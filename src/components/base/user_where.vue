<template>
  <!-- 属性筛选基础组件 -->
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
      <user-where-tree v-if="load>2" :attr_type="attr_type" :url_list="url_list" :options="options" :parent="where" :children="where.children"
        :logic_op="where.logic_op" :add_children="add_children" :children_num="where.children.length" >
      </user-where-tree>
    </div>
  </div>

</template>
<script>
  import UserWhereTree from './user_where_tree';
  export default {
    components: {
      UserWhereTree: UserWhereTree,
    },
    props: ["title", "name", "moduleId", "apis", "value"],
    created() {
      var url_list = {};
      for (var v of this.apis) {
        url_list[v.name] = v.api;
      }
      this.url_list = url_list;
      if(this.value){
        this.where = this.value ;
        this.options.is_edit = true ;
        this.attr_type = this.$store.state.module_linkage[this.moduleId].attr_type ;
      }
    },
    data() {
      return {
        load:0 ,
        id_count: Date.parse(new Date()),
        msg: '/content/category/add',
        options: {
          is_edit:false ,
          attr_list: [], //一级属性列表
          list_value: {}, //各个对象的建议值
          attr_type_list:{} ,//区间/每日
        },
        attr_type: 'OBJECT_DAY', //OBJECT_DAY-区间   //OBJECT_RANGE-每日
        where: {
          "id": 0,
          "fid": 0,
          "level": 0,
          'logic_op': 'AND',
          'children': [],
        },
        url_list: {
          // url_attr: '/mmp/model/event/filter_attr/', //属性列表接口
          // url_sub_attr: '/mmp/model/event/filter_sub_attr/', //子级属性接口地址
          // url_op: '/mmp/model/base/operation/', //操作符列表下拉框的接口地址
          // url_list_value: '/mmp/model/base/attr_dimensions/', //建议值
          // url_range_list: '/mmp/model/base/range_attr_list/', //区间操作符接口地址
          // attr_type_list: '' , //属性类型列表接口地址
        }
      }
    },
    methods: {
      test() {
        console.log(this.where)
      },
      /**
       * 初始化值
       */
      initValue:function(){
        this.where = {
          "id": 0,
          "fid": 0,
          "level": 0,
          'logic_op': 'AND',
          'children': [],
        };
        this.add_children(this.where,'attr') ;
      },
      initOption:function(){
        this.options.attr_list = [] ;
        //获取一级属性列表
        var param = this.$generateParams(this.$store.state.linkage);
        var url_attr = this.url_list.url_attr;
        this.axios.post(url_attr, param).then((response) => {
          var data = response.data;
          if (data.code != 200) {
            this.$error("接口请求失败-user-where-6");
            return;
          }
          var attr_list = data.data[0].child
          attr_list.map((v) => {
            v.leaf = !v.cascade
          })
          this.options.attr_list = attr_list;
        }).catch((errors) => {
          this.options.attr_list = [] ;
          console.log(errors)
          // this.$error("接口请求失败-user-where-1");
        });
      },
      remove_node(parent, index) { //删除树节点
        parent.splice(index, 1);
      },
      add_children(node , group_type) { //给where条件增加叶子节点
        var condition = {
          "fid": node.id,
          'logic_op': 'AND',
          'group_type': group_type,   //logic_group   attr
          "is_group": false,
          "level": node.level + 1,
          "id": this.id_count++,
          'cascade': false,
          'value_array': [],
          'name_array': [],
          'value': '',
          'op': '',
          'field_name': '',
          'field_type': '',
          'op_name': '',
          "need_op": false,
          "list_value": '',
          'left': '',
          "right": '',
          "in": [],
          "box_type": '',
          "children": [],
          "type": "STATIC",
          "fast_name": "",
          "fast": "",
          "range_attr": '',
          "range_attr_name": '',
          "real_value":"",
          "parent_id":"",
        };
        if (group_type  == 'logic_group') { //如果是公式或者逻辑组 给他加俩子事件
          this.add_children(condition, 'attr');
          this.add_children(condition, 'attr');
        }
        node.children.push(condition);
      },
    },
    computed: {
      isFollow() {
        return this.$store.state.linkage; //需要监听的数据
      },
      module_range_type() { //模块内联动区间每日是否发生变化
      	if (!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)) {
      		return {};
      	} else {
      		return this.$store.state.module_linkage[this.moduleId];
      	}
      }
    },
    watch: {
      where: {
        handler: function(val, oldval) {
          this.$emit('input', this.where);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
      isFollow: { //联动参数变化的时候
        handler() {
          this.initValue();
          this.initOption();
        },
        deep: true
      },
      module_range_type: { //联动参数变化的时候
        handler(newVal,oldVal) {
          if(this.attr_type == this.$store.state.module_linkage[this.moduleId].attr_type ){
            return   ;
          }
          if(this.$store.state.module_linkage.hasOwnProperty(this.moduleId) && this.$store.state.module_linkage[this.moduleId].hasOwnProperty("attr_type")){
            this.attr_type = this.$store.state.module_linkage[this.moduleId].attr_type ;
          }
          this.initValue();
          this.initOption();
        },
        deep: true
      },
    },

    mounted() {
      // 一级下拉列表值的接口地址
      var url_attr = this.url_list.url_attr;
      //子级属性接口地址
      var url_sub_attr = this.url_list.url_sub_attr;
      //操作符列表下拉框的接口地址
      var url_op = this.url_list.url_op;
      //建议值
      var url_list_value = this.url_list.url_list_value;
      //区间操作符接口地址
      var url_range_list = this.url_list.url_range_list;
      var param = this.$generateParams(this.$store.state.linkage);
      
      //获取操作符列表接口
      this.axios.post(url_op, param).then((response) => {
        var data = response.data;
        if (data.code != 200) {
          this.$error("接口请求失败-user-where-4");
          return;
        }
        var op_list = data.data
        var op_map = this.$tools.list2map(op_list, 'value');
        var op_field_map = this.$tools.regroup_op(op_list);
        var box_type_map = this.$tools.list2f1f2(op_list, 'value', 'box_type');
        this.options.op_map = op_map;
        this.options.op_field_map = op_field_map;
        this.options.box_type_map = box_type_map;
        this.load ++ ;
      }).catch((errors) => {
        this.$error("接口请求失败-user-where-2");
      });
      //获取区间操作符
      this.axios.post(url_range_list, param).then((response) => {
        var data = response.data;
        if (data.code != 200) {
          this.$error("接口请求失败-user-where-5");
          return;
        }
        var temp_range_list = data.data
        var range_attr_field_type_map = this.$tools.list2f1f2(temp_range_list, 'field_type', 'range_op');
        var rane_attr_name_map = {}
        temp_range_list.map((f) => {
          f.range_op.map((v) => {
            rane_attr_name_map[v["value"]] = v["name"];
          })
        })
        this.options.range_attr_field_type_map = range_attr_field_type_map;
        this.options.rane_attr_name_map = rane_attr_name_map;
        this.load ++ ;
      }).catch((errors) => {
        this.$error("接口请求失败-user-where-3");
      });
      //区间每日
      var url = this.url_list.attr_type_list  ;
      var requestData = this.$generateParams(this.$store.state.linkage);
      this.axios.post(url, requestData).then((rep) => {
        var data = rep.data;
        if (data.code != 200) {
          console.log("接口请求失败" + this.url + 'single');
        }
        this.options.attr_type_list = data.data;
        if(!this.attr_type){
          this.attr_type = this.options.attr_type_list[0].value ;
        }
        this.load ++ ;
      }).catch(function(error) {
        console.log("接口请求失败" + this.url + 'single');
      });
      if(this.where.children.length == 0 ){
        if(!this.options.is_edit){
          this.add_children(this.where,'attr') ;
        }
      }else{
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
