<template>
  <div id="hero" v-bind:style="{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(' + imgSrc + ')' }">
    <section id="hero-content" v-bind:style="{ textAlign: align}">
    <h1>{{ title }}</h1>
    <h3>{{ subtitle }}</h3>
    <p>{{ description }}</p>
    <div id="buttons">
      <router-link v-bind:to='button1_href' rel="noopener">{{button1_text}}</router-link>
      <router-link v-bind:to= 'button2_href' rel="noopener"> {{button2_text}} </router-link>
    </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Hero',
  props: {
    imgSrc: String,
    title: String,
    subtitle: String,
    description: String,
    button1_href: String,
    button1_text: String,
    button2_href: String,
    button2_text: String,
    align: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #hero{
  background-position: center;
  background-size: cover;
    background-attachment: fixed;
  height: calc(100vh - 75px);
  width: 100vw;
  display:table-cell;
  vertical-align: middle;
}

.left {
  text-align: left;
}

.center {
  text-align: center;
}

@media (max-width: 630px) {
  #buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
}

#buttons {
  margin: 50px 0px;
}

h1, h3{
  margin: 10px 0px 0px 0px;
}

a {
  margin: 00px 20px 20px 0px;
  padding: 10px 20px;
  /* background: #FF76E9; */
  color: whitesmoke;
  text-decoration: none;
  border: 1px solid whitesmoke;
  border-radius: 5px;
  transition: 0.5s;
}

a:hover{
  color: #FF76E9;
  border-color: #FF76E9;
}
</style>
