<template>
  <div>
    <div class="my-form-row">
      <span class="my-form-label">分析对象 :</span>
      <el-select style="width: 150px;" v-model="self_value.object" @change="setLinkage($event)" placeholder="请选择">
        <el-option v-for="item in options.object_type_list" :key="item.value" :label="item.name" :value="item.value"></el-option>
      </el-select>
      <el-button @click="confirmObject" :type="is_confirm_object ? 'primary' : 'info' " circle icon="el-icon-check"  size="mini"></el-button>
      <span v-if="is_confirm_object" :class="['input-span' ,self_value.type=='waitToSet' ? '' : 'hover-show' ]">
      是否分析群组
      <el-button @click="setType('platform')" :type="self_value.type=='platform' ? 'primary' : 'info' " circle icon="el-icon-close"  size="mini"></el-button>
      <el-button @click="setType('group')"    :type="self_value.type=='group' ? 'primary' : 'info' " circle icon="el-icon-check"  size="mini"></el-button>
      </span>
    </div>
    <div v-if="self_value.type=='platform'" class="my-form-row">
      <span class="my-form-label">选择平台 :</span>
      <multiple-select v-model="self_value.platform" :data_url="url_list.platform_list"></multiple-select>
    </div>

    <timer v-if="self_value.type=='platform'" title="时间范围" v-model="self_value.time"></timer>
    <div v-if="self_value.type=='group'" class="my-form-row">
      <span class="my-form-label">群组123 :</span>
      <!--<single v-model="self_value.user_group" :data_url="url_list.group_list"></single>-->
      <dynamic-single v-model="self_value.user_group" :data_url="url_list.group_list" :self_value="self_value"></dynamic-single>
    </div>

  </div>
</template>
<script>
  import timer from './timer.vue';
  import dynamicSingle from '@/components/base/dynamicSingle'
  import multipleSelect from '@/components/base/multiple_select'
  export default {
    components: {
      timer: timer,
      dynamicSingle: dynamicSingle,
      multipleSelect: multipleSelect,
    },
    props: ["title" ,"name" ,"moduleId" ,"apis","value"],
    created() {
      var url_list = {};
      for(var v of this.apis){
        url_list[v.name] = v.api ;
      }
      this.url_list = url_list  ;
    },
    data() {
      return {
        self_value: {
          object: 'role', //分析对象
          time: {
            range: [], //时间范围 数组
            type: 'STATIC', //STATIC 静态 //DYNAMIC-动态
            dynamic_time: 'LAST_WEEK', //动态时间枚举值
            start: '',
            end: '',
          },
          user_group: '', //用户包
          platform: [], //平台
          type: 'waitToSet',
          group_type: '',
          sql: '',
        },
        is_confirm_object: false,
        options: {
          object_type_list: [], //一级属性列表
          group_list: [], //各个对象的建议值
          platform_list: [],
        },
        url_list: {
          // object_type_list: '/mmp/model/base/object_type_list/', //对象列表
          // group_list: '/mmp/group/group_list/', //用户包列表接口地址
          // platform_list: '/mmp/model/base/platforms/', //平台列表接口地址
        }
      }
    },
    methods: {
      setLinkage: function(val) {
        this.$set(this.$store.state.linkage,'object',val) ;
      },
      confirmObject() {
        this.is_confirm_object = true;
      },
      setType(type){//是否选择用户包
        this.self_value.type = type ;
        if(type == 'group'){
          this.self_value.platform = [] ;
          this.self_value.time = {
            range: [], //时间范围 数组
            type: 'STATIC', //STATIC 静态 //DYNAMIC-动态
            dynamic_time: 'LAST_WEEK', //动态时间枚举值
            start: '',
            end: '',
          };
        }
        if(type == 'platform'){
          this.self_value.user_group =  '';
        }
      }
    },
    watch: {
      self_value: {
        handler: function(val, oldval) {
          this.$emit('input', this.self_value);
        },
        immediate:true,
        deep: true //对象内部的属性监听，也叫深度监听
      },
    },
    mounted() {
      var url_object_type_list = this.url_list.object_type_list;
      var url_group_list = this.url_list.group_list;
      var url_platform_list = this.url_list.platform_list;
      var param = this.$generateParams({
        "object": this.$store.state.linkage.object,
      });
      //获取分析对象列表
      this.axios.post(url_object_type_list, param).then((response) => {
        var data = response.data;
        if (data.code != 200) {
          this.$error("接口请求失败ananlyze-object-1");
          return;
        }
        var object_type_list = data.data;
        this.options.object_type_list = object_type_list;
        this.self_value.object = object_type_list[0].value;
        this.setLinkage(this.self_value.object);
      }).catch((errors) => {
        this.$error("接口请求失败ananlyze-object-2");
      });
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
