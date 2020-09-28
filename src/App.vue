<template>
  <div id="nav">
    <img alt="Vue logo" src="./assets/logo_long.png">
    <div id="links">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About Us</router-link>
      <router-link to="/contact">Contact</router-link>
    </div>
  </div>
  <router-view/>
</template>

<style>
  html, body{
    margin: 0px;
    background: black;
  }

  div {
    display: block;
  }

  h1{
    font-size: 50px;
    font-weight: 400;
  }

  h2{
    font-size: 40px;
    font-weight: 400;
  }

  h3{
    font-size: 25px;
    font-weight: 400;
  }

  section{
    color: white;
    margin: 0px 75px;
  }

#app {
  font-family: Montserrat, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
}

img {
  height: 40px;
}

#nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 75px;
  background: #111111;
  padding: 0px 50px;
}

a {
  color: #FF76E9;
  text-decoration: none;
}

#nav a {
  color: white;
  padding-left: 20px;
}

#nav a.router-link-exact-active {
  color: #FF76E9;
}
</style>
