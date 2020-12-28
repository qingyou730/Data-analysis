<template>
  <div class="creat-dynamic-group" style="position: relative;height:100%">
    <el-row style="height:32px;line-height:16px;padding: 0px 0px 0px 24px;border-bottom: 1px solid rgb(204, 204, 204);margin: 23px 5px;font-size: 16px;">
      创建群组
    </el-row>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="群组名称" prop="name">
        <!-- <el-input @blur="checkName" @input="repeat_name_falg=false" :placeholder="!repeat_name_falg?'给群组起一个名字':'群组名称重复请重新输入'"
          :class="['name',{'repeat-name-group': repeat_name_falg}]" v-model="ruleForm.name"></el-input> -->
        <el-input  placeholder="给群组起一个名字" v-model="ruleForm.name" class="name"></el-input>
      </el-form-item>
      <el-form-item label="群组描述" prop="desc">
        <el-input type="textarea" v-model="ruleForm.desc"></el-input>
      </el-form-item>
      <el-form-item label="对象类型" prop="type" class="demo-ruleForm">
        <el-select v-model="ruleForm.type" filterable @change="get_public_variable">
          <el-option v-for="item in obj_options" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="sql语句" prop="sql">
        <el-row style="width:80%">
          <group-sql v-model="ruleForm.sql" :key="sqlEditnum+'sql'"></group-sql>
          <div v-if="titleViewFlag" class="view-title-group">sql中变量统一使用${}包起来，且sql中必须包含${platform}</div>
          <div class="event-set">
            <i class="fa fa-align-justify" aria-hidden="true" @click="format(ruleForm)" style="cursor:pointer;color: #0e73ff;font-size:18px;margin:10px 6px 0 6px"
              title="格式化sql"></i>
            <i class="el-icon-s-operation" aria-hidden="true" @click="openParamDia()" style="cursor:pointer;color: #0e73ff;font-size:18px;margin:10px 6px 0 6px;font-weight: 600;"
              title="参数配置"></i>
            <i class="el-icon-view" aria-hidden="true" @click="titleView()" style="cursor:pointer;color: #0e73ff;font-size:18px;margin:10px 6px 0 6px;font-weight: 600;"
              title="用法说明"></i>
          </div>
        </el-row>
      </el-form-item>
    </el-form>
    <!-- 参数表格展示START -->
    <param-table v-if="paramFormSet.length>0 || public_variable_list.length>0 " v-model="paramFormSet" :key="paramFormSet.length+'table'+edit_num"
      :editParamFun="editParamFun" :openParamDia="openParamDia" :public_variable_list="public_variable_list"></param-table>
    <el-row v-if="paramFormSet.length>0 || public_variable_list.length>0">
      <div style="height:24px"></div>
    </el-row>
    <div :class="[{'submit-group': paramFormSet.length==0},{'submit-group-else': paramFormSet.length!=0}]">
      <el-button @click="cancelcreateDyGroup" size="medium">取 消</el-button>
      <el-button type="primary" @click="createDyGroup" size="medium">保 存</el-button>
    </div>
    <!-- 参数表格展示END -->

    <!-- 参数配置弹窗 -->
    <el-dialog title="参数配置" :visible.sync="DialogVisible" :before-close="canceladdParam" :close-on-click-modal="false"
      custom-class="group-dialog" :key="'paramForm'+paramFormNum" width="60%">
      <el-row>
        <el-form :model="paramForm" :rules="param_rules" ref="paramForm" label-width="100px" class="demo-paramForm">
          <el-form-item label="参数名称" prop="name">
            <el-input placeholder="请输入名称" class="name-param" v-model="paramForm.name" style="width:60%"></el-input>
          </el-form-item>
          <el-form-item label="参数类型" prop="type" class="condition">
            <el-select v-model="paramForm.type" filterable placeholder="请选择" @change="fixCloType($event)">
              <el-option label="固定维度" value="dimension"></el-option>
              <el-option label="时间" value="time"></el-option>
              <el-option label="字符串" value="string"></el-option>
              <el-option label="数值" value="number"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="绑定变量" prop="variable" class="condition">
            <el-row style="background: #ECEEFE;padding: 0 6px;width:60%">
              <template v-for="(item, index) in paramForm.variable">
                <div :key="index+'param'">
                  <div>
                    <i class="el-icon-question" style="margin: 0 6px"></i>
                    <span>变量名称</span>
                    <el-input placeholder="请输入" style="width:30%" v-model="item.alias" @input="loopParamForm"></el-input>
                  </div>
                  <div>
                    <i class="el-icon-question" style="margin: 0 6px"></i>
                    <span>变量真实字段</span>
                    <el-input placeholder="请输入" style="width: 30%" v-model="item.value" @input="loopParamForm"></el-input>
                    <el-button icon="el-icon-minus" type="primary" circle size="mini" @click="removeItem(index)"></el-button>
                    <el-button icon="el-icon-plus" type="primary" circle size="mini" @click="addItem"></el-button>
                  </div>
                </div>
              </template>
            </el-row>
          </el-form-item>
          <el-form-item label="配置固定列" prop="column" class="condition">
            <el-row style="background: #ECEEFE;padding: 0 6px;width:100%">
              <template v-for="(column, column_index) in paramForm.column">
                <el-form-item :key="'type'+column_index" :label="column_index==0 ? '列类型：' :''" label-width="100px">
                  <el-select v-model="column.type" size="mini" style="width: 150px;" disabled placeholder="请选择列类型"
                    @change="changeType(column)">
                    <el-option label="固定维度" value="dimension"></el-option>
                    <el-option label="时间" value="time"></el-option>
                    <el-option label="字符串" value="string"></el-option>
                    <el-option label="数值" value="number"></el-option>
                  </el-select>

                  <template v-if="column.type=='dimension'">
                    <el-select v-model="column.multiple" size="mini" style="width: 100px;">
                      <el-option label="多选" :value="true"></el-option>
                      <el-option label="单选" :value="false"></el-option>
                    </el-select>
                    <!-- 是否支持全选 -->
                    <template v-if="column.multiple">
                      <el-select v-model="column.support_sel_all" size="mini" style="width: 120px;" placeholder="是否支持全选">
                        <el-option label="支持全选" :value="true"></el-option>
                        <el-option label="不支持全选" :value="false"></el-option>
                      </el-select>
                    </template>
                    <a href="javascript:;" @click="addDimension(column)">增加枚举值</a>
                  </template>

                  <template v-if="column.type=='time'">
                    <el-select @change="changeGranularity(column)" v-model="column.time_granularity" size="mini" style="width: 100px;"
                      placeholder="请选择时间粒度">
                      <el-option label="天" value="DATE"></el-option>
                      <el-option label="小时" value="HOUR"></el-option>
                      <el-option label="秒" value="SECOND"></el-option>
                    </el-select>

                    <el-select v-if="column.column.hasOwnProperty('order')" v-model="column.op" size="mini" placeholder="请选择操作符"
                      style="width: 120px;" @change="changeTimeOp(column)">
                      <el-option v-for="(op,op_index) in op_list[column.type]" :key="op_index" :label="op.name" :value="op.value"></el-option>
                    </el-select>

                  </template>


                </el-form-item>


                <!-- 固定维度的枚举值 -->
                <el-form-item :key="'dimension'+column_index +d_index" :label="d_index==0 ? '枚举值：' : ''" v-if="column.type=='dimension'"
                  label-width="100px" v-for="(d,d_index) in column.dimension">
                  <el-input size="mini" placeholder="请输入值" v-model="d.value" style="width: 200px;"></el-input>
                  <el-input v-model="d.text" style="width: 200px;" size="mini" placeholder="请输入显示文字"></el-input>
                  <el-button icon="el-icon-minus" type="primary" circle size="mini" @click="removeDimension(column,d_index)"></el-button>
                </el-form-item>


                <el-form-item :key="'name'+column_index+'type'" :label="column_index==0 ? '列名称：' :''" label-width="100px">
                  <el-input v-model="paramForm.name" style="width: 200px;" size="mini" placeholder="请选择列" disabled></el-input>

                  <template v-if="(column.type=='number' || column.type=='string')">
                    <el-select v-if="column.column.hasOwnProperty('order') && column.type" v-model="column.op" size="mini"
                      placeholder="请选择操作符" style="width: 120px;">
                      <el-option v-for="(op,op_index) in op_list[column.type]" :key="op_index" :label="op.name" :value="op.value"></el-option>
                    </el-select>
                    <template v-if="column.type!='date'">
                      <el-input v-model="column.value" v-if="column.op!='BETWEEN'" style="width: 200px;" size="mini"></el-input>
                      <template v-if="column.op == 'BETWEEN'">
                        <el-input v-model="column.start" style="width: 200px;" size="mini" placeholder="请输入开始值"></el-input>~
                        <el-input v-model="column.end" style="width: 200px;" size="mini" placeholder="请输入结束值"></el-input>
                      </template>
                    </template>
                  </template>


                  <!-- 时间类型 -->
                  <template v-if="column.type=='time'">
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
                        <el-date-picker type="datetime" v-if="column.op!='BETWEEN'" value-format="yyyy-MM-dd HH:mm:ss"
                          size="mini" v-model="column.value">

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
                        justify="start" v-for="item in dynamic_time_options" :key="item.label+'_'+'column_index'"
                        @click.native="groupChanged(item,column)">
                        <el-button v-show="item.type=='dynamic'" style="color: #8492a6; font-size: 13px;" type="text">最近</el-button>
                        <el-input style="width: 50px;height: 10px;" @input="inputChange($event,item,column)" size="mini"
                          v-model="item.value" @blur='column.display=false' v-show="item.type=='dynamic'"></el-input>
                        <el-button style="color: #8492a6; font-size: 13px;" type="text" @click='column.display=false'>{{item.label}}</el-button>
                      </el-row>
                      <el-button size="mini" slot="reference">{{column.time_text}}</el-button>
                    </el-popover>
                  </template>

                  <template v-if="column.type=='dimension'">
                    <!--多选-->
                    <el-select v-if="column.multiple" v-model="column.values" size="mini" collapse-tags clearable
                      multiple :key="column_index+'select'">
                      <el-option @click.native="checkAll(column)" :class="is_check_all ? 'selected' :''" label="全选"
                        value="all" v-if="column.support_sel_all&&column.dimension.length>1"></el-option>
                      <el-option @click.native="checkIsCheckAll(column)" v-for="(d,d_index) in column.dimension" :key="d_index"
                        :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option>
                    </el-select>
                    <!--单选-->
                    <el-select v-else v-model="column.value" size="mini" clearable>
                      <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.text" :value="d.value"
                        v-if="d.value && d.text"></el-option>
                    </el-select>
                  </template>

                  <el-button type="primary" size="mini" :key="column_index+'btn'" @click="openViewFun">确认</el-button>
                  <!--预览操作 -->
                  <p v-if="openPreviewFlag" style="margin-left: -55px;border-top: 1px solid #ccc;margin-top: 19px;">预览：</p>

                  <div v-if="openPreviewFlag">
                    <pre-view :date="paramForm.column" :key="preview_num" :paramForm="paramForm"></pre-view>
                  </div>
                </el-form-item>
              </template>
            </el-row>


          </el-form-item>


        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="canceladdParam" size="medium">取 消</el-button>
        <el-button type="primary" @click="addparam" size="medium ">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 用法说明 -->
    <div class="var-drawer" v-if="var_drawer">
      <div style="line-height: 32px;">变量用法：</div>
      <p style="line-height: 24px;margin-bottom:32px">1. ${a} 将会被替换为真实值以及参数替换为SQL表达式，比如将 ${platform}替换为 platform in ('IOS')。</p>
      <p style="line-height: 24px;margin-bottom:32px">2. #{a} 将会被替换为用户输入的值也就是${a}对应的值部分，比如参数平台会被替换为  ('IOS')，前面参数需要自己写。</p>
      <p style="line-height: 24px;margin-bottom:32px">3. #{a.start}  将会被替换为用户输入的值的区间开始对应的值，比如日期区间的开始日期。</p>
      <p style="line-height: 24px;margin-bottom:32px">4. #{a.end}  将会被替换为用户输入的值的区间结束对应的值,，比如日期区间的结束日期。</p>
      <p style="line-height: 24px;margin-bottom:32px">5. SQL中必须使用${platform}或${part}进行平台过滤，并且SQL的返回值只能为 object_id或 distinct(object_id)，因为该SQL的目的是获得一个用户群体。</p>
    </div>
  </div>
