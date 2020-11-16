<template>
  <table style="margin-top: 5px;" v-show="step_children.length>0" :class="['table_list_'+countRow(step_children),'table-2']">
    <tr v-for="(node,index) in step_children" :key="node.id">
      <td :style="'padding-top:'+((countRow(step_children)*46 - 30)/2)+'px;'" v-if="index==0" v-show="step_children.length>1"
        :class="['branch','row_'+countRow(step_children)]" :rowspan="step_children.length">
        <span @click="change_step_logic(parent)" style="cursor: pointer;">{{parent.step_logic =='AND' ? '且' : '或'}}</span>
      </td>
      <td class="leaf">
        <el-select v-model="node.step_type" @change="changeStepType(node)" style="width: 100px;">
          <el-option label="事件" value="event"></el-option>
          <el-option label="逻辑组" value="event_group" v-if="node.level==1"></el-option> <!-- 事件只允许被嵌套两层 -->
        </el-select>

        <!--如果是属性 START -->
        <span v-if="node.step_type=='event'">
          <!--属性选择联级菜单-->
          <el-cascader :ref="'event_node_' + node.id" @change="change_event($event,node)" filterable v-model="node.value_array"
            :props="cascader_props" >
          </el-cascader>

          <el-select style="width: 150px;" v-model="node.range_attr" placeholder="请选择" v-if="node.need_op   && attr_type == 'OBJECT_RANGE' &&  options.range_attr_field_type_map.hasOwnProperty(node.field_type)">
            <el-option v-for="item in options.range_attr_field_type_map[node.field_type]" :key="item.value" :label="item.name"
              :value="item.value"></el-option>
          </el-select>

          <!--操作符 select框-->
          <el-select style="width: 150px;" @change="set_box_type($event,node)" v-model="node.op" placeholder="请选择" v-if="node.need_op">
            <el-option v-for="item in options.op_field_map[node.field_type]" :key="item.value" :label="item.name"
              :value="item.value"></el-option>
          </el-select>

          <template v-if="node.need_op">
            {{edit_list_value(node)}}
            <!-- PHRASE 单个输入框 -->
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


            <!-- PHRASES 多选-->
            <template v-if="node.box_type=='PHRASES'  ">
              <el-select style="width: 400px;" :collapse-tags="options.list_value.hasOwnProperty(node.value)" v-model="node.in" clearable multiple filterable
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
        </span>

        <span>
          <!--节点删除按钮-->
          <el-button @click="remove_node(step_children,index)" type="primary" icon="el-icon-minus" circle size="mini"></el-button>

          <!--逻辑组 添加子节点按钮-->
          <el-button v-if="node.step_type=='event_group' || node.step_type=='formula'" @click="add_step(node)" type="primary"
            icon="el-icon-plus" circle size="mini" class="root-add-btn"></el-button>
        </span>

        <eventIndicatorsTree :attr_type="attr_type" :url_list="url_list" :parent="node" :step_logic="node.step_logic"
          :options="options" :step_children="node.step_children" :add_step="add_step"
          :event_id="event_id"
          :is_object_behavior = "is_object_behavior"
          >
        </eventIndicatorsTree>
      </td>
    </tr>
  </table>
</template>

