<template>
  <el-cascader placeholder="输入可搜索" :props="attrProps" v-model="attrMap.mappings"
    v-if="selectValue!=''"></el-cascader>
</template>

<script>
  export default{
    props:["attrMap","selectValue","object"],
    data() {
      return {
        url_list:{
          url_event_private_attr: '/mmp/behavior/eventPrivateAttr',
          analyze_filter_sub_attr: '/mmp/model/event/analyze_filter_sub_attr',
        },
        attrProps: {
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          value: 'value',
          lazyLoad: ((node, resolve) => {
            const parent = node.data;
            var level = node.level;
            
            if(level == 0){
              let param = {
                event_id: this.selectValue,
                object: 'role'
              }
              let dataMap = this.$generateParams(param)
              this.axios.post(this.url_list.url_event_private_attr, dataMap).then(res => {
                if (res.data.code == 200) {
                  var attr_list = res.data.data[0].child
                  attr_list.map((v) => {
                    v.leaf = !v.cascade
                  })
                  resolve(attr_list)
                } else {
                  this.$error("获取属性映射集合错误！")
                }
              }).catch(error => {
                this.$error("请求属性映射集合接口失败！")
              })
            }
            if (level == 1) {
              let param = {
                "attr_type": "EVENT",
                "object": this.$route.query.object,
                "property_type": node.data.value,
                "step_attr": "attr"
              }
              let dataMap = this.$generateParams(param)
              this.axios.post(this.url_list.analyze_filter_sub_attr, dataMap).then(res => {
                if (res.data.code == 200) {
                  let children = res.data.data;
                  for (let child of children) {
                    child.leaf = true;
                  }
                  resolve(children);
                }
              })
            }
          })
        },
      }
    }
  }
</script>

<style>
</style>
