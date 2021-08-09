/*!
 * Copyright (C) 2021 FamilyLand. All Rights Reserved.
 *
 * @author Wang Gang <javawg@hotmail.com>
 *
 * iconEx 1.1.0 For vue leaflet
 */

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

function updateRule (selector, styleObj) {
  for (let i = 0; i < document.styleSheets[0].cssRules.length; i++) {
    if (document.styleSheets[0].cssRules[i].selectorText === selector) {
      document.styleSheets[0].deleteRule(i)
    }
  }
  document.styleSheets[0].addRule(selector, styleObj)
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

/**
 * 可将Material Design Icons等字体图标或文字转换成leaflet可用的地图图标
 * @module createDivOption
 * @param {string} classId 生成的options的唯一表示
 * @param {Object} opt 生成options所需的各种设定值，可自行编写也可使用预置的6种设定(通过IconEx.getPresetOpt(0, 'name')获取)
 * @return {Object} 用来传递给new leaflet.DivIcon(options)的参数
 */
function createDivOption (classId, opt) {
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
/**
 * 获取调用createDivOption的预置参数
 * @module getPresetOpt
 * @param {Number} index 0-5
 * @param {string} name 非必要项目，设定后会反应在返回值的name属性性
 * @return {Object} 用来传递给createDivOption(classId, opt)的第二个参数
 */
function getPresetOpt (index, name) {
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

// window.test1 = function (srcElement) {
//   console.log(srcElement.parentNode)
// }
export default {
  createDivOption,
  getBeforeStyle,
  getPresetOpt,
}
