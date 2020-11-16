<template>
  <div>
    <!-- 漏斗步骤列表 -->
    <div v-for="(node,index) in step" :key="node.id" class="my-form-row">
      <span class="my-form-label">第{{index+1}}步</span>
      <div style="display: inline-block;">
        <!--属性选择联级菜单-->
        <el-cascader :ref="'event_node_' + node.id" @change="change_event($event,node)" filterable v-model="node.value_array"
          :props="cascader_props">
        </el-cascader>

        <el-dropdown placement="bottom">
          <el-button type="primary" icon="el-icon-plus" circle size="mini"></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="add_step()" v-if="index!=0">步骤</el-dropdown-item>
            <el-dropdown-item @click.native="add_condition(node,'attr')">子条件</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button @click="remove_step(index)" v-if="step.length>2" type="primary" icon="el-icon-minus" circle size="mini"></el-button>

        <event-sub-condition-tree v-if="node.event_id && load>1" :url_list="url_list" :options="options"
          :parent="node" :children="node.children" :add_condition="add_condition" :event_condition_attr="event_condition_attr"
          :event_id="node.event_id" :is_object_behavior="node.is_object_behavior">
        </event-sub-condition-tree>
      </div>
    </div>
  </div>
</template>

<script>
  import eventWhereTree from './event_where_tree.vue';
  import eventSubConditionTree from "./event_sub_condtion/event_sub_condition_tree.vue"
  export default {
    components: {
      eventWhereTree,
      eventSubConditionTree
    },
    props: ["title", "name", "moduleId", "apis", "value"],
    created() {
      // var url_list = {};
      // for (var v of this.apis) {
      //   url_list[v.name] = v.api;
      // }
      // this.url_list = url_list;
      if (this.value) {
        this.step = this.value;
        this.options.is_edit = true;
      }
    },
    data() {
      return {
        load: 1,
        url_list: {
          event_list: "/mmp/model/event/event_dim_groups", //事件列表
          event_sub_list: "/mmp/model/object_event/multistage_attrs", //事件子属性列表
          condition_attr_list: "/mmp/model/object_event/analyze_filter_attr", //筛选一级属性列表
          condition_sub_attr: "/mmp/model/object_event/analyze_filter_second_attr", //筛选子属性接口地址
          condition_op: "/mmp/model/base/operation", //筛选操作符
          list_value: "/mmp/model/base/attr_dimensions", //筛选建议值接口
        },
        event_condition_attr: { //针对事件属性的筛选列表

        },
        options: {
          is_edit: false,
          list_value: {}, //各个对象的建议值
        },
        step: [

        ],
        cascader_props: { //级联菜单的选项
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          lazyLoad: ((node, resolve) => {
            const level = node.level;
            if (node.root) {
              var url = this.url_list.event_list;
              var param = this.$generateParams(this.$store.state.linkage);
              this.axios.post(url, param).then((response) => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-event-where-1");
                  return;
                }

                var event_list = [];
                if (data.data.length > 0 && data.data[0].hasOwnProperty('child')) {
                  var event_list = data.data[0].child;
                }
                event_list.map((v) => {
                  v.leaf = !v.cascade;
                  v.level = 1;
                })
                resolve(event_list);
              }).catch((errors) => {
                console.log(errors);
                this.$error("接口请求失败-event-where-2");
              });
              return;
            }

            const parent = node.data;

            var is_object_behavior = false;
            if (parent.hasOwnProperty("is_object_behavior") && parent.is_object_behavior) {
              is_object_behavior = true;
            }
            var step_attr = ['', 'event_group', 'event_id', 'attr'];
            var behavior_step_attr = ['', 'object_behavior', 'behavior_final_attr'];

            var param = {
              object: this.$store.state.linkage.object,
              property_type: parent.value,
              attr_type: is_object_behavior ? 'OBJECT_BEHAVIOR' : 'EVENT',
              step_attr: is_object_behavior ? behavior_step_attr[level] : step_attr[level],
            }


            //接口参数
            // attr_type :   OBJECT_BEHAVIOR-行为集合  EVENT-事件
            /*step_attr
                event_group 根据事件分类返回事件列表(1级)
                event_id 根据事件ID返回事件属性（2级）
                attr    根据二级属性查找属性列表  （3级）
        
                object_behavior  查询行为集合列表 1级
                behavior_final_attr  查询集合行为下属性 2级
        
               */
            var param = this.$generateParams(param);
            var event_sub_list = this.url_list.event_sub_list;

            //获取一级属性列表
            this.axios.post(event_sub_list, param).then((response) => {
              var data = response.data;
              if (data.code != 200) {
                this.$error("接口请求失败-user-where-tree-sub-child");
                return;
              }
              var children = data.data;
              children.map((v) => {
                v.leaf = true;
                v.level = level + 1;
              })
              resolve(children);
            }).catch((errors) => {
              console.log(errors)
              this.$error("接口请求失败-user-where-tree-sub-child");
            });
          })
        }
      };
    },
    mounted() {
      this.load_condition_op();
      if (!this.options.is_edit) {
        this.add_step();
        this.add_step();
      }
      return;
    },
    methods: {
      /**
       * 对象发生变化的时候重置值
       */
      initValue: function() {
        this.step = [];
        this.add_step();
        this.add_step();
      },
      /**
       * 对象发生变化的时候初始化属性列表
       */
      initOption: function() {
        this.load = 1;
        this.event_condition_attr = {};
        this.options = {
          list_value: {}
        };
        this.load_condition_op();
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
              v.leaf = false; //!v.cascade;
              v.loaded = true;
              v.child.map((second) => {
                second.leaf = !second.cascade;
                second.level = 2;
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
      /**
       * 删除步骤
       */
      remove_step: function(index) {
        this.step.splice(index, 1);
      },
      /**
       * 增加步骤
       * @param {Object} node
       * @param {Object} step_type
       */
      add_step: function(node, step_type) {
        // var first_compare_op = this.options.compare_op_list[0];
        var step = {
          'id': this.$store.state.id_count++,
          'fid': 0,
          "level": 1,
          'logic_op': 'AND', //步骤下的子条件  AND OR
          // 'group_type': 'condition_group',
          'value_array': [],
          'value': '',
          'name_array': [],
          'event_id': '',
          'children': [],
        };
        this.step.push(step);
      },
      /**
       * 添加子条件
       */
      add_condition: function(node, group_type) {
        if (node.hasOwnProperty('event_id') && node.event_id == '') {
          this.$error("请先选择事件");
          return;
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
        if (group_type == 'condition_group') { //如果是公式或者逻辑组 给他加俩子事件
          this.add_condition(condition, 'attr');
          this.add_condition(condition, 'attr');
        }
        node.children.push(condition);
      },
      /**
       * @param {Object} value
       * @param {Object} node
       * 事件的属性发生变化
       */
      change_event: function(value, node, ) {
        //获取选中的option
        var checked_node = this.$refs['event_node_' + node.id][0].panel.getNodeByValue(value);
        var temp_select_options = checked_node.pathNodes;
        var select_options = [];
        temp_select_options.map((v) => {
          select_options.push(v.data);
        })

        var name_array = [];
        for (var i in select_options) {
          name_array.push(select_options[i].name);
        }
        var finnal_option = select_options[select_options.length - 1]
        var finnal_value = finnal_option.value;
        var event_id = value[1];

        var finnal_value = finnal_option.value;
        var event_id = value[1];
        var name_array = [];
        for (var i in select_options) {
          if (select_options[i].hasOwnProperty('name')) {
            name_array.push(select_options[i].name);
          }
        }
        node.value_array = value;
        node.name_array = name_array;
        node.value = finnal_value;
        node.event_id = event_id;
        var is_object_behavior = 0;
        if (finnal_option.hasOwnProperty('is_object_behavior') && finnal_option.is_object_behavior == true) {
          is_object_behavior = 1;
        }
        node.is_object_behavior = is_object_behavior;
        node.children = [];

      },
      //获取建议值
      list_value(parent_value) {
        if (!this.options.list_value.hasOwnProperty(parent_value)) {
          var param = this.$generateParams({
            "object": this.$store.state.linkage.object,
            "attr_id": parent_value,
          });
          var url_list_value = this.url_list.url_list_value;
          this.axios.post(url_list_value, param).then((response) => {
            var data = response.data;
            if (data.code != 200) {
              this.$error("接口请求失败-user-where-tree-list-value");
              return;
            }
            this.$set(this.options.list_value, parent_value, data.data);
          }).catch((errors) => {
            console.log(errors)
            this.$error("接口请求失败-user-where-tree-list-value");
          });
        }
      },
      set_box_type(op, node) { //比较操作符变化的时候修改 box_type
        var op_info = this.options.op_map[op];
        node.box_type = op_info.box_type;
        node.left = '';
        node.right = '';
        node.in = [];
      }
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
