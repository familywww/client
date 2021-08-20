import L from 'leaflet'
import 'proj4'
import 'proj4leaflet'
L.CRS.Baidu = function (useGCJ02, useScaleZoom) {
  let desc = useGCJ02
    ? '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=710 +y_0=910 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs'
    : '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs'
  const result = new L.Proj.CRS('EPSG:900913', desc,
    {
      resolutions: (function () {
        let res = []
        const level = 18
        for (let i = 0; i <= level; i++) {
          res[i] = Math.pow(2, (level - i))
        }
        return res
      }()),
      origin: [ 0, 0, ],
      bounds: L.bounds([ 20037508.342789244, 0, ], [ 0, 20037508.342789244, ]),
    },
  )
  if (useScaleZoom) {
    result.zoom = function (scale) {
      let downScale2, downZoom2, scaleDiff2
      // OverRide proj4 scale
      const maxZoom = downZoom2 = this._scales.length - 1
      for (let i = maxZoom; i >= 0; i--) {
        if (this._scales[i] < scale) {
          break
        }
        downZoom2 = i
      }

      if (downZoom2 === maxZoom) {
        return downZoom2
      }
      downScale2 = this._scales[downZoom2]
      // Check if scale is downScale => return array index
      if (scale === downScale2) {
        return downZoom2
      }
      if (downScale2 === undefined) {
        return -Infinity
      }
      // Interpolate
      const preZoom = downZoom2 - 1
      const preScale = this._scales[preZoom]
      if (preScale === undefined) {
        return Infinity
      }
      scaleDiff2 = downScale2 - preScale
      return (scale - preScale) / scaleDiff2 + downZoom2
    }
  }
  return result
}

/**
 * 可将Material Design Icons等字体图标或文字转换成leaflet可用的地图图标
 * @module createDivOption
 * @param {string} classId 生成的options的唯一表示
 * @param {Object} opt 生成options所需的各种设定值，可自行编写也可使用预置的6种设定(通过IconEx.getPresetOpt(0, 'name')获取)
 * @return {Object} 用来传递给new leaflet.DivIcon(options)的参数
 */
L.DivIconOption = function (classId, opt) {
  const bgStyleId = 'bgStyle_' + classId
  const ftStyleId = 'ftStyle_' + classId

  let innerIconHtml = ''
  if (opt.ftContentOrClass) {
    const f = getBeforeStyle(opt.ftContentOrClass)
    updateRule('.'.concat(ftStyleId, '::before'), 'content:'.concat(f.content, ';font:', f.font, ';border-radius: 50%;', opt.ftBeforeStyle))
    const innerIcon = document.createElement('div')
    innerIcon.className = ftStyleId
    innerIcon.style.textAlign = 'center'
    innerIcon.style.position = 'absolute'
    innerIcon.style.left = '0'
    innerIcon.style.top = '5px'
    innerIcon.style.width = '100%'
    // innerIcon.setAttribute('onclick', 'test1(this)')
    if (opt.ftText) {
      const textArea = document.createElement('div')
      textArea.style = 'margin-top:-5px;'
      textArea.innerText = opt.ftText
      innerIcon.appendChild(textArea)
    }
    innerIconHtml = innerIcon.outerHTML
    innerIcon.remove()
  }

  const b = getBeforeStyle(opt.bgContentOrClass)
  updateRule('.'.concat(bgStyleId, '::before'), 'content:'.concat(b.content, ';font:', b.font, ';', opt.bgBeforeStyle))
  const bgBeforeStyleObj = getBeforeStyle(bgStyleId)
  if (opt.bgStyle) {
    updateRule('.' + bgStyleId, opt.bgStyle)
  }
  const intSize = parseInt(bgBeforeStyleObj.fontSize)
  return {
    html: innerIconHtml,
    className: bgStyleId,
    iconAnchor: [ intSize / 2, intSize, ],
    iconSize: { x: intSize, y: intSize, },
    size: intSize,
    color: bgBeforeStyleObj.color,
    bgContentOrClass: opt.bgContentOrClass,
    ftContentOrClass: opt.ftContentOrClass,
  }
}

