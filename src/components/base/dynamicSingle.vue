<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
      <el-select v-model="model_self" placeholder="请选择" :key="num+'key'" value-key="value" @change="handleSelectval($event)">
        <el-option-group v-for="group in group_set" :key="group.label" :label="group.label">
          <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6;font-size: 16px;" v-if="item.hasOwnProperty('desc')">
              <el-tooltip placement="right">
                <div slot="content">
                  描述：{{item.desc}}
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
              </span>
          </el-option>
        </el-option-group>
      </el-select>
    </div>
    <el-row v-if="render_type == 'dynamic'">
      <el-form class="group-tool-sub">
        <template v-for="(column,column_index) in column_list" v-if="column.type && column.column.hasOwnProperty('alias')">
          <el-form-item :key="'show'+column_index" :label="column.param_name + ' ' +':'" label-width="164px">


            <!-- 时间类型 -->
            <template v-if="column.type=='time'">
              <el-select v-if="column.type == 'time'" v-model="column.time_type" style="width: 150px" placeholder="请选择时间类型"
                @change="changeType(column)">
                <el-option label="动态时间" value="DYNAMIC"></el-option>
                <el-option label="静态时间" value="STATIC"></el-option>
              </el-select>
              <!-- 静态时间 -->
              <template v-if="column.type=='time' && column.time_type=='STATIC' ">
                <template v-if="column.time_granularity=='DATE'">
                  <el-date-picker v-if="column.op=='BETWEEN'" v-model="column.time_range" type="daterange"
                    :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                    align="right" value-format="yyyy-MM-dd">
                  </el-date-picker>
                  <el-date-picker v-if="column.op!='BETWEEN'" v-model="column.value" style="width: 150px;" value-format="yyyy-MM-dd">

                  </el-date-picker>
                </template>

                <template v-if="column.time_granularity!='DATE'">
                  <el-date-picker type="datetime" v-if="column.op!='BETWEEN'" value-format="yyyy-MM-dd HH:mm:ss"
                    v-model="column.value">

                  </el-date-picker>
                  <el-date-picker v-if="column.op=='BETWEEN'" v-model="column.time_range" type="datetimerange"
                    :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                    align="right" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']">
                  </el-date-picker>
                </template>
              </template>
              <!--动态时间选择-->
              <el-popover placement="bottom" @hide="resetInput" @show="initInput(column)" width="100" trigger="click"
                v-model="column.display" v-if="column.type=='time' && column.time_type=='DYNAMIC' ">
                <el-row v-if="item.op == column.op" :class="item.id==column.time_id ? 'checked-drop' : '' " type="flex"
                  justify="start" v-for="item in dynamic_time_options" :key="item.label+'_'+'column_index'"
                  @click.native="groupChanged(item,column)">
                  <el-button v-show="item.type=='dynamic'" style="color: #8492a6; font-size: 13px;" type="text">最近</el-button>
                  <el-input style="width: 50px;height: 10px;" @input="inputChange($event,item,column)" v-model="item.value"
                    @blur='column.display=false' v-show="item.type=='dynamic'"></el-input>
                  <el-button style="color: #8492a6; font-size: 13px;" type="text" @click='column.display=false'>{{item.label}}</el-button>
                </el-row>
                <el-button slot="reference">{{column.time_text}}</el-button>
              </el-popover>
            </template>




            <!-- 字符串 和数值 -->
            <template v-if="(column.type=='number' || column.type=='string' || column.type=='date')">
              <el-select v-if="column.column.hasOwnProperty('order') && column.type" v-model="column.op" placeholder="请选择操作符"
                style="width: 120px;">
                <el-option v-for="(op,op_index) in op_list[column.type]" :key="op_index" :label="op.name" :value="op.value"></el-option>
              </el-select>

              <template v-if="column.type!='date'">
                <el-input v-model="column.value" v-if="column.op!='BETWEEN'" style="width: 200px;"></el-input>
                <template v-if="column.op == 'BETWEEN'">
                  <el-input v-model="column.start" style="width: 200px;" placeholder="请输入开始值"></el-input>~
                  <el-input v-model="column.end" style="width: 200px;" placeholder="请输入结束值"></el-input>
                </template>
              </template>

              <template v-if="column.type=='date'">
                <el-date-picker v-model="column.value" value-format="yyyy-MM-dd" v-if="column.op!='BETWEEN'" style="width: 150px;">
                </el-date-picker>
                <template v-if="column.op == 'BETWEEN'">
                  <el-date-picker v-model="column.start" value-format="yyyy-MM-dd" style="width: 150px;">
                  </el-date-picker> ~
                  <el-date-picker v-model="column.end" value-format="yyyy-MM-dd" style="width: 150px;">
                  </el-date-picker>
                </template>
              </template>

            </template>

            <!-- 固定维度 -->
            <template v-if="column.type=='dimension'">
              <!--多选-->
              <el-select v-if="column.multiple" v-model="column.values" collapse-tags clearable multiple>
                <!-- <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option> -->
                <el-option @click.native="checkAll(column)" :class="is_check_all ? 'selected' :''" label="全选" value="all"
                  v-if="column.support_sel_all&&column.dimension.length>1"></el-option>
                <el-option @click.native="checkIsCheckAll(column)" v-for="(d,d_index) in column.dimension" :key="d_index"
                  :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option>
              </el-select>
              <!--单选-->
              <el-select v-else v-model="column.value" clearable>
                <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option>
              </el-select>
            </template>

            <!-- <el-button type="primary" v-if="column_index == (column_list.length-1)" @click="fixColumnParam" size="mini">确定</el-button> -->
          </el-form-item>
        </template>
      </el-form>
    </el-row>
  </div>

