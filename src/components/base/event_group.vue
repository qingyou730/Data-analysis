<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <el-form style="display: inline-block;">
      <el-row label-width="0px" inline-message='true' v-for="(domain,domainIndex) in domains" :key="domain.id">
        <el-cascader placeholder="输入可搜索" :props="props" filterable v-model="domain.value" :ref="'node_attr_' + domain.id"
          @change="change_value($event,domain,domainIndex)" class="form-item-row">
        </el-cascader>
        <el-popover placement="right" :width="prpoverWidth" trigger="click"  v-if="domain.field_type=='NUMBER'">
          <el-radio-group v-model="domain.intValue" size="small">
            <div class="int-radio" v-for="item in type_list" :key="item.value">
              <el-radio :label="item.value">{{item.name}}</el-radio>
            </div>
          </el-radio-group>
          <div v-if="domain.intValue=='interval'">
            <el-divider margin='0'></el-divider>
            <div class="int-radio">开始：<el-input size="mini" style="width: 70%;" v-model="domain.interval.start"></el-input>
            </div>
            <div class="int-radio">结束：<el-input size="mini" style="width: 70%;" v-model="domain.interval.end"></el-input>
            </div>
            <div class="int-radio">间距：<el-input size="mini" style="width: 70%;" v-model="domain.interval.interval"></el-input>
            </div>
          </div>
          <div class="customs" v-if="domain.intValue=='custom'">
            <el-divider></el-divider>
            <div v-for="(custom, index) in domain.customs" :key="index" >
              <div class="int-radio">
                <el-input size="mini" style="width: 70%;" v-model="custom.name"></el-input>
                <el-button size="mini" v-if="index != domain.customs.length-1 && index!=0" type="text"><i class="el-icon-remove"
                    @click="removeCustom(custom,domain)" /></el-button>
              </div>
              <div class="int-radio">
                <el-input size="mini" :disabled="true" style="width: 40%;" v-model="custom.start"></el-input>
                <el-input size="mini" @blur="inputCustomChange(custom,index,domain.customs)" style="width: 40%;"
                  :disabled="index == domain.customs.length-1" v-model="custom.end"></el-input>
              </div>
            </div>
            <el-button @click='addCustom(domain,domainIndex,domains)'>新增区间</el-button>
          </div>
          <el-button style="margin-right: 10px;" size="mini" slot="reference" icon="el-icon-setting" type="primary"
            circle ></el-button>
        </el-popover>
        <el-button @click.prevent="removeDomain(domain)" v-if="domains.length>1" icon="el-icon-minus" type="primary"
          circle size="mini"></el-button>
        <el-button  @click.prevent="addDomain(domain)" icon="el-icon-plus" type="primary"
          circle size="mini"></el-button>

      </el-row>
    </el-form>
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
      if (this.value) {
        this.domains = this.value;
      }
    },
    data() {
      let vm = this;
      return {
        type_list: [{ //自定义类型
            "name": "使用离散数字",
            "value": "origin"
          },
          {
            "name": "使用默认区间",
            "value": "default"
          },
          {
            "name": "使用等间距",
            "value": "interval"
          },
          {
            "name": "使用自定义区间",
            "value": "custom"
          },
        ],
        domains: [{
          laber: '',
          value: '',
          range_agg: '',
          field_type: '',
          selectRadio: 'a',
          intervalType: false,
          customType: false,
          id: this.$store.state.id_count++,
          customs: [{
            id: this.$store.state.id_count++,
            name: '区间[0,+∞)',
            start: 0,
            end: '+∞'
          }],
          interval: {
            start: '',
            end: '',
            interval: ''
          },
          intValue: 'origin',
          isShowSetting: false,
          group_by_type: ''
        }],
        url_list: {
          // firstUrl: '/mmp/model/event/group_attr/',
          // secondUrl: '/mmp/model/event/group_sub_attr/',
          // url_range_list: '/mmp/model/base/range_attr_list/'
        },
        range_attr_name_map: [],
        attrId: 0,
        type: false,
        prpoverWidth: 190,
        group_by: [],
        options: [],
        segment: '',
        props: {
          label: 'name', //指定label字段用哪个
          lazy: true, //是否懒加载firstUrl
          lazyLoad: ((node, resolve) => {
            const {
              level
            } = node;
            if (level == 0) {
              var requestData = this.$generateParams(this.$store.state.linkage);
              this.axios.post(this.url_list.firstUrl, requestData).then((rep) => {
                  var options = rep.data.data;
                  options.map((op) => {
                    op.leaf = false;
                    op.level = 0;
                  })
                  resolve(options);
                })
                .catch(function(error) {
                  alert(error);
                });
            }
            if (level == 1) {
              var children = node.data.child;
              children.map((v) => {
                v.level = level + 1;
                v.leaf = !v.cascade;
              })
              resolve(children);
            }
            if (level == 2) {
              var param = this.$generateParams({
                "object": this.$store.state.linkage.object,
                "parent_property": node.value,
              });
              var url_sub_attr = this.url_list.secondUrl;
              //获取一级属性列表
              this.axios.post(url_sub_attr, param).then((response) => {
                var data = response.data;
                if (data.code != 200) {
                  this.$error("接口请求失败-event-group");
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
                this.$error("event-group");
              });
            }
          }),
        },
      }
    },
    mounted() {},
    methods: {
      /**
       * @param {Object} range自动生成区间名称
       */
      rangeName(range_list){
        for(var range of range_list){
          range.name = '区间['+range.start+','+range.end+')'
        }
      },
      addDomain() {
        this.domains.push({
          laber: '',
          value: '',
          range_agg: '',
          field_type: '',
          selectRadio: 'a',
          intervalType: false,
          customType: false,
          id: this.$store.state.id_count++,
          customs: [{
            id: this.$store.state.id_count++,
            name: '区间[0,+∞)',
            start: 0,
            end: '+∞'
          }],
          interval: {
            start: '',
            end: '',
            interval: ''
          },
          intValue: 'origin',
          isShowSetting: false,
          group_by_type: ''
        });
      },
      removeDomain(item) {
        var index = this.domains.indexOf(item)
        if (this.domains.length > 1) {
          this.domains.splice(index, 1);
        }
      },
      removeCustom(item, node) {
        var index = node.customs.indexOf(item)
        node.customs[index + 1].start = node.customs[index - 1].end;
        if (index !== 0) {
          node.customs.splice(index, 1)
        }
      },
      addCustom(node, index, parent) {
        var pre = node.customs[node.customs.length - 1];
        pre.end = pre.start + 1;
        node.customs.push({
          id: node.customs.length - 1,
          start: pre.end,
          end: '+∞',
          name: '区间',
        });
        this.customChange(node)
        this.rangeName(node.customs) ;
      },
      inputCustomChange(custom, index, customs) {
        if (custom.end < custom.start) {
          this.$error("区间右值需要大于左值");
          return;
        }
        custom.end = Number(custom.end);
        customs[index + 1].start = custom.end;
        for(var x=index+1;x<customs.length;x++){

          var next = customs[x]  ;
          var pre_end = customs[x-1].end  ;
          var old_next_end =  next.end   ;
          next.start = pre_end ;
          if (next.end !='+∞' && next.end<pre_end){
            next.end = pre_end+1;
          }else{
            break;
          }
        }
        this.rangeName(customs) ;
      },
      getParam(node) {
        if (node.intValue == 'custom') {
          return node.customs;
        }
        if (node.intValue == 'interval') {
          return node.interval;
        }
        return {};
      },
      change_value(value, node, domainIndex) {
        var checked_node = this.$refs['node_attr_' + node.id][0].panel.getNodeByValue(value);
        var temp_select_options = checked_node.pathNodes;
        var select_options = [];
        temp_select_options.map((v) => {
          select_options.push(v.data);
        })
        
        var name_array = [];
        for (var i in select_options) {
          if (select_options[i].hasOwnProperty('name')) {
            name_array.push(select_options[i].name);
          }
        }
        node.name_array = name_array ;
        
        
        //设置node节点的值
        var finnal_value = value[value.length - 1]
        var finnal_option = select_options[select_options.length - 1]
        var group_by_type = select_options[0]
        var field_type = finnal_option.field_type;
        var list_value = finnal_option.list_value;
        node.group_by_type = group_by_type
        node.range_agg = '';
        node.field_type = field_type;
      },
      changeSegment(domainIndex) {
        if (!this.group_by.hasOwnProperty(domainIndex)) {
          return;
        }
        this.group_by[domainIndex].range_agg = this.segment;
      }
    },
    watch: {
      domains: {
        handler: function(val, oldval) {
          this.$emit('input', this.domains);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
      object: { //联动参数变化的时候
        handler() {
          this.domains = [{
              laber: '',
              value: '',
              range_agg: '',
              field_type: '',
              selectRadio: 'a',
              intervalType: false,
              customType: false,
              id: this.$store.state.id_count++,
              customs: [{
                id: this.$store.state.id_count++,
                name: '区间[0,+∞)',
                start: 0,
                end: '+∞'
              }],
              interval: {
                start: '',
                end: '',
                interval: ''
              },
              intValue: 'origin',
              isShowSetting: false,
              group_by_type: ''
            }];
        },
        deep: true
      },
    },
    computed: {
      module_range_type() { //模块内联动区间每日是否发生变化
        if (!this.$store.state.module_linkage.hasOwnProperty(this.moduleId)) {
          return {};
        } else {
          return this.$store.state.module_linkage[this.moduleId];
        }
      },
      object() {
        return this.$store.state.linkage.object; //需要监听的数据
      },
    }
  }
</script>

<style>
  .int-radio {
    margin: 10px 0 10px 0;
  }
</style>
