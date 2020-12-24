<template>
  <div>
    <show-report id="5faba14462fa664dd8642025"></show-report> 
  </div>
</template>

<script>
  import createReport from '@/components/views/custom/base/createReport.vue'
  import showReport from '@/components/views/custom/base/showReport.vue'
  import windowPeriod from '@/components/base/window_period.vue'
  export default {
    components:{
      createReport,
      showReport
    },
    data() {
      return {
        showCreateReport:false ,
        window:null,
        msg: '/content/news/list'
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1,
  h2 {
    font-weight: normal;
  }

  a ul {
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
