<template>
  <div class="my-form-row retained_time" >
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
      <el-select v-model="self_value.type" @change="changeTimeType($event)" style="width: 120px;">
        <el-option label="动态时间" value="DYNAMIC"></el-option>
        <el-option label="静态时间" value="STATIC"></el-option>
      </el-select>
      <el-date-picker v-show="self_value.type=='STATIC'" v-model="self_value.ranges" type="daterange" align="left"
        unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions"
        @change="onTimeChange" value-format="yyyy-MM-dd">
      </el-date-picker>
      <el-select v-show="self_value.type=='DYNAMIC'" v-model="self_value.dynamic_time" style="width: 120px;">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-popover placement="bottom" width="100" trigger="click" v-model="display">
        <el-row :class="item.checked ? 'checked-drop' : '' "   type="flex" justify="start" v-for="item in retainedDrop" :key="item.label" @click.native="groupChanged(item)">
          <el-input style="width: 50px;height: 10px;" @input="inputChange($event,item)" size="mini" v-model="item.value"  @blur='display=false' v-show="item.type=='dynamic'"></el-input>
          <el-button style="color: #8492a6; font-size: 13px;" type="text" @click='display=false'>{{item.label}}</el-button>
        </el-row>
        <el-button slot="reference">{{self_value.rangeValue}}</el-button>
      </el-popover>
      <el-select v-model="self_value.analyze_type" placeholder="请选择" style="width: 120px;">
        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["title", "name", "moduleId", "apis", "value"],
    created() {
      this.self_value = {
        ranges: [], //时间范围 数组
        type: 'DYNAMIC', //STATIC 静态 //DYNAMIC-动态
        dynamic_time: 'TODAY', //动态时间枚举值
        start: '',
        end: '',
        time_type: 'DAY',
        range: '7',
        analyze_type: 'KEEP',
        rangeValue: '7日',
        num: 0,
      };

      if(this.value){
        this.self_value = this.value
      }
    },
    data() {
      return {
        display: false,
        self_value: {
          ranges: [], //时间范围 数组
          type: 'DYNAMIC', //STATIC 静态 //DYNAMIC-动态
          dynamic_time: 'TODAY', //动态时间枚举值
          start: '',
          end: '',
          time_type: 'DAY',
          range: '7',
          analyze_type: '',
          rangeValue: '7日',
          num: 0,
        },
        pickerOptions: {
          shortcuts: [{
            text: '今日',
            onClick: ((picker) => {
              this.self_value.dynamic_time = 'value';
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime());
              picker.$emit('pick', [start, end]);
            }),
          }, {
            text: '昨日',
            onClick: ((picker) => {
              this.self_value.dynamic_time = 'YESTERDAY';
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', [start, end]);
            })
          }, {
            text: '本周',
            onClick: ((picker) => {
              this.self_value.dynamic_time = 'THIS_WEEK';
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - start.getDay() + 1);
              end.setDate(start.getDate() + 6);
              picker.$emit('pick', [start, end]);
            })
          }, {
            text: '上周',
            onClick: ((picker) => {
              this.self_value.dynamic_time = 'LAST_WEEK';
              const start = new Date();
              start.setDate(start.getDate() - start.getDay() + 1 - 7);
              var end = new Date(start.valueOf() + 86400*6*1000) ;
              picker.$emit('pick', [start, end]);
            }),
          }, {
            text: '本月',
            onClick: ((picker) => {
              this.self_value.dynamic_time = 'THIS_MONTH';
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - start.getDate() + 1);
              end.setDate(-1);
              end.setMonth(start.getMonth())
              picker.$emit('pick', [start, end]);
            })
          }, {
            text: '上月',
            onClick: ((picker) => {
              this.self_value.dynamic_time = 'LAST_MONTH';
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - start.getDate() + 1);
              start.setMonth(start.getMonth() - 1);
              end.setMonth(start.getMonth() + 1);
              end.setDate(0);
              picker.$emit('pick', [start, end]);
            })
          }, {
            text: '过去7天',
            onClick: ((picker) => {
              this.self_value.dynamic_time = 'LAST_7';
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            })
          }, {
            text: '过去30天',
            onClick: ((picker) => {
              this.self_value.dynamic_time = 'LAST_30';
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            })
          }]
        },
        showStatic: true,
        showDynamic: false,
        map: {
          TODAY: '今日',
          YESTERDAY: '昨日',
          LAST_7: '过去7天',
          LAST_30: '过去30天',
          THIS_WEEK: '本周',
          LAST_WEEK: '上周',
          THIS_MONTH: '本月',
          LAST_MONTH: '上月',
        },
        options: [{
          value: 'TODAY',
          label: '今日'
        }, {
          value: 'YESTERDAY',
          label: '昨日'
        }, {
          value: 'LAST_7',
          label: '过去7天'
        }, {
          value: 'LAST_30',
          label: '过去30天'
        }, {
          value: 'THIS_WEEK',
          label: '本周'
        }, {
          value: 'LAST_WEEK',
          label: '上周'
        }, {
          value: 'THIS_MONTH',
          label: '本月'
        }, {
          value: 'LAST_MONTH',
          label: '上月'
        }],
        retainedDrop: [{
            checked:false,
            value: '1',
            label: '次日',
            type: 'static',
            group: 'DAY'
          }, {
            checked:true,
            value: '7',
            label: '7日',
            type: 'static',
            group: 'DAY'
          },
          {
            checked:false,
            value: '14',
            label: '14日',
            type: 'static',
            group: 'DAY'
          },
          {
            checked:false,
            value: '30',
            label: '30日',
            type: 'static',
            group: 'DAY'
          },
          {
            value: '',
            label: '日',
            type: 'dynamic',
            group: 'DAY'
          },
          {
            checked:false,
            value: '0',
            label: '当周',
            type: 'static',
            group: 'WEEK'
          }, {
            checked:false,
            value: '1',
            label: '次周',
            type: 'static',
            group: 'WEEK'
          }, {
            checked:false,
            value: '4',
            label: '4周',
            type: 'static',
            group: 'WEEK'
          }, {
            checked:false,
            value: '8',
            label: '8周',
            type: 'static',
            group: 'WEEK'
          },
          {
            checked:false,
            value: '',
            label: '周',
            type: 'dynamic',
            group: 'WEEK'
          },{
            checked:false,
            value: '0',
            label: '当月',
            type: 'static',
            group: 'MONTH'
          }, {
            checked:false,
            value: '1',
            label: '次月',
            type: 'static',
            group: 'MONTH'
          }, {
            checked:false,
            value: '3',
            label: '3月',
            type: 'static',
            group: 'MONTH'
          }, {
            checked:false,
            value: '6',
            label: '6月',
            type: 'static',
            group: 'MONTH'
          },
          {
            checked:false,
            value: '',
            label: '月',
            type: 'dynamic',
            group: 'MONTH'
          },
        ],
        typeOptions: [{
          value: 'KEEP',
          label: '留存'
        }, {
          value: 'LOST',
          label: '流失'
        }],
      }
    },
    methods: {
      inputChange:function(value,item){
        item.value = parseInt(item.value);
        this.groupChanged(item);
      },
      changeTimeType(value) {
        if (value == 'DYNAMIC') {
          this.self_value.dynamic_time = 'TODAY';
        }
      },
      onTimeChange() {
        this.self_value.start = this.self_value.ranges[0];
        this.self_value.end = this.self_value.ranges[1];
      },
      groupChanged(item) {
        for(var v of this.retainedDrop){
          v.checked = false ;
        }
        item.checked  = true  ;
        if (item.type == 'dynamic') {
          this.self_value.range = item.value
          this.$set(this.self_value,'rangeValue',item.value + item.label)
        } else {
          this.self_value.range = item.value
          this.$set(this.self_value,'rangeValue',item.label)
        }
        this.self_value.time_type = item.group
      }
    },
    watch: {
      self_value: {
        handler: function(val, oldval) {
          this.$emit('input', this.self_value);
        },
        immediate: true,
        deep: true //对象内部的属性监听，也叫深度监听
      },
    },
    mounted() {
      this.$emit('input', this.self_value);
    },
  }
</script>

<style>
  .retained_time .el-popover{
    height: 200px;overflow: auto;
  }
  .checked-drop{color: #0e73ff !important;}
  .checked-drop button{color: #0e73ff !important;}
  .checked-drop input{color: #0e73ff !important;}
</style>
