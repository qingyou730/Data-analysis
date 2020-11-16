<template>
  <table v-show="step_children.length>0" class="table-2 table-formula">
    <tr v-for="(node,index) in step_children" :key="node.id">
      <td v-if="index==0" class="branch formula" :rowspan="step_children.length+1">
        <span @click="change_step_logic(parent)"> </span>
      </td>
      <td class="leaf">
        <span class="number-order">{{index + 1}}</span>
        <!--如果是属性 START -->
        <span v-if="node.step_type=='event'">
          <el-input v-model="node.alias" style="width: 150px;" placeholder="别名"></el-input>
          <!--属性选择联级菜单-->
          <el-cascader :ref="'event_node_' + node.id" @change="change_event($event,node)" filterable v-model="node.value_array"
            :props="cascader_props" :options="options.event_list">
          </el-cascader>

          <!-- 聚合属性 -->
          <el-select v-if="node.need_agg" v-model="node.agg" @change="changeAgg($event,node)">
            <el-option :key="index" v-for="(item,index) in options.agg_op_field_map[node.field_type]" :value="item.value"
              :label="item.name"></el-option>
          </el-select>


          <!--操作符 select框-->
          <!-- <el-select  style="width: 150px;" @change="set_box_type($event,node)" v-model="node.op" placeholder="请选择" v-if="node.need_op">
            <el-option v-for="item in options.op_field_map[node.field_type]" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select> -->
        </span>
        <!--如果是属性 END -->

        <span>
          <!--节点删除按钮-->
          <el-button @click="remove_node(step_children,index)" type="primary" icon="el-icon-minus" circle size="mini"></el-button>
          <el-dropdown placement="bottom">
            <el-button type="primary" icon="el-icon-plus" circle size="mini"></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="add_step(parent,'event')">事件</el-dropdown-item>
              <el-dropdown-item @click.native="add_condition(node,'attr')" v-if="node.step_type=='event'">子条件</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>

        <event-sub-condition-tree v-if="node.step_type=='event' && node.event_id" :url_list="url_list" :options="options"
          :parent="node" :children="node.children" :add_condition="add_condition" :event_id="node.event_id"
          :is_object_behavior="node.is_object_behavior">
        </event-sub-condition-tree>

      </td>
    </tr>
    <tr>
      <el-popover class="keybord-container" placement="bottom-start" width="620" trigger="click">
        <div class="keybord">
          <span style="display: block;width: 100%;clear: both;" v-for="(node,index) in step_children" :key="index" v-if="node.value.trim()!=''"
            @click="insertFormulaElement('step' + node.id+'_' ,(node.alias ? node.alias:node.name_array.join('_')),parent,true)">
            {{node.alias ? node.alias:node.name_array.join('_')}}</span>
        </div>
        <div class="keybord">
          <span @click="insertFormulaElement(' AND ',' AND ',parent)">AND</span>
          <span @click="insertFormulaElement(' OR ',' OR ',parent)">OR</span>
          <span @click="cleanFormula(parent)">清除</span>
          <span @click="deleteFormulaElement(parent)">删除</span>

          <span @click="insertFormulaElement(' > ',' > ',parent)">&gt;</span>
          <span @click="insertFormulaElement(' < ',' < ',parent)">&lt;</span>
          <span @click="insertFormulaElement(' IN ',' IN ',parent)">IN</span>
          <span @click="insertFormulaElement(' NOT IN ',' NOT IN ',parent)">NOT IN </span>


          <span @click="insertFormulaElement(' >= ',' >= ',parent)">&gt;=</span>
          <span @click="insertFormulaElement(' <= ',' <= ',parent)">&lt;=</span>
          <span @click="insertFormulaElement(' LIKE ',' LIKE ',parent)">LIKE</span>
          <span @click="insertFormulaElement('\'','\'',parent)">'</span>


          <span @click="insertFormulaElement('(','(',parent)">(</span>
          <span @click="insertFormulaElement(')',')',parent)">)</span>
          <span @click="insertFormulaElement(' <> ',' <> ',parent)">&lt;&gt;</span>
          <span @click="insertFormulaElement(' / ',' ÷ ',parent)">÷</span>

          <span @click="insertFormulaElement('7','7',parent)">7</span>
          <span @click="insertFormulaElement('8','8',parent)">8</span>
          <span @click="insertFormulaElement('9','9',parent)">9</span>
          <span @click="insertFormulaElement(' * ',' × ',parent)">×</span>

          <span @click="insertFormulaElement('4','4',parent)">4</span>
          <span @click="insertFormulaElement('5','5',parent)">5</span>
          <span @click="insertFormulaElement('6','6',parent)">6</span>
          <span @click="insertFormulaElement(' － ',' － ',parent)">－</span>

          <span @click="insertFormulaElement('1','1',parent)">1</span>
          <span @click="insertFormulaElement('2','2',parent)">2</span>
          <span @click="insertFormulaElement('3','3',parent)">3</span>
          <span @click="insertFormulaElement(' ＋ ',' ＋ ',parent)">＋</span>

          <span @click="insertFormulaElement(',',',',parent)">,</span>
          <span @click="insertFormulaElement('0','0',parent)">0</span>
          <span @click="insertFormulaElement('.','.',parent)">.</span>
          <span @click="insertFormulaElement(' = ',' = ',parent)">=</span>



        </div>
        <div style="width: 100%;" class="formula-editor" slot="reference" v-html="this.getFormulaText(parent)"></div>
      </el-popover>
    </tr>
  </table>
