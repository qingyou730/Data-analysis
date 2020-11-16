<template>
  <el-dialog title="新建报表" :visible.sync="visible" :before-close="closeDialog" width="1200px" :close-on-click-modal="false">
    <el-row class="w-dialog-header">
      <div class="report-step">
        <span :class="['report-step-number',{'on':step>=1}]">1</span>
        <span :class="['report-step-text',{'on':step>=1}] ">创建报表</span>
        <span :class="['report-step-line ',{'on':step>=1}]"></span>

        <span :class="['report-step-number',{'on':step>=2}]">2</span>
        <span :class="['report-step-text',{'on':step>=2}] ">选择关联列</span>
        <span :class="['report-step-line ',{'on':step>=2}]"></span>


        <span :class="['report-step-number',{'on':step>=3}]">3</span>
        <span :class="['report-step-text',{'on':step>=3}] ">选择报表指标</span>


      </div>
      <el-form :model="step_1" :rules="rules">
        <!--第一步 创建报表-->
        <template v-if="step==1">
          <el-form-item label="报表名称" label-width="100px" prop="name">
            <el-input v-model="step_1.name" autocomplete="off" placeholder="给报表起一个名字"></el-input>
          </el-form-item>
          <el-form-item label="报表类型" label-width="100px" prop="type">
            <el-radio @change="initTask" v-model="step_1.type" label="DYNAMIC">动态报表</el-radio>
            <el-radio @change="initTask" v-model="step_1.type" label="STATIC">静态报表</el-radio>
          </el-form-item>

          <el-form-item label="添加任务" label-width="100px" prop="task_ids">
            <el-select v-model="search_task.search_type" @change="searchType($event,true)" style="width: 100px;">
              <!-- <el-option label="所有人" value="all"></el-option> -->
              <el-option label="部门" value="department"></el-option>
              <el-option label="仅自己" value="self"></el-option>
            </el-select>

            <el-select @change="changeTaskIds()" v-model="step_1.task_ids" style="width: 400px;" v-if="task_list && task_list.length>0"
              multiple filterable collapse-tags clearable>
              <el-option v-if="step_1.type=='DYNAMIC'" v-for="(item,k) in task_list" :label="item.name" :key="k" :value="item.id"></el-option>
              <el-option v-if="step_1.type=='STATIC'" v-for="(item,k) in task_list" :label="item.view_name" :key="k"
                :value="item.view_id"></el-option>
            </el-select>
            <div>
              <el-tag :key="tag" v-for="(tag,index) in step_1.task_ids" type="info" closable style="margin-right: 20px;"
                :disable-transitions="false" @close="removeTaskId(index)">
                {{task_name_map[tag]}}
              </el-tag>
            </div>
          </el-form-item>
        </template>

        <template v-if="step==2">
          <template v-for="(task_id,task_order) in step_1.task_ids">
            <el-form-item :key="task_id" :label="task_name_map[task_id]" label-width="300px">
              <el-checkbox-group v-model="step_2.current_field[task_order]" @change="singleChecked(step_2.current_field[task_order],task_order)">
                <el-checkbox :disabled="step_2.field_checked[task_order].has(field)" v-for="(field,f_order) in task_field[task_id]"
                  :label="field" :key="f_order">{{field}}</el-checkbox>
              </el-checkbox-group>
              <p v-if="task_order == (step_1.task_ids.length-1)">
                <el-button size="small" style="color: #3e8fff;" @click="addRelationField">确定</el-button>
              </p>
            </el-form-item>
          </template>

          <el-form-item label="关联属性" label-width="300px">
            <div class="relation_field_container">
              <el-row class="relation_field_row" v-for="(row,row_index) in step_2.relation_field_list" :key="row_index">
                <i @click="removeRelationField(row_index)" class="fa fa-minus-square-o" style="color:#0e73ff ;font-size: 25px;line-height: 32px;vertical-align: middle; cursor: pointer;"></i>
                <el-tag v-for="(field,f_index) in row.field_list" effect="plain" type="info" :key="f_index">
                  {{field}}
                </el-tag>
                <i class="fa fa-long-arrow-right" style="color:#0e73ff ;font-size: 25px;line-height: 32px;vertical-align: middle;margin:0 15px; "></i>
                <el-input :placeholder="(row.is_different ? '请输入重命名' : row.field_list[0]) " style="width: 200px;"
                  v-model="row.alias"></el-input>
              </el-row>
            </div>
          </el-form-item>


        </template>
        <template v-if="step==3">
          <!-- 已选择的关联属性字段 -->
          <el-form-item label="已选择的关联属性" label-width="300px" class="gray-label">
            <el-tag :key="index" v-for="(tag,index) in step_2.relation_field_list" type="info" style="margin-right: 20px;"
              :disable-transitions="false" @>
              {{tag.alias ? tag.alias : tag.field_list[0]}}
            </el-tag>
          </el-form-item>

          <template v-for="(task_id,task_order) in step_1.task_ids">
            <el-form-item :key="task_id" :label="task_name_map[task_id]" label-width="300px">
              <el-checkbox-group v-model="step_3.column_ids[task_order]" @change="changeIndicators(task_order)">
                <el-checkbox v-for="(field,f_order) in task_field[task_id]" :label="field" :key="f_order">{{field}}</el-checkbox>
              </el-checkbox-group>

              <template v-if="task_order == (step_1.task_ids.length-1)">
                {{step_3.type}}
                <el-button @click="setTab('rename')" :type="step_3.tab == 'rename' ? 'primary' : ''">指标重命名</el-button>
                <el-button @click="setTab('preview')" :type="step_3.tab == 'preview' ? 'primary' : ''">报表预览</el-button>
              </template>

            </el-form-item>
          </template>

          <div class="preview-table-container">
            <!--重命名-->
            <template v-if="step_3.tab == 'rename'">
              <div v-for=" task_id in step_1.task_ids" :key="task_id" style="margin-bottom: 10px;width: max-content;padding: 5px;">
                {{task_name_map[task_id]}}
                <template v-for="(col,col_index) in step_3.column_list" v-if="col.task_id == task_id">
                  <span :key="col_index" style="display: inline-block;margin: 5px 10px;">
                    <el-button size="small">{{col.column}}</el-button>
                    <i class="fa fa-long-arrow-right" style="color:#0e73ff ;font-size: 25px;line-height: 32px;vertical-align: middle;margin:0 5px; "></i>
                    <el-input size="small" style="width: 100px;" clearable :placeholder="col.column" v-model="col.alias"></el-input>
                  </span>
                </template>
              </div>
            </template>
            <!--预览报表-->
            <template v-if="step_3.tab == 'preview'">
              <table class="table table-bordered preview-table" style="width: max-content;">
                <thead>
                  <tr>
                    <th style="width:180px;background-color: #D5D5D5;">指标</th>
                    <th style="width:180px;background-color: #0E73FF;color: white;" :key="col_index" v-for="(col,col_index) in step_3.column_list">{{col.alias ? col.alias : col.column }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="background-color: #D5D5D5;">数据</td>
                    <td style="background-color: #0E73FF;color: white;" :key="col_index" v-for="(col,col_index) in step_3.column_list">--</td>
                  </tr>
                </tbody>
              </table>
            </template>
          </div>
        </template>

      </el-form>
    </el-row>

    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" v-if="this.step!=1" @click="preStep">上一步</el-button>
      <el-button type="primary" v-if="this.step!=3" @click="nextStep">下一步</el-button>
      <el-button type="primary" v-if="this.step==3" @click="save">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    props: ['value', 'id','folder_id'],
    data() {
      return {
        step: 1,
        step_2: {
          current_field: [], //当前选中的字段
          field_checked: [], //已经被选中的字段
          relation_field_list: [], //关联字段 [ {"alias":"别名","field_list":['任务1字段',"任务2字段",..]}]
        },
        step_3: {
          'order_number': 1, //排序值
          'column_ids': [], //指标
          'column_list': [], //指标名称 和别名
          'tab': 'preview', //rename  preview
          'column_count': [], //每个任务的指标count 
          'column_order': {}, //每个指标的书序
        },
        search_task: { //任务列表筛选类型
          "filter_type": "user",
          "filter_value": "all",
          "search_type": "self",
        }, //
        task_field: { //每个任务的字段

        },
        step_1: {
          name: "",
          desc: "",
          type: "STATIC", //DYNAMIC 
          task_ids: [],
          folder_id: "5fa8bbb17d54f61584f69caf", //
        },
        task_list: [], //可选任务列表
        task_name_map: {}, //任务 ID：name对象
        rules: {
          name: [{
            required: true,
            message: '请输入报表名称',
            trigger: 'blur'
          }],
          type: [{
            required: true,
            message: '请输入报表类型',
            trigger: 'blur'
          }],
          task_ids: [{
            required: true,
            message: '请输入报表类型',
            trigger: 'blur'
          }],
        },
        visible: true,
        // filed_list_test: [
        //   ['平台', '大区', '玩家等级', '渠道', '最大付费人数', '资源变动-付费成功', '登录时间', '注册时间', '最后一次登录时间', '资源变动_付费成功'],
        //   ['资源变动-付费成功2', '登录时间2', '注册时间2', '最后一次登录时间2', '资源变动_付费成功2', '平台', '大区', '玩家等级2', '渠道2', '最大付费人数2'],
        //   ['资源变动-付费成功3', '登录时间3', '注册时间3', '最后一次登录时间3', '资源变动_付费成功3', '平台', '大区', '玩家等级3', '渠道3', '最大付费人数3'],
        //   ['资源变动-付费成功4', '登录时间4', '注册时间4', '最后一次登录时间4', '资源变动_付费成功4', '平台', '大区', '玩家等级4', '渠道4', '最大付费人数4'],
        //   ['资源变动-付费成功5', '登录时间5', '注册时间5', '最后一次登录时间5', '资源变动_付费成功5', '平台', '大区', '玩家等级5', '渠道5', '最大付费人数5'],
        // ]
      }
    },
    created() {
      if(this.folder_id){
        this.step_1.folder_id = this.folder_id ;
      }
    },
    mounted() {
      if (this.id) {
        this.get_edit_data();
      }else{
        this.initTask(false);  
      }
      

    },
    methods: {
      get_edit_data: function() {
        var url = '/mmp/report/custom_report_detail';
        // var url = "/mmp/report/custom_report_result" ;
        var param = this.$generateParams({
          "id": this.id,
        });
        this.axios
          .post(url, param)
          .then(rep => {
            if (rep.data.code == 200) {
              var web_param = JSON.parse(rep.data.data.web_param);
              for(var i in web_param.step_2.field_checked){ //数组转化为集合 因为集合不能JSON转
                web_param.step_2.field_checked[i] = new Set(web_param.step_2.field_checked[i]);
              }
              this.step_1 = web_param.step_1;
              this.step_2 = web_param.step_2;
              this.step_3 = web_param.step_3;
              this.initTask(true);  
              for (var task_id of this.step_1.task_ids){
                this.getColumn(task_id);
              }
            } else {
              this.$error("获取任务详情失败");
            }
          })
          .catch(error => {
            console.log(error);
            this.loading = false;
            this.$error("获取任务详情失败");
          });
      },

      /**
       * 指标发生变化
       * @param {Object} task_order
       */
      changeIndicators: function(task_order) {
        var old_count = this.step_3.column_count[task_order];
        var new_count = this.step_3.column_ids[task_order].length;

        // this.step_3.column_count[task_order] = new_count ;
        this.$set(this.step_3.column_count, task_order, new_count);
        var task_id = this.step_1.task_ids[task_order]
        if (new_count > old_count) { //新加了一个值
          var new_column = this.step_3.column_ids[task_order][this.step_3.column_ids[task_order].length - 1];
          this.$set(this.step_3.column_order, task_id + '_' + new_column, this.step_3.order_number++);
        }
        var column_list = [];
        var index = 0;
        for (var task_columns of this.step_3.column_ids) {
          var task_id = this.step_1.task_ids[index];
          for (var column of task_columns) {
            column_list.push({
              "task_id": task_id,
              "column": column,
              "alias": '',
              "order": this.step_3.column_order[task_id + '_' + column],
            });
          }
          index++;
        }
        column_list.sort(function(m, n) {
          return m.order - n.order;
        })
        this.$set(this.step_3, 'column_list', column_list);
      },
      /**
       * @param {Object} $tab
       * 设置步骤3的选项卡
       */
      setTab: function($tab) {
        this.step_3.tab = $tab;
      },
      /**
       * 新增关联字段
       */
      addRelationField: function() {
        var field_list = [];
        var index = 0;
        for (var v of this.step_2.current_field) {
          if (v.length != 1) {
            this.$error("每个任务必须选择一个字段");
            return;
          } else {
            field_list.push(v[0]);
            index++;
          }
        }
        var index = 0;
        for (var v of this.step_2.current_field) {
          this.step_2.field_checked[index].add(v[0]); //已经选中的加上当前的值
          this.$set(this.step_2.current_field, index, []); //当前选中的清空
          index++;
        }

        var item_number = new Set(field_list).size;
        var is_different = item_number == field_list.length;
        this.step_2.relation_field_list.push({
          "field_list": field_list,
          'alias': "",
          "is_different": is_different
        });
      },
      /**
       * 删除关联字段
       * @param {Object} index
       */

      removeRelationField: function(index) {
        var field_list = this.step_2.relation_field_list[index].field_list;
        var t = 0;
        for (var field of field_list) { //删除已选中的字段 让变成可选
          this.step_2.field_checked[t].delete(field);
          t++;
        }
        this.step_2.relation_field_list.splice(index, 1);
      },
      /**
       * @param {Object} value
       * 强制把复选框改为单选框
       */
      singleChecked: function(value, index) {
        if (value.length > 1) {
          value = [value[value.length - 1]];
          this.$set(this.step_2.current_field, index, value);
        }
      },
      /**
       * 
       */
      changeTaskIds: function() {
        //任务发生变化的时候初始化第二部关联属性字段
        this.step_2.current_field = [];
        this.step_2.field_checked = [];

        //任务发生变化初始化指标字段
        this.step_3.column_ids = [];
        this.step_3.column_list = [];
        this.step_3.column_count = [];
        this.step_3.column_order = {};
        for (var i in this.step_1.task_ids) {

          this.step_2.current_field.push([]);
          this.step_2.field_checked.push(new Set());

          this.step_3.column_ids.push([]);
          this.step_3.column_count.push(0);
        }
        this.getColumn();
      },
      /**
       * 获取某个任务的字段
       */
      getColumn: function(task_id) {
        if (!task_id) { //编辑的时候会有task_id传过来
          if (this.step_1.task_ids.length == 0) {
            return;
          }
          var task_id = this.step_1.task_ids[this.step_1.task_ids.length - 1];
        }
        if (this.task_field.hasOwnProperty(task_id)) {
          return;
        }
        var type = this.step_1.type == 'DYNAMIC' ? 'cron' : 'view';
        var url = this.$store.state.api_url.task.get_column;
        var param = {
          "object": "role",
          "task_id": task_id,
          "type": type,
        };
        param = this.$generateParams(param);
        this.axios
          .post(url, param)
          .then(rep => {
            if (rep.data.code == 200) {
              this.$set(this.task_field, task_id, rep.data.data);
            } else {
              this.$error("该任务获取字段失败，请删除该任务");
            }
          })
          .catch(error => {
            console.log(error);
            this.loading = false;
            this.$error("获取任务字段接口请求失败");
          });
      },

      /**
       * 删除一个选中的任务
       * @param {Object} index
       */
      removeTaskId: function(index) {
        this.step_1.task_ids.splice(index, 1);
        this.changeTaskIds();
      },
      /**
       * 初始化任务列表
       */
      initTask: function(is_edit) {
        if(!is_edit){
          this.step_1.task_ids = [];
        }
        if (this.step_1.type == 'STATIC') { //我的视图
          var requestUrl = this.$store.state.api_url.view.list;
          let data = {
            "filter_type": this.search_task.filter_type,
            "filter_value": this.search_task.filter_value,
            "keyword": '',
            page_size: 9999999,
            page: 1,
          }
          let requestData = this.$generateParams(data);
          this.axios.post(requestUrl, requestData).then((rep) => {
              this.task_list = rep.data.data.hits;
              for (var v of this.task_list) {
                this.$set(this.task_name_map, v.view_id, v.view_name);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else { //定时任务列表
          var param = this.$generateParams({
            page: 1,
            page_size: 999999999,
            "filter_type": 'user', //this.search_task.filter_type,
            "filter_value": 'all', //this.search_task.filter_value,
          });
          this.axios
            .post("/mmp/task/find_timed_tasks", param)
            .then(rep => {
              this.task_list = rep.data.data.hits;
              for (var v of this.task_list) {
                this.$set(this.task_name_map, v.id, v.name);
              }
            })
            .catch(error => {
              console.log(error);
              this.loading = false;
              this.$error("接口请求失败");
            });
        }
      },
      /**
       * @param {Object} type
       * @param {Object} resetPage
       * 搜索类型发生变化
       */
      searchType: function(type, resetPage) {
        if (type == 'all') {
          this.search_task.filter_value = 'all'
        }
        if (type == 'self') {
          this.search_task.filter_type = 'user';
          this.search_task.filter_value = this.$store.state.user.user_id;
        }
        if (type == 'department') {
          this.search_task.filter_type = 'group';
          this.search_task.filter_value = this.$store.state.user.group;
        }
        // this.getData(resetPage);
        this.initTask();
      },
      /**
       * 前一步
       */
      preStep: function() {
        if (this.step > 1) {
          this.step--;
        }
      },
      /**
       * 下一步
       */
      nextStep: function() {
        if (this.step == 1) {
          if (!this.step_1.name) {
            this.$error("自定义报表名称不允许为空");
            return;
          }
          if (this.step_1.task_ids.length < 1) {
            this.$error("请选择任务");
            return;
          }
          for (var task_id of this.step_1.task_ids) {
            if (!this.task_field.hasOwnProperty(task_id)) {
              this.$error("任务【" + this.task_name_map[task_id] + "】数据错误，请删除该任务");
              return;
            }
          }
        }
        if (this.step == 2) {
          for (var v of this.step_2.relation_field_list) {
            if (v.is_different) {
              if (!v.alias) {
                this.$error("字段名称不相同的关联字段必须起别名");
                return;
              }
            }
          }
          if (this.step_1.task_ids.length > 1 && this.step_2.relation_field_list.length == 0) {
            this.$error("多个任务的时候必须要有关联字段");
            return;
          }
        }

        if (this.step < 3) {
          this.step++;
        }
      },
      /**
       * 关闭弹窗
       */
      closeDialog: function() {
        this.visible = false;
        this.$emit('input', false);
      },
      /**
       * 组装关联字段参数
       */
      make_relation_field_list: function() {
        if (this.step_1.task_ids.length == 0) {
          throw new Error("第一步必须选择任务");
        }
        var index = 0;
        var associate_field = [];
        for (var v of this.step_2.relation_field_list) {
          var relation = {};
          var field = {}; //每个任务对应的字段
          for (var task_index in this.step_1.task_ids) {
            field[this.step_1.task_ids[task_index]] = v.field_list[task_index]
          }
          if (v.is_different) {
            if (!v.alias) {
              throw new Error("字段名称不相同的关联字段必须起别名");
            }
          }
          relation.name = v.alias ? v.alias : v.field_list[0];
          relation.field = field;
          associate_field.push(relation);
        }
        if (this.step_1.task_ids.length > 1 && associate_field.length == 0) {
          throw new Error("多个任务的时候必须要有关联字段");
        }
        return associate_field;
      },
      /**
       * 组装指标字段参数
       */
      make_indicators_field_list: function() {
        if (this.step_1.task_ids.length == 0) {
          throw new Error("第一步必须选择任务");
        }
        var index = 0;
        var indicators_field = [];
        for (var v of this.step_3.column_ids) {
          if (v.length == 0) {
            throw new Error("每个任务都必须选择指标字段");
          }
          index++;
        }
        var alias_check = {};
        for (var col of this.step_3.column_list) {
          indicators_field.push({
            "task_id": col.task_id,
            "field": col.column,
            "alias": col.alias ? col.alias : col.column,
            "order": col.order,
          });
          var key = col.alias ? col.alias : col.column;
          if (alias_check.hasOwnProperty(key)) {
            throw new Error("指标【" + key + "】重复，请重命名");
          } else {
            alias_check[key] = 1;
          }
        }
        if (indicators_field.length == 0) {
          throw new Error("必须选择指标");
        }
        return indicators_field;
      },
      save: function() {
        var web_param = {
          "step_1": this.step_1,
          "step_2": this.step_2,
          "step_3": this.step_3,
        }
     
        var param = {
          "name": this.step_1.name, //报表名称
          "type": this.step_1.type, //报表类型
          "folder_id": this.step_1.folder_id, //放在哪个下面 文件夹ID
          "task_list": this.step_1.task_ids, //任务ID列表
        };
        try {
          var associate_field = this.make_relation_field_list();
          var indicators_field = this.make_indicators_field_list();
        } catch (e) {
          this.$error(e.message);
          return;
        }
        param.associate_field = associate_field;
        param.indicators_field = indicators_field;
        if (!param.name) {
          this.$error("请输入报表名称");
          return;
        }
        if (!param.folder_id) {
          this.$error("请选择文件夹");
          return;
        }
        for(var i in web_param.step_2.field_checked){
          web_param.step_2.field_checked[i] = Array.from(web_param.step_2.field_checked[i]);  
        }
        param.web_param = JSON.stringify(web_param);
        if(this.id){
          param.id = this.id ;
        }
        var url = this.$store.state.api_url.report.create;
        var param = this.$generateParams(param);
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            this.closeDialog();
            this.$success("自定义报表保存成功");
          } else {
            this.$error("自定义报表保存失败");
          }
        }).catch((errors) => {
          console.log(errors)
          this.$error("自定义报表保存失败");
        });;
      },
    },
    computed: {},
    watch: {},
  }
</script>

<style>
  .w-dialog-header {
    border-top: 1px solid #EAEAEA;
    padding-top: 20px;
  }

  .report-step {
    margin: 0 auto;
    width: 1000px;
    text-align: center;
    margin-bottom: 20px;
  }

  .report-step .report-step-number {
    display: inline-block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #D5D5D5;
    line-height: 30px;
    font-size: 25px;
    font-weight: bold;
    color: white;
  }

  .report-step .report-step-number.on {
    background-color: #0E73FF;
    border: none;
  }

  .report-step-text {
    line-height: 30px;
    font-size: 25px;
    margin: 0 25px;
    color: #D5D5D5;
  }

  .report-step-text.on {
    color: black;
  }

  .report-step-line {
    display: inline-block;
    width: 50px;
    height: 5px;
    background-color: #D5D5D5;
    vertical-align: text-top;
    margin-right: 20px;
    margin-top: 5px;
  }

  .relation_field_container {
    min-height: 300px;
    border: dashed 1px #D5D5D5;
  }

  .relation_field_row {
    padding-left: 15px;
    padding-top: 15px;
  }

  .relation_field_row .el-tag {
    margin-left: 15px;
  }

  .gray-label .el-form-item__label {
    color: gray;
  }

  .preview-table-container {
    border: dashed 1px #D5D5D5;
    width: 1000px;
    overflow-x: auto;
    margin: 0 auto;
    min-height: 200px;
    padding: 10px;
  }

  .preview-table th,
  .preview-table td {
    border: 1px solid #9ba0a2;
  }
</style>
