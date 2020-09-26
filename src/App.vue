<template>
  <img alt="Mousai logo" src="./assets/logo.png" style="height:300px; margin: 50px;">
  <HelloWorld msg="Welcome to Mousai Neurotechnologies"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
  html,body{
    background: #121212;
  }
#app {
  font-family: Montserrat, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  margin-top: 60px;
}
</style>
