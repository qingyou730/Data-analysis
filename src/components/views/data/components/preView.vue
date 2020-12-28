<template>
  <div>
    <template v-for="(column, column_index) in column_list" v-if="column.type && column.column.hasOwnProperty('alias')">
      <el-form-item :key="'show' + column_index" :label="paramForm.name + ' ' + ':'" label-width="86px">
        <!-- 字符串 和数值 -->
        <template v-if="
            column.type == 'number' ||
            column.type == 'string' 
          ">
          <el-select v-if="column.column.hasOwnProperty('order') && column.type" v-model="column.op" size="mini"
            placeholder="请选择操作符" style="width: 120px">
            <el-option v-for="(op, op_index) in op_list[column.type]" :key="op_index" :label="op.name" :value="op.value"></el-option>
          </el-select>
          <el-input v-model="column.value" v-if="column.op != 'BETWEEN'" style="width: 200px" size="mini"></el-input>
          <template v-if="column.op == 'BETWEEN'">
            <el-input v-model="column.start" style="width: 200px" placeholder="请输入开始值" size="mini"></el-input>~
            <el-input v-model="column.end" style="width: 200px" placeholder="请输入结束值" size="mini"></el-input>
          </template>
        </template>


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

        <!-- 固定维度 -->
        <template v-if="column.type == 'dimension'">
          <!--多选-->
          <el-select v-if="column.multiple" v-model="column.values" collapse-tags clearable multiple size="mini">
            <!-- <el-option v-for="(d,d_index) in column.dimension" :key="d_index" :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option> -->
            <el-option @click.native="checkAll(column)" :class="is_check_all ? 'selected' : ''" label="全选" value="all"
              v-if="column.support_sel_all && column.dimension.length > 1"></el-option>
            <el-option @click.native="checkIsCheckAll(column)" v-for="(d, d_index) in column.dimension" :key="d_index"
              :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option>
          </el-select>
          <!--单选-->
          <el-select v-else v-model="column.value" clearable size="mini">
            <el-option v-for="(d, d_index) in column.dimension" :key="d_index" :label="d.text" :value="d.value" v-if="d.value && d.text"></el-option>
          </el-select>
        </template>

        <!-- <el-button type="primary" v-if="column_index == (column_list.length-1)" @click="fixColumnParam" size="mini">确定</el-button> -->
      </el-form-item>
    </template>
  </div>
</template>
<script>
  import pickerOptions from '@/config/pickerOptions.js'
  import dynamic_time_options from '@/config/dynamicTimeOptions.js'
  import fixColumnOpOptions from '@/config/fixColumnOpOptions.js'
  export default {
    props: ["date", "paramForm"],
    data() {
      return {
        edit_num: 0,
        titleViewFlag: false,
        repeat_name_falg: false,
        ruleForm: {
          name: '',
          desc: "",
          type: "",
          sql: "",
        },
        var_name_set: [], //绑定变量的集合
        paramFormNum: 0,
        column_list: [],
        originParamForm: null,
        midRenParamform: null,
        openPreviewFlag: false, //是否开启预览页面
        paramFormSet: [ //参数保存集合

        ],
        paramTypeOption: [

        ],
        web_obj: {},
        sqlEditnum: 0, //sqkEdit的key
        obj_options: [{
          "value": "role",
          "name": "角色",
          "cascade": false
        }, {
          "value": "device",
          "name": "设备",
          "cascade": false
        }, {
          "value": "zone",
          "name": "区服",
          "cascade": false
        }], //对象类型
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
        this.titleViewFlag = !this.titleViewFlag;
      },
      fixCloType(type) { //固定列类型设置
        this.paramForm.column.forEach(item => {
          item.type = type;
          item.value = '';
          item.start = '',
            item.end = '';
          item.values = [];
          item.op = '=';
        })
      },
      editParamFun(item, index) { //编辑参数方法
        this.originParamForm = JSON.parse(JSON.stringify(item));
        this.paramForm = item;
        this.openParamEdit = true;
        this.paramEditIndex = index;
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
        console.log(column);
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
              if (j.time_range.length != 2) {
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

      cancelcreateDyGroup() { //取消创建动态群组
        this.$confirm('取消后设置的数据不可恢复，请谨慎处理', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          this.closeEditKey();
        }).catch(() => {

        });
      },
      createDyGroup() { //创建动态群组
        let url = this.$store.state.api_url.dynamicDroup.create_dynamic_group;
        if (!this.ruleForm.name) {
          this.$error('请输入动态名称')
          return;
        }
        if (!this.ruleForm.desc) {
          this.$error('请输入动态描述')
          return;
        }
        if (!this.ruleForm.sql) {
          this.$error('动态群组sql不能为空')
          return;
        }
        if (this.paramFormSet.length == 0) {
          this.$error('动态群组需要配置变量')
          return;
        }

        //校验sql变量是否正确
        let reg = /\{\s((?!\{).)*\s\}/;
        let innnerReg = /[0-9a-zA-Z_]{1,}/;
        let strReg = "";
        let arrSql = sqlFormatter.format(this.ruleForm.sql).split('$');
        arrSql = arrSql.filter(item => item.indexOf('{') > -1);
        let aliasSet = [];
        let variableSet = [];
        this.paramFormSet.forEach((item) => {
          item.variable.forEach(innerItem => {
            aliasSet.push(innerItem.alias)
          });
        })
        arrSql.forEach(item => {
          strReg = item.match(reg)[0].match(innnerReg)[0];
          variableSet.push(strReg);
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
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.$success('创建成功');
            this.closeEditKey();
            this.getDataCustom()
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
            }]
          }
        }
      }
    },
    mounted() {
      if (this.date) {
        this.column_list = JSON.parse(JSON.stringify(this.date))
      }
    }
  }
</script>
