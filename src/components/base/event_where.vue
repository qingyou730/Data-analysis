<template>
  <!-- 属性筛选基础组件 -->
  <div class="my-form-row">
    <span class="my-form-label">{{title ? title +' :' :''}}</span>
    <div style="display: inline-block;">
      <!-- <el-button @click="add_step(step)" type="primary" icon="el-icon-plus" circle size="mini" class="root-add-btn"></el-button> -->
      <event-where-tree :url_list="url_list" :options="options" :parent="step" :step_children="step.step_children"
        :step_logic="step.step_logic" :add_step="add_step" :add_condition="add_condition" 
        :event_condition_attr="event_condition_attr" v-if="load>3">
      </event-where-tree>
    </div>
  </div>

</template>

<script>
  import eventWhereTree from './event_where_tree.vue';
  export default {
    components: {
      eventWhereTree
    },
    props: ["title", "name", "moduleId", "apis", "value"],
    created() {
      var url_list = {};
      for (var v of this.apis) {
        url_list[v.name] = v.api;
      }
      this.url_list = url_list;
      if(this.value){
        this.step = this.value ;
        this.options.is_edit = true ;
      }
    },
    data() {
      return {
        load: 1,
        url_list: {
          // event_list: "/mmp/model/object_event/event_groups", //事件列表
          // event_sub_list: "/mmp/model/object_event/multistage_attrs", //事件子属性列表
          // agg_op: "/mmp/model/base/functions", //聚合操作符
          // condition_attr_list: "/mmp/model/object_event/analyze_filter_attr", //筛选一级属性列表
          // condition_sub_attr: "/mmp/model/object_event/analyze_filter_second_attr", //筛选子属性接口地址
          // condition_op: "/mmp/model/base/operation", //筛选操作符
          // list_value: "/mmp/model/base/attr_dimensions", //筛选建议值接口
          // compare_op: "/mmp/model/base/agg_operation", //比较操作符
        },
        event_condition_attr: { //针对事件属性的筛选列表

        },
        options: {
          is_edit:false ,
          list_value: {}, //各个对象的建议值
        },
        step: {
          "id": 1,
          "fid": 0,
          "level": 0,
          'step_logic': 'AND',
          'logic_op': 'AND',
          'step_children': [],
          'condition_children': [],
        },
      };
    },
    mounted() {
      this.load_agg_op();
      this.load_condition_op();
      this.load_compare_op();
      if(!this.options.is_edit){
        this.add_step(this.step, 'event');
      }
      return;
    },
    methods: {
      /**
       * 对象发生变化的时候重置值
       */
      initValue:function(){
        this.step = {
          "id": 1,
          "fid": 0,
          "level": 0,
          'step_logic': 'AND',
          'logic_op': 'AND',
          'step_children': [],
          'condition_children': [],
        }
        this.add_step(this.step, 'event');
      },
      /**
       * 对象发生变化的时候初始化属性列表
       */
      initOption:function(){
        this.load =  1 ;
        this.event_condition_attr = {} ;
        this.options= {list_value:{}};
        this.load_agg_op();
        this.load_condition_op();
        this.load_compare_op();
      },
      /**
       * @param {Object} event_id
       * @param {Object} is_object_behavior
       * 加载个事件的一级筛选属性
       */
      load_event_condition_attr: function(event_id, is_object_behavior) {
        if (this.event_condition_attr.hasOwnProperty(event_id)) {
          return;
        } else {
          var url = this.url_list.condition_attr_list;
          var step_attr = 'event_id';
          var behavior_step_attr = 'object_behavior';
          var param = {
            object: this.$store.state.linkage.object,
            property_type: event_id,
            attr_type: is_object_behavior ? 'OBJECT_BEHAVIOR' : 'EVENT',
            step_attr: is_object_behavior ? behavior_step_attr : step_attr,
          }
          var param = this.$generateParams(param);
          //获取一级属性列表
          this.axios.post(url, param).then((response) => {
            var data = response.data;
            if (data.code != 200) {
              this.$error("接口请求失败-user-where-tree-sub-child");
              return;
            }
            var children = data.data;
            children.map((v) => {
              v.leaf = false ; //!v.cascade;
              v.loaded = true  ;
              v.child.map((second)=>{
                second.leaf = !second.cascade;
                second.level  = 2  ;
              })
            })
            this.$set(this.event_condition_attr, event_id, children);
          }).catch((errors) => {
            console.log(errors)
            this.$error("接口请求失败-user-where-tree-sub-child");
          });
        }
      },
      /**
       * 初始化的时候加载比较操作符
       */
      load_compare_op: function() {
        var url = this.url_list.compare_op;
        var param = this.$generateParams(this.$store.state.linkage);
        this.axios.post(url, param).then((response) => {
          var data = response.data;
          if (data.code != 200) {
            this.$error("接口请求失败-event-where-1");
            return;
          }
          var compare_op_list = data.data;
          var compare_op_map = this.$tools.list2map(compare_op_list, 'value');
          this.options.compare_op_list = compare_op_list;
          this.options.compare_op_map = compare_op_map;
          this.load++;
        }).catch((errors) => {
          this.$error("接口请求失败-event-where-2");
        });
      },
      /**
       * 初始化的时候加载聚合操作符
       */
      load_agg_op: function() {
        var url = this.url_list.agg_op;
        var param = this.$generateParams(this.$store.state.linkage);
        this.axios.post(url, param).then((response) => {
          var data = response.data;
          if (data.code != 200) {
            this.$error("接口请求失败-event-where-1");
            return;
          }
          var agg_op_list = data.data;
          var agg_op_map = this.$tools.list2map(agg_op_list, 'value');
          var agg_op_field_map = this.$tools.regroup_op(agg_op_list);
          this.options.agg_op_list = agg_op_list;
          this.options.agg_op_map = agg_op_map;
          this.options.agg_op_field_map = agg_op_field_map;
          this.load++;
        }).catch((errors) => {
          console.log(errors);
          this.$error("接口请求失败-event-where-2");
        });
      },
      /**
       *初始化的时候加载条件的比较操作符
       */
      load_condition_op: function() {
        var url = this.url_list.condition_op;
        var param = this.$generateParams(this.$store.state.linkage);
        this.axios.post(url, param).then((response) => {
          var data = response.data;
          if (data.code != 200) {
            this.$error("接口请求失败-event-where-1");
            return;
          }
          var condition_op_list = data.data
          var condition_op_map = this.$tools.list2map(condition_op_list, 'value');
          var condition_op_field_map = this.$tools.regroup_op(condition_op_list);
          var condition_box_type_map = this.$tools.list2f1f2(condition_op_list, 'value', 'box_type');
          this.options.condition_op_map = condition_op_map;
          this.options.condition_op_field_map = condition_op_field_map;
          this.options.condition_box_type_map = condition_box_type_map;
          this.load++;
        }).catch((errors) => {
          console.log(errors);
          this.$error("接口请求失败-event-where-2");
        });
      },
      add_step: function(node, step_type) {
        // var first_compare_op = this.options.compare_op_list[0];
        var step = {
          'id': this.$store.state.id_count++,
          'fid': node.id,
          "level": node.level + 1,
          "formula": "",
          'step_type': step_type, //步骤类型event_group   步骤组  步骤event   公式formula
          'step_logic': 'AND', //步骤组 AND-OR
          'logic_op': 'AND', //步骤下的子条件  AND OR
          // 'group_type': 'condition_group',
          'compare_id': '', // first_compare_op["value"],
          'compare_name': '', // first_compare_op["name"],
          'compare_op': '', //first_compare_op["op"],
          'compare_value': 0,
          'value_array': [],
          'value': '',
          'name_array': [],
          'alias': '',
          'agg': '',
          'field_name': '',
          'agg_name': '',
          'need_agg': false,
          'field_type': '',
          'event_id': '',
          'children': [],
          'step_children': [],
          'formula_element': [],
        };
        if (step_type == 'event_group' || step_type == 'formula') { //如果是公式或者逻辑组 给他加俩子事件
          this.add_step(step, 'event');
          this.add_step(step, 'event');
        }
        node.step_children.push(step);
      },
      /**
       * 添加子条件
       */
      add_condition: function(node ,group_type ) {
        if (node.hasOwnProperty('event_id') && node.event_id == '') {
          this.$error("请先选择事件");
          return ;
        }
        var condition = {
          "fid": node.id,
          'logic_op': 'AND',
          'group_type': group_type,
          "is_group": false,
          "level": node.hasOwnProperty('event_id') ? 1 : (node.level + 1),
          "id": this.$store.state.id_count++,
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
          'start': '',
          "end": '',
          "in": [],
          "box_type": '',
          "children": [],
        };
        if (group_type  == 'condition_group') { //如果是公式或者逻辑组 给他加俩子事件
          this.add_condition(condition, 'attr');
          this.add_condition(condition, 'attr');
        }
        node.children.push(condition);
      },
    },
    computed: {
      isFollow() {
        return this.$store.state.linkage; //需要监听的数据
      },
    },
    watch: {
      step: {
        handler: function(val, oldval) {
          this.$emit('input', this.step);
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
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
