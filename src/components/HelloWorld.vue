<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      To see our demo of Brainstorm,<br>
      check out
      <a href="https://app.mousaineuro.com/" target="_blank" rel="noopener">this page</a>.
    </p>

    <p>
      To see Invocations: our interactive blog,<br>
      check out
      <a href="blog.mousaineuro.com/" target="_blank" rel="noopener">this page</a>.
    </p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #FF76E9;
}
</style>
