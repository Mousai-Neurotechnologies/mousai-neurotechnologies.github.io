<template>
    <section id="footer">
      <div>
    <p style="font-size: 16px;">Made with &#10084;&#65039; and &#9749;</p>
    <p>© 2020 Mousai Neurotechnologies</p>
      </div>
      <div>
      <p class ='unavailable'>Newsletter</p>
      <p><a class ='link' href="mailto:contact@mousaineuro.com" target="_blank">Contact</a></p>
      <p class ='unavailable'>Sitemap</p>
      </div>
      <div>
        <p class ='unavailable'>Code of Conduct</p>
        <p class ='unavailable'>Terms of Service</p>
        <p class ='unavailable'>Privacy Policy</p>
      </div>
    </section>
</template>

<script>
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  p {
    font-size: 12px;
  }

  #footer {
    display: flex;
    height: 200px;
    justify-content: space-between;
    align-items: center;
    margin: auto;
    padding: 0px 50px;
    background: #111111;
  }

  .unavailable{
    color: #777777;
    cursor: default;
  }

</style>
