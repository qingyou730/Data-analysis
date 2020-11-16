<template>
    <p>{{msg}}</p>
</template>

<script>
export default {
  name: 'list',
  data () {
    return {
      msg: '/content/news/list'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}a
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
