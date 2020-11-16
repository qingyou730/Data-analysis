<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}}:</span>
    <el-select v-model="self_value" filterable style="width: 120px;">
      <el-option v-for="item in options" :key="item.value" :label="item.name" :value="item.value"></el-option>
    </el-select>
    计算
  </div>
</template>

<script>
  export default {
    props: ["title" ,"name" ,"moduleId" ,"apis","value"],
    data() {
      return {
        self_value: '',
        options: [{
            "name": "天",
            "value": "DAY"
          },
          {
            "name": "小时",
            "value": "HOUR"
          },
          {
            "name": "自然周",
            "value": "WEEK"
          },
          {
            "name": "自然月",
            "value": "MONTH"
          },
          {
            "name": "分钟",
            "value": "MINUTE"
          },
          {
            "name": "合计",
            "value": "ALL"
          }
        ],
      }
    },
    created() {
      if( this.value){
        this.self_value = this.value;
      }else{
        this.self_value = 'DAY';
      }

    },
    methods: {},
    computed: {
      isFollow() {
        return this.$store.state.linkage; //需要监听的数据
      }
    },
    watch: {
      self_value: { //value值变化的时候给上级v-model
        handler: function(val, oldval) {
          this.$emit('input', this.self_value);
        },
        immediate: true,
        deep: true //对象内部的属性监听，也叫深度监听
      },
    },
  }
</script>

<style>
</style>