let workDivId = null
function getBeforeStyle (className) {
  if (!workDivId) {
    workDivId = document.createElement('div')
    document.documentElement.childNodes[0].appendChild(workDivId)
  }
  workDivId.className = className
  const beforeStyle = window.getComputedStyle(workDivId, 'before')
  let result = {
    content: beforeStyle.content === 'none' ? ('"' + (className || '') + '"') : (beforeStyle.content),
    font: beforeStyle.font,
    fontSize: beforeStyle.fontSize,
    color: beforeStyle.color,
  }
  workDivId.removeAttribute('class')
  return result
}

function updateRule (selector, styleObj) {
  let i = 0
  for (i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].ownerNode.nodeName === 'STYLE') {
      break
    }
  }

  for (let j = 0; j < document.styleSheets[i].cssRules.length; j++) {
    if (document.styleSheets[i].cssRules[j].selectorText === selector) {
      document.styleSheets[i].deleteRule(j)
    }
  }
  document.styleSheets[i].addRule(selector, styleObj)
}

const presetOpt = [
  {
    name: '预置0:粗边框字体背景,白粗字前景',
    bgContentOrClass: 'mdi mdi-map-marker',
    bgBeforeStyle: 'font-size:50px;color:#00c421;-webkit-text-stroke:0.05em #FFF',
    ftContentOrClass: '例',
    ftBeforeStyle: 'background:#00c421;font-size:18px;font-weight:bold;color:white;',
  },
  {
    name: '预置1:粗边框字体背景,无前景',
    bgContentOrClass: 'mdi mdi-map-marker',
    bgBeforeStyle: 'font-size:50px;color:#00c421;-webkit-text-stroke:0.05em #FFF',
  },
  {
    name: '预置2:无边框字体背景,黑大字前景',
    bgContentOrClass: 'mdi mdi-map-marker',
    bgBeforeStyle: 'font-size:50px;color:#00c421;-webkit-text-stroke:0.00em #FFF',
    ftContentOrClass: '例',
    ftBeforeStyle: 'background:#00c421;font-size:25px;color:black;',
  },
  {
    name: '预置样式3:细边框字体背景,黑大字前景',
    bgContentOrClass: 'mdi mdi-map-marker',
    bgBeforeStyle: 'font-size:50px;color:#00c421;-webkit-text-stroke:0.02em #FFF',
    ftContentOrClass: '例',
    ftBeforeStyle: 'background:#00c421;font-size:25px;color:black;',
  },
  {
    name: '预置4:无边框字体背景,白粗字体前景',
    bgContentOrClass: 'mdi mdi-map-marker',
    bgBeforeStyle: 'font-size:50px;color:#00c421;-webkit-text-stroke:0.00em #FFF',
    ftContentOrClass: '例',
    ftBeforeStyle: 'background:#00c421;font-size:18px;font-weight:bold;color:white;',
  },
  {
    name: '预置5:颜色背景,黑字前景',
    bgBeforeStyle: 'font-size:45px;color:#00c421;',
    bgStyle: 'border-radius:50%;background:radial-gradient(#00c421 55%, #FFFFFFff 60%, #00c421 70%)',
    ftContentOrClass: 'mdi mdi-webcam',
    ftBeforeStyle: 'font-size:17px;',
    ftText: '##',
  },
  {
    name: '预置6:颜色背景,白粗字前景',
    bgBeforeStyle: 'font-size:45px;color:#00c421;',
    bgStyle: 'border-radius:50%;background:radial-gradient(#00c421 55%, #FFFFFFff 60%, #00c421 70%)',
    ftContentOrClass: '例',
    ftBeforeStyle: 'font-size:17px;font-weight:bold;color:white;',
    ftText: '##',
  },
]

