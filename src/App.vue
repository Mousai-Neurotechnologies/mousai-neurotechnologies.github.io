
<template>
  <router-view> </router-view>
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

  button {width: 100%; height: 50px; cursor: pointer; color: white;
    background: #7373FF; border: none; padding: 10px; font-weight: bold;}

  section{
    color: white;
    margin: 75px;
  }

  #app {
  font-family: Montserrat, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
}

  #messages li { flex-grow: 1; padding: 5px 10px; color: whitesmoke;}
  #messages li:nth-child(odd) { background: rgb(15,15,15)}

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
  position: sticky;
  top: 0;
  left: 0;
}

.stretch{
  display: flex;
  padding: 50px;
  flex-grow: 1;
  justify-content: flex-end;
}

a.text {
  color: #FF76E9;
  text-decoration: none;
}

a.text:visited {
  color: #999999;
}

#nav a.link {
  margin-left: 20px;
  font-size: 12px;
}

a.link {
  color: white;
  text-decoration: none;
  position: relative;
  cursor: pointer;
  padding: 5px 0px;
  transition: .5s;
  }

a.link:hover {
   color: #FF76E9;
}

a.link:before {
   content: "";
   position: absolute;
   width: 0;
   height: 1px;
   bottom: 0;
   left: 0;
   background-color: white;
  visibility: hidden;
  transition: all 0.3s ease-in-out;
}

a.link:hover:before {
   visibility: visible;
   width: 100%;
 }

a.link.router-link-exact-active {
  color: #FF76E9;
}

@media (max-width: 630px) {
  #nav a.link{
    display: none;
  }
}

</style>
