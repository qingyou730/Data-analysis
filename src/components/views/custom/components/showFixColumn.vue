<template>
  <div id="show-fix-column">
    <!-- <span style="display: inline-block;margin-left:15px;position: absolute;top: 10px;">
      <i class="fa fa-thumb-tack" aria-hidden="true" style="margin-right: 14px;color:#0E73FF;"></i>固定列
    </span> -->
    <el-form style="display: inline-block;margin-left: 92px;">
      <template v-for="(column,column_index) in column_list" v-if="column.type && column.column.hasOwnProperty('alias')">
        <el-form-item :key="'show'+column_index" :label="column.column.alias + ':'" label-width="150px">

          <!-- 时间类型 -->
          <template v-if="column.type=='time'">
            <el-select v-if="column.type == 'time'" v-model="column.time_type" style="width: 150px" size="mini"
              placeholder="请选择时间类型" @change="changeType(column)">
              <el-option label="动态时间" value="DYNAMIC"></el-option>
              <el-option label="静态时间" value="STATIC"></el-option>
            </el-select>
            <!-- 静态时间 -->
            <template v-if="column.type=='time' && column.time_type=='STATIC' ">
              <template v-if="column.time_granularity=='DATE'">
                <el-date-picker v-if="column.op=='BETWEEN'" size="mini" v-model="column.time_range" type="daterange"
                  :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                  align="right" value-format="yyyy-MM-dd">
                </el-date-picker>
                <el-date-picker v-if="column.op!='BETWEEN'" size="mini" v-model="column.value" style="width: 150px;">

                </el-date-picker>
              </template>

              <template v-if="column.time_granularity!='DATE'">
                <el-date-picker type="datetime" v-if="column.op!='BETWEEN'" value-format="yyyy-MM-dd HH:mm:ss" size="mini"
                  v-model="column.value">

                </el-date-picker>
                <el-date-picker v-if="column.op=='BETWEEN'" size="mini" v-model="column.time_range" type="datetimerange"
                  :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                  align="right" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:01', '23:59:59']">
                </el-date-picker>
              </template>
            </template>
            <!--动态时间选择-->
            <el-popover placement="bottom" @hide="resetInput" @show="initInput(column)" width="100" trigger="click"
              v-model="column.display" v-if="column.type=='time' && column.time_type=='DYNAMIC' ">
              <el-row v-if="item.op == column.op" :class="item.id==column.time_id ? 'checked-drop' : '' " type="flex"
                justify="start" v-for="item in dynamic_time_options" :key="item.label+'_'+'column_index'" @click.native="groupChanged(item,column)">
                <el-button v-show="item.type=='dynamic'" style="color: #8492a6; font-size: 13px;" type="text">最近</el-button>
                <el-input style="width: 50px;height: 10px;" @input="inputChange($event,item,column)" size="mini"
                  v-model="item.value" @blur='column.display=false' v-show="item.type=='dynamic'"></el-input>
                <el-button style="color: #8492a6; font-size: 13px;" type="text" @click='column.display=false'>{{item.label}}</el-button>
              </el-row>
              <el-button size="mini" slot="reference">{{column.time_text}}</el-button>
            </el-popover>
          </template>


          <!-- 字符串 和数值 -->
          <template v-if="(column.type=='number' || column.type=='string' || column.type=='date')">
            <el-select v-if="column.column.hasOwnProperty('order') && column.type" v-model="column.op" size="small"
              placeholder="请选择操作符" style="width: 200px;">
              <el-option v-for="(op,op_index) in op_list[column.type]" :key="op_index" :label="op.name" :value="op.value"></el-option>
            </el-select>

            <template v-if="column.type!='date'">
              <el-input v-model="column.value" v-if="column.op!='BETWEEN'" style="width: 200px;" size="small"></el-input>
              <template v-if="column.op == 'BETWEEN'">
                <el-input v-model="column.start" style="width: 200px;" size="small" placeholder="请输入开始值"></el-input>~
                <el-input v-model="column.end" style="width: 200px;" size="small" placeholder="请输入结束值"></el-input>
              </template>
            </template>

            <template v-if="column.type=='date'">
              <el-date-picker v-model="column.value" value-format="yyyy-MM-dd" v-if="column.op!='BETWEEN'" style="width: 200px;"
                size="small">
              </el-date-picker>
              <template v-if="column.op == 'BETWEEN'">
                <el-date-picker v-model="column.start" value-format="yyyy-MM-dd" style="width: 200px;" size="small">
                </el-date-picker> ~
                <el-date-picker v-model="column.end" value-format="yyyy-MM-dd" style="width: 200px;" size="small">
                </el-date-picker>
              </template>
            </template>

          </template>

          <!-- 固定维度 -->
          <template v-if="column.type=='dimension'">
            <!--多选-->
            <el-select v-if="column.multiple" v-model="column.values" size="small" collapse-tags clearable multiple
              style="width: 200px;">
              <!-- <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option> -->
              <el-option @click.native="checkAll(column)" :class="is_check_all ? 'selected' :''" label="全选" value="all"
                v-if="column.support_sel_all&&column.dimension.length>1"></el-option>
              <el-option @click.native="checkIsCheckAll(column)" v-for="(d,d_index) in column.dimension" :key="d_index"
                :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option>
            </el-select>
            <!--单选-->
            <el-select v-else v-model="column.value" size="small" clearable>
              <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option>
            </el-select>
          </template>

          <el-button type="primary" v-if="column_index == (column_list.length-1)" @click="fixColumnParam" size="mini">确定</el-button>
        </el-form-item>

      </template>
    </el-form>
  </div>
