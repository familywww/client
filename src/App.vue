<template>
  <layout/>
</template>

<script>
export default {
  name: 'App',
  components: {
    layout: () => import('./layout/default'),
  },
}
</script>
<style>
html {
  overflow: auto !important;
  min-width: 1024px;
}
::-webkit-scrollbar{
  width: 5px;
  height: 5px;
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
