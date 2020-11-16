<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
      <el-cascader :key="number" placeholder="输入可搜索" :props="firstProp" filterable v-model="event.title" :ref="node_attr"
        @change="eventChanged(event)">
      </el-cascader>

      <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addSubEvent()"></el-button>
      <table v-show="event.conditions.length>0" :class="['table_list_'+countRow(event.conditions),'table-2']">
        <tr v-for="(node,index) in event.conditions" :key="index" >
          <!-- 逻辑判断 -->
          <td v-if="index==0" v-show="event.conditions.length>1" :class="['branch','row_'+countRow(event.conditions)]"
            :style="'padding-top:'+((countRow(event.conditions)*46 - 30)/2)+'px;'" :rowspan="event.conditions.length">
            <span @click="change_step_logic(event)" style="cursor: pointer;">{{event.logic =='AND' ? '且' : '或'}}</span>
          </td>
          <!-- 子条件 -->
          <td class="leaf">
            <!-- 事件子条件 -->
            <el-cascader placeholder="输入可搜索" :props="prop" filterable v-model="node.value" :ref="'node_attr_' + node.id"
              @change="subEventChanged($event,node)">
            </el-cascader>
            <!-- 操作符 -->
            <el-select style="width: 150px;" @change="set_box_type($event,node)" v-model="node.op" placeholder="请选择"
              v-if="node.need_op">
              <el-option v-for="item in options.op_field_map[node.field_type]" :key="item.value" :label="item.name"
                :value="item.value">
                </el-option>
            </el-select>

            <template v-if="node.need_op">
              <template v-if="node.box_type=='PHRASE'">
                <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" v-if="node.field_type=='DATE'" v-model="node.left"
                  type="datetime" placeholder="选择日期时间"> </el-date-picker>
                <template v-else>
                  <el-input v-if="!node.list_value" v-model="node.left" placeholder="请输入内容" style="width: 200px;"></el-input>
                  <el-select v-else style="width: 350px;" v-model="node.left" placeholder="请选择" allow-create>
                    <el-option v-for="(item,index) in options.list_value[node.value]" :key="index" :label="item.name"
                      :value="item.value"></el-option>
                  </el-select>
                </template>
              </template>

              <template v-if="node.box_type=='PHRASES'  ">
                <el-select style="width: 400px;" :collapse-tags="options.list_value.hasOwnProperty(node.value)"  v-model="node.in" clearable multiple filterable
                  allow-create default-first-option placeholder="请选择">
                  <el-option v-if="options.list_value.hasOwnProperty(node.value)" v-for="(item,index) in options.list_value[node.value]"
                    :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </template>

              <template v-if="node.box_type=='RANGE'  ">
                <template v-if="node.field_type=='DATE'  ">
                  <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" v-model="node.left" type="datetime" placeholder="选择日期时间">
                  </el-date-picker>
                  <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" v-model="node.right" type="datetime" placeholder="选择日期时间">
                  </el-date-picker>
                </template>
                <template v-else>
                  <el-input v-model="node.left" placeholder="请输入最小值" style="width: 200px;"></el-input>
                  <el-input v-model="node.right" placeholder="请输入最大值" style="width: 200px;"></el-input>
                </template>
              </template>

            </template>
            <el-button @click="removeSubEvent(node)" type="primary" icon="el-icon-minus" circle size="mini"></el-button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["title", "name", "moduleId", "apis", "value"],
    created() {
      var url_list = {};
      for (var v of this.apis) {
        url_list[v.name] = v.api;
      }
      this.url_list = url_list;
      
      if(this.value){
        this.event = this.value
      }
    },
    data() {
      return {
        number: 1 ,
        node_attr: '',
        idCount: Date.parse(new Date()),
        event: {
          title: '',
          logic: 'AND',
          conditions: []
        },
        subOptions: [],
        eventOptions: [],
        children: [],
        url_list: {
          // url_event_group: '/mmp/model/event/event_groups',
          // multistage_events: '/mmp/model/event/multistage_events',
          // url_op: '/mmp/model/base/operation/',
          // url_aggregation_function: '/mmp/model/base/functions',
          // url_sub_attr: '/mmp/model/event/analyze_filter_sub_attr/',
          // url_list_value: '/mmp/model/base/attr_dimensions/',
        },
        options: {
          attr_list: [], //一级属性列表
          event_groups: [],
          agg_selections: [],
          list_value: {}, //各个对象的建议值
          op_map: {},
          op_field_map: {}
        },
        firstProp: {
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          lazyLoad: ((node, resolve) => {
            var level = node.level;
            var parent = node.data
            if (level == 0){
              var param = this.$generateParams(this.$store.state.linkage);
              this.axios.post(this.url_list.url_event_group, param).then(response => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-user-where-6");
                  return;
                }
                var attr_list = [] ;
                if(data.data.length>0 && data.data[0].hasOwnProperty('child')){
                  attr_list = data.data[0].child;
                }
                attr_list.map((v) => {
                  v.leaf = !v.cascade
                })
                resolve(attr_list);
              }).catch((errors) => {
                console.log(errors)
                this.$error("接口请求失败-user-where-1");
              });
            }
            if (level == 1) {
              var is_object_behavior = false;
              if (parent != null && parent.hasOwnProperty("is_object_behavior") && parent.is_object_behavior) {
                is_object_behavior = true;
              }
              var step_attr = 'event_group';
              var behavior_step_attr = 'object_behavior';

              var param = {
                object: this.$store.state.linkage.object,
                property_type: parent.value,
                attr_type: is_object_behavior ? 'OBJECT_BEHAVIOR' : 'EVENT',
                step_attr: is_object_behavior ? behavior_step_attr : step_attr,
              }
              var param = this.$generateParams(param);
              var event_sub_list = this.url_list.multistage_events;

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
                })
                this.children = children
                resolve(children)
              }).catch((errors) => {
                console.log(errors)
                this.$error("接口请求失败-user-where-tree-sub-child");
              });
            }
          })
        },
        prop: {
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          lazyLoad: ((node, resolve) => {
            var level = node.level;
            var parent = node.data
            if(level == 0){
              var step_attr = 'event_id';
              var behavior_step_attr = 'behavior_final_attr';
              var is_object_behavior = false;
              if (parent != null && parent.hasOwnProperty("is_object_behavior") && parent.is_object_behavior) {
                is_object_behavior = true;
              }
              this.event.obj_type = is_object_behavior ? 'OBJECT_BEHAVIOR' : 'EVENT'
              
              var param = {
                object: this.$store.state.linkage.object,
                property_type: this.event.title[1],
                attr_type: is_object_behavior ? 'OBJECT_BEHAVIOR' : 'EVENT',
                step_attr: is_object_behavior ? behavior_step_attr : step_attr,
              }
              var param = this.$generateParams(param);
              var event_sub_list = this.url_list.multistage_events;
              
              //获取一级属性列表
              this.axios.post(event_sub_list, param).then((response) => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-user-where-tree-sub-child");
                  return;
                }
                var children = data.data;
                children.map((v) => {
                  v.leaf = !v.cascade;
                })
                resolve(children)
              }).catch((errors) => {
                console.log(errors)
                this.$error("接口请求失败-user-where-tree-sub-child");
              });
            }
            if(level == 1){
              var is_object_behavior = false;
              if (parent != null && parent.hasOwnProperty("is_object_behavior") && parent.is_object_behavior) {
                is_object_behavior = true;
              }
              var step_attr = ['event_id', 'attr'];
              var behavior_step_attr = ['behavior_final_attr'];
              var param = {
                object:this.$store.state.linkage.object,
              
                property_type: parent == null ? "" : parent.value,
              
                attr_type: is_object_behavior ? 'OBJECT_BEHAVIOR' : 'EVENT',
                step_attr: is_object_behavior ? behavior_step_attr[level] : step_attr[level],
              }
              
              var param = this.$generateParams(param);
              var event_sub_list = this.url_list.url_sub_attr;
              
              //获取一级属性列表
              this.axios.post(event_sub_list, param).then((response) => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-user-where-tree-sub-child");
                  return;
                }
                var children = data.data;
                children.map((v) => {
                  v.leaf = !v.cascade;
                  v.level = level + 1;
                })
                resolve(children);
              }).catch((errors) => {
                console.log(errors)
                this.$error("接口请求失败-user-where-tree-sub-child");
              });
            }

          })
        }
      }
    },

    methods: {
      change_step_logic() { //更换节点的  AND OR
        this.$set(this.event, 'logic', this.event.logic == 'AND' ? 'OR' : 'AND')
      },

      addSubEvent() {
        this.event.conditions.push({
          value: [],
          need_op: false,
          id: this.idCount++,
          op: '',
          in: [],
          left: '',
          right: '',
        })
      },
      eventChanged(event) {
        event.conditions = []
        let node = this.children.find(v => {
          return v.value == event.title[1]
        })

        if (node != null) {
          let is_object_behavior = false
          if (node.hasOwnProperty("is_object_behavior") && node.is_object_behavior) {
            is_object_behavior = true;
          }
        }
      },
      subEventChanged(value, node) {
        var checked_node = this.$refs['node_attr_' + node.id][0].panel.getNodeByValue(value);
        var temp_select_options = checked_node.pathNodes;
        var select_options = [];
        temp_select_options.map((v) => {
          select_options.push(v.data);
        })

        //设置node节点的值
        var finnal_value = value[value.length - 1]
        var finnal_option = select_options[select_options.length - 1]
        var field_type = finnal_option.field_type;
        var list_value = finnal_option.list_value;
        var field_name = finnal_option.name;
        var need_op = true;
        if (field_type == '' || field_type == 'preset') {
          var need_op = false;
          var op = finnal_value;
          var op_name = finnal_value;
          list_value = false;
          var box_type = 'PRESET';
        } else {
          var need_op = true;
          var op = this.options.op_field_map[field_type][0].value;
          var op_name = this.options.op_map[op].name;
          var box_type = this.options.box_type_map[op];
        }
        var name_array = [];
        for (var i in select_options) {
          if (select_options[i].hasOwnProperty('name')) {
            name_array.push(select_options[i].name);
          }
        }
        node.name_array = name_array;
        node.finnal_value = finnal_value;
        node.op = op;
        node.field_name = field_name;
        node.field_type = field_type;
        node.op_name = op_name;
        node.need_op = need_op;
        node.list_value = list_value;
        node.left = '';
        node.right = '';
        node.in = [];
        node.box_type = box_type;

        if (this.attr_type == 'OBJECT_RANGE' && this.options.range_attr_field_type_map.hasOwnProperty(field_type)) {
          var range_attr = this.options.range_attr_field_type_map[field_type][0].value;
        } else {
          var range_attr = ''
        }
        node.range_attr = range_attr;

        if (list_value) {
          this.list_value(finnal_value)
        }
      },

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
      },

      removeSubEvent(node) {
        var index = this.event.conditions.indexOf(node)
        this.event.conditions.splice(index, 1);
      },

      countRow(list) {
        var number = 0;
        for (var i in list) {
          var v = list[i];
          number += 1;
        }
        return number;
      },
      counChildren(list) {
        var number = 0;
        for (var v of list) {
          if (v.group_type == 'attr') {
            number += 1;
          } else {
            number += 1;
            number += this.counChildren(v.event.conditions);
          }
        }
        return number;
      },
      initOption:function(){

      },
      initValue:function(){
        this.number ++ ;
        this.event = {
          title: '',
          logic: 'AND',
          conditions: []
        };
      }
    },

    mounted() {
       var param = this.$generateParams(this.$store.state.linkage);
      this.axios.post(this.url_list.url_aggregation_function, param).then(response => {
        var data = response.data;
        if (data.code != 200) {
          this.$error("接口请求失败-user-where-6");
          return;
        }
        var op_list = data.data
        var op_map = this.$tools.list2map(op_list, 'value');
        var op_field_map = this.$tools.regroup_op(op_list);
        this.options.agg_op_map = op_map;
        this.options.agg_op_field_map = op_field_map;
      }).catch((errors) => {
        console.log(errors)
        this.$error("接口请求失败-user-where-1");
      });

      //获取操作符列表接口
      this.axios.post(this.url_list.url_op, param).then((response) => {
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
      }).catch((errors) => {
        this.$error("接口请求失败-user-where-2");
      });
    },
    computed: {
      isFollow() {
        return this.$store.state.linkage; //需要监听的数据
      },
    },
    watch: {
      event: {
        handler: function(val, oldval) {
          this.$emit('input', this.event);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
      isFollow: { //联动参数变化的时候
        handler() {
          this.initOption();
          this.initValue();
        },
        // immediate: true,
        deep: true
      },
    },
  }
</script>

<style>
</style>
