<template>
  <table style="margin-top: 5px;" v-show="children.length>0" :class="['table_list_'+countRow(children),'table-2']">
    <tr v-for="(node,index) in children" :key="node.id">
      <td :style="'padding-top:'+((countRow(children)*46 - 30)/2)+'px;'" v-if="index==0" v-show="children.length>1"
        :class="['branch','row_'+countRow(children)]" :rowspan="children.length">
        <span @click="change_logic_op(parent)" style="cursor: pointer;">{{parent.logic_op =='AND' ? '并且' : '或者'}}</span>
      </td>
      <td class="leaf">
        <el-select @change="changeGroupType(node)" v-model="node.group_type" style="width: 100px;">
          <el-option v-if="node.level==1" label="逻辑组" value="condition_group"></el-option>
          <el-option :label="subconditions_type=='dimension' ? '事件': '属性'" value="attr"></el-option>
        </el-select>

        <!--如果是属性 START -->
        <span v-if="node.group_type=='attr'">
          <!--属性选择联级菜单-->
          <el-cascader :ref="'sub_condition_' + node.id" @change="change_value($event,node)" filterable v-model="node.value_array"
            :props="cascader_props"  />
          {{updateCascaderValue(node)}}

          <!--操作符 select框-->
          <el-select style="width: 150px;" @change="set_box_type($event,node)" v-model="node.op" placeholder="请选择" v-if="node.need_op">
            <el-option v-for="item in options.condition_op_field_map[node.field_type]" :key="item.value" :label="item.name"
              :value="item.value"></el-option>
          </el-select>

          <!-- 条件值 start -->
          <!-- 根据 BOX_type  字段类型是否是日期    是否有建议值不同 -->
          <template v-if="node.need_op">
            {{edit_list_value(node)}}
            <!-- PHRASE 单个输入框 -->
            <template v-if="node.box_type=='PHRASE'">
              <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" v-if="node.field_type=='DATE'" v-model="node.start"
                type="datetime" placeholder="选择日期时间"> </el-date-picker>
              <template v-else>
                <el-input v-if="!node.list_value" v-model="node.start" placeholder="请输入内容" style="width: 200px;"></el-input>
                <el-select v-else style="width: 350px;" v-model="node.start" placeholder="请选择" allow-create>
                  <el-option v-for="(item,index) in options.list_value[node.value]" :key="index" :label="item.name"
                    :value="item.value"></el-option>
                </el-select>
              </template>
            </template>


            <!-- PHRASES 多选-->
            <template v-if="node.box_type=='PHRASES'">
              <el-select style="width: 400px;"  :collapse-tags="options.list_value.hasOwnProperty(node.value)"  v-model="node.in" clearable multiple filterable
                allow-create default-first-option placeholder="请选择">
                <el-option v-if="options.list_value.hasOwnProperty(node.value)" v-for="(item,index) in options.list_value[node.value]"
                  :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </template>

            <template v-if="node.box_type=='RANGE'  ">
              <template v-if="node.field_type=='DATE'  ">
                <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" v-model="node.start" type="datetime" placeholder="选择日期时间">
                </el-date-picker>
                <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" v-model="node.end" type="datetime" placeholder="选择日期时间">
                </el-date-picker>
              </template>
              <template v-else>
                <el-input v-model="node.start" placeholder="请输入最小值" style="width: 200px;"></el-input>
                <el-input v-model="node.end" placeholder="请输入最大值" style="width: 200px;"></el-input>
              </template>
            </template>

          </template>



          <!-- 条件值 start -->

        </span>
        <!--如果是属性 END -->

        <span>
          <!--节点删除按钮-->
          <el-button @click="remove_node(children,index)" type="primary" icon="el-icon-minus" circle size="mini"></el-button>

          <el-dropdown placement="bottom">
            <el-button type="primary" icon="el-icon-plus" circle size="mini"></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="add_condition(parent,'attr')">属性</el-dropdown-item>
              <el-dropdown-item v-if="node.group_type=='condition_group'" @click.native="add_condition(node,'attr')">子属性</el-dropdown-item>
              <el-dropdown-item v-if="node.level==1" @click.native="add_condition(parent,'condition_group')">逻辑组</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>

        <!--递归渲染逻辑组下的节点-->
        <event-sub-condition-tree v-if="node.group_type=='condition_group'" :url_list="url_list" :options="options"
          :parent="node" :children="node.children" :add_condition="add_condition" :event_id="event_id"
          :is_object_behavior="is_object_behavior">
        </event-sub-condition-tree>
      </td>
    </tr>
  </table>