</template>
<script>
  import pickerOptions from '@/config/pickerOptions.js'
  import dynamic_time_options from '@/config/dynamicTimeOptions.js'
  import fixColumnOpOptions from '@/config/fixColumnOpOptions.js'
  import sqlEdit from '../components/sqlEdit'
  import groupSql from '@/components/base/groupSql'
  import sqlFormatter from "sql-formatter";
  import paramTable from './paramTable'
  import preView from './preView'

  export default {
    props: ["add_folder_id", "value", "edit_group_id", "open_edit_group", "changeIDfid", "closeEditKey",
      "closeeditGgroup", "getDataCustom", "custom_left","clearEditId"
    ],
    components: {
      sqlEdit,
      groupSql,
      paramTable,
      preView
    },
    data() {
      return {
        var_drawer:false,
        preview_num: 0,
        edit_num: 0,
        titleViewFlag: false,
        repeat_name_falg: false,
        ruleForm: {
          name: '',
          desc: "",
          type: "role",
          sql: "",
        },
        public_variable_list: [], //公共变量列表
        var_name_set: [], //绑定变量的集合
        paramFormNum: 0,
        column_list: [],
        originParamForm: null,
        midRenParamform: null,
        openPreviewFlag: false, //是否开启预览页面
        paramForm: {
          name: '',
          type: "string",
          variable: [{
            alias: "",
            value: "",
            order: 0,
          }],
          column: [{
            "type": 'string',
            "column": {
              alias: "",
              value: "",
              order: 0,
            },
            "op": "=",
            "value": '',
            "values": [],
            "start": "",
            "end": "",
            "time_type": 'DYNAMIC', //时间类型
            "time_granularity": "DATE", //时间粒度
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
          }]
        },
        paramFormSet: [ //参数保存集合

        ],
        paramTypeOption: [

        ],
        web_obj: {},
        sqlEditnum: 0, //sqkEdit的key
        obj_options: [], //对象类型
        DialogVisible: false, //参数弹窗dialong
        is_check_all: false, //多选是否选中
        openParamEdit: false,
        paramEditIndex: null,
        fix_column_list: [],
        pickerOptions,
        dynamic_time_options,
        "op_list": fixColumnOpOptions,
        param_rules: {
          name: [{
            required: true,
            message: '请输入群组名称',
            trigger: 'blur'
          }, ],
          type: [{
            required: true,
            message: '请选择群组对象类型',
            trigger: 'change'
          }],
          variable: [{
            required: true,
            message: '请选择群组对象类型',
            trigger: 'change'
          }],
          column: [{
            required: true,
            message: '请选择群组对象类型',
            trigger: 'change'
          }],
        },
        rules: { //校验规则
          name: [{
            required: true,
            message: '请输入群组名称',
            trigger: 'blur'
          }, ],
          type: [{
            required: true,
            message: '请选择群组对象类型',
            trigger: 'change'
          }],
          sql: [{
            required: true,
            message: '请填写群组sql',
            trigger: 'change'
          }],
          desc: [{
            required: true,
            message: '请填写群组描述',
            trigger: 'blur'
          }]
        },
      }
    },
    methods: {
      get_object_list: function() {
        var param = this.$generateParams({
          object: "role",
          page: 1,
          page_size: 10,
        });
        var $url = this.$store.state.api_url.public.object_type_list;
        this.axios
          .post($url, param)
          .then((response) => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            this.obj_options = data.data;
          })
          .catch((error) => {
            this.$error("接口请求失败");
          });
      },
      openViewFun() { //开启预览操作
        this.openPreviewFlag = !this.openPreviewFlag;
        this.fix_column_list = [];
        // this.paramForm.variable.forEach(item=>{
        //     this.column_list.push(item.column)
        // })
        this.fix_column_list[0] = this.midRenParamform[0].column;
      },
      checkName() { //校验name是否重复
        this.custom_left.custom_list.forEach(item => {
          if (item.name == this.ruleForm.name) {
            this.ruleForm.name = "";
            this.repeat_name_falg = true;
          }
        })
      },
      titleView() {
        this.var_drawer = !this.var_drawer;
      },
      fixCloType(type) { //固定列类型设置
        this.paramForm.column.forEach(item => {
          item.type = type;
          item.value = '';
          item.start = '',
            item.end = '';
          item.values = [];
          item.op = type == 'time' ? 'BETWEEN' : '=';
        })
      },
      editParamFun(item, index) { //编辑参数方法
        this.originParamForm = JSON.parse(JSON.stringify(item));
        this.paramForm = item;
        this.openParamEdit = true;
        this.paramEditIndex = index;
      },
      /**
       * 修改时间粒度
       * @param {Object} column
       */
      changeGranularity: function(column) {
        column.time_range = [];
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
      addDimension(column) { //增加枚举值
        column.dimension.push({
          "value": "",
          "text": ""
        });
      },
      /**
       * 动态时间隐藏的时候重置自定义输入
       */
      resetInput() {
        for (var v of this.dynamic_time_options) {
          if (v.type == 'dynamic') {
            v.value = '';
          }
        }
      },
      /**
       * 动态时间展示的时候把值填回去
       */
      initInput: function(column) {
        if (this.dynamic_time_options[column.time_id - 1].type == 'dynamic') {
          this.dynamic_time_options[column.time_id - 1].value = column.time_value;
        }
      },
      canceladdParam() { //取消参数到集合
        if (this.openParamEdit) {
          this.$set(this.paramFormSet, this.paramEditIndex, this.originParamForm);
        }
        this.closeDia();
        this.paramForm = {
          name: '',
          type: "string",
          variable: [{
            alias: "",
            value: "",
            order: 0,
          }],
          column: [{
            "type": 'string',
            "column": {
              alias: "",
              value: "",
              order: 0,
            },
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
          }]

        }
        // this.midRenParamform = JSON.parse(JSON.stringify(this.paramForm.variable));
        this.openParamEdit = false;
        this.openPreviewFlag = false;
      },
      flagParam() {

      },
      handleSqlstr(middleSql, where) {

      },
      addparam() { //添加参数到集合
        if (!this.paramForm.name) {
          this.$error('请输入参数名称')
          return;
        }
        let aliasFlag = false;
        this.paramForm.variable.forEach((item) => {
          if (!item.alias || !item.value) {
            aliasFlag = true;
          }
        })
        if (aliasFlag) {
          this.$error("请配置变量");
          aliasFlag = false;
          return;
        }
        //校驗和提示
        for (var j of this.paramForm.column) {
          if (j.type == "dimension") {
            if (j.dimension.length == 0) {
              this.$error("维度类型需要加枚举值");
              return;
            }

            for (var d of j.dimension) {
              if (d.value == '' || d.text == '') {
                this.$error("维度类型枚举值的值和文本都不能为空");
                return;
              }
            }
            if (j.support_sel_all && j.multiple) { //支持多选校验,values的长多要大于零
              if (j.values.length == 0) {
                this.$error("维度类型枚举值的条件不能为空");
                return;
              }
            }
            if (!j.multiple) { //单选校验,value不能为空
              if (!j.value) {
                this.$error("维度类型枚举值的条件不能为空");
                return;
              }
            }

          }
          if (j.type == 'number' || j.type == 'string' || j.type == 'date') {
            if (j.op != 'BETWEEN') {
              if (!j.value) {
                this.$error('请输入或选择条件');
                return;
              }
            } else {
              if (!j.start || !j.end) {
                this.$error('请输入或选择条件');
                return;
              }
            }
          }
          if (j.type == 'time') {
            if (j.time_type == "STATIC") {
              if (j.op == 'BETWEEN' && j.time_range.length != 2) {
                this.$error('请输入或选择条件');
                return;
              }
              if (j.op == '=' && !j.value) {
                this.$error('请输入或选择条件');
                return;
              }
            } else {

            }
          }
        }


        if (this.openParamEdit) {
          this.paramFormSet[this.paramEditIndex] = this.paramForm;
        } else {
          this.paramFormSet.push(this.paramForm);
        }
        this.openParamEdit = false;
        this.closeDia();
        this.paramForm = {
          name: '',
          type: "string",
          variable: [{
            alias: "",
            value: "",
            order: 0
          }],
          column: [{
            "type": 'string',
            "column": {
              alias: "",
              value: "",
              order: this.paramForm.variable.length,
            },
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
          }]
        }
        // this.midRenParamform = JSON.parse(JSON.stringify(this.paramForm.variable));
        this.openPreviewFlag = false;
        this.edit_num++;
      },
      addItem() { //添加一项参数项
        this.paramForm.variable.push({
          alias: "",
          value: "",
          order: this.paramForm.variable.length,
        })
      },
      loopParamForm() { //变量变化对应的固定列操作
        this.paramForm.variable.forEach((item, index) => {
          this.paramForm.column[0].column.alias = item.alias;
          this.paramForm.column[0].column.value = item.value;
          this.paramForm.column[0].column.order = item.order;
        });
        this.whatchMidRen();
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
       * 获取公共变量列表
       */
      get_public_variable: function() {
        var param = this.$generateParams({
          object: this.ruleForm.type,
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
              this.edit_num++;
            }

          })
          .catch((error) => {
            console.log(error);
            this.$error("接口请求失败");
          });
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
      //删除枚举值
      removeDimension(column, index) {
        column.dimension.splice(index, 1);
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
          item.values = [];
          this.is_check_all = false;
        }
      },
      /**
       * 删除一列
       */
      removeColumn(index) {
        if (this.paramForm.fixColumn.length == 1) {
          return;
        }
        this.paramForm.fixColumn.splice(index, 1);
      },
      addColumn() {
        this.paramForm.fixColumn.push({
          "type": '',
          "column": {},
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
        });
      },

      cancelcreateDyGroup() { //取消创建动态群组
        this.$confirm('取消后设置的数据不可恢复，请谨慎处理', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          this.closeEditKey();
          this.clearEditId();
        }).catch(() => {

        });
      },
      createDyGroup() { //创建动态群组
        let url = this.$store.state.api_url.dynamicDroup.create_dynamic_group;
        if (!this.ruleForm.name) {
          this.$error('请输入动态群组名称')
          return;
        }
        if (!this.ruleForm.desc) {
          this.$error('请输入动态群组描述')
          return;
        }
        if (!this.ruleForm.sql) {
          this.$error('动态群组sql不能为空')
          return;
        }
        if (!this.ruleForm.type) {
          this.$error('请选择对象类型')
          return;
        }
        if (this.paramFormSet.length == 0) {
          this.$error('动态群组需要配置变量')
          return;
        }

        //校验sql变量是否正确
        var reg = /([$#]).*?\{\s?(\w+)(\.start|\.end){0,1}\s?\}/g
        let variableSet = []; // sql中填写的变量名称
        var c = this.ruleForm.sql.replace(reg, function(replace, $1, $2, $3) {
          variableSet.push($2);
          return '';
        })


        let aliasSet = []; //配置的变量列表
        this.paramFormSet.forEach((item) => {
          item.variable.forEach(innerItem => {
            aliasSet.push(innerItem.alias)
          });
        })
        //公共变量
        this.public_variable_list.forEach((item) => {
          item.variable.forEach(innerItem => {
            aliasSet.push(innerItem.alias)
          });
        })
        for (let val of variableSet) {
          let valFlag = 0;
          valFlag = aliasSet.indexOf(val);
          if (valFlag < 0) {
            this.$error('请检查sql中的变量和绑定变量是否一致');
            return
          }
        }
        //检查绑定变量名称是否重复
        let filter_alias_set = [...new Set(aliasSet)];
        if (filter_alias_set.length != aliasSet.length) {
          this.$error('绑定变量名称重复，请重新绑定变量');
          return;
        }

        this.paramFormSet.forEach(item => { //对象选择时候渲染名称
          item.column[0].param_name = item.name;
        })

        let web_params = {
          name: this.ruleForm.name,
          "desc": this.ruleForm.desc,
          "object_type": this.ruleForm.type,
          "sql": this.ruleForm.sql,
          "folder_id": this.add_folder_id,
          "id": this.edit_group_id ? this.edit_group_id : '',
          bind_vars: this.paramFormSet,
        };
        let data = {
          "bind_vars": JSON.stringify(this.paramFormSet),
          "desc": this.ruleForm.desc,
          "fixed_column": '[]',
          "folder_id": this.edit_group_id ? this.web_obj.folder_id : this.add_folder_id,
          "id": this.edit_group_id ? this.web_obj.id : '',
          "name": this.ruleForm.name,
          "object": "role",
          "object_type": this.ruleForm.type,
          "sql": sqlFormatter.format(this.ruleForm.sql),
          "web_params": JSON.stringify(web_params)
        };
        if (!data.folder_id) {
          this.$error('所属文件夹参数错误请刷新重试');
          return
        }
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.$success('创建成功');
            this.closeEditKey();
            this.getDataCustom();
            this.clearEditId();
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          console.log(errors);
        })
      },
      removeItem: function(index) { //移除参数的index项
        if (this.paramForm.variable.length == 1) {
          this.paramForm.variable[index].value = "";
          this.paramForm.variable[index].alias = "";
          return;
        }
        this.paramForm.variable.splice(index, 1);

      },
      openParamDia() { //参数弹窗
        this.DialogVisible = true;
      },
      closeDia() {
        this.DialogVisible = false;
      },
      format: function(item) { //格式化sql
        item.sql = sqlFormatter.format(item.sql);
        this.sqlEditnum++;
      },
      whatchMidRen() {
        // this.paramForm.variable.forEach(item=>{
        //     item.column = middleUse[0].column;
        // })
      },
      backfillData() {
        if (this.open_edit_group) { //编辑操作
          var url = this.$store.state.api_url.dynamicDroup.find_dynamic_group;
          var paramData = {
            "id": this.edit_group_id,
            "object": "role"
          }
          var requestData = this.$generateParams(paramData);
          this.axios.post(url, requestData).then((rep) => {
            var data = rep.data;
            if (data.code != 200) {
              console.log("接口请求失败" + this.url + 'single');
            } else {
              this.web_obj = JSON.parse(data.data.web_params);
              this.ruleForm.name = this.web_obj.name ? this.web_obj.name : '';
              this.ruleForm.desc = this.web_obj.desc ? this.web_obj.desc : '';
              this.ruleForm.type = this.web_obj.object_type ? this.web_obj.object_type : '';
              this.ruleForm.sql = sqlFormatter.format(this.web_obj.sql);
              this.web_obj.id = data.data.id ? data.data.id : "";
              // this.paramForm =  this.web_obj.bind_vars[0]?this.web_obj.bind_vars[0]:this.paramForm;
              this.paramFormSet = this.web_obj.bind_vars.length > 0 ? this.web_obj.bind_vars : this.paramFormSet;
              this.paramFormNum++;
              this.sqlEditnum++;
              this.closeeditGgroup();
            }
          }).catch(function(error) {
            // console.log("接口请求失败" + this.url + 'single');
          });
        } else {
          this.ruleForm = {
            name: '',
            desc: "",
            type: "role",
            sql: "",
          }
          this.paramFormNum = 0;
          this.paramForm = {
            name: '',
            type: "string",
            variable: [{
              alias: "",
              value: "",
              order: 0,
            }],
            column: [{
              "type": 'string',
              "column": {
                alias: "",
                value: "",
                order: 0,
              },
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
            }]
          }
        }
      }
    },
    destroyed() {
      this.clearEditId();
      this.closeeditGgroup();
      this.ruleForm = {
        name: '',
        desc: "",
        type: "",
        sql: "",
      }
      this.paramFormNum = 0;
      this.paramForm = {
        name: '',
        type: "string",
        variable: [{
          alias: "",
          value: "",
          order: 0,
        }],
        column: [{
          "type": 'string',
          "column": {
            alias: "",
            value: "",
            order: 0,
          },
          "op": "=",
          "value": '',
          "values": [],
          "start": "",
          "end": "",
          "time_type": 'DYNAMIC', //时间类型
          "time_range": [], //时间粒度
          "time_units": 'DAY', //动态时间单位
          "time_granularity": "DATE", //时间粒度
          "time_text": "最近1天", //动态时间文本
          "time_value": "1", //动态时间枚举值
          "time_id": 3,
          "display": false,
          "dimension": [],
          "only_one": false,
          "multiple": true,
          "support_sel_all": true,
        }]
      }

    },
    created() {
      // this.getobjType();
    },
    mounted() {
      this.get_object_list();
      this.get_public_variable();
      this.backfillData();
      this.midRenParamform = JSON.parse(JSON.stringify(this.paramForm.variable));
      if (this.midRenParamform.length > 1) {
        this.midRenParamform.length = 1;
      }
    },
    watch: {
      paramForm: {
        handler(val, oldval) {
          this.preview_num++;
        },
        // immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },
      midRenParamform: {
        handler(val, oldval) {
          this.whatchMidRen();
        },
        // immediate: true,
        deep: true, //对象内部的属性监听，也叫深度监听
      },

    },
  }
