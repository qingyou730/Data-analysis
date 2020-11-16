<template>
  <div>
    <hr style="width: 1000%;margin-left: -100%;background-color: #E5E5E5;border:none;height: 1px;" />
    <div class="my-form-row retained_time">
      <span class="my-form-label">窗口期 :</span>
      <div style="display: inline-block;">

        <el-popover placement="bottom" width="100" trigger="click" v-model="display">
          <el-row :class="item.checked ? 'checked-drop' : '' " type="flex" justify="start" v-for="item in window_period_options"
            :key="item.label" @click.native="groupChanged(item)">
            <el-input style="width: 50px;height: 10px;" @input="inputChange($event,item)" size="mini" v-model="item.value"
              @blur='display=false' v-show="item.type=='dynamic'"></el-input>
            <el-button style="color: #8492a6; font-size: 13px;" type="text" @click='display=false'>{{item.label}}</el-button>
          </el-row>
          <el-button slot="reference">{{self_value.window_period.text}}</el-button>
        </el-popover>
        <el-tooltip class="item" effect="dark" content="窗口期:用户触发第一个步骤后,在指定窗口期内完成整个漏斗,即算完成了全部转化" placement="top-start">
          <i class="el-icon-question icon-help"></i>
        </el-tooltip>

      </div>
    </div>
    <div class="my-form-row">
      <span class="my-form-label">时间范围 :</span>
      <div style="display: inline-block;">
        <el-select v-model="self_value.type" @change="changeTimeType($event)" style="width: 120px;">
          <el-option label="动态时间" value="DYNAMIC"></el-option>
          <el-option label="静态时间" value="STATIC"></el-option>
        </el-select>
        <el-date-picker v-show="self_value.type=='STATIC'" v-model="self_value.range" type="daterange" align="left"
          unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions"
          @change="onTimeChange" value-format="yyyy-MM-dd"></el-date-picker>
       <!-- <span style="color:#f56c6c; font-size:14px;" v-show="range_time&&self_value.type=='STATIC'">
          <i class="el-icon-warning">时间周期最大支持60天</i>
        </span> -->
        <el-select v-show="self_value.type=='DYNAMIC'" v-model="self_value.dynamic_time">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip class="item" effect="dark" :content="'第一个步骤发生的事件区间，后续步骤发生时间被延展到'+getShowText()" placement="top-start">
          <i class="el-icon-question icon-help"></i>
        </el-tooltip>
      </div>
    </div>
  </div>

</template>

