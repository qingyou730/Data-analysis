<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
      <el-select v-model="self_value" filterable>
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
        self_value: '',
        options: [],
        url_list: {
          // data_list: '/mmp/group/group_list/', //属性列表接口
        }
      }
    },
    created() {
      if(this.value) {
        this.self_value = this.value;
      }
      var url_list = {};
      for (var v of this.apis) {
        url_list[v.name] = v.api;
      }
      this.url_list = url_list;
    },
    mounted() {
      this.getData();
    },
    methods: {
      getData() {
        var url = this.url_list.data_list;
        var requestData = this.$generateParams(this.$store.state.linkage);
        this.axios.post(url, requestData).then((rep) => {
          var data = rep.data;
          if (data.code != 200) {
            console.log("接口请求失败" + url + 'single');
          }
          this.options = data.data;
        }).catch(function(error) {
          console.log("接口请求失败" + url + 'single');
        });
      }
    },
    computed: {
      isFollow() {
        return this.$store.state.linkage; //需要监听的数据
      }
    },
    watch: {
      isFollow: { //联动参数变化的时候
        handler() {
          this.getData();
          this.self_value = '';
        },
        deep: true
      },
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
