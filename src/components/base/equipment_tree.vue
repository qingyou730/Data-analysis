<template>
  <table v-show="children.length>0" :class="['table_list_'+countRow(children),'table-2',(children.length==1 && parent.level==0 )?'one-leaf':'',parent.level==0 ?'level-1' :'']">
    <tr v-for="(node,index) in children" :key="node.id" >
      <td :style="'padding-top:'+((countRow(children)*46 - 30)/2)+'px;'" v-if="index==0" v-show="children.length>1"
        :class="['branch','row_'+countRow(children), (children.length==1 && parent.level==0 )?'one-leaf':'',parent.level==0 ?'level-1' :'']"
        :rowspan="children.length">
        <span @click="change_logic_op(parent)" style="cursor: pointer;">{{parent.logic_op =='AND' ? '并且' : '或者'}}</span>
      </td>
      <td :class="['leaf',children.length==1?'one-leaf':'']" :style="index==0 ? 'padding-top:5px;' : ''">
        <!--如果是属性 START -->
        <span v-if="node.group_type=='attr'">
          <!--属性选择联级菜单-->
          <el-cascader :ref="'node_attr_' + node.id" @change="change_value($event,node)" filterable v-model="node.value_array"
            :props="cascader_props" />
          <!--如果是区间属性  区间属性选择 select框-->
          <el-select style="width: 150px;" v-model="node.range_attr" placeholder="请选择" v-if="node.need_op   && attr_type == 'OBJECT_RANGE' &&  options.range_attr_field_type_map.hasOwnProperty(node.field_type)">
            <el-option v-for="item in options.range_attr_field_type_map[node.field_type]" :key="item.value" :label="item.name"
              :value="item.value"></el-option>
          </el-select>

          <!--操作符 select框-->
          <el-select style="width: 150px;" @change="set_box_type($event,node)" v-model="node.op" placeholder="请选择" v-if="node.need_op">
            <el-option v-for="item in options.op_field_map[node.field_type]" :key="item.value" :label="item.name"
              :value="item.value"></el-option>
          </el-select>

          <!-- 条件值 start -->
          <!-- 根据 BOX_type  字段类型是否是日期    是否有建议值不同 -->
          <template v-if="node.need_op">
            {{edit_list_value(node)}}
            <!--装备武者走特殊逻辑 start-->
            <template v-if="node.field_type == 'LIST_MAP'">
              <!-- PHRASE 单个输入框 -->
              <template v-if="node.box_type=='PHRASE'">
                <el-input v-model="node.left" placeholder="请输入内容" style="width: 200px;">
                  <template slot="suffix"><span class="input-suffix">个</span></template>
                </el-input>
              </template>
              <!-- PHRASE 单个输入框 END-->


              <!-- PHRASES 多选-->
              <template v-if="node.box_type=='PHRASES'  ">
                <el-select style="width: 400px;" :collapse-tags="options.list_value.hasOwnProperty(node.value)" v-model="node.in"
                  clearable multiple filterable allow-create default-first-option placeholder="请选择">
                  <el-option v-if="options.list_value.hasOwnProperty(node.value)" v-for="(item,index) in options.list_value[node.value]"
                    :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
                <span class="select-suffix">个</span>
              </template>
              <!-- PHRASES 多选 end-->

              <!-- 区间 start-->
              <template v-if="node.box_type=='RANGE'  ">
                <el-input v-model="node.left" placeholder="请输入最小值" style="width: 200px;"></el-input>
                <el-input v-model="node.right" placeholder="请输入最大值" style="width: 200px;"> <template slot="suffix"><span
                      class="input-suffix">个</span></template></el-input>
              </template>
              <!-- 区间 end-->
            </template>
            <!--装备武者走特殊逻辑 end-->
            <!--非装备武者 statr-->
            <template v-else>
              <!-- PHRASE 单个输入框 -->
              <template v-if="node.box_type=='PHRASE'">
                <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" v-if="node.field_type=='DATE'" v-model="node.left"
                  type="datetime" placeholder="选择日期时间"> </el-date-picker>
                <template v-else>
                  <el-input v-if="!node.list_value" v-model="node.left" placeholder="请输入内容" style="width: 200px;"></el-input>
                  <template v-else>
                    <el-select style="width: 350px;" v-model="node.left" placeholder="请选择" allow-create>
                      <el-option v-for="(item,index) in options.list_value[node.value]" :key="index" :label="item.name"
                        :value="item.value"></el-option>
                    </el-select>
                  </template>
                </template>
              </template>


              <!-- PHRASES 多选-->
              <template v-if="node.box_type=='PHRASES'  ">
                <el-select style="width: 400px;" :collapse-tags="options.list_value.hasOwnProperty(node.value)" v-model="node.in"
                  clearable multiple filterable allow-create default-first-option placeholder="请选择">
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
          </template>
          <!--非装备武者 end-->
          <!-- 条件值 start -->

        </span>
        <!--如果是属性 END -->

        <span>
          <!--节点删除按钮-->
          <el-button @click="remove_node(children,index)" type="primary" icon="el-icon-minus"
            circle size="mini"></el-button>
          <el-dropdown placement="bottom">
            <el-button type="primary" icon="el-icon-plus" circle size="mini" style="margin-left: 10px;"></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="add_children(parent,'attr')">属性</el-dropdown-item>
             <!-- <el-dropdown-item @click.native="add_children(node,'attr')" v-if="node.group_type=='logic_group'">子属性</el-dropdown-item>
              <el-dropdown-item @click.native="add_children(parent,'logic_group')">逻辑组</el-dropdown-item> -->
              <el-dropdown-item @click.native="add_children(node,'attr')" v-if="node.field_type=='LIST_MAP'">子条件</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
        <!--递归渲染装备下的节点-->
        <equipment-tree :attr_type="attr_type" :url_list=url_list :parent="node" v-if="node.field_type=='LIST_MAP'"
          :options="options" :children="node.children" :logic_op="node.logic_op" :children_num="node.children.length" :is_equipment="true"
          :add_children="add_children">
        </equipment-tree>
      </td>
    </tr>
  </table>