<script>
  Date.prototype.Format = function(fmt) {
    var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "H+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" +
        o[k]).substr(("" + o[k]).length)));
    return fmt;
  }
  export default {
    props: {
      value: {
        type: Object,
        default: () => {
          return {
            range: [], //时间范围 数组
            type: "DYNAMIC", //STATIC 静态 //DYNAMIC-动态
            dynamic_time: "TODAY", //动态时间枚举值
            start: "",
            end: "",
          };
        },
      },
      title: {
        type: String,
        default: "时间范围",
      },
    },
    created() {
      if (this.value) {
        this.self_value = this.value;
      }
    },
    data() {
      return {
        display: false,
        range_time: false,
        self_value: {
          range: [], //时间范围 数组
          type: "DYNAMIC", //STATIC 静态 //DYNAMIC-动态
          dynamic_time: "TODAY", //动态时间枚举值
          start: "",
          end: "",
          window_period: {
            number: 1,
            units: 'DAYS',
            text: '当日',
            the_day: true,
          },
        },

        pickerOptions: {
          shortcuts: [{
              text: "今日",
              onClick: (picker) => {
                this.self_value.dynamic_time = "value";
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime());
                // this.self_value.range = [start, end] ;
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "昨日",
              onClick: (picker) => {
                this.self_value.dynamic_time = "YESTERDAY";
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24);
                end.setTime(end.getTime() - 3600 * 1000 * 24);
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "本周",
              onClick: (picker) => {
                this.self_value.dynamic_time = "THIS_WEEK";
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - start.getDay() + 1);
                end.setDate(start.getDate() + 6);
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "上周",
              onClick: (picker) => {
                this.self_value.dynamic_time = "LAST_WEEK";
                const start = new Date();
                start.setDate(start.getDate() - start.getDay() + 1 - 7);
                var end = new Date(start.valueOf() + 86400*6*1000) ;
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "本月",
              onClick: (picker) => {
                this.self_value.dynamic_time = "THIS_MONTH";
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - start.getDate() + 1);
                end.setDate(-1);
                end.setMonth(start.getMonth());
                // this.self_value.range = [start, end] ;
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "上月",
              onClick: (picker) => {
                this.self_value.dynamic_time = "LAST_MONTH";
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - start.getDate() + 1);
                start.setMonth(start.getMonth() - 1);
                end.setMonth(start.getMonth() + 1);
                end.setDate(0);
                // this.self_value.range = [start, end] ;
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "过去7天",
              onClick: (picker) => {
                this.self_value.dynamic_time = "LAST_7";
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                // this.self_value.range = [start, end] ;
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "过去30天",
              onClick: (picker) => {
                this.self_value.dynamic_time = "LAST_30";
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                // this.self_value.range = [start, end] ;
                picker.$emit("pick", [start, end]);
              },
            },
          ],
        },
        showStatic: true,
        showDynamic: false,
        map: {
          TODAY: "今日",
          YESTERDAY: "昨日",
          LAST_7: "过去7天",
          LAST_30: "过去30天",
          THIS_WEEK: "本周",
          LAST_WEEK: "上周",
          THIS_MONTH: "本月",
          LAST_MONTH: "上月",
        },
        options: [{
            value: "TODAY",
            label: "今日",
          },
          {
            value: "YESTERDAY",
            label: "昨日",
          },
          {
            value: "LAST_7",
            label: "过去7天",
          },
          {
            value: "LAST_30",
            label: "过去30天",
          },
          {
            value: "THIS_WEEK",
            label: "本周",
          },
          {
            value: "LAST_WEEK",
            label: "上周",
          },
          {
            value: "THIS_MONTH",
            label: "本月",
          },
          {
            value: "LAST_MONTH",
            label: "上月",
          },
        ],
        window_period_options: [{
            checked: false,
            value: 5,
            label: '5分钟',
            units: 'MINUTES',
            the_day: false,
          },
          {
            checked: false,
            value: 1,
            label: '1小时',
            units: 'HOURS',
            the_day: false,
          }, {
            checked: false,
            value: 1,
            label: '当天',
            units: 'DAYS',
            the_day: true,
          }, {
            checked: false,
            value: 24,
            label: '24小时',
            units: 'HOURS',
            the_day: false,
          }, {
            checked: false,
            value: 7,
            label: '7天',
            units: 'DAYS',
            the_day: false,
          }, {
            checked: false,
            value: 14,
            label: '14天',
            units: 'DAYS',
            the_day: false,
          }, {
            checked: false,
            value: 30,
            label: '30天',
            units: 'DAYS',
            the_day: false,
          },
          {
            checked: false,
            value: '',
            label: '天',
            units: 'DAYS',
            type: 'dynamic',
            the_day: false,
          },
        ],
      };

    },
    methods: {
      getShowText:function(){
        if(this.self_value.type=='DYNAMIC'){
          var end = this.getEnd(this.self_value.dynamic_time) ;
        }else{
          var end = this.self_value.end + ' 23:59:59'; 
        }
        var time = new Date(end).getTime();
        var window_period = this.self_value.window_period ;
        if(window_period.the_day){
          return (new Date(end)).Format('yyyy-MM-dd');  
        }else{
          if(window_period.units == 'MINUTES'){
            time += window_period.number * 60 * 1000 ;  
          }else if(window_period.units == 'HOURS'){
            time += window_period.number * 3600 * 1000 ;   
          }else if(window_period.units == 'DAYS'){
            time += window_period.number * 86400 * 1000 ;   
          }
          if(new Date(time).Format('HH:mm') == '23:59'){
            return (new Date(time).Format('yyyy-MM-dd')) ; 
          }else{
            time += 1000 ;
            return (new Date(time).Format('yyyy-MM-dd HH:mm')) ;  
          }
          //  MINUTES  HOURS DAYS
        }
        // return time ;
        // return end ;
      },
      /**
       * 计算动态时间的结束时间
       * @param {Object} ent_time_str
       */
      getEnd:function(ent_time_str){
        switch(ent_time_str){
          case 'TODAY':
            var time  =   (new Date()).Format('yyyy-MM-dd 23:59:59');
            return time ;
            break;
          case 'YESTERDAY':
              var time  = new Date(((new Date()).getTime() - 3600 * 1000 * 24)).Format('yyyy-MM-dd 23:59:59');
              return time ;
            break;
          case 'LAST_7':
            var time  = new Date(((new Date()).getTime() - 3600 * 1000 * 24 * 7)).Format('yyyy-MM-dd 23:59:59');
            return time ;
            break;
          case 'LAST_30':
            var time  = new Date(((new Date()).getTime() - 3600 * 1000 * 24) * 30).Format('yyyy-MM-dd 23:59:59');
            return time ;
            break;
          case 'THIS_WEEK':
            var start = new Date() ;
            var end = new Date() ;
            start.setDate(start.getDate() - start.getDay() + 1);
            end.setDate(start.getDate() + 6);
            return end.Format('yyyy-MM-dd 23:59:59');
            break;
          case 'LAST_WEEK':
            var start = new Date();
            start.setDate(start.getDate() - start.getDay() + 1 - 7);
            var end = new Date(start.valueOf() + 86400*6*1000) ;
            return end.Format('yyyy-MM-dd 23:59:59');
            break;
          case 'THIS_MONTH':
              var end = new Date();
              var start = new Date();
              start.setDate(start.getDate() - start.getDate() + 1);
              end.setDate(-1);
              end.setMonth(start.getMonth());
              return end.Format('yyyy-MM-dd 23:59:59');
            break;
          case 'LAST_MONTH':
            var end = new Date();
            var start = new Date();
            start.setDate(start.getDate() - start.getDate() + 1);
            start.setMonth(start.getMonth() - 1);
            end.setMonth(start.getMonth() + 1);
            end.setDate(0);
            return end.Format('yyyy-MM-dd 23:59:59');
            break;
        }
        
      },
      inputChange: function(value, item) {
        var value = parseInt(value);
        if (isNaN(value)) {
          return;
        }
        item.value = parseInt(item.value);
        this.groupChanged(item);
      },

      groupChanged(item) {
        if (item.value == '') {
          return
        }
        for (var v of this.window_period_options) {
          v.checked = false;
        }
        item.checked = true;
        if (item.type == 'dynamic') {
          this.self_value.window_period.number = item.value
          this.self_value.window_period.units = item.units
          this.self_value.window_period.text = item.value + '天'
          this.self_value.window_period.the_day = item.the_day
        } else {
          this.self_value.window_period.number = item.value
          this.self_value.window_period.units = item.units
          this.self_value.window_period.text = item.label
          this.self_value.window_period.the_day = item.the_day
        }
      },
      changeTimeType(value) {
        if (value == "DYNAMIC") {
          this.self_value.dynamic_time = "TODAY";
          this.range_time = false;
        } else {
          this.range_time = true;
          setTimeout(() => (this.range_time = false), 5000);
        }
      },
      datedifference(sDate1, sDate2) {
        var dateSpan, tempDate, iDays;
        sDate1 = Date.parse(sDate1);
        sDate2 = Date.parse(sDate2);
        dateSpan = sDate2 - sDate1;
        dateSpan = Math.abs(dateSpan);
        iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
        return iDays;
      },
      onTimeChange() {
        // console.log("cccccc") ;
        // this.self_value.type = 'STATIC'  ;
        let start = this.self_value.range[0].split(" ")[0];
        let end = this.self_value.range[1].split(" ")[0];
        // let resultEnd = this.self_value.range[1].split(" ")[1];
        let day = this.datedifference(start, end);
        if (day > 60) {
          this.$error("时间周期最大支持60天");
          this.self_value.start = this.self_value.range[0];
          let format = Date.parse(this.self_value.start.split(" ")[0]);
          let rangeTime = format + 60 * 24 * 3600 * 1000;
          this.self_value.range[1] = new Date(rangeTime).Format("yyyy-MM-dd");
        }
        this.self_value.start = this.self_value.range[0];
        this.self_value.end = this.self_value.range[1];
      },
    },
    watch: {
      self_value: {
        handler: function(val, oldval) {
          this.$emit("input", this.self_value);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
    },
    mounted() {
      this.$emit("input", this.self_value);
    },
  };
</script>

<style>
  .checked-drop{color: #0e73ff !important;}
  .checked-drop button{color: #0e73ff !important;}
  .checked-drop input{color: #0e73ff !important;}
</style>