/**
 * 获取调用DivIconOption的预置参数
 * @module DivIconPresetOption
 * @param {Number} index 0-5
 * @param {string} name 非必要项目，设定后会反应在返回值的name属性性
 * @return {Object} 用来传递给createDivOption(classId, opt)的第二个参数
 */
L.DivIconPresetOption = function (index, name) {
  let result = {}
  Object.assign(result, presetOpt[index])
  result.Name = (target) => {
    result.name = target
    return result
  }
  // 背景字体类或内容
  result.BgContentOrClass = (target) => {
    result.bgContentOrClass = target
    return result
  }
  // 背景字体颜色
  result.BgBeforeColor = (target) => {
    if (result.bgStyle) {
      result.bgStyle = result.bgStyle.replaceAll('#00c421', target)
    }
    if (result.bgBeforeStyle) {
      result.bgBeforeStyle = result.bgBeforeStyle.replaceAll('#00c421', target)
    }
    if (result.ftBeforeStyle) {
      result.ftBeforeStyle = result.ftBeforeStyle.replaceAll('#00c421', target)
    }
    return result
  }
  // 背景字体边框颜色
  result.BgBorderColor = (target) => {
    if (result.bgBeforeStyle) {
      result.bgBeforeStyle = result.bgBeforeStyle.replaceAll('#FFF', target)
    }
    return result
  }
  // 背景字体大小
  result.BgFontSize = (target) => {
    if (result.bgBeforeStyle) {
      result.bgBeforeStyle = result.bgBeforeStyle.replaceAll('50px', target).replaceAll('45px', target)
    }
    return result
  }
  // 上层字体类或内容
  result.FtContentOrClass = (target) => {
    result.ftContentOrClass = target
    return result
  }
  // 上层字体颜色
  result.FtBeforeColor = (target) => {
    if (result.ftBeforeStyle) {
      result.ftBeforeStyle = result.ftBeforeStyle.replaceAll('white', target).replaceAll('black', target)
    }
    return result
  }
  // 上层字体大小
  result.FtFontSize = (target) => {
    if (result.ftBeforeStyle) {
      result.ftBeforeStyle = result.ftBeforeStyle.replaceAll('17px', target).replaceAll('18px', target).replaceAll('25px', target)
    }
    return result
  }
  // 上层文字
  result.FtText = (target) => {
    result.ftText = target
    return result
  }
  return name ? result.Name(name) : result
}

// L.GridLayer.include({
//   _setZoomTransform: function (level, _center, zoom) {
//     console.log('1', this._map.options.crs.code)
//     let center = _center
//     // if (center !== undefined && this.options) {
//     //   if (this.options.corrdType === 'gcj02') {
//     //     center = L.coordConver().gps84_To_gcj02(_center.lng, _center.lat)
//     //   } else if (this.options.corrdType === 'bd09') {
//     //     center = L.coordConver().gps84_To_bd09(_center.lng, _center.lat)
//     //   }
//     // }
//     const scale = this._map.getZoomScale(zoom, level.zoom)
//     const translate = level.origin.multiplyBy(scale)
//       .subtract(this._map._getNewPixelOrigin(center, zoom)).round()
//
//     if (L.Browser.any3d) {
//       L.DomUtil.setTransform(level.el, translate, scale)
//     } else {
//       L.DomUtil.setPosition(level.el, translate)
//     }
//   },
//   _getTiledPixelBounds: function (_center) {
//     let center = _center
//     // if (center !== undefined && this.options) {
//     //   if (this.options.corrdType === 'gcj02') {
//     //     center = L.coordConver().gps84_To_gcj02(_center.lng, _center.lat)
//     //   } else if (this.options.corrdType === 'bd09') {
//     //     center = L.coordConver().gps84_To_bd09(_center.lng, _center.lat)
//     //   }
//     // }
//     const map = this._map
//     const mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom()
//     const scale = map.getZoomScale(mapZoom, this._tileZoom)
//     const pixelCenter = map.project(center, this._tileZoom).floor()
//     const halfSize = map.getSize().divideBy(scale * 2)
//
//     return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize))
//   },
// })

export default L
