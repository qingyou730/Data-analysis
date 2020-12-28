<template>
  <div>
    <!-- 参数配置弹窗 -->
    <el-dialog :title="id?'修改参数':'添加参数'" :visible.sync="DialogVisible" :before-close="closeDialog" :close-on-click-modal="false"
      custom-class="group-dialog" width="60%">
      <el-row>
        <el-form :model="paramForm" label-width="100px" class="demo-paramForm">
          <el-form-item label="参数名称" prop="name">
            <el-input placeholder="请输入中文名称" class="name-param" v-model="paramForm.name" style="width:60%"></el-input>
          </el-form-item>
          <el-form-item label="参数标识" prop="field">
            <el-input placeholder="请输入英文表示" class="name-param" v-model="paramForm.field" style="width:60%"></el-input>
          </el-form-item>
          <el-form-item label="对象类型" class="condition">
            <el-select v-model="paramForm.object" filterable>
              <el-option v-for="item in obj_options" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否范围参数">
            <el-radio-group v-model="paramForm.is_scope">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
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
                    <el-input size="mini" placeholder="请输入" style="width:30%" v-model="item.alias"></el-input>
                  </div>
                  <div>
                    <i class="el-icon-question" style="margin: 0 6px"></i>
                    <span>变量真实字段</span>
                    <el-input size="mini" placeholder="请输入" style="width: 30%" v-model="item.value"></el-input>
                    <el-button icon="el-icon-minus" type="primary" circle size="mini" @click="removeItem(index)"></el-button>
                    <el-button icon="el-icon-plus" type="primary" circle size="mini" @click="addItem"></el-button>
                  </div>
                </div>
              </template>
            </el-row>
          </el-form-item>


          <el-form-item label="配置固定列" prop="column" class="condition">
            <el-row style="background: #ECEEFE;padding: 0 6px;width:100%">
              <template>
                <el-form-item :key="'type'" label="列类型：" label-width="100px">
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

                    <el-select v-if="column.column.hasOwnProperty('order')"
                      v-model="column.op" size="mini" placeholder="请选择操作符" style="width: 120px;"  @change="changeTimeOp(column)">
                      <el-option v-for="(op,op_index) in op_list[column.type]" :key="op_index" :label="op.name" :value="op.value"></el-option>
                    </el-select>

                  </template>


                </el-form-item>


                <!-- 固定维度的枚举值 -->
                <el-form-item :key="'dimension' +d_index" :label="d_index==0 ? '枚举值：' : ''" v-if="column.type=='dimension'"
                  label-width="100px" v-for="(d,d_index) in column.dimension">
                  <el-input size="mini" placeholder="请输入值" v-model="d.value" style="width: 200px;"></el-input>
                  <el-input v-model="d.text" style="width: 200px;" size="mini" placeholder="请输入显示文字"></el-input>
                  <el-button icon="el-icon-minus" type="primary" circle size="mini" @click="removeDimension(column,d_index)"></el-button>
                </el-form-item>


                <el-form-item :key="'name'+'type'" label="列名称" label-width="100px">
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
                        <el-date-picker  type="datetime" v-if="column.op!='BETWEEN'" value-format="yyyy-MM-dd HH:mm:ss" size="mini" v-model="column.value" >
                        
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

                  <template v-if="column.type=='dimension'">
                    <!--多选-->
                    <el-select v-if="column.multiple" v-model="column.values" size="mini" collapse-tags clearable
                      multiple :key="'select'">
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

                  <el-button type="primary" size="mini" :key="'btn'" @click="openViewFun">确认</el-button>
                  <!--预览操作 -->
                  <p v-if="openPreviewFlag" style="margin-left: -55px;border-top: 1px solid #ccc;margin-top: 19px;">预览：</p>

                  <div v-if="openPreviewFlag">
                    <pre-view :date="fix_column_list" :key="preview_num" :paramForm="paramForm"></pre-view>
                  </div>
                </el-form-item>
              </template>
            </el-row>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog" size="medium">取 消</el-button>
        <el-button type="primary" @click="submit" size="medium ">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import pickerOptions from '@/config/pickerOptions.js'
  import dynamic_time_options from '@/config/dynamicTimeOptions.js'
  import fixColumnOpOptions from '@/config/fixColumnOpOptions.js'
  import preView from './preView'
  export default {
    components: {
      preView
    },
    props:["id"],
    data() {
      return {
        pickerOptions,
        dynamic_time_options,
        op_list: fixColumnOpOptions,
        is_check_all: false, //多选是否选中
        DialogVisible: true, //是否显示弹窗
        preview_num: 1,
        paramForm: {
          object: 'role',
          name: '',
          type: "string",
          "is_scope": true,
          "field": '',
          variable: [{
            alias: "",
            value: "",
            order: 0,
          }],

        },
        obj_options: [], //对象类型
        column: {
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
        },
        fix_column_list: [], //预览用的固定列
        openPreviewFlag: false, //是否展示预览
      }
    },
    mounted() {
      console.log(this.id) ;
      this.get_object_list();
      if(this.id){
        this.getDetail();
      }
    },
    methods: {
      /**
       * @param {Object} column
       * 时间类型的变化 区间 和等于
       */
      changeTimeOp:function(column){
        if(column.op == '='){
          column.time_units =  'DAY'; //动态时间单位
          column.time_text =  "今日"; //动态时间文本
          column.time_value =  "1"; //动态时间枚举值
          column.time_id =  15;
          column.only_one = true ;
        }
        if(column.op == 'BETWEEN'){
          column.time_units =  'DAY'; //动态时间单位
          column.time_text =  "最近1天"; //动态时间文本
          column.time_value =  "1"; //动态时间枚举值
          column.time_id =  3;
          column.only_one = false ;
        }
        console.log(column);
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
       * 动态时间展示的时候把值填回去
       */
      initInput: function(column) {
        if (this.dynamic_time_options[column.time_id - 1].type == 'dynamic') {
          this.dynamic_time_options[column.time_id - 1].value = column.time_value;
        }
      },
      /**
       * 动态时间自定义输入的时候
       * @param {Object} value
       * @param {Object} item
       * @param {Object} column
       */
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
      groupChanged:function(item, column) {
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
       * 编辑的时候获取旧的数据详情
       */
      getDetail:function(){
        var param = this.$generateParams({
          id:this.id ,
        });
        var url = this.$store.state.api_url.public_variable.detail;
        this.axios
          .post(url, param)
          .then((response) => {
            var  data = response.data;
            if(data.code == 200){
                var param = data.data ;
                this.paramForm.object = param.object ;
                this.paramForm.name = param.name ;
                this.paramForm.type = param.type ;
                this.paramForm.field = param.field ;
                this.paramForm.is_scope = param.is_scope ;
                this.paramForm.variable = JSON.parse(param.variable) ;
                this.column = JSON.parse(param.column)[0] ;
            }else{
              this.$error("接口请求失败");
            }
          })
          .catch((error) => {
            this.$error("接口请求失败");
          });
      },
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
      /**
       * 修改时间粒度
       * @param {Object} column
       */
      changeGranularity: function(column) {
        column.time_range = [];
      },
      changeType(column) { //固定列类型
        // column.op = '=';
        column.value = '';
        column.start = '',
          column.end = '';
        column.values = [];
      },
      /**
       * 类型发生变化设置
       * @param {Object} type
       */
      fixCloType: function(type) {
        this.column.type = type;
        this.column.value = '';
        this.column.start = '',
          this.column.end = '';
        this.column.values = [];
        this.column.op = type == 'time' ? 'BETWEEN' : '=';
      },
      openViewFun: function() { //开启预览操作
        this.openPreviewFlag = !this.openPreviewFlag;
        this.fix_column_list = [JSON.parse(JSON.stringify(this.column))]
      },
      /**
       *删除变量
       * @param {Object} index
       */
      removeItem: function(index) {
        if (this.paramForm.variable.length == 1) {
          this.paramForm.variable[index].value = "";
          this.paramForm.variable[index].alias = "";
          return;
        }
        this.paramForm.variable.splice(index, 1);
      },
      /**
       * 添加变量
       */
      addItem: function() {
        this.paramForm.variable.push({
          alias: "",
          value: "",
          order: this.paramForm.variable.length,
        })
      },
      /**
       * 增加枚举值
       * @param {Object} column
       */
      addDimension: function(column) {
        column.dimension.push({
          "value": "",
          "text": ""
        });
      },
      //删除枚举值
      removeDimension: function(column, index) {
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
       * 关闭弹窗
       */
      closeDialog: function() {
        this.DialogVisible = false;
        this.$emit('input', false);
      },
      /**
       * 取消添加参数
       */
      submit: function() {
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
        if (this.column.type == "dimension") {
          if (this.column.dimension.length == 0) {
            this.$error("维度类型需要加枚举值");
            return;
          }

          for (var d of this.column.dimension) {
            if (d.value == '' || d.text == '') {
              this.$error("维度类型枚举值的值和文本都不能为空");
              return;
            }
          }
          if (this.column.support_sel_all && this.column.multiple) { //支持多选校验,values的长多要大于零
            if (this.column.values.length == 0) {
              this.$error("维度类型枚举值的条件不能为空");
              return;
            }
          }
          if (!this.column.multiple) { //单选校验,value不能为空
            if (!this.column.value) {
              this.$error("维度类型枚举值的条件不能为空");
              return;
            }
          }

        }
        if (this.column.type == 'number' || this.column.type == 'string' || this.column.type == 'date') {
          if (this.column.op != 'BETWEEN') {
            if (!this.column.value) {
              this.$error('请输入或选择条件');
              return;
            }
          } else {
            if (!this.column.start || !this.column.end) {
              this.$error('请输入或选择条件');
              return;
            }
          }
        }
        if (this.column.type == 'time') {
          if (this.column.time_type == "STATIC") {
            if (this.column.op == 'BETWEEN' && this.column.time_range.length != 2) {
              this.$error('请输入或选择条件');
              return;
            }
            if (this.column.op == '=' && !this.column.value) {
              this.$error('请输入或选择条件');
              return;
            }
          } else {

          }
        }
        var param = {
          "object": this.paramForm.object,
          "name": this.paramForm.name,
          "type": this.paramForm.type,
          "field": this.paramForm.field,
          "is_scope": this.paramForm.is_scope,
          "variable": JSON.stringify(this.paramForm.variable),
          "column": JSON.stringify([this.column]),
          "name": this.paramForm.name,
          "variable_name": this.$tools.array_column(this.paramForm.variable, 'alias').join(',')
        }
        if(this.id){
          param.id =  this.id ;
        }
        var url = this.$store.state.api_url.public_variable.add;
        var param = this.$generateParams(param);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.$success("操作成功");
            this.openPreviewFlag = false;
            this.edit_num++;
            this.closeDialog();
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          console.log(errors);
        })
      },
    },
  }
</script>

<style>
</style>
