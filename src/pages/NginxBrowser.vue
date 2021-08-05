<template>
  <v-app id="app">
    <v-navigation-drawer app>
      <v-treeview
        :items.sync="folders"
        return-object
        item-key="url"
        item-text="text"
        activatable
        @update:active="folderClick"
      >
        <template v-slot:append="{ item }" >
          <v-icon color="orange">
            {{ active.url === item.url ? 'mdi-folder-open' : 'mdi-folder' }}
          </v-icon>
        </template>
      </v-treeview>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-breadcrumbs :items="links" divider="-"></v-breadcrumbs>
    </v-app-bar>
    <v-main>
      <v-container class="d-flex flex-wrap"  style="min-height: 900px; width: 100%">
        <v-card tile elevation="5" max-height="250" class="ma-8" :width="$vuetify.breakpoint.smAndDown?'100%':'265'" v-for="(card,i) in active.files" :key="i">
          <a v-if="card.file" :href="card.url" target="_blank">
            <v-img v-if="card.file === 'image'" :src="card.thumUrl"  class="white--text align-end text-right" :aspect-ratio="4/3">
              {{ card.text }}
            </v-img>
            <video v-if="card.file === 'video'"  :src="card.url" controls="controls" height="100%" width="100%" style="max-height: 250px">
              {{ card.text }}
            </video>
          </a>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import $ from 'jquery'
const fileListRoot = '/browser/'
const thumbnailRoot = '/thumbnail/'
export default {
  name: 'browser',
  data () {
    return {
      folders: [ { text: '全部', url: fileListRoot, files: [], children: [], }, ],
      active: { text: '全部', url: '', files: [], },
      links: [],
    }
  },
  methods: {
    async fetchFolder (activeFolder) {
      activeFolder.children = []
      activeFolder.files = []
      await this.$api.get(activeFolder.url).then(res => {
        const pre = $(res.data)[5]
        let picObj = null
        pre.childNodes.forEach((item, i) => {
          const href = $(item).attr('href')
          const fileName = $(item).text()
          if (href) {
            picObj = {}
            picObj.text = fileName
            picObj.url = activeFolder.url + fileName
          } else {
            const photoInfos = item.nodeValue.trim().split(' ')
            const size = photoInfos[photoInfos.length - 1]
            if (size) {
              picObj.date = photoInfos[0]
              picObj.time = photoInfos[1]
              if (size === '-') {
                picObj.children = []
                activeFolder.children.push(picObj)
              } else {
                picObj.size = size
                picObj.file = this.fileType(picObj.text)
                if (picObj.file === 'image') {
                  picObj.thumUrl = activeFolder.url.replace(fileListRoot, thumbnailRoot) + picObj.text
                }
                activeFolder.files.push(picObj)
              }
            }
          }
        })
      }).catch(res => {
        console.log(res)
      })
    },
    folderClick (folder) {
      if (!folder.length) return
      if (!folder.files) {
        this.fetchFolder(folder[0])
      }
      this.active.text = folder[0].url
      this.active.url = folder[0].url
      this.active.files = folder[0].files
      this.links = []
      this.links.push(this.active)
    },
    fileType (fileName) {
      if (!fileName || fileName.lastIndexOf('.') < 0) {
        return ''
      }
      const type = fileName.substring(fileName.lastIndexOf('.'))
      if ('.jpg.png.jpeg.gif.tiff.vnd.wap.bmp.icon'.indexOf(type) > -1) {
        return 'image'
      } else if ('.avi.mp4.mov.3gpp.mpeg.mpg.flv.m4v.mng.asx.asf.wmv'.indexOf(type) > -1) {
        return 'video'
      } else {
        return 'other'
      }
    },
  },
}
</script>
<style></style>