</script>
<style>
  .creat-dynamic-group{
    position: relative;
  }
  .creat-dynamic-group .name input {
    width: 32%;
    height: 32px;
    overflow: auto;
  }

  .creat-dynamic-group .el-textarea textarea {
    width: 32%;
  }

  .creat-dynamic-group .condition input {
    height: 32px;
    line-height: 32px;
  }

  .creat-dynamic-group .event-set {
    width: 100%;
    height: 32px;
    background: #E8E8E8;
    box-shadow: 1px 1px 4px #ccc;
    line-height: 32px;
    padding: 0 0 0 29px;
    box-sizing: border-box;
    position: relative;
  }

  .name-param input {
    width: 100%;
  }

  .group-dialog .el-dialog__header {
    border-bottom: 1px solid #ccc;
  }

  .creat-dynamic-group .submit-group {
    text-align: right;
    margin: 50px 24px 0px 0px;
    padding-bottom: 12px;
  }

  .creat-dynamic-group .submit-group-else {
    text-align: right;
    margin: 8px 24px 0px 0px;
    height: 60px;
  }

  .view-title-group {
    width: 192px;
    line-height: 24px;
    position: absolute;
    /* top: 12px; */
    right: 3px;
    bottom: 5px;
    z-index: 100;
    background: #fff;
    box-shadow: 1px 1px 6px #ccc;
    border-radius: 4px;
  }

  .repeat-name-group input::-webkit-input-placeholder {
    /* WebKit browsers */
    color: red;
  }

  .creat-dynamic-group .condition input {
    height: 26px;
    line-height: 32px;
  }
  .creat-dynamic-group .var-drawer {
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    padding: 0px 0px 0 12px;
    /* top: 82px; */
    border-radius: 4px;
    background: white;
    height: 100%;
    box-shadow: 1px 1px 3px #ccc;
    z-index: 10;
  }
  .creat-dynamic-group .el-textarea textarea{
    font-family: Arial, Helvetica, sans-serif;
  }
  .demo-ruleForm .demo-ruleForm input{
    height: 32px;
  }
</style>
