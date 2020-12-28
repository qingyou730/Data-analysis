<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
      <el-select v-model="self_value" filterable @change="setLinkage($event)">
        <el-option v-for="item in options" :key="item.value" :label="item.name" :value="item.value"></el-option>
      </el-select>
    </div>
  </div>

</template>

<script>
  export default {
    props: ["title", "name", "moduleId", "apis", "value"],
    data() {
      return {
        self_value: 'role',
        options: [],
        url_list: {
          // data_list: '/mmp/model/base/object_type_list/', //列表接口
        }
      }
    },
    created() {
      if(this.value && this.value != ''){
        if(this.value != this.self_value){
          this.self_value = this.value  ;
          this.setLinkage(this.value) ;
        }
      }
      var url_list = {};
      for (var v of this.apis) {
        url_list[v.name] = v.api;
      }
      this.url_list = url_list;
    },
    mounted() {
      this.getData();
      this.$emit('input', this.self_value);
    },
    methods: {
      setLinkage: function(val) {
        this.$set(this.$store.state.linkage,this.name,val) ;
      },
      getData() {
        var url = this.url_list.data_list;
        var requestData = this.$generateParams();
        this.axios.post(url, requestData).then((rep) => {
          var data = rep.data;
          if (data.code != 200) {
            console.log("接口请求失败" + this.url + 'single');
          }
          this.options = data.data;
          // this.self_value = this.options[0].value ;
          // this.setLinkage(this.options[0].value) ;
        }).catch(function(error) {
          console.log("接口请求失败" + this.url + 'single');
        });
      }
    },
    computed: {

    },
    watch: {
      self_value: { //value值变化的时候给上级v-model
        handler: function(val, oldval) {
          this.$emit('input', this.self_value);
        },
        deep: true //对象内部的属性监听，也叫深度监听
      },
    },
  }
</script>

<style>
</style>