</template>

<script>
  import pickerOptions from '@/config/pickerOptions.js'
  import dynamic_time_options from '@/config/dynamicTimeOptions.js'
  import fixColumnOpOptions from '@/config/fixColumnOpOptions.js'
  export default {
    props: ["title", "name", "moduleId", "apis", "value"],
    data() {
      return {
        model_self: {},
        self_value: {
          "group_id": "",
          "group_type": "",
          "sql": "",
          column_list: null,
          originalSql: "",
          scope_param: {},
        },
        middleSql: '',
        options: [],
        dynamic_list: [],
        group_set: [],
        num: 0,
        column_list: [],
        big_column_list: [], //用于校验sql变量
        url_list: {
          // data_list: '/mmp/group/group_list/', //属性列表接口
        },
        public_variable_list: [], //公共变量列表
        is_check_all: false,
        render_type: '',
        pickerOptions,
        dynamic_time_options,
        "op_list": fixColumnOpOptions,
        sql: '',
      }
    },
    created() {
      if (this.value) {
        if (this.value.group_type == "static") {
          this.model_self.value = this.value.group_id;
          this.self_value = {
            "group_id": this.value.group_id,
            "group_type": this.value.group_type,
            "sql": "",
            column_list: null,
            originalSql: "",
            big_column_list: []
          }
        } else {
          this.render_type = this.value.group_type;
          this.model_self.value = this.value.group_id;
          this.column_list = this.value.column_list;
          this.sql = this.value.originalSql;
          this.self_value = this.value;
          this.big_column_list = this.value.big_column_list;
          let arr = this.big_column_list; //用來操作where数组

          this.column_list = []; //this.column_list指針指向this.big_column_list
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].variable.length > 1) {
              for (let j = 0; j < arr[i].variable.length; j++) {
                if (this.sql.indexOf(arr[i].variable[j].alias) > -1) {
                  this.column_list.push(arr[i].column[0]);
                  break;
                }
              }
            } else {
              if (this.sql.indexOf(arr[i].variable[0].alias) > -1) {
                this.column_list.push(arr[i].column[0]);
              }
            }
          }

          //如果this.column_list有重複 去重
          for (let q = 0; q < this.column_list.length; q++) {
            this.uniqueSet(this.column_list);
          }
        }
      }
      var url_list = {};
      for (var v of this.apis) {
        url_list[v.name] = v.api;
      }
      this.url_list = url_list;
    },
    mounted() {
      this.getData();
    },
    methods: {
      //对象类型发生变化的时候初始化所有值
      initData: function() {
        this.getData();
        this.self_value.group_id = '';
        this.self_value.group_type = '';
        this.self_value.sql = '';
        this.self_value.column_list = null;
        this.self_value.originalSql = '';
        this.column_list = [];
        this.big_column_list = [];
      },
      preview() {
        this.previewFlag = true
      },
      checkIsCheckAll: function(item) {
        if (item.values.length != item.dimension.length) {
          this.is_check_all = false;
        } else {
          this.is_check_all = true;
        }
      },
      checkAll(item) { //全选
        if (this.is_check_all == false) {
          this.is_check_all = true;
          var data = [];
          item.dimension.map((v) => {
            data.push(v.value);
          });
          item.values = data;
        } else {
          console.log("取消选择");
          item.values = [];
          this.is_check_all = false;
        }
      },
      //删除枚举值
      removeDimension: function(column, index) {
        column.dimension.splice(index, 1);
      },
      addDimension: function(column) {
        //增加枚举值
        column.dimension.push({
          "value": "",
          "text": ""
        });
      },
      /**
       * 动态时间展示的时候把值填回去
       */
      initInput: function(column) {
        if (this.dynamic_time_options[column.time_id - 1].type == 'dynamic') {
          this.dynamic_time_options[column.time_id - 1].value = column.time_value;
        }
      },
      /**
       * 动态时间隐藏的时候重置自定义输入
       */
      resetInput: function() {
        for (var v of this.dynamic_time_options) {
          if (v.type == 'dynamic') {
            v.value = '';
          }
        }
      },
      inputChange: function(value, item, column) {
        var value = parseInt(value);
        if (isNaN(value)) {
          return;
        }
        item.value = parseInt(item.value);
        this.groupChanged(item, column);
      },

      /**
       * 动态时间的点击事件
       * @param {Object} item
       * @param {Object} column
       */
      groupChanged(item, column) {
        if (item.value == '') {
          return
        }
        if (item.type == 'dynamic') {
          column.time_id = item.id
          column.time_text = '最近' + item.value + item.label
          column.time_units = item.units
          column.time_value = item.value
          column.only_one = item.only_one
        } else {
          column.time_id = item.id
          column.time_text = item.label
          column.time_units = item.units
          column.time_value = item.value
          column.only_one = item.only_one
        }
      },
      switchOp: function() {
        for (var col of this.column_list) {
          if (!col.type) {
            this.$error("请选择列类型");
            return;
          }
          if (!col.column.hasOwnProperty('order')) {
            this.$error("请选择列名称");
            return;
          }
          if (col.type == "dimension") {
            if (col.dimension.length == 0) {
              this.$error("维度类型需要加枚举值");
              return;
            }
            for (var d of col.dimension) {
              if (d.value == '' || d.text == '') {
                this.$error("维度类型枚举值的值和文本都不能为空");
                return;
              }
            }
          }
        }
        this.op = 'show';
        this.changeShowfixFlag();
      },
      changeType(column) {
        if(column.time_type == 'STATIC'){
          var old_time = this.$tools.getDynamicTime(column) ;
          column.value = old_time.start;
          column.start = old_time.start,
          column.end = old_time.end;
          column.time_range = [old_time.start,old_time.end] ;
          column.values = [];
        }else{
          column.value = new Date();
          column.start = new Date(),
          column.end = new Date();
          column.values = [];
        }
      },
      doEdit: function() {
        if (this.column_list.length == 0) {
          this.addColumn();
        }
        this.op = 'edit';
      },
      /**
       * 获取公共变量列表
       */
      get_public_variable: function() {
        var param = this.$generateParams({
          object: this.$store.state.linkage.object,
          page: 1,
          page_size: 999999,
        });
        var url = this.$store.state.api_url.public_variable.list;
        this.axios
          .post(url, param)
          .then((response) => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            if (data.data.hasOwnProperty('hits') && data.data.hits) {
              var list = data.data.hits;
              for (var v of list) {
                v.variable = JSON.parse(v.variable);
                v.column = JSON.parse(v.column);
                v.extraVariable = v.variable_name;
              }
              this.public_variable_list = list;
            }

          })
          .catch((error) => {
            console.log(error);
            this.$error("接口请求失败");
          });
      },
      getDynamicData() {
        this.get_public_variable();
        let url = this.$store.state.api_url.dynamicDroup.dynamic_group_list;
        var param = this.$generateParams({
          object: this.$store.state.linkage.object,
          page: 1,
          page_size: 10000,
          is_all: this.$access('/data/dynamic/add'),
        });
        this.axios
          .post(url, param)
          .then((response) => {
            let data = response.data;
            this.dynamic_list = data.data.hits;
            this.dynamic_list.forEach(item => {
              item.value = item.id;
            })
            //拼接option
            let staticGroup = {
              label: '静态群组',
              options: this.options
            }
            let dynamicGroup = {
              label: '动态群组',
              options: this.dynamic_list
            }
            this.group_set[0] = dynamicGroup;
            this.group_set[1] = staticGroup;
            this.num++;
          })
          .catch((error) => {
            this.$error("接口请求失败");
          });
      },
      getData() {
        var url = this.url_list.data_list;
        var requestData = this.$generateParams(this.$store.state.linkage);
        this.axios.post(url, requestData).then((rep) => {
          var data = rep.data;
          if (data.code != 200) {
            console.log("接口请求失败" + url + 'single');
          }
          this.options = data.data;
          this.getDynamicData()
        }).catch(function(error) {
          console.log("接口请求失败" + url + 'single');
        });
      },
      handleSelectval(item) {
        if (item.hasOwnProperty('sql')) {
          this.sql = item.sql;
          let arr = JSON.parse(item.bind_vars);
          this.big_column_list = this.public_variable_list.concat(arr);

          this.column_list = [];
          for (var v of this.public_variable_list) {
            v.column[0].param_name = v.name;
            v.column[0].field = v.field;
            v.column[0].is_scope = v.is_scope;
            v.column[0].type = v.type;
            v.column[0].variable = v.variable;
            this.column_list.push(v.column[0]);
          }
          // let aliasSet = [];          //存变量集合
          for (let i = 0; i < arr.length; i++) {
            this.column_list.push(arr[i].column[0]);
          }


          //如果this.column_list有重複 去重
          // for (let q = 0; q < this.column_list.length; q++) {
          //   this.uniqueSet(this.column_list);
          // }

          this.render_type = "dynamic";
          this.self_value.group_id = item.id;
          this.self_value.sql = this.sql;
          this.self_value.originalSql = item.sql;
          this.self_value.group_type = 'dynamic';
          this.self_value.column_list = this.column_list;
          this.self_value.big_column_list = this.big_column_list;
        } else {
          this.sql = '';
          this.render_type = "static";
          this.self_value.group_id = item.value;
          this.self_value.group_type = 'static';
          this.self_value.column_list = [];
          this.self_value.sql = '';
          this.self_value.big_column_list = [];
          this.self_value.originalSql = "";
        }
      },
      uniqueSet(arr) {
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) {
              arr.splice(i, 1);
            }
          }
        }
      },
      concatPara() {
        var where = [];
        var variable_values = {};
        var scope_param = {};
        this.big_column_list.forEach(item => { //每个参数的循环
          if (item.is_scope) {
            scope_param[item.field] = item.column[0].values;
          }
          item.variable.forEach(innerItem => { //每个变量的循环
            var column = item.column[0];
            var variable_value = {};
            variable_value.name = item.name;
            variable_value.variable_name = innerItem.alias;
            variable_value.field = innerItem.value;
            variable_value.type = column.type  ;
            //字符串 
            if (column.type == 'string') {
              if (column.op == 'BETWEEN') {
                variable_value.op = column.op;
                variable_value.condition = '(' + innerItem.value + ' ' + column.op + " '" + column.start +
                  "'  AND  '" + column.end + "')";
                variable_value.value = '';
                variable_value.start = column.start;
                variable_value.end = column.end;
              } else {
                variable_value.op = column.op;
                variable_value.condition = '(' + innerItem.value + ' ' + column.op + " '" + column.value +
                  "'" + ')';
                variable_value.value = column.value;
                variable_value.start = '';
                variable_value.end = '';
              }
            }
            //数值类型
            if (column.type == 'number') {
              if (column.op == 'BETWEEN') {
                variable_value.op = column.op;
                variable_value.condition = '(' + innerItem.value + ' ' + column.op + " " + column.start +
                  "  AND  " + column.end + ")";
                variable_value.value = '';
                variable_value.start = column.start;
                variable_value.end = column.end;
              } else {
                variable_value.op = column.op;
                variable_value.condition = '(' + innerItem.value + ' ' + column.op + " " + column.value +
                  " " + ')';
                variable_value.value = column.value;
                variable_value.start = '';
                variable_value.end = '';
              }
            }

            //固定维度
            if (column.type == 'dimension') {
              //固定维度的多选情况
              if (column.multiple && column.values.length > 0) {
                var in_array = [];
                for (var in_value of column.values) {
                  in_array.push("'" + in_value + "'")
                }
                variable_value.op = 'IN';
                variable_value.condition = '(' + innerItem.value + ' ' + 'IN' + "(" + in_array.join(',') +
                  ")" + ')';
                variable_value.value = in_array;
                variable_value.start = '';
                variable_value.end = '';
              }

              //固定维度的单选情况
              if (!column.multiple && column.value != '') {
                variable_value.op = '=';
                variable_value.condition = '(' + innerItem.value + ' ' + '=' + " '" + column.value +
                  "'" + ')';
                variable_value.value = column.value;
                variable_value.start = '';
                variable_value.end = '';
              }

            }
            //时间类型
            if (column.type == 'time') {
              if (column.time_type == 'STATIC') {
                if (column.op == '=') {
                  variable_value.op = column.op;
                  var value = '';
                  if(column.time_granularity == 'DATE'){
                    value = new Date(column.value).Format('yyyy-MM-dd');
                  }
                  if(column.time_granularity == 'HOUR'){
                    value = new Date(column.value).Format('yyyy-MM-dd HH');
                  }
                  if(column.time_granularity == 'SECOND'){
                    value = new Date(column.value).Format('yyyy-MM-dd HH:mm:ss');
                  }
                  
                 
                  variable_value.condition = '(' + innerItem.value + ' ' + column.op + " '" + value +
                    "'" + ')';
                  variable_value.value = value;
                  variable_value.start = value;
                  variable_value.end = value;
                } else {
                  var start = new Date(column.time_range[0]);
                  var end = new Date(column.time_range[1]);
                  if (column.time_granularity == 'DATE') {
                    start = start.Format('yyyy-MM-dd');
                    end = end.Format('yyyy-MM-dd');
                  }
                  if (column.time_granularity == 'HOUR') {
                    start = start.Format('yyyy-MM-dd HH');
                    end = end.Format('yyyy-MM-dd HH');
                  }
                  if (column.time_granularity == 'SECOND') {
                    start = start.Format('yyyy-MM-dd HH:mm:ss');
                    end = end.Format('yyyy-MM-dd HH:mm:ss');
                  }
                  variable_value.op = 'BETWEEN';
                  variable_value.condition = '(' + innerItem.value + ' ' + 'BETWEEN' + " '" + start +
                    "'  AND  '" + end + "')"
                  variable_value.value = '';
                  variable_value.start = start;
                  variable_value.end = end;
                }
              } else {
                var time_units = column.time_units;
                var time_value = column.time_value;
                var end = new Date().Format('yyyy-MM-dd 23:59:59');
                var start = (new Date(new Date(end).getTime() - 86400 * 1000 * (1 - 1))).Format(
                  'yyyy-MM-dd 00:00:00');
                if (time_units == 'HOURS') { //最近N小时
                  var end = (new Date(new Date().getTime() - 3600 * 1000)).Format('yyyy-MM-dd HH:59:59');
                  var start = (new Date(new Date().getTime() - 3600 * 1000 * time_value)).Format(
                    'yyyy-MM-dd HH:00:00');
                }
                if (time_units == 'DAYS') { //最近N天
                  var end = new Date().Format('yyyy-MM-dd 23:59:59');
                  var start = (new Date(new Date(end).getTime() - 86400 * 1000 * (time_value - 1))).Format(
                    'yyyy-MM-dd 00:00:00');
                  if (column.only_one) {
                    var end = new Date(start).Format(
                      'yyyy-MM-dd 23:59:59')
                  }
                }
                if (time_units == 'WEEK') { //最近N周
                  var today = new Date();
                  var now = today.getDay();
                  var start = new Date(today.getTime() - 86400 * 1000 * (now - 1));
                  var end = new Date(today.getTime() + 86400 * 1000 * (7 - now));

                  var end = end.Format('yyyy-MM-dd 23:59:59');
                  var start = (new Date(new Date(end).getTime() - 86400 * 1000 * (time_value * 7 - 1))).Format(
                    'yyyy-MM-dd 00:00:00');
                  if (column.only_one) {
                    var end = new Date(new Date(start).getTime() + 86400 * 1000 * 6).Format(
                      'yyyy-MM-dd 23:59:59')
                  }
                }
                if (time_units == 'MONTH') { //最近月小时
                  var now = new Date();
                  var now2 = new Date();
                  var start = new Date();
                  var end = new Date();
                  start.setMonth(now.getMonth() - (time_value - 1));
                  var start = start.Format('yyyy-MM-01 00:00:00');
                  now.setMonth(now.getMonth() + 1);
                  now.setDate(0);
                  var end = now.Format('yyyy-MM-dd 23:59:59');
                  if (column.only_one) {
                    var start_object = new Date(start);
                    start_object.setMonth(start_object.getMonth() + 1);
                    start_object.setDate(0);
                    end = start_object.Format('yyyy-MM-dd 23:59:59');
                  }
                }

                var start = new Date(start);
                var end = new Date(end);
                var value = '' ;
                if (column.time_granularity == 'DATE') {
                  start = start.Format('yyyy-MM-dd');
                  end = end.Format('yyyy-MM-dd');
                  value = start;
                }
                if (column.time_granularity == 'HOUR') {
                  start = start.Format('yyyy-MM-dd HH');
                  end = end.Format('yyyy-MM-dd HH');
                  value = start;
                }
                if (column.time_granularity == 'SECOND') {
                  start = start.Format('yyyy-MM-dd HH:mm:ss');
                  end = end.Format('yyyy-MM-dd HH:mm:ss');
                  value = start;
                }
                
                if(column.op == 'BETWEEN'){
                  variable_value.condition = '(' + innerItem.value + ' ' + 'BETWEEN' + " '" + start + "'  AND  '" +
                    end + "')";
                }else{
                  variable_value.condition =  '(' + innerItem.value + ' ' + column.op + " '" + value +
                    "'" + ')';
                }
                variable_value.op =  column.op ;
                variable_value.value = value;
                variable_value.start = start;
                variable_value.end = end;
              }
            }
            variable_values[innerItem.alias] = variable_value;
          })
        })
        this.self_value.scope_param = scope_param;
        this.middleSql = this.self_value.originalSql;
        this.handleSqlstr(this.middleSql, variable_values);
        this.$set(this.self_value, 'sql', this.middleSql);
        this.$set(this.self_value, 'column_list', this.column_list);
      },
      handleSqlstr(middleSql, where) {
        var reg = /([$#]).*?\{\s?(\w+)(\.start|\.end){0,1}\s?\}/g
        var c = middleSql.replace(reg, ((search, $1, $2,$3) => {
          var quotation = where[$2].type == 'number' ?  '' : "'" ; 
          if ($1 == '$') {
            return where[$2].condition;
          }
          if ($1 == '#') {
            if(!$3){
              return quotation + where[$2].value + quotation;
            }else{
              if($3 == '.start'){
                return quotation + where[$2].start + quotation;
              }
              if($3 == '.end'){
                return quotation + where[$2].end + quotation;
              }
            }
            
          }
        }));
        this.middleSql = c;
      },
    },
    computed: {
      isFollow() {
        return this.$store.state.linkage; //需要监听的数据
      }
    },
    watch: {
      isFollow: { //联动参数变化的时候
        handler() {
          this.initData();
        },
        deep: true
      },
      // column_list: {
      //   handler(val, oldval) {
      //     this.concatPara();
      //     // this.$emit('input', this.self_value);
      //   },
      //   immediate: true,
      //   deep: true, //对象内部的属性监听，也叫深度监听
      // },
      self_value: {
        handler(val, oldval) {
          this.$emit('input', this.self_value);
        },
        immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
    },
  }
</script>

<style>
  .group-tool-sub .el-form-item {
    /* margin-bottom: 22px; */
    margin: 3px 0;
  }
</style>
