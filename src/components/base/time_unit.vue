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
    props: ["title", "name", "moduleId", "apis", "value"],
    created() {
      if (this.value) {
        this.self_value = this.value;
        if (!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)) {
          var t = {};
          this.$set(this.$store.state.module_linkage, this.moduleId, t);
        }
        this.$set(this.$store.state.module_linkage[this.moduleId],this.name,this.self_value)
      }
    },
    data() {
      return {
        options: [{
            name: '天',
            value: 'DAY'
          },
          {
            name: '自然周',
            value: 'WEEK'
          },
          {
            name: '自然月',
            value: 'MONTH'
          },
          {
            name: '合计',
            value: 'ALL'
          }
        ],
        self_value: 'DAY',
      }
    },
    methods: {
      onChanged() {
        if (!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)) {
          var t = {};
          t[this.name] = this.self_value;
          this.$set(this.$store.state.module_linkage, this.moduleId, t);
          this.$store.state.module_linkage
        } else {
          // this.$store.state.module_linkage[this.moduleId][this.name] = this.self_value;
          this.$set(this.$store.state.module_linkage[this.moduleId],this.name,this.self_value)
        }
        this.$emit('input', this.self_value);
      }
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
