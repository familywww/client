<template>
  <v-app id="app" :class="moveMarkerClassName" >
    <div style="width: 1415px;height: 100%;">
      <v-tabs v-model="mapUrlIndex" dark background-color="teal darken-3" show-arrows opaque="0.8">
        <v-tabs-slider color="teal lighten-3"></v-tabs-slider>
        <v-tab v-for="(subItem, j) in mapControl.tile" :key="j" :value="j">
          {{ subItem.name }}
        </v-tab>
      </v-tabs>
      <l-map
        ref="map"
        :zoom.sync="mapControl.zoom"
        :center.sync="mapControl.center"
        :min-zoom="mapControl.minZoom"
        :max-zoom="mapControl.maxZoom"
        :crs="mapControl.tile[mapUrlIndex].crs"
        :options.sync="mapControl.options"
        @move="zoomEnd"
      >
        <l-control-scale position="topleft" :imperial="false" :metric="true" />
        <l-control-layers position="topleft" :sortLayers="false" />
        <l-tile-layer
          v-for="layer in mapControl.tile[mapUrlIndex].maps"
          :key="layer.name"
          :name="layer.name"
          :visible="layer.visible"
          :url="layer.url"
          :options="{tms: mapControl.tile[mapUrlIndex].tms, zIndex: layer.zIndex, opacity: layer.opacity}"
          :subdomains="mapControl.tile[mapUrlIndex].subdomains"
          :layer-type="layer.type"
        />

        <div
          v-for="group in markers.filter(item => { return item.type === 'point'})"
          :key="group.id"
        >
          <l-marker
            ref="points"
            v-for="marker in group.children"
            :key="'mark-' + marker.id"
            :id="marker.id"
            :lat-lng="marker"
            :draggable="false"
            :icon="marker.icon"
            @mousedown="cameraCursorShow(marker)"
          >
            <l-tooltip :options="{ direction: 'bottom', interactice: true, }">
              <span>{{ marker.videoItem ? marker.videoItem.src : marker.status }}</span>
            </l-tooltip>
          </l-marker>
        </div>
        <div
          v-for="(optValue, optKey) in markerIconOptions"
          :key="optKey"
        >
          <l-marker-cluster
            v-for="(typeValue, typeKey) in optValue"
            :key="typeKey"
            :options="createClusterOptions(typeValue.clusterOption)"
          >
            <div
              v-for="markGroup in markers.filter(item => { return item.type !== 'point' && item.type === optKey})"
              :key="'markGroup-' + markGroup.groupId"
              :id="markGroup.groupId"
            >
              <l-marker
                ref="points"
                v-for="marker in markGroup.children.filter(item => { return item.status === typeKey })"
                :key="'mark-' + marker.id"
                :id="marker.id"
                :lat-lng="marker"
                :draggable="false"
                :icon="marker.icon"
                @mousedown="cameraCursorShow(marker)"
              >
                <l-tooltip :options="{ direction: 'bottom', interactice: true, }">
                  <span>{{ marker.videoItem ? marker.videoItem.name : (marker.lng + ':' + marker.lat) }}</span>
                </l-tooltip>
              </l-marker>
            </div>
          </l-marker-cluster>
        </div>
        <l-polyline
          v-for="item in markers.filter(group => { return group.type === 'point'})"
          :key="item.id"
          :lat-lngs="item.children"
          :weight="3"
          :color="'#fffb11'"
        ></l-polyline>
      </l-map>
    </div>
    <v-card max-width="220" style="z-index:900;position: absolute;top:47px;right:500px; background: #2b3575a8">
      <v-card-title>
        <v-combobox v-model="comboboxVal" :items="comboboxItems" label="输入或选择" outlined dense></v-combobox>
        <v-icon color="#00c421" @click="setZoom">mdi-home-group</v-icon>
        <v-icon color="#f44a00">mdi-layers-triple</v-icon>
        <v-icon color="#eb9201">mdi-traffic-light</v-icon>
        <v-icon color="#fe2954">mdi-hydro-power</v-icon>
        <v-icon color="#44b900">mdi-leaf</v-icon>
        <v-icon color="#00c5f5">mdi-tractor</v-icon>
        <v-icon color="#00c5f5">mdi-briefcase-variant</v-icon>
      </v-card-title>
      <v-list v-scroll.self="onScroll" dense class="overflow-y-auto" height="920px" style="background: #ffffff00">
        <v-list-group
          sub-group
          style="margin: 0px 0px 0px -20px"
          v-for="item in markers"
          :key="item.id"
          :value="false"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title class="white--text">{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            v-for="(subItem, j) in item.children"
            :key="j"
            @click="listClick(item, subItem)"
            @mousedown="cameraCursorShow(subItem)"
          >
            <v-list-item-icon style="margin-right: 2px">
              <v-icon
                :color="markerIconOptions[item.type][subItem.status].markerOption.color"
                :style="'font-style: normal;'"
                v-text="markerIconOptions[item.type][subItem.status].markerOption.ftContentOrClass
                     || markerIconOptions[item.type][subItem.status].markerOption.bgContentOrClass.replace('mdi ', '')
                       "
              ></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="white--text" v-text="subItem.videoItem ? subItem.videoItem.name : subItem.id "></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-card>
    <video
      ref="videoFlv"
      style="z-index:900;position: absolute;top:10px;right:10px; width: 480px; height: 270px"
      autoplay
      loop
      controls
      controlsList="nodownload"
      disablePictureInPicture
      @mouseover="mouseOverVideo(2)"
      @mouseout="mouseOutVideo()"
      @mouseup="videoPlay(2)"
    >
    </video>
    <div ref="videoJs" style="z-index:900;position: absolute;top:300px;right:10px; width: 480px; height: 270px">
      <video
        id="videoJs"
        style="width: 100%; height: 100%"
        class="video-js"
        controls
        @mouseover="mouseOverVideo(1)"
        @mouseout="mouseOutVideo()"
        @mouseup="videoPlay(1)"
      >
      </video>
    </div>
    <canvas ref="canvas" style="position:absolute;top:0;left:0;z-index: 901;pointer-events:none"/>
  </v-app>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import L from '../plugins/leafletEx'
import 'leaflet-draw'
import * as Vue2Leaflet from 'vue2-leaflet'
import vueLeafletMarkerCluster from 'vue2-leaflet-markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import videoJs from 'video.js'
import 'video.js/dist/video-js.css'
import flv from 'flv.js'
import 'videojs-flvjs'
const allVideoItem = [
  { type: 'application/x-mpegURL', name: '全国风景总览', src: 'https://gcalic.v.myalicdn.com/gc/wgw05_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黟县宏村月沼', src: 'https://gctxyc.liveplay.myqcloud.com/gc/yxhcyz_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黟县宏村南湖', src: 'https://gcalic.v.myalicdn.com/gc/yxhcnh_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黟县西递牌坊', src: 'https://gcalic.v.myalicdn.com/gc/yxxdpf_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黟县西递半山亭俯瞰', src: 'https://gcalic.v.myalicdn.com/gc/yxxdbst_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黟县卢村远眺', src: 'https://gccncc.v.wscdns.com/gc/yxlcyt_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '婺源江岭1', src: 'https://gctxyc.liveplay.myqcloud.com/gc/wygjt1_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '婺源江岭2', src: 'https://gccncc.v.wscdns.com/gc/wygjt2_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山始信峰', src: 'https://gctxyc.liveplay.myqcloud.com/gc/hssxf_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山卧云峰', src: 'https://gcalic.v.myalicdn.com/gc/hswlf_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山梦笔生花', src: 'https://gccncc.v.wscdns.com/gc/hsmbsh_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山排云亭', src: 'https://gcalic.v.myalicdn.com/gc/hspyt_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山西海大峡谷', src: 'https://gcalic.v.myalicdn.com/gc/hsxhdxg_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山光明顶', src: 'https://gccncc.v.wscdns.com/gc/hsgmd_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山信兴道', src: 'https://gccncc.v.wscdns.com/gc/hsyg_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山平天矼', src: 'https://gcalic.v.myalicdn.com/gc/hsptgz_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '黄山飞来石', src: 'https://gccncc.v.wscdns.com/gc/hsptgy_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '云台山红石硖', src: 'https://gcalic.v.myalicdn.com/gc/ytshsx_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '泰山主峰', src: 'https://gctxyc.liveplay.myqcloud.com/gc/taishan01_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '泰山迎客松', src: 'https://gcalic.v.myalicdn.com/gc/taishan02_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '泰山大观峰', src: 'https://gctxyc.liveplay.myqcloud.com/gc/taishan03_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '泰山拱北石', src: 'https://gcalic.v.myalicdn.com/gc/taishan04_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '泰山十八盘', src: 'https://gcalic.v.myalicdn.com/gc/taishan05_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '泰山玉皇顶', src: 'https://gcalic.v.myalicdn.com/gc/taishan06_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '泰山天街', src: 'https://gccncc.v.wscdns.com/gc/taishan07_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '云台山小寨沟', src: 'https://gccncc.v.wscdns.com/gc/ytsxzg_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '云台山百家岩', src: 'https://gccncc.v.wscdns.com/gc/ytsbjy_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '云台山茱萸峰', src: 'https://gccncc.v.wscdns.com/gc/ytszyf_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '武夷山玉女峰', src: 'https://gcalic.v.myalicdn.com/gc/wysynf_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '印象大红袍', src: 'https://gctxyc.liveplay.myqcloud.com/gc/wysyxdhp_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '武夷山大红袍茶园', src: 'https://gctxyc.liveplay.myqcloud.com/gc/wysdhpcy_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '张家界迷魂台', src: 'https://gccncc.v.wscdns.com/gc/zjjmht_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '张家界水绕4门', src: 'https://gccncc.v.wscdns.com/gc/zjjsrsm_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '张家界将军列队', src: 'https://gctxyc.liveplay.myqcloud.com/gc/zjjjjdl_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '张家界阿凡达悬浮山', src: 'https://gcalic.v.myalicdn.com/gc/zjjafdxfs_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '凤凰古城', src: 'https://gccncc.v.wscdns.com/gc/fhgcdgm_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '凤凰古城南华山', src: 'https://gccncc.v.wscdns.com/gc/fhgcdnhs_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '卢村远眺', src: 'https://gccncc.v.wscdns.com/gc/yxlcyt_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '宠村月沼', src: 'https://gccncc.v.wscdns.com/gc/yxhcyz_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '少林寺广场', src: 'https://gccncc.v.wscdns.com/gc/zsslsgc_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '水长城镜头一', src: 'https://gcalic.v.myalicdn.com/gc/wgw01_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '水长城镜头二', src: 'https://gcalic.v.myalicdn.com/gc/wgw02_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '水长城镜头三', src: 'https://gccncc.v.wscdns.com/gc/wgw03_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '水长城镜头四', src: 'https://gccncc.v.wscdns.com/gc/wgw04_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '狮子山鸟瞰古城', src: 'https://gccncc.v.wscdns.com/gc/ljgcszsnkgc_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '远眺玉龙雪山', src: 'https://gcalic.v.myalicdn.com/gc/ljgcwglytylxs_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '大研花巷景观台', src: 'https://gcalic.v.myalicdn.com/gc/ljgcdyhxgjt_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '峨眉云海日出', src: 'https://gctxyc.liveplay.myqcloud.com/gc/emsarm_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '贡嘎雪山', src: 'https://gctxyc.liveplay.myqcloud.com/gc/emsyh_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '远眺万佛顶', src: 'https://gcalic.v.myalicdn.com/gc/emswfs_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '普贤菩萨像', src: 'https://gcalic.v.myalicdn.com/gc/emspxps_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '乐山大佛全景', src: 'https://gccncc.v.wscdns.com/gc/lsdfgfl_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '悬空寺全景', src: 'https://gcalic.v.myalicdn.com/gc/hsxksqj_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '恒宗', src: 'https://gcalic.v.myalicdn.com/gc/hsxkssqdzrqj_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '悬空寺侧景', src: 'https://gcalic.v.myalicdn.com/gc/hsxkscj_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '天涯鸟瞰', src: 'https://gctxyc.liveplay.myqcloud.com/gc/tyhjtynl_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '天涯石', src: 'https://gctxyc.liveplay.myqcloud.com/gc/tyhjtys_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '南天一柱', src: 'https://gctxyc.liveplay.myqcloud.com/gc/tyhjntyz_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '日月石', src: 'https://gccncc.v.wscdns.com/gc/tyhjrys_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '雪乡大石碑', src: 'https://gcalic.v.myalicdn.com/gc/mdjxxdsb_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '雪乡梦幻家园', src: 'https://gctxyc.liveplay.myqcloud.com/gc/mdjxxmhjyxj_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '观景台', src: 'https://gccncc.v.wscdns.com/gc/mdjxxmhjygjt_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '嘉峪关长城', src: 'https://gctxyc.liveplay.myqcloud.com/gc/jyg04_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '大水库', src: 'https://gccncc.v.wscdns.com/gc/ljgcdsc_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '中央电视台中塔西', src: 'https://gccncc.v.wscdns.com/gc/ztx_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '中央电视台中塔东', src: 'https://gcalic.v.myalicdn.com/gc/ztd_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '中央电视台中塔南', src: 'https://gccncc.v.wscdns.com/gc/ztn_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '中央电视台中塔北', src: 'https://gcalic.v.myalicdn.com/gc/ztb_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '小布达拉宫', src: 'https://gcalic.v.myalicdn.com/gc/bsszxbdlg_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '棒槌山', src: 'https://gccncc.v.wscdns.com/gc/bsszbcs_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '远眺山庄', src: 'https://gcalic.v.myalicdn.com/gc/bssztt_1/index.m3u8', },
  { type: 'application/x-mpegURL', name: '金山', src: 'https://gcalic.v.myalicdn.com/gc/bsszjs_1/index.m3u8', },
]
const iconSetting = {
  point: {
    's_01': L.DivIconPresetOption(0, '轨迹开始').BgBeforeColor('#12a336').FtContentOrClass('起'), // { name: '轨迹开始', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#12a336;-webkit-text-stroke:0.05em #FFF', ftContentOrClass: '起', ftBeforeStyle: 'background:#12a336;font-size:18px;font-weight:bold;color:white;', },
    's_02': L.DivIconPresetOption(1, '轨迹过程').BgBeforeColor('#ff2a00'), // { name: '轨迹过程', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#ff2a00;-webkit-text-stroke:0.05em #FFF', },
    's_03': L.DivIconPresetOption(1, '轨迹进行').BgBeforeColor('#ffa400').BgContentOrClass('mdi mdi-human-male'), // { name: '轨迹进行', bgContentOrClass: 'mdi mdi-human-male', bgBeforeStyle: 'font-size:50px;color:#ffa400;-webkit-text-stroke:0.05em #FFF', },
    's_04': L.DivIconPresetOption(0, '轨迹结束').BgBeforeColor('#952b00').FtContentOrClass('终'), // { name: '轨迹结束', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#952b00;-webkit-text-stroke:0.05em #FFF', ftContentOrClass: '终', ftBeforeStyle: 'background:#952b00;font-size:18px;font-weight:bold;color:white;', },
  },
  building: {
    's_01': L.DivIconPresetOption(2, '房屋楼宇').BgBeforeColor('#00c421').FtContentOrClass('mdi mdi-home-group'), // { name: '房屋楼宇', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#00c421;', ftContentOrClass: 'mdi mdi-home-group', ftBeforeStyle: 'background:#00c421;font-size:25px;', },
  },
  public: {
    's_01': { name: '公用设施', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#f44a00;', ftContentOrClass: 'mdi mdi-layers-triple', ftBeforeStyle: 'background:#f44a00;font-size:25px;', },
  },
  traffic: {
    's_01': { name: '交通设施', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#eb9201;', ftContentOrClass: 'mdi mdi-traffic-light', ftBeforeStyle: 'background:#eb9201;font-size:25px;', },
  },
  environment: {
    's_01': { name: '环境设施', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#fe2954;', ftContentOrClass: 'mdi mdi-hydro-power', ftBeforeStyle: 'background:#fe2954;font-size:25px;', },
  },
  green: {
    's_01': L.DivIconPresetOption(2, '绿化设施').BgBeforeColor('#44b900').FtContentOrClass('mdi mdi-leaf'), // { name: '绿化设施', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#44b900;', ftContentOrClass: 'mdi mdi-leaf', ftBeforeStyle: 'background:#44b900;font-size:25px;', },
  },
  org: {
    's_01': { name: '农户资源', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#00c5f5;', ftContentOrClass: 'mdi mdi-tractor', ftBeforeStyle: 'background:#00c5f5;font-size:25px;', },
    's_02': { name: '组织机构', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#00c5f5;', ftContentOrClass: 'mdi mdi-briefcase-variant', ftBeforeStyle: 'background:#00c5f5;font-size:25px;', },
  },
  camera: {
    's_01': { name: '在线设备', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#00f0ff;', ftContentOrClass: 'mdi mdi-webcam', ftBeforeStyle: 'background:#00f0ff;font-size:25px;', },
    's_02': L.DivIconPresetOption(3, '离线设备').BgBeforeColor('#808080').FtContentOrClass('mdi mdi-webcam'), // { name: '离线设备', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#808080;-webkit-text-stroke:0.02em #FFF', ftContentOrClass: 'mdi mdi-webcam', ftBeforeStyle: 'background:#808080;font-size:25px;', },
  },
  environment2: {
    's_01': L.DivIconPresetOption(4, '市容环境').BgBeforeColor('#00c421').FtContentOrClass('环'), // { name: '市容环境', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#00c421;', ftContentOrClass: '环', ftBeforeStyle: 'background:#00c421;font-size:17px;font-weight:bold;color:white;', },
  },
  advertisement: {
    's_01': { name: '宣传广告', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#b200e8;', ftContentOrClass: '宣', ftBeforeStyle: 'background:#b200e8;font-size:17px;font-weight:bold;color:white;', },
  },
  construction: {
    's_01': { name: '施工管理', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#c77700;', ftContentOrClass: '施', ftBeforeStyle: 'background:#c77700;font-size:17px;font-weight:bold;color:white;', },
  },
  street: {
    's_01': { name: '街面秩序', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#fe2954;', ftContentOrClass: '街', ftBeforeStyle: 'background:#fe2954;font-size:17px;font-weight:bold;color:white;', },
  },
  event: {
    's_01': { name: '突发事件', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#e10006;', ftContentOrClass: '事', ftBeforeStyle: 'background:#e10006;font-size:17px;font-weight:bold;color:white;', },
  },
  other: {
    's_01': { name: '其他事件', bgContentOrClass: 'mdi mdi-map-marker', bgBeforeStyle: 'font-size:50px;color:#00c5f5;', ftContentOrClass: '其', ftBeforeStyle: 'background:#00c5f5;font-size:17px;font-weight:bold;color:white;', },
  },
}
export default {
  name: 'mapTest',
  components: {
    'l-map': Vue2Leaflet.LMap,
    'l-control-layers': Vue2Leaflet.LControlLayers,
    'l-control-scale': Vue2Leaflet.LControlScale,
    'l-tile-layer': Vue2Leaflet.LTileLayer,
    // 'l-wms-tile-layer': Vue2Leaflet.LWMSTileLayer,
    'l-polyline': Vue2Leaflet.LPolyline,
    // 'l-polygon': Vue2Leaflet.LPolygon,
    'l-marker': Vue2Leaflet.LMarker,
    'l-tooltip': Vue2Leaflet.LTooltip,
    // 'l-circle': Vue2Leaflet.LCircle,
    'l-marker-cluster': vueLeafletMarkerCluster,
  },
  created () {
    this.init()
  },
  mounted () {
    this.videoInit()

    const self = this
    document.onmouseup = function (e) {
      self.cameraCursorHide()
      self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
    }
    this.canvas = self.$refs.canvas
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.ctx = this.canvas.getContext('2d')
    document.onmousemove = function (e) {
      if (self.moveMarker) {
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
        self.ctx.beginPath()
        self.ctx.setLineDash([ 5, 15, ])
        self.ctx.moveTo(e.clientX, e.clientY)
        self.ctx.lineTo(self.tarVideo.offsetLeft + self.tarVideo.clientWidth / 2, self.tarVideo.offsetTop + self.tarVideo.clientHeight / 2)
        self.ctx.lineWidth = 3
        self.ctx.strokeStyle = 'yellow'
        self.ctx.stroke()
        self.ctx.closePath()
      }
    }
  },
  data () {
    return {
      comboboxItems: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, ],
      comboboxVal: 0,
      scrollInvoked: 0,
      mapUrlIndex: 0,
      mapControl: {
        tile: [
          {
            name: '高德',
            crs: L.CRS.EPSG3857,
            tms: false,
            subdomains: '1234',
            maps: [
              { name: 'st6', zIndex: 1, opacity: 1.0, visible: false, type: 'base', url: '//webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}', },
              { name: 'st7', zIndex: 2, opacity: 1.0, visible: false, type: 'base', url: '//webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', },
              { name: 'rd7', zIndex: 3, opacity: 1.0, visible: true, type: 'base', url: '//webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', },
              { name: 'rd8', zIndex: 4, opacity: 1.0, visible: false, type: 'base', url: '//webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', },
              { name: '标签', zIndex: 5, opacity: 1.0, visible: false, type: 'overlay', url: '//webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}', },
            ],
            layers: [
            ],
          },
          {
            name: '百度',
            crs: L.CRS.Baidu(true),
            tms: true,
            subdomains: '012',
            maps: [
              { zIndex: 1, opacity: 1.0, visible: false, type: 'base', name: '默认', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=norma', },
              { zIndex: 2, opacity: 1.0, visible: false, type: 'base', name: '清新蓝', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=light', },
              { zIndex: 3, opacity: 1.0, visible: false, type: 'base', name: '黑夜', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=dark', },
              { zIndex: 4, opacity: 1.0, visible: false, type: 'base', name: '红色警戒', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=redalert', },
              { zIndex: 5, opacity: 1.0, visible: false, type: 'base', name: '精简', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=googlelite', },
              { zIndex: 6, opacity: 1.0, visible: false, type: 'base', name: '自然绿', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=grassgreen', },
              { zIndex: 7, opacity: 1.0, visible: true, type: 'base', name: '午夜蓝', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=midnight', },
              { zIndex: 8, opacity: 1.0, visible: false, type: 'base', name: '浪漫粉', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=pink', },
              { zIndex: 9, opacity: 1.0, visible: false, type: 'base', name: '青春绿', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=darkgreen', },
              { zIndex: 10, opacity: 1.0, visible: false, type: 'base', name: '清新蓝绿', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=bluish', },
              { zIndex: 11, opacity: 1.0, visible: false, type: 'base', name: '高端灰', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=grayscale', },
              { zIndex: 12, opacity: 1.0, visible: false, type: 'base', name: '强边界', url: '//api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&styles=hardedge', },
              { zIndex: 13, opacity: 1.0, visible: false, type: 'base', name: '街景', url: '//online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=ph&udt=20210803', },
              { zIndex: 14, opacity: 1.0, visible: false, type: 'base', name: '街②', url: '//online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1', },
              { zIndex: 15, opacity: 1.0, visible: false, type: 'base', name: '卫星', url: '//maponline{s}.bdimg.com/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&app=webearth2&v=009&udt=20210803', },
              { zIndex: 15, opacity: 1.0, visible: false, type: 'base', name: '栅格', url: '//shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46', },
              { zIndex: 98, opacity: 1.0, visible: false, type: 'overlay', name: '路况', url: '//its.map.baidu.com:8002/traffic/TrafficTileService?x={x}&y={y}&level={z}&time=' + new Date().getTime() + '&label=web2D&v=017', },
              { zIndex: 99, opacity: 1.0, visible: false, type: 'overlay', name: '标签', url: '//online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020', },
            ],
            layers: [
            ],
          },
          {
            name: 'Geoq',
            crs: L.CRS.EPSG3857,
            tms: false,
            subdomains: 'abc',
            maps: [
              { name: 'map', zIndex: 1, opacity: 1.0, visible: true, type: 'base', url: '//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}', },
              { name: 'PurplishBlue', zIndex: 2, opacity: 1.0, visible: false, type: 'base', url: '//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}', },
              { name: 'Gray', zIndex: 3, opacity: 1.0, visible: false, type: 'base', url: '//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}', },
              { name: 'Warm', zIndex: 4, opacity: 1.0, visible: false, type: 'base', url: '//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}', },
              { name: 'Hydro', zIndex: 5, opacity: 1.0, visible: false, type: 'overlay', url: '//thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}', },
            ],
            layers: [
            ],
          },
          {
            name: '谷歌',
            crs: L.CRS.EPSG3857,
            tms: false,
            subdomains: '0123',
            maps: [
              { name: '卫星①', zIndex: 1, opacity: 1.0, visible: true, type: 'base', url: '//mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil', },
              { name: '卫星②', zIndex: 2, opacity: 1.0, visible: false, type: 'base', url: '//www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', },
              { name: '标卫①', zIndex: 3, opacity: 1.0, visible: false, type: 'base', url: '//mt{s}.google.cn/vt/lyrs=y&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil', },
              { name: '标卫②', zIndex: 4, opacity: 1.0, visible: false, type: 'base', url: '//www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}', },
              { name: '标地①', zIndex: 5, opacity: 1.0, visible: false, type: 'base', url: '//mt{s}.google.cn/vt/lyrs=p&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil', },
              { name: '线路①', zIndex: 6, opacity: 1.0, visible: false, type: 'base', url: '//mt{s}.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil', },
              { name: '线路②', zIndex: 7, opacity: 1.0, visible: false, type: 'base', url: '//www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}', },
              { name: '地形①', zIndex: 9, opacity: 0.5, visible: false, type: 'overlay', url: '//mt{s}.google.cn/vt/lyrs=t&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil', },
              { name: '标签①', zIndex: 8, opacity: 1.0, visible: false, type: 'overlay', url: '//mt{s}.google.cn/vt/lyrs=h&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil', },
            ],
            layers: [
            ],
          },
        ],
        zoom: 16,
        minZoom: 2,
        maxZoom: 18,
        center: L.latLng(39.911424, 116.400221),
        options: {
          attributionControl: false,
          zoomControl: false,
          animate: true,
        },
      },
      moveMarker: null,
      moveMarkerClassName: '',
      markerIconOptions: {},
      markers: [
        {
          name: '轨迹小',
          type: 'point',
          children: [
            { id: '1', lng: 118.49849220, lat: 39.64711339, status: 's_01', videoItem: { name: 'video/mp4', type: 'video/mp4', src: 'https://mp4.vjshi.com/2019-03-23/3b0aace78bc58d7f866cdbe494581e3f.mp4', }, },
            { id: '2', lng: 118.49729060, lat: 39.64719600, status: 's_02', videoItem: { name: 'mp4', type: 'mp4', src: 'https://mp4.vjshi.com/2019-03-23/560ddf5b6b05d8b660937668dd8db1d9.mp4', }, },
            { id: '3', lng: 118.49750520, lat: 39.65010384, status: 's_02', videoItem: { name: 'mp4', type: 'mp4', src: 'https://view.2amok.com/20200621/4f91d925aa0739c37ae639a3917e76e3.mp4', }, },
            { id: '4', lng: 118.49568130, lat: 39.65018645, status: 's_02', videoItem: { name: 'CCTV5', type: 'application/x-mpegURL', src: 'http://223.110.245.165/ott.js.chinamobile.com/PLTV/3/224/3221226362/index.m3u8', }, },
            { id: '5', lng: 118.49533800, lat: 39.64625424, status: 's_02', videoItem: { name: 'CCTV5+', type: 'application/x-mpegURL', src: 'http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8', }, },
            { id: '6', lng: 118.49381450, lat: 39.64628728, status: 's_02', videoItem: { name: '嘉峪关长城', type: 'application/x-mpegURL', src: 'https://gctxyc.liveplay.myqcloud.com/gc/jyg04_1/index.m3u8', }, },
            { id: '7', lng: 118.49375010, lat: 39.64557681, status: 's_04', videoItem: { name: 'flv', type: 'flv', src: 'https://mister-ben.github.io/videojs-flvjs/bbb.flv', }, },
          ],
        },
        {
          name: '轨迹大',
          type: 'point',
          children: [
            { id: '101', lng: 118.51012230, lat: 39.61312721, status: 's_01', videoItem: { name: 'video/mp4', type: 'video/mp4', src: 'https://mp4.vjshi.com/2019-03-23/3b0aace78bc58d7f866cdbe494581e3f.mp4', }, },
            { id: '102', lng: 118.49827766, lat: 39.61312721, status: 's_02', videoItem: { name: 'mp4', type: 'mp4', src: 'https://mp4.vjshi.com/2019-03-23/560ddf5b6b05d8b660937668dd8db1d9.mp4', }, },
            { id: '103', lng: 118.49844933, lat: 39.60902757, status: 's_02', videoItem: { name: 'mp4', type: 'mp4', src: 'https://view.2amok.com/20200621/4f91d925aa0739c37ae639a3917e76e3.mp4', }, },
            { id: '104', lng: 118.49218369, lat: 39.60942432, status: 's_02', videoItem: { name: 'CCTV5', type: 'application/vnd.apple.mpegurl', src: 'https://cctv5txyh5c.liveplay.myqcloud.com/live/cdrmcctv5plus_1_td.m3u8', }, },
            { id: '105', lng: 118.48909378, lat: 39.61418514, status: 's_02', videoItem: { name: 'CCTV5+', type: 'application/x-mpegURL', src: 'http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8', }, },
            { id: '106', lng: 118.48823547, lat: 39.61425126, status: 's_02', videoItem: { name: '嘉峪关长城', type: 'application/x-mpegURL', src: 'https://gctxyc.liveplay.myqcloud.com/gc/jyg04_1/index.m3u8', }, },
            { id: '107', lng: 118.48497391, lat: 39.61934232, status: 's_02', videoItem: { name: 'flv', type: 'flv', src: 'https://mister-ben.github.io/videojs-flvjs/bbb.flv', }, },
            { id: '108', lng: 118.48025322, lat: 39.62403634, status: 's_02', },
            { id: '109', lng: 118.47664833, lat: 39.61735883, status: 's_02', },
            { id: '110', lng: 118.47312927, lat: 39.61425126, status: 's_02', },
            { id: '111', lng: 118.46454620, lat: 39.59831449, status: 's_02', },
            { id: '112', lng: 118.46111298, lat: 39.59474309, status: 's_02', },
            { id: '113', lng: 118.47424507, lat: 39.58898878, status: 's_02', },
            { id: '114', lng: 118.47596169, lat: 39.59527220, status: 's_02', },
            { id: '115', lng: 118.48497391, lat: 39.59533833, status: 's_02', },
            { id: '116', lng: 118.49184036, lat: 39.59666108, status: 's_02', },
            { id: '117', lng: 118.49209785, lat: 39.59930651, status: 's_02', },
            { id: '118', lng: 118.49733353, lat: 39.59904197, status: 's_02', },
            { id: '119', lng: 118.49716187, lat: 39.59758699, status: 's_02', },
            { id: '120', lng: 118.50488663, lat: 39.59646267, status: 's_02', },
            { id: '121', lng: 118.51037979, lat: 39.60299496, status: 's_03', },
          ],
        },
        {
          name: '北京',
          type: 'point',
          children: [
            { id: '百度天安门城楼', lng: 116.403964, lat: 39.915099, status: 's_01', },
            { id: '百度     国旗', lng: 116.403931, lat: 39.913260, status: 's_01', },
            { id: '百度英雄纪念碑', lng: 116.404169, lat: 39.910955, status: 's_01', },
            { id: '谷歌天安门城楼', lng: 116.397469, lat: 39.908734, status: 's_04', },
            { id: '谷歌     国旗', lng: 116.397555, lat: 39.906973, status: 's_04', },
            { id: '谷歌英雄纪念碑', lng: 116.397716, lat: 39.904606, status: 's_04', },
          ],
        },
      ],
      playerFlv: null,
      playerJs: null,
    }
  },
  methods: {
    zoomEnd (e) {
      this.comboboxVal = e.target.getZoom()
    },
    setZoom () {
      this.$refs.map.mapObject.setZoom(this.comboboxVal)
    },
    makeMarkerObj (count) {
      let lngEx = 0.0
      let latEx = 0.5
      for (let type in this.markerIconOptions) {
        if (type !== 'point') {
          for (let status in this.markerIconOptions[type]) {
            const groupId = type + status
            const markerGroup = { groupId: groupId, name: this.markerIconOptions[type][status].name || groupId, type: type, children: [], }
            for (let i = 0; i < count; i++) {
              let tmpVideoItem = null
              if (type === 'camera' && status === 's_01' && i < 72) {
                tmpVideoItem = allVideoItem[i]
              }
              markerGroup.children.push({
                id: groupId + i,
                lng: 118.0 + lngEx + Math.random() / 10,
                lat: 39.0 + latEx + Math.random() / 10,
                status: status,
                videoItem: tmpVideoItem,
              })
            }
            this.markers.push(markerGroup)
            lngEx += 0.1
            if (lngEx > 1) {
              lngEx = 0.0
              latEx -= 0.1
            }
          }
        }
      }
    },
    onScroll () {
      this.scrollInvoked++
    },
    init () {
      for (let type in iconSetting) {
        this.markerIconOptions[type] = {}
        for (let status in iconSetting[type]) {
          const classId = type + status
          const tS = {}
          tS.name = iconSetting[type][status].name
          tS.markerOption = L.DivIconOption(classId, iconSetting[type][status])
          tS.clusterOption = L.DivIconOption(
            'cluster_'.concat(classId),
            {
              ftText: '##',
              ftBeforeStyle: iconSetting[type][status].ftBeforeStyle + 'font-size:17px;',
              ftContentOrClass: iconSetting[type][status].ftContentOrClass,
              bgBeforeStyle: 'font-size:45px;',
              bgStyle: 'border-radius:50%;background:radial-gradient(' + tS.markerOption.color + ' 55%, #FFFFFFff 60%, ' + tS.markerOption.color + ' 70%)',
            }
          )
          this.markerIconOptions[type][status] = tS
        }
      }
      this.makeMarkerObj(73)
      this.createMarkerIcon(this.markers)
    },
    createMarkerIcon (markersGroup) {
      markersGroup.forEach(group => {
        group.children.forEach(marker => {
          marker.icon = new L.DivIcon(this.markerIconOptions[group.type][marker.status].markerOption)
        })
      })
    },
    createClusterOptions (clusterIconOptions) {
      return {
        iconCreateFunction: (cluster) => {
          return new L.DivIcon(
            {
              html: clusterIconOptions.html.replace('##', cluster.getChildCount()),
              className: clusterIconOptions.className,
              iconSize: clusterIconOptions.iconSize,
            }
          )
        },
      }
    },
    cameraCursorHide () {
      if (this.moveMarker) {
        this.moveMarker = null
        this.moveMarkerClassName = ''
        this.$refs.map.mapObject.dragging.enable()
      }
    },
    cameraCursorShow (marker) {
      this.markerActive(marker)
      if (!marker.videoItem) {
        return
      }
      this.moveMarker = marker
      this.moveMarkerClassName = 'camera_cursor'
      this.tarVideo = marker.videoItem.type.indexOf('/') > 0 ? this.$refs.videoJs : this.videoFlv
      this.$refs.map.mapObject.dragging.disable()
    },
    markerActive (marker) {
      this.$refs.points.forEach(point => {
        if (point.mapObject._icon) {
          point.mapObject._icon.classList.remove('active')
          if (marker && point.$attrs.id === marker.id) {
            point.mapObject._icon.classList.add('active')
          }
        }
      })
    },
    listClick (group, marker) {
      if (group.type === 'point') {
        this.$refs.map.mapObject.flyToBounds(L.latLngBounds(group.children))
      } else {
        this.$refs.map.mapObject.flyTo(L.latLng(marker.lat, marker.lng))
      }
    },
    videoInit () {
      this.videoFlv = this.$refs.videoFlv
      this.playerJs = videoJs(
        'videoJs',
        {
          bigPlayButton: false,
          textTrackDisplay: false,
          posterImage: true,
          errorDisplay: false,
          controlBar: true,
          playbackRates: [ 0.7, 1.0, 1.5, 2.0, ], // 播放速度
          language: 'zh-CN',
          notSupportedMessage: '此视频暂时无法播放,请稍后再试',
          techOrder: [ 'html5', 'flvjs', ],
          flvjs: {
            mediaDataSource: {
              isLive: false,
              cors: true,
              withCredentials: false,
            },
          },
        }
      )
    },
    mouseOverVideo (playerType) {
      if (this.moveMarker) {
        const videoItem = this.moveMarker.videoItem
        if (videoItem && videoItem.src) {
          if (videoItem.type.indexOf('/') > 0) {
            if (playerType === 1) {
              this.moveMarkerClassName = this.moveMarkerClassName + ' yes'
            }
          } else {
            if (playerType === 2) {
              this.moveMarkerClassName = this.moveMarkerClassName + ' yes'
            }
          }
        }
      }
    },
    mouseOutVideo () {
      if (this.moveMarkerClassName) {
        this.moveMarkerClassName = this.moveMarkerClassName.replace(' yes', '')
      }
    },
    videoPlay (playerType) {
      if (this.moveMarkerClassName.indexOf('yes') > 0) {
        const videoItem = this.moveMarker.videoItem
        if (!videoItem || !videoItem.src) {
          return
        }
        if (playerType === 1) {
          this.jsPlay(videoItem)
        } else {
          this.flvPlay(videoItem)
        }
      }
    },
    flvPlay (videoItem) {
      if (this.playerFlv != null) {
        this.playerFlv.pause()
        this.playerFlv.unload()
        this.playerFlv.detachMediaElement()
        this.playerFlv.destroy()
        this.playerFlv = null
      }
      this.playerFlv = flv.createPlayer({
        type: videoItem.type,
        isLive: true,
        url: videoItem.src,
      })
      this.playerFlv.attachMediaElement(this.videoFlv)
      this.playerFlv.load()
    },
    jsPlay (videoItem) {
      this.playerJs.src([ { type: videoItem.type, src: videoItem.src, }, ])
      this.playerJs.play()
    },
  },
}

</script>
<style>
.leaflet-tooltip {
  background-color: #2b3575;
  border: 1px solid #00e0ec;
  color: #fff;
}
.v-list-group__header__prepend-icon{
  margin-right: 0 !important;
}
.v-list-group__header__prepend-icon .v-icon {
  color:white !important;
}
.leaflet-interactive.active {
  animation: marker-jump 0.5s 0s alternate infinite;
  -webkit-animation: marker-jump 0.5s 0s alternate infinite;
}
@-webkit-keyframes marker-jump {
  0% {margin-top: -47px;}
  50% {margin-top: -55px;}
}
@keyframes marker-jump {
  0% {margin-top: -47px;}
  50% {margin-top: -55px;}
}
.camera_cursor.yes video{
  cursor: url('../../public/05.png') 17 18, auto !important;
}
.camera_cursor *:not(video){
  cursor: url('../../public/06.png') 17 18, auto !important;
}
video::-webkit-media-controls-play-button {
  display: none !important;
}
/*当前播放时间*/
video::-webkit-media-controls-current-time-display {
  display: none !important;
}
/*剩余时间*/
video::-webkit-media-controls-time-remaining-display {
  display: none !important;
}
/*音量按钮*/
video::-webkit-media-controls-volume-control-container {
  display: none !important;
}
/*// 时间轴*/
video::-webkit-media-controls-timeline {
  display: none !important;
}

::-webkit-scrollbar{
  width: 5px;
}
/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track{
  border-radius: 10px;
  background-color: rgba(0,0,0,0.1);
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb{
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  background-color: rgb(6, 241, 202);
}
</style>
