<template>
  <div id="fix-column">
    <el-dialog title="配置固定列" :visible.sync="value" :close-on-click-modal="wrapper_no" :before-close="closeDialog"
      width="900px">
      {{column_list}}
      <el-form style="margin-right: 38px;">
        <template v-for="(column,column_index) in column_list">
          <div style="margin:10px 30px 10px 0px" :key="column_index+'fixwra'+render_num">
            <el-form-item :key="'type'+column_index" :label="column_index==0 ? '列类型：' :''" label-width="100px">
              <div style="background: #ECEEFE;padding-left:10px">
                <el-select v-model="column.type" size="small" placeholder="请选择列类型" @change="fixCloType(column)" style="width: 200px;">
                  <el-option label="固定维度" value="dimension"></el-option>
                  <el-option label="时间" value="time"></el-option>
                  <el-option label="字符串" value="string"></el-option>
                  <el-option label="数值" value="number"></el-option>
                </el-select>

                <template v-if="column.type=='dimension'">
                  <el-select v-model="column.multiple" size="small" style="width: 100px;">
                    <el-option label="多选" :value="true"></el-option>
                    <el-option label="单选" :value="false"></el-option>
                  </el-select>
                  <!-- 是否支持全选 -->
                  <template v-if="column.multiple">
                    <el-select v-model="column.support_sel_all" size="small" style="width: 200px;" placeholder="是否支持全选">
                      <el-option label="支持全选" :value="true"></el-option>
                      <el-option label="不支持全选" :value="false"></el-option>
                    </el-select>
                  </template>
                  <el-select v-model="column.enumeration" placeholder="请选择枚举值类型" size="small" style="width: 120px;" @change="handleDimension($event, column)">
                    <el-option
                      label="增加枚举值"
                      value="addenumeration">
                    </el-option>
                    <el-option
                      label="请求枚举值"
                      value="reqenumeration">
                    </el-option>
                  </el-select>
                  <!-- <a href="javascript:;" @click="addDimension(column)">增加枚举值</a> -->
                </template>


                <template v-if="column.type=='time'">
                  <el-select @change="changeGranularity(column)" v-model="column.time_granularity" size="small" style="width: 100px;"
                    placeholder="请选择时间粒度">
                    <el-option label="天" value="DATE"></el-option>
                    <el-option label="小时" value="HOUR"></el-option>
                    <el-option label="秒" value="SECOND"></el-option>
                  </el-select>

                  <el-select v-model="column.op" size="small" placeholder="请选择操作符" style="width: 120px;" @change="changeTimeOp(column)">
                    <el-option v-for="(op,op_index) in op_list[column.type]" :key="op_index" :label="op.name" :value="op.value"></el-option>
                  </el-select>
                </template>
              </div>
            </el-form-item>

            <!-- 固定维度的枚举值 -->
            <el-form-item :key="'dimension'+column_index +d_index" :label="d_index==0 ? '枚举值：' : ''" v-if="column.type=='dimension'"
              label-width="100px" v-for="(d,d_index) in column.dimension">
              <div style="background: #ECEEFE;padding-left:10px" v-if="column.enumeration=='addenumeration'">
                <el-input size="small" placeholder="请输入值" v-model="d.key" style="width: 200px;"></el-input>
                <el-input v-model="d.value" style="width: 200px;" size="small" placeholder="请输入显示文字"></el-input>
                <el-button icon="el-icon-plus" type="primary" circle size="mini" @click="addDimension(column)" v-if="d_index==0"></el-button>
                <el-button icon="el-icon-minus" type="primary" circle size="mini" @click="removeDimension(column,d_index)"></el-button>
              </div>
              <div style="background: #ECEEFE;padding-left:10px" v-if="column.enumeration=='reqenumeration'&&d_index==0">
                <span>请先输入枚举属性</span>
                <el-input size="small" placeholder="请输入值" v-model="column.req_dimension" style="width: 200px;"></el-input>
                <el-button @click="getDimension(column.req_dimension, column)" size="small">确定</el-button>
                <el-tooltip  effect="dark" content="请求回来的数据格式：[key:'', value: '']" placement="right">
                  <i class="el-icon-question icon-help"></i>
                </el-tooltip>
              </div>
            </el-form-item>


            <el-form-item :key="'name'+column_index" :label="column_index==0 ? '列名称：' :''" label-width="100px">
              <div style="background: #ECEEFE;padding-left:10px">
                <el-select v-model="column.column" size="small"  placeholder="请选择列" style="width: 200px;">
                  <el-option v-for="(indicator,indicator_index) in indicators" :key="indicator_index" :label="indicator"
                    :value="indicator"></el-option>
                </el-select>



                <!-- 字符串 和数值 -->
                <template v-if="(column.type=='number' || column.type=='string'  || column.type=='date')">
                  <el-select  v-if="column.type" v-model="column.op" size="small"
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
                    <el-date-picker v-model="column.value" value-format="yyyy-MM-dd" v-if="column.op!='BETWEEN'" style="width: 150px;"
                      size="small">
                    </el-date-picker>
                    <template v-if="column.op == 'BETWEEN'">
                      <el-date-picker v-model="column.start" value-format="yyyy-MM-dd" style="width: 150px;" size="small">
                      </el-date-picker> ~
                      <el-date-picker v-model="column.end" value-format="yyyy-MM-dd" style="width: 150px;" size="small">
                      </el-date-picker>
                    </template>
                  </template>
                </template>

                <template v-if="column.type=='dimension'">
                  <!--多选-->
                  <el-select v-if="column.multiple" v-model="column.values" size="small" collapse-tags clearable multiple
                    style="width: 200px;">
                    <!-- <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option> -->
                    <el-option @click.native="checkAll(column)" :class="column.is_check_all ? 'selected' :''" label="全选" value="all"
                      v-if="column.support_sel_all&&column.dimension.length>1"></el-option>
                    <el-option @click.native="checkIsCheckAll(column)" v-for="(d,d_index) in column.dimension" :key="d_index"
                      :label="d.value" :value="d.key" v-if="d.value && d.key"></el-option>
                  </el-select>
                  <!--单选-->
                  <el-select v-else v-model="column.value" size="small" clearable>
                    <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.value" :value="d.key" v-if="d.value && d.key"></el-option>
                  </el-select>
                </template>

                <!-- 时间类型 -->
                <template v-if="column.type=='time'">
                  <!-- 静态时间 -->
                  <template v-if="column.type=='time' && column.time_type=='STATIC' ">
                    <template v-if="column.time_granularity=='DATE'">
                      <el-date-picker v-if="column.op=='BETWEEN'" size="small" v-model="column.time_range" type="daterange"
                        :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        align="right" value-format="yyyy-MM-dd">
                      </el-date-picker>
                      <el-date-picker v-if="column.op!='BETWEEN'" size="small" v-model="column.value" style="width: 150px;">

                      </el-date-picker>
                    </template>

                    <template v-if="column.time_granularity!='DATE'">
                      <el-date-picker type="datetime" v-if="column.op!='BETWEEN'" value-format="yyyy-MM-dd HH:mm:ss" size="small"
                        v-model="column.value">

                      </el-date-picker>
                      <el-date-picker v-if="column.op=='BETWEEN'" size="small" v-model="column.time_range" type="datetimerange"
                        :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        align="right" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:01', '23:59:59']">
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
                      <el-input style="width: 50px;height: 10px;" @input="inputChange($event,item,column)" size="small"
                        v-model="item.value" @blur='column.display=false' v-show="item.type=='dynamic'"></el-input>
                      <el-button style="color: #8492a6; font-size: 13px;" type="text" @click='column.display=false'>{{item.label}}</el-button>
                    </el-row>
                    <el-button size="small" slot="reference">{{column.time_text}}</el-button>
                  </el-popover>
                </template>


                <el-button icon="el-icon-minus" type="primary" circle size="mini" @click="removeColumn(column_index)"></el-button>
                <el-button icon="el-icon-plus" type="primary" circle size="mini" @click="addColumn"></el-button>
                <!-- <el-button type="primary" v-if="column_index == (column_list.length-1)" @click="switchOp" size="small">确定</el-button> -->
                <el-button type="primary" v-if="column_index == (column_list.length-1)" @click="preview" size="mini">确定</el-button>
              </div>
            </el-form-item>
          </div>

        </template>
      </el-form>
      <div style="width:100%;height:32px;"></div>


      <p v-if="previewFlag" style="margin-left: 46px;">预览：</p>
      <el-form v-if="previewFlag">
        <template v-for="(column,column_index) in preview_column_list" v-if="column.type">
          <el-form-item :key="'show'+column_index" :label="column.column + ':'" label-width="150px">

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
                  <el-input style="width: 50px;height: 10px;" @input="inputChange($event,item,column)" size="mini" v-model="item.value"
                    @blur='column.display=false' v-show="item.type=='dynamic'"></el-input>
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
                <el-option @click.native="checkAll(column)" :class="column.is_check_all ? 'selected' :''" label="全选" value="all"
                  v-if="column.support_sel_all&&column.dimension.length>1"></el-option>
                <el-option @click.native="checkIsCheckAll(column)" v-for="(d,d_index) in column.dimension" :key="d_index"
                  :label="d.value" :value="d.key" v-if="d.value && d.key"></el-option>
              </el-select>
              <!--单选-->
              <el-select v-else v-model="column.value" size="small" clearable>
                <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.value" :value="d.key" v-if="d.value && d.key"></el-option>
              </el-select>
            </template>

            <!-- <el-button type="primary" v-if="column_index == (column_list.length-1)" @click="fixColumnParam" size="small">确定</el-button> -->
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer" style="margin-right: 30px;">
        <el-button @click="closeDialog()" size="medium">取 消</el-button>
        <el-button type="primary" @click="save_fixed_column();" size="medium">保 存</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  import pickerOptions from '@/config/pickerOptions.js'
  import dynamic_time_options from '@/config/dynamicTimeOptions.js'
  import fixColumnOpOptions from '@/config/fixColumnOpOptions.js'
  import axios from "axios"
  export default {
    props: ['value', 'id', 'folder_id', 'indicators', 'task_field', 'fixed_column_str'],
    data() {
      return {
        render_num: 0,
        visible: true,
        is_check_all: false,
        display: false,
        op: "show",
        previewFlag: false,
        column_type: '',
        preview_column_list: [],
        column_list: [{
          "type": '',
          "column": "",
          "op": "=",
          "value": '',
          "values": [],
          "start": "",
          "end": "",
          "time_granularity": "DATE", //时间粒度
          "time_type": 'DYNAMIC', //时间类型
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
          enumeration: "",  //枚举值类型
          req_dimension: "", //请求属性绑定字段
          is_check_all: false, //，枚举是否是全选
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
      console.log(this.id);
      if (this.fixed_column_str) {
      //   var column_list = JSON.parse(this.fixed_column_str);
      //   if (column_list.length > 0) {
      //     this.column_list = column_list;
      //     this.$emit('input', this.column_list);
      //   }
      }
    },
    methods: {
      getDimension(val,column) {
        if(!val) {
          this.$error('请输入枚举属性');
          return;
        }
        var url = this.$store.state.api_url.task.get_dimension;
        axios.get(url, {
        　　params: { 'field': val }
        }).then( (res) =>{
          var data = res.data;
          if(data.code==200){
            if(data.data.length>0) {
              column.dimension = data.data;
            }else{
              column.dimension = [{value:'', key:""}]
              this.$error("任务属性没有对应的字段");
            }
          }
        }).catch((error)=> {
        　　this.$error(error.msg);
        });
      },
      handleDimension(val,column) {
        if(val=="addenumeration") {
          column.values.length = 0;
          column.dimension.length = 0;
          this.addDimension(column)
        }else{
          column.dimension=[{key:"", value:""}]
          // this.render_num++;
        }
      },
      /**
       * @param {Object} column
       * 时间类型的变化 区间 和等于
       */
      changeTimeOp: function(column) {
        if (column.op == '=') {
          column.time_units = 'DAY'; //动态时间单位
          column.time_text = "今日"; //动态时间文本
          column.time_value = "1"; //动态时间枚举值
          column.time_id = 15;
          column.only_one = true;
        }
        if (column.op == 'BETWEEN') {
          column.time_units = 'DAY'; //动态时间单位
          column.time_text = "最近1天"; //动态时间文本
          column.time_value = "1"; //动态时间枚举值
          column.time_id = 3;
          column.only_one = false;
        }
      },
      /**
       * 关闭弹窗
       */
      closeDialog: function() {
        this.visible = false;
        this.$emit('input', false);
      },
      preview() {
        this.previewFlag = true;
        this.preview_column_list = JSON.parse(JSON.stringify(this.column_list));
      },
      checkIsCheckAll: function(item) {
        if (item.values.length != item.dimension.length) {
          item.is_check_all = false;
        } else {
          item.is_check_all = true;
        }
      },
      checkAll(item) { //全选
        if (item.is_check_all == false) {
          item.is_check_all = true;
          var data = [];
          item.dimension.map((v) => {
            data.push(v.key);
          });
          item.values = data;
        } else {
          item.values = [];
          item.is_check_all = false;
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
      /**
       * 修改时间粒度
       * @param {Object} column
       */
      changeGranularity: function(column) {
        column.time_range = [];
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
      switchOp() {
        for (var col of this.column_list) {
          if (!col.type) {
            this.$error("请选择列类型");
            return;
          }
          if (!col.column) {
            this.$error("请选择列名称");
            return;
          }
          if (col.type == "dimension") {
            if (col.dimension.length == 0) {
              this.$error("维度类型需要加枚举值");
              return;
            }
            for (var d of col.dimension) {
              if (d.value == '' || d.key == '') {
                this.$error("维度类型枚举值的值和文本都不能为空");
                return;
              }
            }
          }
        }
        this.op = 'show';
        this.changeShowfixFlag();
      },
      fixCloType(column) { //固定列类型设置
        column.value = '';
        column.start = '',
        column.end = '';
        column.values = [];
        column.op = column.type == 'time' ? 'BETWEEN' : '=';
      },
      /**
       * @param {Object} column
       * 变化静态时间动态时间
       */
      changeType: function(column) {
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
          "column": "",
          "op": "=",
          "value": '',
          "values": [],
          "start": "",
          "end": "",
          "time_granularity": "DATE", //时间粒度
          "time_type": 'DYNAMIC', //时间类型
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
          enumeration: "",  //枚举值类型
          is_check_all: false,
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
      /**
       * 这里只保存了固定列
       */
      save_fixed_column: function() {
        if (this.column_list.length == 0) {
          this.$error('请配置固定列信息');
          return;
        }
        for (var col of this.column_list) {
          if (!col.type) {
            this.$error("请选择列类型");
            return;
          }
          if (!col.column) {
            this.$error("请选择列名称");
            return;
          }
          if (col.type == "dimension") {
            if (col.dimension.length == 0) {
              this.$error("维度类型需要加枚举值");
              return;
            }
            for (var d of col.dimension) {
              if (d.value == '' || d.key == '') {
                this.$error("维度类型枚举值的值和文本都不能为空");
                return;
              }
            }
          }
        }
        this.$emit('showFixcolmnFun');
        this.$emit('input', false);
        // var url = this.$store.state.api_url.task.set_time_task_fix_column;
        // var fixed_column = JSON.stringify(this.column_list);
        // var param = {
        //   "fixed_column": fixed_column,
        //   "id": this.id,
        // }
        // param = this.$generateParams(param);
        // this.axios
        //   .post(url, param)
        //   .then(rep => {
        //     if (rep.data.code == 200) {
        //       this.$success("设置成功");
        //       this.$emit('input', false);
        //     } else {
        //       this.$error(rep.data.msg);
        //     }
        //   })
        //   .catch(error => {
        //     console.log(error);
        //     this.$error("保存固定列失败");
        //   });
      },
    },
    computed: {},
    watch: {
      column_list: {
        handler: function(val, oldval) {
          this.$emit('changeFixcolmnFun', this.column_list);
        },
        deep: true, //对象内部的属性监听，也叫深度监听
      },
    }
  }
</script>

<style>
  #fix-column .el-form-item {
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
