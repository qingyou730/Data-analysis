<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
      <!-- 属性指标基础组件 -->
      <template v-if="load>=2" v-for="(agg,index) in agg_list">
      <el-row  :key="index" class="form-item-row attr-agg-row">
        <span class="number-order">{{index + 1}}</span>
        <el-input placeholder="请给指标起一个名字" v-model="agg.alias" style="width: 160px;"></el-input>
        <!--属性联级菜单-->
        <el-cascader :key="agg.id" @change="changeAttr($event,agg)" :ref="'node_attr_' + agg.id" filterable v-model="agg.value_array"
          :props="cascader_props" />
        <!--  根据区间每日 是否选择 -->
        <el-select @change="changeRangeAttr($event,agg)" v-if="agg.need_agg  && time_type != 'DAY' && options.range_attr_field_type_map.hasOwnProperty(agg.field_type)"
          v-model="agg.range_attr" filterable style="width: 150px;">
          <el-option v-for="item in options.range_attr_field_type_map[agg.field_type]" :key="item.value" :label="item.name"
            :value="item.value"></el-option>
        </el-select>
        <!--聚合属性-->
        <el-select v-if="agg.need_agg " @change="chageOp($event,agg)" v-model="agg.agg_node" filterable style="width: 100px;">
          <el-option v-for="item in options.agg_op_field_map[agg.field_type]" :key="item.value" :label="item.name" :value="item"></el-option>
        </el-select>

        <el-button  v-if="agg_list.length>1"  @click="remove_node(index)" type="primary" circle icon="el-icon-minus" size="mini"></el-button>
        <el-button v-if="agg.parent_field_type!='LIST_MAP'" @click="add_agg" type="primary" circle icon="el-icon-plus" size="mini"></el-button>
        <el-dropdown v-if="agg.parent_field_type=='LIST_MAP'"  placement="bottom">
          <el-button type="primary" icon="el-icon-plus" circle size="mini" style="margin-left: 5px;"></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="add_agg">指标</el-dropdown-item>
            <el-dropdown-item @click.native="add_children(agg,'attr')">子条件</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!--递归渲染装备下的节点-->
        <equipment-tree :is_agg="true" :key="'sub_children'+index" attr_type="OBJECT_DAY" :url_list=url_list :parent="agg" v-if="agg.parent_field_type=='LIST_MAP' && load_where"
          :options="options" :children="agg.children" :logic_op="agg.logic_op" :children_num="agg.children.length" :add_children="add_children" >
        </equipment-tree>
      </el-row>

      </template>
    </div>
  </div>
