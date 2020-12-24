<template>
  <div>
    <el-row style="padding-bottom: 25px">行为集合</el-row>
    <el-form label-position="right" label-width="120px">
      <el-form-item label="名称:">
        <el-input placeholder="请输入名称" v-model="label" style="width: 30%;" @change="onNameChange"></el-input>
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item label="描述:">
        <el-input placeholder="请输入描述" v-model="desc" style="width: 30%;"></el-input>
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item label="包含事件:">
        <div :span="30" v-for="(step,index) in behaviorCollection.steps" :key="index" class="my-form-row">
          <el-cascader placeholder="输入可搜索" :props="prop" filterable v-model="step.eventGroupValue"
            :ref="'node_attr_' + step.id" @change="change_event($event,step,index)">
          </el-cascader>
          <el-dropdown placement="bottom">
            <el-button type="primary" icon="el-icon-plus" circle size="mini"></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="add_main_step()">事件指标</el-dropdown-item>
              <el-dropdown-item @click.native="add_condition(step,'attr')">子条件</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button @click="remove_step(step)" type="primary" icon="el-icon-minus" circle size="mini" class="root-add-btn"></el-button>

          <event-sub-condition-tree v-if="step.event_id && load" :url_list="url_list" :options="options"
            :parent="step" :children="step.children" :add_condition="add_condition" :event_id="step.event_id"
            :is_object_behavior="false">
          </event-sub-condition-tree>

        </div>
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item label="属性：">
        <span>行为事件公共属性为默认内置公共属性</span>
        <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addAttr()"></el-button>
      </el-form-item>
      <div v-for="(attr,index) in behaviorCollection.attrList" :key="index">
        <el-form-item>
          <el-input v-model="attr.attrName" style="width: 15%;" @change="onAttrNameChange(attr)"></el-input>
          <span>类型： </span>
          <el-select style="width: 12%;" v-model="attr.attrType">
            <el-option label="字符串" value="STRING"></el-option>
            <el-option label="数值" value="NUMBER"></el-option>
          </el-select>
          <el-button @click="removeAttr(behaviorCollection.attrList,index)" v-if="behaviorCollection.attrList.length>1" type="primary" icon="el-icon-minus" circle size="mini"></el-button>
        </el-form-item>
        <el-form-item>
          <el-form-item label="属性映射" label-width="80px">
            <div v-for="(attrMap,i) in attr.attrMappingList" :key="i">
              <el-select v-model="attrMap.selectValue" @change="attrMappingChanged(i,attrMap,attr)">
                <el-option v-for="(attrOption,i) in attr.attrOptions" :key="i" :disabled="attrOption.disabled" :label="attrOption.label"
                  :value="attrOption.value"></el-option>
              </el-select>
              <sub-attr :attrMap="attrMap" :selectValue="attrMap.selectValue" :object="$route.query.object"></sub-attr>
              <el-button @click="removeAttrMap(attr.attrMappingList,i,attrMap,attr)" v-if="attr.attrMappingList.length>1" type="primary" icon="el-icon-minus" circle size="mini"></el-button>
              <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addAttrMapping(attr)"></el-button>
            </div>
          </el-form-item>
        </el-form-item>
      </div>
      <el-divider></el-divider>
      <el-form-item>
        <el-button size="mini" @click="onClickSubmit" type="primary">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import eventSubConditionTree from "@/components/base/event_sub_condtion/event_sub_condition_tree.vue"
  import subAttr from "@/components/views/data/behavior/sub_attr.vue"
  export default {
    components: {
      eventSubConditionTree: eventSubConditionTree,
      subAttr:subAttr
    },
    props: ["title", "name", "moduleId", "apis", "value"],

    created() {
      var get = this.$route.query;
      if (get.hasOwnProperty("id")) {
        let param = {
          id: get.id
        }
        let paramData = this.$generateParams(param)
        this.axios.post(this.url_list.url_find,paramData).then(res => {
          if(res.data.code != 200){
            this.$error("请求参数失败")
            return
          }

          let webParam = JSON.parse(res.data.data.web_params)
          this.label = webParam.name
          this.desc = webParam.desc
          this.behaviorCollection = webParam.behaviorCollection
          this.attrOptions = webParam.attrOptions
        }).catch(error => {
          console.log(error);
          this.$error("获取行为集合详细信息失败")
        })
      }
    },

    data() {
      return {
        load:0,
        label: '',
        desc: '',
        id_count:  Date.parse(new Date()),
        object:'',
        options: {
          attr_list: [], //一级属性列表
          behavior_groups: [],
          agg_selections: [],
          list_value: {}, //各个对象的建议值
          op_map: {},
          op_field_map: {}
        },
        event_id: 0,
        caonima: [],
        attr_type: '', //OBJECT_DAY-区间   //OBJECT_RANGE-每日
        attrOptions: [{
          label: '',
          value: ''
        }],
        behaviorCollection: {
          steps: [{
            "id": this.$store.state.id_count++,
            "fid": 0,
            "level": 0,
            'logic_op': 'AND',
            'children': [],
            'agg_value': '',
            'eventGroupValue': '',
            'event_id':'',
            'alias': '',
            options: {
              agg_selections: [],
              event_list: []
            }
          }],
          attrList: []
        },
        url_list: {
          url_behavior: '/mmp/behavior/events', //属性列表接口
          url_op: '/mmp/model/base/operation/', //操作符列表下拉框的接口地址
          url_list_value: '/mmp/model/base/attr_dimensions/', //建议值
          url_split_event_attr: '/mmp/model/route/split_event_attr',
          url_find_attrs_by_event_id: '/mmp/behavior/find_attrs_by_event_id',
          url_event_private_attr: '/mmp/behavior/eventPrivateAttr',
          analyze_filter_sub_attr: '/mmp/model/event/analyze_filter_sub_attr',
          url_add: '/mmp/behavior/addOrModiy',
          url_find: '/mmp/behavior/find_behavior_detail_by_id',

          condition_attr_list: "/mmp/model/object_event/analyze_filter_attr", //筛选一级属性列表
          condition_sub_attr: "/mmp/model/object_event/analyze_filter_second_attr", //筛选子属性接口地址
          condition_op: "/mmp/model/base/operation", //筛选操作符
          list_value: "/mmp/model/base/attr_dimensions", //筛选建议值接口
        },
        tempParam: {},
        prop: { //级联菜单的选项
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          lazyLoad: ((node, resolve) => {
            const parent = node.data;
            var level = node.level;
            if (level == 0) {
              var param = this.$generateParams(this.$store.state.linkage);
              this.axios.post(this.url_list.url_behavior, param).then(response => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-user-where-6");
                  return;
                }
                var attr_list = data.data
                resolve(attr_list)
              }).catch((errors) => {
                console.log(errors)
                this.$error("接口请求失败-user-where-1");
              });
            }
            if (level == 1) {
              node.data.child.map(child => {
                child.leaf = true;
              })
              resolve(node.data.child)
            }
          }),
        },
        attrProps: {
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载
          value: 'value',
          lazyLoad: ((node, resolve) => {
            const parent = node.data;
            var level = node.level;

            if(level == 0){
              let dataMap = this.$generateParams(this.tempParam)
              this.axios.post(this.url_list.url_event_private_attr, dataMap).then(res => {
                if (res.data.code == 200) {
                  var attr_list = res.data.data[0].child
                  attr_list.map((v) => {
                    v.leaf = !v.cascade
                  })
                  this.$set(attrMap, 'attrMapping', attr_list);
                } else {
                  this.$error("获取属性映射集合错误！")
                }
              }).catch(error => {
                this.$error("请求属性映射集合接口失败！")
              })
            }
            if (level == 1) {
              let param = {
                "attr_type": "EVENT",
                "object": this.$route.query.object,
                "property_type": node.data.value,
                "step_attr": "attr"
              }
              let dataMap = this.$generateParams(param)
              this.axios.post(this.url_list.analyze_filter_sub_attr, dataMap).then(res => {
                if (res.data.code == 200) {
                  let children = res.data.data;
                  for (let child of children) {
                    child.leaf = true;
                  }
                  resolve(children);
                }
              })
            }
            if (level == 0) {
              return
            }
          })
        },
      }
    },
    methods: {
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
      removeAttrMap(parent, index,attrMap,attr) { //删除节点
        for(var v of attr.attrOptions){
          if(v.value == attrMap.selectValue){
            v.disabled = false ;
          }
        }
        parent.splice(index, 1);
      },
      onNameChange() {
        let reg = new RegExp('^[A-Za-z\u4e00-\u9fa5]|[A-Za-z\u4e00-\u9fa5][\w_0-9]+$');
        if (!reg.test(this.label)) {
          this.$error("名称格式不正确，请重新输入")
          this.label = ''
        }
      },
      onAttrNameChange(attr) {
        let reg = new RegExp('^[A-Za-z\u4e00-\u9fa5]|[A-Za-z\u4e00-\u9fa5][\w_0-9]+$');
        if (!reg.test(attr.attrName)) {
          this.$error("名称格式不正确，请重新输入")
          attr.attrName = ''
        }
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
      change_event(value, node, index) {
        var checked_node = this.$refs['node_attr_' + node.id][0].panel.getNodeByValue(value);
        var node_data = checked_node.data;
        var node_type = node_data.field_type;
        node.event_id = value[1] ;
        this.attrOptions[index].label = node_data.name;
        this.attrOptions[index].value = node_data.value;
        this.behaviorCollection.attrList = [];

        var param = this.$generateParams(this.$store.state.linkage);
        this.axios.post(this.url_list.url_split_event_attr, param).then(response => {
          var data = response.data;
          if (data.code != 200) {
            this.$error("接口请求失败-user-where-4");
            return;
          }
          this.$set(node.options, 'event_list', data.data);
        }).catch((errors) => {
          this.$error("接口请求失败-user-where-2");
        });
        node.step_children = []
      },
      add_main_step() {
        var step = {
          "id": this.$store.state.id_count++,
          "fid": 0,
          "level": 0,
          'logic_op': 'AND',
          'children': [],
          'agg_value': '',
          'eventGroupValue': '',
          'event_id':'',
          'alias': '',
          "options": {
            agg_selections: [],
            event_list: []
          }
        };
        this.attrOptions.push({
          label: '',
          value: ''
        })
        this.behaviorCollection.steps.push(step);
      },
      remove_step(node) {
        var index = this.behaviorCollection.steps.indexOf(node)
        if (this.behaviorCollection.steps.length > 1) {
          if(node.eventGroupValue.length>0){
            this.behaviorCollection.attrList = []  ;
          }
          this.behaviorCollection.steps.splice(index, 1);
        }
        var optionIndex = this.attrOptions.indexOf(node)
        this.attrOptions.splice(index, 1);
      },
      attrMappingChanged(i, attrMap, attr) {
        let param = {
          event_id: attrMap.selectValue,
          object: this.$route.query.object
        }
        this.tempParam = param

        let dataMap = this.$generateParams(param)
        this.axios.post(this.url_list.url_event_private_attr, dataMap).then(res => {
          if (res.data.code == 200) {
            var attr_list = res.data.data[0].child
            attr_list.map((v) => {
              v.leaf = !v.cascade
            })
            this.$set(attrMap, 'attrMapping', attr_list);
          } else {
            this.$error("获取属性映射集合错误！")
          }
        }).catch(error => {
          this.$error("请求属性映射集合接口失败！")
        })
        for (let option of attr.attrOptions) {
          let isSelect = false;
          for (let attrMapping of attr.attrMappingList) {
            if (attrMapping.selectValue == option.value) {
              option.disabled = true;
              isSelect = true;
            }
          }
          if (!isSelect) {
            option.disabled = false;
          }
        }
      },
      addAttr() {
        for (let attrOption of this.attrOptions) {
          attrOption.disabled = false;
        }
        let options = JSON.parse(JSON.stringify(this.attrOptions))
        this.behaviorCollection.attrList.push({
          attrOptions: options,
          attrName: '',
          attrType: 'STRING',
          attrMappingList: [{
            selectValue: '',
            mappings: []
          }]
        })
      },
      removeAttr(parent, index) { //删除树节点
        parent.splice(index, 1);
      },
      addAttrMapping(attr) {
        if (attr.attrMappingList.length < this.behaviorCollection.steps.length) {
          attr.attrMappingList.push({
            selectValue: ''
          })
        } else {
          this.$error("子属性数量不大于包含事件数量")
        }
      },
      onClickSubmit() {
        let event = {}
        var copy =  JSON.parse(JSON.stringify(this.behaviorCollection.steps))
        for (let step of copy) {
          let obj = {}
          //拼子条件
          var condition_data = {
            'is_group': true,
            'logic_op': step["logic_op"],
          }
          try {
            var new_data = []; //递归拼接子条件
            for (var condition of step["children"]) {
              new_data.push(this.$tools.makeSubmitParam.eventSubCondtionRecursion(condition))
            }
          } catch (err) {
            return this.$error(err.message);
          }
          if(new_data.length>0){
            obj.type = 'CONDITIONAL';
            condition_data["conditions"] = new_data;
            obj["conditions"] = condition_data;
          }else{
            obj.type =  'DIRECT' ;
          }
          Object.defineProperty(event, step.eventGroupValue[1], {
            value: obj,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }

        let attr = []
        for (let attribute of this.behaviorCollection.attrList) {
          let attrObj = {}
          attrObj.attr_name = attribute.attrName
          attrObj.attr_type = attribute.attrType
          attrObj.mapping = {}
          for (let attrMapping of attribute.attrMappingList) {
            let attr_id = ''
            if(attrMapping.mappings.length > 1){
              attr_id = attrMapping.mappings[1]
            }
            let attrMappingSub = {
              event_attr_id: attrMapping.mappings[0],
              attr_id: attr_id
            }
            Object.defineProperty(attrObj.mapping, attrMapping.selectValue, {
              value: attrMappingSub,
              writable: true,
              enumerable: true,
              configurable: true
            });
          }
          attr.push(attrObj)
        }

        let web_param = {
          behaviorCollection: this.behaviorCollection,
          name: this.label,
          desc: this.desc,
          attrOptions:this.attrOptions,
        }

        let dataMap = {
          name: this.label,
          desc: this.desc,
          events: event,
          attrs: attr,
          web_params: JSON.stringify(web_param) ,
          object: this.$route.query.object,
        }
        var id = this.$route.query.id ;
        if(id){
          dataMap.id = id  ;
        }
        let param = this.$generateParams(dataMap)

        if(this.label == ''){
          this.$error("行为集合名称不允许为空");
          return ;
        }
        this.axios.post(this.url_list.url_add, param).then(res => {
          if (res.data.code != 200) {
            this.$error("新增行为集合失败")
          } else{
            this.$success("新增行为集合成功")
            this.$router.push('/data/behavior/list')
          }
        }).catch(error => {
          this.$error("新增行为集合失败")
        })
      },
    },
    computed: {
      module_range_type() { //模块内联动区间每日是否发生变化
        if (!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)) {
          return {};
        }
        return this.$store.state.module_linkage[this.moduleId];
      }
    },
    watch: {
      where: {
        handler: function(val, oldval) {
          this.$emit('input', this.behaviorCollection);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
      module_range_type: { //联动参数变化的时候
        handler(newVal, oldVal) {
          this.attr_type = this.$store.state.module_linkage[this.moduleId].attr_type;
          this.where = {
            "id": 0,
            "fid": 0,
            "level": 0,
            'logic_op': 'AND',
            'children': [],
          };
        },
        deep: true
      },
    },

    mounted() {
      var param = this.$generateParams(this.$store.state.linkage);

      this.axios.post(this.url_list.url_list_value, param).then(response => {
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
      this.load_condition_op() ;
    }
  };
</script>
<style lang="">
  .title-name {
    line-height: 38px;
    text-align: right;
  }
</style>