<script>
  import eventWhereFormula from './event_where_formula.vue';
  export default {
    components: {
      eventWhereFormula
    },
    name: 'eventIndicatorsTree',
    props: ['url_list', 'options', 'parent', 'step_children', 'step_logic', 'add_step', 'attr_type', 'event_id', 'is_object_behavior'],
    data() {
      return {
        cascader_props: { //级联菜单的选项
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          // children: 'child',
          lazyLoad: ((node, resolve) => {
            if (node.root) {
              var event_id = this.event_id ;
              var is_object_behavior = this.is_object_behavior ;
              var step_attr = 'event_id';
              var behavior_step_attr = 'behavior_final_attr';
              var param = {
                object: this.$store.state.linkage.object,
                property_type: event_id,
                attr_type: is_object_behavior ? 'OBJECT_BEHAVIOR' : 'EVENT',
                step_attr: is_object_behavior ? behavior_step_attr : step_attr,
              }
              var param = this.$generateParams(param);
              this.axios.post(this.url_list.url_attr, param).then(response => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-user-where-4");
                  return;
                }
                var attr_list =  data.data  ;
                attr_list.map((v) => {
                  v.leaf = false;
                  v.level = 1 ;
                });
                resolve(attr_list);
              }).catch((errors) => {
                this.$error("接口请求失败-user-where-2");
              });
              return;
            }
            const parent = node.data;
            var level = node.level;
            if (level == 1) {
              parent.child.map((v) => {
                v.leaf = !v.cascade;
                v.level = level + 1;
              })
              resolve(parent.child);
              return ;
            }
            if (level == 2) {
              var is_object_behavior = false;
              if (parent != null && parent.hasOwnProperty("is_object_behavior") && parent.is_object_behavior) {
                is_object_behavior = true;
              }
              var step_attr = ['event_group', 'event_id', 'attr'];
              var behavior_step_attr = ['object_behavior', 'behavior_final_attr'];

              var param = {
                object: this.$store.state.linkage.object,

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
      /**
       * @param {Object} node编辑的时候加载建议值
       */
      edit_list_value: function(node) {
        if (this.options.is_edit) {
          if (node.list_value) {
            this.list_value(node.value);
          }
        }
      },
      /**
       * @param {Object} node
       * 编辑的时候联级菜单显示选中的文字
       */
      updateCascaderValue: function(node) {
        this.$nextTick(() => {
          this.$refs['event_node_' + node.id][0].inputValue = node.name_array.join(' / ');
        });
      },
      /**
       * 计算总行数 计算且或连线的总行数
       */
      countRow(list) {
        var number = 0;
        for (var i in list) {
          var v = list[i];
          if (v.group_type == 'attr') {
            number += 1;
          } else {
            if (i == (list.length - 1)) {
              number += 1;
            } else {
              number += 1;
              number += this.counChildren(v.step_children);
            }
          }
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
            number += this.counChildren(v.step_children);
          }
        }
        return number;
      },

      /**
       * @param {Object} value
       * @param {Object} node
       * 事件聚合值比较操作符发生变化
       */
      changeCompareOp: function(value, node) {
        var compare = this.options.compare_op_map[value];
        node.compare_id = compare.value;
        node.compare_name = compare.name;
        node.compare_op = compare.op;
      },
      /**
       * 事件的聚合发生变化
       */
      changeAgg: function(value, node) {
        var agg = this.options.agg_op_map[value];
        node.agg_name = agg.name;
      },
      /**
       * 步骤类型发生变化时 把儿置空
       */
      changeStepType: function(node) {
        node.step_children = [];
      },
      update_parent() { //更新父组件
        return
      },
      remove_node(parent, index) { //删除树节点
        parent.splice(index, 1);
        this.update_parent();

      },
      change_step_logic(node) { //更换节点的  AND OR
        this.$set(node, 'step_logic', node.step_logic == 'AND' ? 'OR' : 'AND')
        this.update_parent();
      },
      add_step_children(node) { //给where条件增加叶子节点
        var condition = {
          "fid": node.id,
          'step_logic': 'AND',
          'step_type': 'event',
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
          "step_children": [],
          "type": "STATIC",
          "fast_name": "",
          "fast": "",
          "range_attr": '',
          "range_attr_name": '',
          "options": {
            agg_selections: [],
            event_list: []
          }
        };
        node.step_children.push(condition);
        this.update_parent();
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

        //设置node节点的值
        var finnal_value = value[value.length - 1]
        var finnal_option = select_options[select_options.length - 1]
        var field_type = finnal_option.field_type;
        var list_value = finnal_option.list_value;
        var field_name = finnal_option.name;
        var need_op = true;
        if (field_type == '') {
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
        node.children = [];
        var name_array = [];
        for (var i in select_options) {
          if (select_options[i].hasOwnProperty('name')) {
            name_array.push(select_options[i].name);
          }
        }
        node.name_array = name_array;
        node.value = finnal_value;
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
        //区间每日默认值
        if (this.attr_type == 'OBJECT_RANGE' && this.options.range_attr_field_type_map.hasOwnProperty(field_type)) {
          var range_attr = this.options.range_attr_field_type_map[field_type][0].value;
        } else {
          var range_attr = ''
        }
        node.range_attr = range_attr;
        //加载建议值
        if (list_value) {
          this.list_value(finnal_value)
        }
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
    watch: {
      options: {
        handler: function(val, oldval) {
          this.$emit('input', this.step);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
    },
  }
</script>
