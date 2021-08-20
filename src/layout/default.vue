<template>
  <v-app>
    <v-app-bar app dense color="teal lighten-3" style="z-index:1500">
      <v-tabs >
        <v-tabs-slider color="yellow"></v-tabs-slider>
        <v-tab v-for="(item, index) in $router.options.routes" :key="index" :to="item.path">
          {{ item.name }}
        </v-tab>
      </v-tabs>
    </v-app-bar>
    <router-view/>
  </v-app>
</template>