</template>
<script>
  import EquipmentTree from './equipment_tree';
  export default {
    components: {
      EquipmentTree
    },
    props: ["title", "name", "moduleId", "apis", "value"],
    created() {
      var url_list = {};
      for (var v of this.apis) {
        url_list[v.name] = v.api;
      }
      this.url_list = url_list;
      if (this.value) {
        this.agg_list = this.value;
        this.options.is_edit = true;
        if(this.time_type != this.$store.state.module_linkage[this.moduleId].time_type){
          this.time_type = this.$store.state.module_linkage[this.moduleId].time_type;
        }
      }
    },
    data() {
      return {
        load_where:false ,
        id_count: Date.parse(new Date()),
        msg: '/content/category/add',
        load: 0,
        options: {
          is_edit: false,
          attr_list: [], //一级属性列表
          agg_op_list: [],
          sub_attr: {}, //子属性列表
          list_value: {}, //各个对象的建议值
        },
        time_type: 'DAY', //OBJECT_DAY-区间   //OBJECT_RANGE-每日
        url_list: {
          // url_attr: '/mmp/model/object_attr/analyze_attrs/', //属性列表接口
          // url_sub_attr: '/mmp/model/object_attr/second_filter_attrs/', //子级属性接口地址
          // url_op: '/mmp/model/base/functions/', //聚合操作符列表下拉框的接口地址
          // url_range_list: '/mmp/model/base/range_attr_list/', //区间操作符接口地址
        },
        //聚合指标列表
        agg_list: [{
          "id": Date.parse(new Date()) - 3,
          'agg_node': {},
          'agg': '',
          'field_name': '',
          'agg_name': '',
          'need_agg': false,
          'field_type': '',
          'parent_field_type':'',
          'logic_op':'AND',
          'children':[] ,
          "alias": '',
          'range_attr': '',
          'range_attr_name': '',
          'value_array': [],
          'name_array': [],
        }],
        cascader_props: { //级联菜单的选项
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          lazyLoad: ((node, resolve) => {
            const level = node.level;
            if (node.root) {
              // 一级下拉列表值的接口地址
              var url_attr = this.url_list.url_attr;
              var param = {
                'time_type':this.time_type ,
                'object' : this.$store.state.linkage.object
              }
              var param = this.$generateParams(param);
              this.axios.post(url_attr, param).then((response) => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-user-agg-6");
                }
                var attr_list = data.data[0].child;
                attr_list.map((v) => {
                  v.leaf = !v.cascade;
                  v.level = level + 1 ;
                });
                resolve(attr_list);
              }).catch((errors) => {
                console.log(errors)
                // this.$error("接口请求失败-user-agg-1");
              });
              return ;
            }

            var parent = node.value;
            var url = this.url_list.url_sub_attr;
            var param = this.$generateParams({
              type: parent
            })
            this.axios.post(url, param).then((response) => {
              var data = response.data;
              if (data.code != 200) {
                this.$error("接口请求失败-user-agg-10");
                return;
              }
              var sub_attr_list = data.data;
              sub_attr_list.map((v) => {
                v.level = node.level + 1;
                v.leaf = !v.cascade;
              })
              resolve(sub_attr_list);
            }).catch((errors) => {
              this.$error("接口请求失败-user-agg-11");
            });
          })
        },
      }
    },
    methods: {
      test() {
        console.log(this.where)
      },
      //聚合操作符发生改变
      chageOp(selectOption, node) {
        node.agg = selectOption.value;
        node.agg_name = selectOption.name;
        this.createAlias(node);
      },
      changeRangeAttr(range_attr, node) {
        if (range_attr) {
          node.range_attr_name = this.options.range_attr_name_map[range_attr];
        }
        this.createAlias(node);
      },
      /**
       * @param {Object} value_array
       * @param {Object} node
       * 聚合属性值发生变化
       */
      changeAttr: function(value, node) {
        //获取选中的option

        var  checked_node = this.$refs['node_attr_' + node.id][0].panel.getNodeByValue(value);
        var temp_select_options = checked_node.pathNodes;
        var select_options = [];
        temp_select_options.map((v) => {
          select_options.push(v.data);
        })

        //设置node节点的值
        var finnal_value = value[value.length - 1]
        var finnal_option = select_options[select_options.length - 1]
        var parent_option = select_options[0] ;
        node.parent_field_type = parent_option.field_type ;
        var field_type = finnal_option.field_type;
        var field_name = finnal_option.name;
        var need_agg = true;
        var name_array = [];
        for (var i in select_options) {
          if (select_options[i].hasOwnProperty('name')) {
            name_array.push(select_options[i].name);
          }
        }
        node.name_array = name_array;
        node.field_name = field_name;
        node.field_type = field_type;
        node.need_agg = need_agg;


        if (node.field_type == 'preset') {
          node.range_attr = '';
          node.range_attr_name = '';
          node.agg = finnal_option.value;
          node.agg_name = finnal_option.name;
          node.need_agg = false;
        } else {
          //区间每日默认值
          if (this.time_type != 'DAY' && this.options.range_attr_field_type_map.hasOwnProperty(field_type)) {
            node.range_attr = this.options.range_attr_field_type_map[node.field_type][0].value;
            node.range_attr_name = this.options.range_attr_field_type_map[node.field_type][0].name;
          } else {
            node.range_attr = '';
            node.range_attr_name = '';
          }
          if (this.options.agg_op_field_map.hasOwnProperty(node.field_type)) {
            var selectOption = this.options.agg_op_field_map[node.field_type][0];
            node.agg = selectOption.value;
            node.agg_name = selectOption.name;
            node.agg_node = selectOption;
          } else {
            node.agg_node = {};
            node.agg = '';
            node.agg_name = '';
          }
          node.children = [] ;
        }
        this.createAlias(node);
      },
      /**
       * 生成别名
       */
      createAlias(node){
        if (node.field_type == 'preset') {
          node.alias = node["field_name"] ;
        }else{
          var range = '';
          if (node.hasOwnProperty('range_attr_name') && node.range_attr_name != '') {
            range = '_' + node.range_attr_name;
          }
          node['alias'] = node["field_name"] + range + '_' + node["agg_name"];
        }
      },
      initValue() { //当联动参数变动的时候初始化值
        this.agg_list = [{
          "id": this.id_count++,
          'agg_node': {},
          'agg': '',
          'field_name': '',
          'agg_name': '',
          'need_agg': false,
          'field_type': '',
          'parent_field_type':'',
          'logic_op':'AND',
          'children':[] ,
          "alias": '',
          'range_attr': '',
          'range_attr_name': '',
          'value_array': [],
          'name_array': [],
        }]
      },
      remove_node(index) { //删除树节点
        this.agg_list.splice(index, 1);
      },
      add_agg(node) { //增加指标
        this.agg_list.push({
          "id": this.id_count++,
          'agg_node': {},
          'agg': '',
          'field_name': '',
          'agg_name': '',
          'need_agg': false,
          'field_type': '',
          'parent_field_type':'',
          'logic_op':'AND',
          'children':[] ,
          "alias": '',
          'range_attr': '',
          'range_attr_name': '',
          'value_array': [],
          'name_array': [],
        });
      },
      /**
       * 增加子条件
       * @param {Object} node
       * @param {Object} group_type
       */
      add_children:function(node , group_type) {
        var condition = {
          "fid": node.id,
          'logic_op': 'AND',
          'group_type': group_type,   //logic_group   attr
          "is_group": false,
          "level": (node.hasOwnProperty('level') ? node.level : 0 ) + 1,
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
      initOption: function() {
        if (this.$store.state.linkage.object == '') {
          return;
        }
        //子级属性接口地址
        var url_sub_attr = this.url_list.url_sub_attr;
        //操作符列表下拉框的接口地址
        var url_op = this.url_list.url_op;
        //区间操作符接口地址
        var url_range_list = this.url_list.url_range_list;
        var param = this.$generateParams(this.$store.state.linkage);

        //获取操作符列表接口
        this.axios.post(url_op, param).then((response) => {
          var data = response.data;
          if (data.code != 200) {
            this.$error("接口请求失败-user-agg-4");
            return;
          }
          var agg_op_list = data.data
          var agg_op_map = this.$tools.list2map(agg_op_list, 'value');
          var agg_op_field_map = this.$tools.regroup_op(agg_op_list);
          this.options.agg_op_map = agg_op_map;
          this.options.agg_op_field_map = agg_op_field_map;
          this.load++;
        }).catch((errors) => {
          this.$error("接口请求失败-user-agg-2");
        });
        //获取区间操作符
        this.axios.post(url_range_list, param).then((response) => {
          var data = response.data;
          if (data.code != 200) {
            this.$error("接口请求失败-user-agg-5");
            return;
          }
          var temp_range_list = data.data
          var range_attr_field_type_map = this.$tools.list2f1f2(temp_range_list, 'field_type', 'range_op');
          var range_attr_name_map = {}
          temp_range_list.map((f) => {
            f.range_op.map((v) => {
              range_attr_name_map[v["value"]] = v["name"];
            })
          })
          this.options.range_attr_field_type_map = range_attr_field_type_map;
          this.options.range_attr_name_map = range_attr_name_map;
          this.load++;
        }).catch((errors) => {
          console.log(errors);
          this.$error("接口请求失败-user-agg-3");
        });

      }
    },
    computed: {
      isFollow() {
        return this.$store.state.linkage; //需要监听的数据
      },
      module_range_type() { //模块内联动区间每日是否发生变化
        if (!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)) {
          return "";
        } else {
          let str = ''
          for(let key in this.$store.state.module_linkage[this.moduleId]){
            str += key + "_" + this.$store.state.module_linkage[this.moduleId][key]
          }
          return str;
        }
      }
    },
    watch: {
      isFollow: { //联动参数变化的时候
        handler() {
          this.initOption();
          this.initValue();
        },
        // immediate: true,
        deep: true
      },
      module_range_type: { //联动参数变化的时候
        handler(newVal, oldVal) {
          if (this.time_type == this.$store.state.module_linkage[this.moduleId].time_type) {
            return;
          }
          if (this.$store.state.module_linkage.hasOwnProperty(this.moduleId) && this.$store.state.module_linkage[this.moduleId]
            .hasOwnProperty("time_type")) {
            this.time_type = this.$store.state.module_linkage[this.moduleId].time_type;
          }
          this.initOption();
          this.initValue();
        },
        deep: true
      },
      agg_list: {
        handler: function(val, oldval) {
          this.$emit('input', this.agg_list);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },

    },
    mounted() {
      if (this.$store.state.module_linkage.hasOwnProperty(this.moduleId) && this.$store.state.module_linkage[this.moduleId].hasOwnProperty('time_type')) {
        this.time_type = this.$store.state.module_linkage[this.moduleId].time_type;
      }
      this.initOption();
      //获取操作符列表接口
      var url_op = '/mmp/model/base/operation/';
      var param = this.$generateParams(this.$store.state.linkage);
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
        this.load_where = true ;
      }).catch((errors) => {
        this.$error("接口请求失败-user-where-2");
      });

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