</template>

<script>
  export default {
    name: 'EventSubConditionTree',
    props: ['add_condition', 'children', 'logic_op', 'children_num', 'options', 'parent', 'url_list', 'attr_type',
      'event_id', 'is_object_behavior', 'subconditions_type'
    ],
    data() {
      return {
        cascader_props: { //级联菜单的选项
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          lazyLoad: ((node, resolve) => {
            var level = node.level;
            if (node.root) {
              var event_id = this.event_id ;
              var is_object_behavior = this.is_object_behavior ;
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
                  v.child.map((second) => {
                    second.leaf = !second.cascade;
                    second.level = 2;
                  })
                })
                resolve(children);
              }).catch((errors) => {
                console.log(errors)
                this.$error("接口请求失败-user-where-tree-sub-child");
              });
              return;
            }
            if (level == 1) {
              var children = node.data.child;
              resolve(children);
              return;
            }
            if (level == 2) {
              var param = {
                object: this.$store.state.linkage.object,
                property_type: node.value,
                attr_type: 'EVENT',
                step_attr: 'attr',
              }
              var param = this.$generateParams(param);
              var condition_sub_attr = this.url_list.condition_sub_attr;
              //获取一级属性列表
              this.axios.post(condition_sub_attr, param).then((response) => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败event_sub_condition_tree");
                  return;
                }
                var attr_list = data.data;
                attr_list.map((v) => {
                  v.leaf = !v.cascade;
                  v.level = node.level + 1;
                })
                resolve(attr_list);
              }).catch((errors) => {
                console.log(errors)
                this.$error("接口请求失败-event_sub_condition_tree");
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
      updateCascaderValue: function(node) {
        this.$nextTick(() => {
          this.$refs['sub_condition_' + node.id][0].inputValue = node.name_array.join(' / ');
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
              number += this.counChildren(v.children);
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
            number += this.counChildren(v.children);
          }
        }
        return number;
      },

      /**
       * 更改 逻辑组 还是属性
       */
      changeGroupType: function(node) {
        node.children = [];
        if (node.group_type == 'condition_group') {
          this.add_condition(node, 'attr');
          this.add_condition(node, 'attr');
        }
      },
      update_parent() { //更新父组件
        return
      },
      remove_node(parent, index) { //删除树节点
        parent.splice(index, 1);
        this.update_parent();

      },
      change_logic_op(node) { //更换节点的  AND OR
        node.logic_op = node.logic_op == 'AND' ? 'OR' : 'AND';
        this.update_parent();
      },
      change_value(value, node) {
        //获取选中的option
        var checked_node = this.$refs['sub_condition_' + node.id][0].panel.getCheckedNodes();
        var temp_select_options = checked_node[0].pathNodes;
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
          var op = this.options.condition_op_field_map[field_type][0].value;
          var op_name = this.options.condition_op_map[op].name;
          var box_type = this.options.condition_box_type_map[op];
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
        node.start = '';
        node.end = '';
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
          var url_list_value = this.url_list.list_value;
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
        var op_info = this.options.condition_op_map[op];
        node.box_type = op_info.box_type;
        node.start = '';
        node.end = '';
        node.in = [];
      }

    }
  }
</script>