</template>

<script>
  import pickerOptions from '@/config/pickerOptions.js'
  import dynamic_time_options from '@/config/dynamicTimeOptions.js'
  import fixColumnOpOptions from '@/config/fixColumnOpOptions.js'
  export default {
    props: ['value', 'id', 'folder_id', 'indicators', 'task_field', 'fixed_column_str', "fixColumnParam", "showfixFlag",
      "changeShowfixFlag", "save_fixed_column"
    ],
    data() {
      return {
        is_check_all: false,
        display: false,
        op: "show",
        previewFlag: false,
        column_type: '',
        preview_column_list: [],
        column_list: [{
          "type": '',
          "column": {},
          "op": "=",
          "value": '',
          "values": [],
          "start": "",
          "end": "",
          "time_type": 'STATIC', //时间类型
          "time_range": [], //时间粒度
          "time_units": 'DAY', //动态时间单位
          "time_text": "最近1天", //动态时间文本
          "time_value": "1", //动态时间枚举值
          "time_id": 3,
          "display": false,
          "dimension": [],
          "only_one": false,
          "multiple": true,
          "support_sel_all": true,
        }], //配置的固定列列表
        t: '',
        wrapper_no: false,
        pickerOptions,
        dynamic_time_options,
        "op_list": fixColumnOpOptions,
      }
    },
    created() {
      // if (this.fixed_column_str) {
      //   console.log(this.fixed_column_str, '23333')
      //   var column_list = JSON.parse(this.fixed_column_str);
      //   if (column_list.length > 0) {
      //     this.column_list = column_list;
      //     this.$emit('input', this.column_list);
      //   }
      // }
    },
    mounted() {
      if (this.fixed_column_str) {
        var column_list = JSON.parse(this.fixed_column_str);
        if (column_list.length > 0) {
          this.column_list = column_list;
          this.$emit('input', this.column_list);
        }

      }
    },
    methods: {
      preview() {
        this.previewFlag = true;
        this.preview_column_list = JSON.parse(JSON.stringify(this.column_list));
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
          console.log(item, 'item')
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
        if (column.time_type == 'STATIC') {
          var old_time = this.$tools.getDynamicTime(column);
          column.value = old_time.start;
          column.start = old_time.start,
            column.end = old_time.end;
          column.time_range = [old_time.start, old_time.end];
          column.values = [];
        } else {
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
       * 添加一列
       */
      addColumn: function() {
        this.column_list.push({
          "type": '',
          "column": {},
          "op": "=",
          "value": '',
          "values": [],
          "start": "",
          "end": "",
          "time_type": 'STATIC', //时间类型
          "time_range": [], //时间范围
          "time_units": 'DAY', //动态时间单位
          "time_text": "最近1天", //动态时间文本
          "time_value": "1", //动态时间枚举值
          "time_id": 3,
          "display": false,
          "dimension": [],
          "only_one": false,
          "multiple": true,
          support_sel_all: true,
        });
      },
      /**
       * 删除一列
       */
      removeColumn: function(index) {
        if (this.column_list.length == 1) {
          return;
        }
        this.column_list.splice(index, 1);
      },
    },
    computed: {},
    watch: {
      column_list: {
        handler: function(val, oldval) {
          this.$emit('input', this.column_list);
        },
        deep: true, //对象内部的属性监听，也叫深度监听
      },
    }
  }
</script>

<style>
  #show-fix-column {
    position: relative;
  }

  #show-fix-column .el-form-item {
    margin-bottom: 0;
  }

  .checked-drop {
    color: #0e73ff !important;
  }

  .checked-drop button {
    color: #0e73ff !important;
  }

  .checked-drop input {
    color: #0e73ff !important;
  }
</style>