</template>

<script>
  import eventSubConditionTree from "./event_sub_condtion/event_sub_condition_tree.vue"
  export default {
    components: {
      eventSubConditionTree
    },
    props: ['url_list', 'options', 'parent', 'step_children', 'step_logic', 'add_step', 'add_condition',

    ],
    data() {
      return {
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
                var event_list = data.data[0].child;
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
                v.leaf = !v.cascade;
                v.level = level + 1;
              })
              resolve(children);
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
       * @param {Object} 拼接公式
       */
      getFormulaText: function(node) {
        var html = '';
        node.formula_element.map((v) => {
          html += v.text;
        });
        return html;
      },
      /**
       * @param {Object} value
       * @param {Object} node
       * 往公式中插入元素
       */
      insertFormulaElement: function(value, text, node, is_event) {
        if (is_event) {
          node.formula_element.push({
            text: '<span class="event-node">' + text + '</span>',
            value: value
          });
        } else {
          node.formula_element.push({
            text: '<span>' + text + '</span>',
            value: value
          });
        }
      },
      cleanFormula: function(node) {
        node.formula_element = [];
      },
      /**
       * @param {Object} node 从公式中删除元素
       */
      deleteFormulaElement: function(node) {
        node.formula_element.pop();
        //删除一个元素
      },
      test: function() {
        console.log("ccccc");
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
        node.step_logic = node.step_logic == 'AND' ? 'OR' : 'AND';
        this.update_parent();
      },
      add_step_children(node) { //给where条件增加叶子节点
        var condition = {
          "fid": node.id,
          'step_logic': 'AND',
          'step_type': 'attr',
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

        var name_array = [];
        for (var i in select_options) {
          name_array.push(select_options[i].name);
        }
        var finnal_option = select_options[select_options.length - 1]
        var field_type = finnal_option.field_type;
        var field_name = name_array.join('_');
        var finnal_value = finnal_option.value;
        var event_id = value[1];

        var finnal_value = finnal_option.value;
        var event_id = value[1];
        if (finnal_option.hasOwnProperty("type") && finnal_option.type == 'PRESET' || field_type == 'preset') {
          var need_agg = false;
          var agg = finnal_value;
          var agg_name = 'PRESET';
        } else {
          var need_agg = true;
          var agg_node = this.options.agg_op_field_map[field_type][0];
          var agg = agg_node.value;
          var agg_name = agg_node.name;
        }
        var name_array = [];
        for (var i in select_options) {
          if (select_options[i].hasOwnProperty('name')) {
            name_array.push(select_options[i].name);
          }
        }
        node.value_array = value;
        node.name_array = name_array;
        node.value = finnal_value;
        node.agg = agg;
        node.field_name = field_name
        node.agg_name = agg_name;
        node.need_agg = need_agg;
        node.field_type = field_type;
        node.event_id = event_id;
        var is_object_behavior = 0;
        if (finnal_option.hasOwnProperty('is_object_behavior') && finnal_option.is_object_behavior == true) {
          is_object_behavior = 1;
        }

        var first_compare_op = this.options.compare_op_list[0];
        node.compare_id = first_compare_op["value"];
        node.compare_name = first_compare_op["name"];
        node.compare_op = first_compare_op["op"];

        node.is_object_behavior = is_object_behavior;
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

    }
  }
</script>
