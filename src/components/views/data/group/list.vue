<template>
  <div>
    <el-row style="border-bottom: 1px solid rgb(241 241 241);">
      <span style="display: inline-block;width: 92px;text-align: center;padding-bottom: 8px;cursor:pointer" :class="{'active-group-border': tab=='static'}"
        @click="changeTab('static')">静态群组</span>
      <span style="display: inline-block;width: 92px;text-align: center;padding-bottom: 8px;cursor:pointer" :class="{'active-group-border': tab=='dynamic'}"
        @click="changeTab('dynamic')">动态群组</span>
      <span style="display: inline-block;width: 92px;text-align: center;padding-bottom: 8px;cursor:pointer" :class="{'active-group-border': tab=='variable'}"
        @click="changeTab('variable')" v-if="$access('/data/variable/list')">公共变量</span>
      <span style="display: inline-block;width: 92px;text-align: center;padding-bottom: 8px;cursor:pointer" :class="{'active-group-border': tab=='routine'}"
        @click="changeTab('routine')" v-if="$access('/data/group/routineconfigure')">常规配置</span>
    </el-row>
    <el-row style="height:12px"></el-row>
    
    <!-- 静态群组列表 -->
    <static-list v-if="tab=='static'"></static-list>
    <!-- 动态群组列表  -->
    <add-dynamic v-if="tab=='dynamic'"></add-dynamic>
    <!-- 公共变量列表  -->
    <variable-list v-if="tab=='variable'"></variable-list>
     <!-- 常规配置  -->
    <routine-configure v-if="tab=='routine'"></routine-configure>
  </div>
</template>
<script>
  import staticList from '@/components/views/data/group/staticList'
  import addDynamic from '@/components/views/data/group/addDynamic'
  import variableList from '@/components/views/data/group/variableList'
  import routineConfigure from '@/components/views/data/group/routineConfigure'

  export default {
    components: {
      addDynamic,
      staticList,
      variableList,
      routineConfigure
    },
    data() {
      return {
        tab:'static', //当前选项卡  static  dynamic  variable
      }
    },
    methods: {
      changeTab(flag) {
        this.tab = flag; //当前选项卡  static  dynamic  variable
      }
    }
  }
</script>
<style>
  .active-group-border {
    border-bottom: 1px solid #0e73ff;
  }
</style>
