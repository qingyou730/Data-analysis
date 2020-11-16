<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
    <el-select v-model="self_value" @change="onChanged" style="width: 120px;">
      <el-option v-for="item in options" :key="item.value" :label="item.name" :value="item.value"></el-option>
    </el-select>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["title" ,"name" ,"moduleId" ,"apis","value"],
    created() {
      var url_list = {};
      for(var v of this.apis){
        url_list[v.name] = v.api ;
      }
      this.url_list = url_list  ;
      if (this.value) {
        this.self_value = this.value;
        if(!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)){
          var t = {} ;
          t[this.name] = this.self_value ;
          this.$set(this.$store.state.module_linkage , this.moduleId,t) ;
        }else{
          this.$store.state.module_linkage[this.moduleId][this.name] = this.self_value;
        }
      }
    },
    data() {
      return {
        options: [],
        self_value: 'OBJECT_DAY',
        url_list:{
          // 'data_list  ':'/mmp/model/base/scope_attr' , //选项列表接口
        },
      }
    },
    methods: {
      onChanged() {
        if(!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)){
          var t = {} ;
          t[this.name] = this.self_value ;
          this.$set(this.$store.state.module_linkage , this.moduleId,t) ;
          this.$store.state.module_linkage
        }else{
          this.$store.state.module_linkage[this.moduleId][this.name] = this.self_value;
        }
        this.$emit('input', this.self_value);
      }
    },
    mounted() {
      var url = this.url_list.data_list  ;
      var requestData = this.$generateParams(this.$store.state.linkage);
      this.axios.post(url, requestData).then((rep) => {
        var data = rep.data;
        if (data.code != 200) {
          console.log("接口请求失败" + this.url + 'single');
        }
        this.options = data.data;
        if(!this.self_value){
          this.self_value = this.options[0].value ;
        }
        if(!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)){
          var t = {} ;
          t[this.name] = this.self_value ;
          this.$set(this.$store.state.module_linkage , this.moduleId,t) ;
          this.$store.state.module_linkage
        }else{
          this.$store.state.module_linkage[this.moduleId][this.name] = this.self_value;
        }
      }).catch(function(error) {
        console.log("接口请求失败" + this.url + 'single');
      });
    },
    watch: {
      self_value: {
        handler: function(val, oldval) {
          this.$emit('input', this.self_value);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
    },

  }
</script>

<style>
</style>
