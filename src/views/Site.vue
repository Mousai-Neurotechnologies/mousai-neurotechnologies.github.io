<template>
  <Nav/>
  <router-view></router-view>
  <Footer/>
</template>

<script>
  // @ is an alias to /src
  import Nav from '@/components/Nav.vue'
  import Footer from '@/components/Footer.vue'

  export default {
    name: 'Site',
    components: {
      Nav,
      Footer
    }
  }
</script>