</template>

<script>
  export default {
    name: 'EquipmentTree',
    props: ['add_children', 'children', 'logic_op', 'children_num', 'options', 'parent', 'url_list', 'attr_type','is_equipment','is_agg'],
    data() {
      return {
        cascader_props: { //级联菜单的选项
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          lazyLoad: ((node, resolve) => {
            const level = node.level;
            if(this.is_agg){ //属性指标装备选择到了具体属性
              var param = this.$generateParams({
                "object": this.$store.state.linkage.object,
                "parent_property": this.parent.value_array[0],
              });
            }else{
              var param = this.$generateParams({
                "object": this.$store.state.linkage.object,
                "parent_property": this.parent.value,
              });
            }

            var url_sub_attr = '/mmp/model/event/filter_sub_attr/';
            if(this.is_equipment){
              var url_sub_attr = '/mmp/model/event/map_list_sub_attr/';
            }
            //获取一级属性列表
            this.axios.post(url_sub_attr, param).then((response) => {
              var data = response.data;
              if (data.code != 200) {
                this.$error("接口请求失败-user-where-tree-sub-child");
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
              this.$error("接口请求失败-user-where-tree-sub-child");
            });
          })
        }
      }
    },
    methods: {
      /**
       * 计算总行数 计算且或连线的总行数
       */
      countRow(list) {
        var number = 0;
        for (var i in list) {
          var v = list[i];
          if (v.group_type == 'attr' && v.field_type != 'LIST_MAP') {
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
          if (v.group_type == 'attr' && v.field_type != 'LIST_MAP') {
            number += 1;
          } else {
            number += 1;
            number += this.counChildren(v.children);
          }
        }
        return number;
      },

      /**
       * 修改是否是逻辑组
       */
      changeGroupType: function(node) {
        if (node.group_type == 'logic_group') {
          node.children = [];
          this.add_children(node, 'attr')
          this.add_children(node, 'attr')
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
      change_value(value, node, ) {
        //获取选中的option
        var checked_node = this.$refs['node_attr_' + node.id][0].panel.getNodeByValue(value);
        var temp_select_options = checked_node.pathNodes;
        var select_options = [];
        temp_select_options.map((v) => {
          select_options.push(v.data);
        })

        //设置node节点的值
        var finnal_value = value[value.length - 1]
        var finnal_option = select_options[select_options.length - 1]
        node.real_value = finnal_option.real_value  ;
        node.parent_id  = finnal_option.parent_id  ;
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
        node.is_group = false;
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
          var url_list_value = '/mmp/model/base/attr_dimensions/';
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
      updateCascaderValue: function(node) {
        this.$nextTick(() => {
          this.$refs['node_attr_' + node.id][0].inputValue = node.name_array.join(' / ');
        });
      },
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
      set_box_type(op, node) { //比较操作符变化的时候修改 box_type
        var op_info = this.options.op_map[op];
        node.box_type = op_info.box_type;
        node.left = '';
        node.right = '';
        node.in = [];
      }

    }
  }
</script>
