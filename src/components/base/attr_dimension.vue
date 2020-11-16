<template>
  <div class="my-form-row">
    <div style="display: inline-block;">
      <span class="my-form-label">属性类型 :</span>
      <div style="display: inline-block;">
        <el-select v-model="agg.attr_type" @change="onTypeChanged" style="width: 120px;">
          <el-option v-for="item in type_options" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <timer v-model="agg.timer" title="时间范围" v-if="agg.attr_type != 'OBJECT_LAST'"></timer>
    <div class="my-form-row" v-if="agg.attr_type != 'OBJECT_LAST'">
      <span class="my-form-label">时间周期 :</span>
      <div style="display: inline-block;">
        <el-select v-model="agg.time_type" @change="onTimeChanged" style="width: 120px;">
          <el-option v-for="item in time_options" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <div class="my-form-row">
      <span class="my-form-label">{{title}} :</span>
      <div style="display: inline-block;">
        <!-- 属性指标基础组件 -->
        <el-row v-for="(item,index) in agg.agg_list" :key="index" class="form-item-row">
          <span class="number-order">{{index + 1}}</span>
          <!--属性联级菜单-->
          <el-cascader @change="changeAttr($event,item)" :ref="'node_attr_' + item.id" filterable v-model="item.value_array"
            :props="cascader_props" :key="item.id" />
          <!--  根据区间每日 是否选择 -->
          <el-select @change="changeRangeAttr($event,item)" v-if="agg.time_type != 'DAY' && agg.attr_type != 'OBJECT_LAST' && options.range_attr_field_type_map != null && options.range_attr_field_type_map.hasOwnProperty(item.field_type)"
            v-model="item.range_attr" filterable style="width: 150px;">
            <el-option v-for="item in options.range_attr_field_type_map[item.field_type]" :key="item.value" :label="item.name"
              :value="item.value"></el-option>
          </el-select>
          <el-button v-if="agg.agg_list.length>1" @click="remove_node(index)" type="primary" circle icon="el-icon-minus"
            size="mini"></el-button>
          <el-button @click="add_children" type="primary" circle icon="el-icon-plus" size="mini"></el-button>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
  import UserWhereTree from './user_where_tree';
  import timer from './timer'
  export default {
    components: {
      UserWhereTree: UserWhereTree,
      timer: timer
    },
    props: ["title", "name", "moduleId", "apis", "value"],
    created() {
      var url_list = {};
      for (var v of this.apis) {
        url_list[v.name] = v.api;
      }
      this.url_list = url_list;
      if (this.value) {
        this.agg = this.value;
        this.options.is_edit = true;
      }
      this.initOption()
    },
    data() {
      return {
        id_count: Date.parse(new Date()),
        options: {
          is_edit: false,
          attr_list: [], //一级属性列表
          sub_attr: {}, //子属性列表
        },
        type_options: [{
            name: '每日属性',
            value: 'OBJECT_DAY'
          },
          {
            name: '最终属性',
            value: 'OBJECT_LAST'
          }
        ],
        time_options: [{
            name: '天',
            value: 'DAY'
          },
          {
            name: '自然周',
            value: 'WEEK'
          },
          {
            name: '自然月',
            value: 'MONTH'
          },
          {
            name: '合计',
            value: 'ALL'
          }
        ],
        url_list: {
          // url_attr: '/mmp/model/object_attr/analyze_attrs/', //属性列表接口
          // url_sub_attr: '/mmp/model/object_attr/second_filter_attrs/', //子级属性接口地址
          // url_range_list: '/mmp/model/base/range_attr_list/', //区间操作符接口地址
        },
        //聚合指标列表
        agg: {
          attr_type: 'OBJECT_DAY',
          timer: null,
          time_type: 'DAY',
          agg_list: [{
            "id": 0,
            'agg': '',
            'field_name': '',
            'agg_name': '',
            'field_type': '',
            "alias": '',
            'range_attr': '',
            'range_attr_name': '',
            'value_array': [],
            'name_array': [],
          }],
        },
        cascader_props: { //级联菜单的选项
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          lazyLoad: ((node, resolve) => {
            const level = node.level;
            if (node.root) {
              // 一级下拉列表值的接口地址
              var url_attr = this.url_list.url_attr;
              let paramData = {
                object: this.$store.state.linkage.object,
                attr_type: this.agg.attr_type
              }
              var param = this.$generateParams(paramData);
              this.axios.post(url_attr, param).then((response) => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-user-agg-6");
                }
                var attr_list = [] ;
                if(data.data.length>0 && data.data[0].hasOwnProperty('child')){
                  attr_list = data.data[0].child;
                }
                attr_list.map((v) => {
                  v.leaf = !v.cascade;
                  v.level = level + 1;
                });
                resolve(attr_list);
              }).catch((errors) => {
                console.log(errors)
                // this.$error("接口请求失败-user-agg-1");
              });
              return;
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

      changeRangeAttr(range_attr, node) {
        if (range_attr) {
          node.range_attr_name = this.options.range_attr_name_map[range_attr];
        }
      },
      /**
       * @param {Object} value_array
       * @param {Object} node
       * 聚合属性值发生变化
       */
      changeAttr: function(value, node) {
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
        var field_type = finnal_option.field_type
        var field_name = finnal_option.name
        var name_array = [];
        for (var i in select_options) {
          if (select_options[i].hasOwnProperty('name')) {
            name_array.push(select_options[i].name);
          }
        }
        node.name_array = name_array;
        node.field_name = field_name;
        node.field_type = field_type;


        if (node.field_type == 'preset') {
          node.range_attr = '';
          node.range_attr_name = '';
          node.agg = finnal_option.value;
          node.agg_name = finnal_option.name;
        } else {
          //区间每日默认值
          if (this.agg.time_type != 'DAY' && this.options.range_attr_field_type_map.hasOwnProperty(field_type)) {
            node.range_attr = this.options.range_attr_field_type_map[node.field_type][0].value;
            node.range_attr_name = this.options.range_attr_field_type_map[node.field_type][0].name;
          } else {
            node.range_attr = '';
            node.range_attr_name = '';
          }
        }
      },
      firstChange(selectOption, node) { //第一级属性变化
        node.cascade = selectOption.cascade;
        node.first = selectOption.value;
        node.field_type = selectOption.field_type;
        node.field_name = selectOption.name;
        node.agg = selectOption.cascade;
        node.agg_name = selectOption.cascade;
        node.second = [];
        node.second_node = [];
        node.is_check_all = false;
        if (this.agg.time_type != 'DAY' && this.options.range_attr_field_type_map.hasOwnProperty(node.field_type)) {
          node.range_attr = this.options.range_attr_field_type_map[node.field_type][0].value;
          node.range_attr_name = this.options.range_attr_field_type_map[node.field_type][0].name;
        } else {
          node.range_attr = '';
          node.range_attr_name = '';
        }
        if (node.field_type == 'preset') {
          node.range_attr = '';
          node.range_attr_name = '';
          node.agg = selectOption.value;
          node.agg_name = selectOption.name;

        }
        if (node.cascade) {
          this.initSecond(node);
        }
      },


      initValue() { //当联动参数变动的时候初始化值
        this.agg.agg_list = [{
          "id": this.id_count++,
          'agg': '',
          'field_name': '',
          'agg_name': '',
          'field_type': '',
          "alias": '',
          'range_attr': '',
          'range_attr_name': '',
          'value_array': [],
          'name_array': [],
          'attr_type': ''
        }]
      },
      remove_node(index) { //删除树节点
        this.agg.agg_list.splice(index, 1);
      },
      add_children(node) { //给where条件增加叶子节点
        this.agg.agg_list.push({
          "id": this.id_count++,
          'agg': '',
          'field_name': '',
          'agg_name': '',
          'field_type': '',
          "alias": '',
          'range_attr': '',
          'range_attr_name': '',
          'value_array': [],
          'name_array': [],
          'attr_type': ''
        });
      },
      initOption: function() {
        if (this.$store.state.linkage.object == '') {
          return;
        }
        //子级属性接口地址
        var url_sub_attr = this.url_list.url_sub_attr;
        //操作符列表下拉框的接口地址
        //区间操作符接口地址
        var url_range_list = this.url_list.url_range_list;
        var param = this.$generateParams(this.$store.state.linkage);

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
          this.$set(this.options, 'range_attr_field_type_map', range_attr_field_type_map)
          this.options.range_attr_name_map = range_attr_name_map;
          this.load++;
        }).catch((errors) => {
          console.log(errors);
          this.$error("接口请求失败-user-agg-3");
        });
      },

      onTypeChanged() {
        this.initOption();
        this.initValue();
      },

      onTimeChanged() {
        this.initOption();
        this.initValue();
      }
    },
    computed: {
      isFollow() {
        return this.$store.state.linkage; //需要监听的数据
      },
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
      agg: {
        handler: function(val, oldval) {
          this.$emit('input', this.agg);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },

    },
    mounted() {
      this.initOption();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
