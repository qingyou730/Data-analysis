<template>
  <div style="height: 100%;overflow-y:auto;">
    <el-row class="page-titie-box">
      <span style="font-size: 16px;">{{report.name}}</span>
      <el-button v-if="$access('/custom/report/publish')" type="primary" @click="publish" size="small" :class="['add-btn',{'cancel-public':report.is_publish}]"
        style="margin: 6px 12px">{{report.is_publish?'取消发布':'发布'}}</el-button>
    </el-row>
    <el-row v-if="!wra_condition_fix" style="background-color: #F5F5F5;background-color: rgb(245, 245, 245);height: 32px;width: 99.2%;">
      <div style="position: absolute;bottom: 6px;left: 50%;margin-left: -12px;">
        <span style="display:inline-block;cursor:pointer" @click="putItawayWra"><i class="el-icon-arrow-down" style="margin-right:4px"></i>展开</span>
      </div>
    </el-row>
    <el-row class="gray-row" ref="wra_condition_fix" v-if="wra_condition_fix">
      <div style="position: absolute;bottom: 0;left: 50%;margin-left: -12px;">
        <span style="display:inline-block;cursor:pointer" @click="putItawayWra"><i class="el-icon-arrow-up" style="margin-right:4px"></i>收起</span>
      </div>
      <!--显示固定列-->
      <show-fix-column v-if="report.name" :key="'show_fix_column' + report.name" v-model="fixed_column" :indicators="report.indicators_field"
        :task_field="task_field" :fixed_column_str="report.fixed_column" :changeRigthKey="changeRigthKey"
        :fixColumnParam="fixColumnParam" :showfixFlag="showfixFlag" :changeShowfixFlag="changeShowfixFlag"></show-fix-column>

      <!-- 配置固定列 -->

      <fix-column v-if="showfixFlag" :id="id" :key='report.name' v-model="showfixFlag" :indicators="report.indicators_field"
        :task_field="task_field" :fixed_column_str="report.fixed_column" :changeRigthKey="changeRigthKey"
        :changeShowfixFlag="changeShowfixFlag" :fixColumnParam="fixColumnParam" :cancelPublic="cancelPublic"></fix-column>

      <div style="height:12px"></div>
      <!-- 显示设置 -->
      <show-needcol :report="report" :task_field="task_field" :combinationParam="fixColumnParam" :propData="propData"
        :showColdata="showColdata" :key="show_need_col+'need'" :changeRigthKey="changeRigthKey"></show-needcol>

    </el-row>
    <div class="">
      <div style="display: inline-block;width: 100%;">
        <el-dropdown v-if="$access('/custom/report/add')" trigger="click" style="float: right;">
          <el-button type="text" style="float: right;color: #939393;margin-right: 10px;"><i class="text-primary fa fa-ellipsis-h"></i></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="showEdit=true">编辑</el-dropdown-item>
            <el-dropdown-item @click.native="showfixFlag=true">配置固定列</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="text" style="float: right;color: #939393;margin-right: 10px;" @click="download"><i class="text-primary fa fa-download"></i></el-button>
        <el-button type="text" style="float: right;color: #939393;margin-right: 10px;" @click="getData"><i class="text-primary fa fa-refresh"></i></el-button>



      </div>
      <div style="width: 100%;overflow-x: auto;">
        <table class="table table-bordered" v-loading="loading">
          <thead>
            <tr v-if="!appoint_col_key">
              <th style="min-width:150px;" v-for="(col,index) in report.indicators_field" :key="index">{{col.alias}}</th>
            </tr>
            <tr v-else>
              <th style="min-width:150px;" v-for="(col,index) in appoint.indicators_field" :key="index">{{col.alias}}</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="!appoint_col_key">
              <tr v-for="(row,row_index) in result" :key="'data_row_'+row_index">
                <td v-for="(col,index) in report.indicators_field" :key="index">{{row[col.alias]}}</td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(row,row_index) in result" :key="'data_row_'+row_index">
                <td v-for="(col,index) in appoint.indicators_field" :key="index">{{row[col.alias]}}</td>
              </tr>
            </template>
          </tbody>
        </table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
          :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
          :total="totalData"></el-pagination>
      </div>

    </div>
    <create-report v-if="showEdit" v-model="showEdit" :id="this.id" :changeRigthKey="changeRigthKey"
      :renderAddCustom="renderAddCustom" :folder_id="folder_id" :cancelPublic="cancelPublic"
    ></create-report>
  </div>
</template>

<script>
  import showNeedcol from '@/components/views/custom/components/showNeedcol'
  import createReport from '@/components/views/custom/base/createReport.vue'
  import fixColumn from '@/components/views/custom/components/fixColumn.vue'
  import showFixColumn from '@/components/views/custom/components/showFixColumn.vue'
  export default {
    components: {
      createReport,
      fixColumn,
      showNeedcol,
      showFixColumn,
    },
    props: ['value', 'id', 'folder_id', "changeRigthKey","renderAddCustom"],
    data() {
      return {
        showfixFlag: false,
        param: {},
        propData: {
          order: {
            key: "",
            value: "ASC",
          },
          select_condition: [{
            key: {},
            value: '',
            condition: '=',
            "start": "",
            "end": "",
          }]
        },
        showColdata: [{
          value: {}
        }],
        showEdit: false, //是否展示编辑弹窗
        loading: true,
        step: 1,
        report: {},
        appoint: {}, //指定列report
        result: [],
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
        show_need_col: 1,
        visible: true,
        totalPage: 0,
        totalData: 0,
        currentPage: 1,
        pageSize: 20,
        show: {
          "where": '',
          "order": '',
          "specified_column": [],
        },
        appoint_col_key: false, //是否开启指定列数据渲染
        wra_condition_fix: true,
        fixed_column: [], //固定列列表
      }
    },
    created() {
      if (this.folder_id) {
        this.step_1.folder_id = this.folder_id;
      }
    },
    mounted() {
      if (this.id) {
        this.get_detail();

      } else {
        this.$error("没有报表ID");
      }
    },
    methods: {
      cancelPublic() {
        this.report.is_publish = false;
      },
      getChilrenFun() { //
        this.$refs.fixColumn['doEdit']();
      },
      changeShowfixFlag() {
        this.showfixFlag = !this.showfixFlag;
      },
      putItawayWra() { //收起条件设置
        this.wra_condition_fix = !this.wra_condition_fix;
        // this.$refs['wra_condition_fix']['$el'].style.height = '0px';
        // console.log(this.$refs['wra_condition_fix']['$el'], " this.$refs===");
      },

      /**
       * 固定列筛选参数
       */
      fixColumnParam: function() {
        this.show.where = '';
        this.show.order = "";
        this.show.specified_column = [];
        var where = [];
        for (var column of this.fixed_column) {
          //数值
          if (column.type == 'number') {
            if (column.op == 'BETWEEN') {
              if (column.start != '' && column.end != '' && column.start && column.end) {
                where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + column.op + " " + column.start +
                  "  AND  " + column.end + ")")
              }
            } else {
              if (column.value != '' && column.value) {
                where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + column.op + " " + column.value +
                  ')');
              }
            }
          }
          //字符串   
          if (column.type == 'string') {
            if (column.op == 'BETWEEN') {
              if (column.start != '' && column.end != '' && column.start && column.end) {
                where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + column.op + " '" + column.start +
                  "'  AND  '" + column.end + "')")
              }
            } else {
              if (column.value != '' && column.value) {
                where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + column.op + " '" + column.value +
                  "'" + ')');
              }
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
              where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + 'IN' + "(" + in_array.join(
                  ',') +
                ")" + ')');
            }

            //固定维度的单选情况
            if (!column.multiple && column.value != '') {
              where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + '=' + " '" + column.value +
                "'" + ')');
            }

          }
          //时间类型
          if (column.type == 'time') {
            if (column.time_type == 'STATIC') {
              if (column.op == '=') {
                var value = new Date(column.value);
                if (column.time_granularity == 'DATE') {
                  value = value.Format('yyyy-MM-dd');
                }
                if (column.time_granularity == 'HOUR') {
                  value = value.Format('yyyy-MM-dd HH');
                }
                if (column.time_granularity == 'SECOND') {
                  value = value.Format('yyyy-MM-dd HH:mm:ss');
                }
                where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + column.op + " '" + value +
                  "')")
              } else { //column.op == 'between'
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
                where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + 'BETWEEN' + " '" + start +
                  "'  AND  '" + end + "')")
              }
            } else {
              var time_units = column.time_units;
              var time_value = column.time_value;
              var end = new Date().Format('yyyy-MM-dd 23:59:59');
              var start = (new Date(new Date(end).getTime() - 86400 * 1000 * (1 - 1))).Format(
                'yyyy-MM-dd 00:00:01');
              if (time_units == 'HOURS') { //最近N小时
                var end = (new Date(new Date().getTime() - 3600 * 1000)).Format('yyyy-MM-dd HH:59:59');
                var start = (new Date(new Date().getTime() - 3600 * 1000 * time_value)).Format(
                  'yyyy-MM-dd HH:00:01');
              }
              if (time_units == 'DAYS') { //最近N天
                var end = new Date().Format('yyyy-MM-dd 23:59:59');
                var start = (new Date(new Date(end).getTime() - 86400 * 1000 * (time_value - 1))).Format(
                  'yyyy-MM-dd 00:00:01');
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
                  'yyyy-MM-dd 00:00:01');
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
                var start = start.Format('yyyy-MM-01 00:00:01');
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
              if (column.op == 'BETWEEN') {
                where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + 'BETWEEN' + " '" + start +
                  "'  AND  '" + end + "')")
              } else {
                where.push('(' + column.column.task_id + '.' + column.column.field + ' ' + column.op + " '" + start +
                  "')")
              }

            }
          }
        }

        //显示设置参数拼接
        if (this.propData.order.key) {
          let order_fields_key = this.propData.order['key']['task_id'] + '.' + this.propData.order['key']['field'];
          this.show.order = order_fields_key + ' ' + this.propData.order['value'];
        }
        if (this.propData.select_condition[0].value || this.propData.select_condition[0].start) {
          this.propData.select_condition.forEach((item, index) => {
            let sel_key = item.key['task_id'] + '.' + item.key['field'];
            if (item.condition != 'BETWEEN') {
              where.push('(' + sel_key + ' ' + item.condition + ' ' + "'" + item.value + "'" + ')');
            } else {
              where.push('(' + sel_key + ' ' + 'BETWEEN' + ' ' + "'" + item.start + "'" + ' ' + 'AND' +
                ' ' + "'" + item.end + "'" + ')');
            }
          });
        }
        if (this.showColdata[0].value.hasOwnProperty('task_id')) {
          this.showColdata.forEach((item, index) => {
            this.show.specified_column.push(item.value);
          })
        }


        if (where.length > 0) {
          var where_str = where.join(' AND ');
          this.show.where = where_str;
        }
        this.appoint.indicators_field = this.show.specified_column;
        this.currentPage = 1;
        this.getData(true);
      },
      isRepeat(arr) {
        var hash = {};
        for (var i in arr) {
          if (hash[arr[i]]) {
            return true;
          }
          // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
          hash[arr[i]] = true;
        }
        return false;
      },
      onclickRefresh() {},
      /**
       * 获取报表详情
       */
      get_detail: function() {
        var url = this.$store.state.api_url.report.detail;
        var param = this.$generateParams({
          "id": this.id,
        });
        this.axios
          .post(url, param)
          .then(rep => {
            if (rep.data.code == 200) {
              var web_param = JSON.parse(rep.data.data.web_param);
              for (var i in web_param.step_2.field_checked) { //数组转化为集合 因为集合不能JSON转
                web_param.step_2.field_checked[i] = new Set(web_param.step_2.field_checked[i]);
              }
              this.step_1 = web_param.step_1;
              this.step_2 = web_param.step_2;
              this.step_3 = web_param.step_3;
              delete rep.data.data.web_param;
              this.report = rep.data.data;
              if(this.report.fixed_column) {
                this.fixed_column = JSON.parse(this.report.fixed_column);
              }
              this.fixColumnParam();
              // this.initTask(true);
              for (var task_id of this.step_1.task_ids) {
                this.getColumn(task_id);
              }
            } else {
              console.log(rep);
              this.$error("获取任务详情失败1");
            }
          })
          .catch(error => {
            console.log(error);
            this.loading = false;
            this.$error("获取任务详情失败2");
          });
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
      // 当前页
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getData();
      },
      /**
       * 获取任务结果
       */
      getData: function(need_count) {
        if (this.show.specified_column[0]) {
          this.appoint_col_key = true;
        } else {
          this.appoint_col_key = false;
        }
        this.loading = true;
        var url = this.$store.state.api_url.report.result;
        var param = this.$generateParams({
          "id": this.id,
          'order_by': this.show.order, //20201109000401_000488.平台_区间内最终 asc
          'page': this.currentPage,
          'page_size': this.pageSize,
          'where': this.show.where, // 20201109000401_000488.省_区间内最终 = '湖南' ,
          'specified_column': this.show.specified_column,
        });
        this.axios
          .post(url, param)
          .then(rep => {
            if (rep.data.code == 200) {
              // this.totalData = rep.data.data.total;
              this.result = rep.data.data.responseList;
              this.loading = false;
            } else {
              this.loading = false;
              this.$error(rep.data.msg);
            }
          })
          .catch(error => {
            console.log(error);
            this.loading = false;
            this.$error("获取报表结果失败4");
          });
        if (need_count) {
          var url = this.$store.state.api_url.report.total;
          this.axios
            .post(url, param)
            .then(rep => {
              if (rep.data.code == 200) {
                this.totalData = rep.data.data;
              } else {
                this.$error(rep.data.msg);
              }
            })
            .catch(error => {
              console.log(error);
              this.$error("获取报表结果失败5");
            });
        }

      },
      /**
       * 下载
       */
      download: function() {
        var url = this.$store.state.api_url.report.download;
        var param = this.$generateParams({
          "id": this.id,
          'order_by': this.show.order, //20201109000401_000488.平台_区间内最终 asc
          // 'page': this.currentPage,
          // 'page_size': this.pageSize,
          'where': this.show.where, // 20201109000401_000488.省_区间内最终 = '湖南' ,
          'specified_column': this.show.specified_column,
        });

        /*  //指定列列子
        {
          "task_id": "20201109000401_000488",
          "field": "省_区间内最终",
          "alias": "省1",
          "order": "1"
        }, {
          "task_id": "20201109000401_000488",
          "field": "角色id_区间内最终",
          "alias": "角色1",
          "order": "2"
        }, {
          "task_id": "20201109000401_000489",
          "field": "角色id_区间内最终",
          "alias": "角色id_区间内最终",
          "order": "3"
        },
        */
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            var url = this.$store.state.api_url.task.get_file + '?path=' + data.data;
            window.location.href = url;
          } else {
            this.$error(data.msg);
          }
        }).catch((error) => {
          console.log(error);
          this.$error("加载数据失败");
        });
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
       * 关闭弹窗
       */
      closeDialog: function() {
        this.visible = false;
        this.$emit('input', false);
      },
      /**
       * 发布
       * 把报表的 is_publish改为true 
       */
      publish: function() {
        this.$confirm(this.report.is_publish ? '此操作将取消发布, 是否继续?' : '此操作将进行发布提交, 是否继续?', this.report.is_publish ? '提示' :
          '确认信息', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: this.report.is_publish ? 'error' : 'warning'
          }).then(() => {
          var url = this.$store.state.api_url.report.publish;
          var param = {
            "id": this.id,
            "is_publish": !this.report.is_publish,
          };
          param = this.$generateParams(param);
          this.axios
            .post(url, param)
            .then(rep => {
              if (rep.data.code == 200) {
                this.report.is_publish = !this.report.is_publish;
                this.$success("操作成功");
              } else {
                this.$error("操作失败");
              }
            })
            .catch(error => {
              console.log(error);
              this.$error("操作失败");
            });
        }).catch(() => {

        });
      },
      save: function() {
        return;
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
  .gray-row {
    background-color: #F5F5F5;
    min-height: 106px;
    margin-top: 20px;
    padding: 10px 10px 10px 2px;
    margin-right: 7px;
  }

  .text-primary {
    color: #0e73ff;
  }
  .page-titie-box .cancel-public{
    margin: 6px 12px;
    background: #ccc;
    border-color: transparent;
  }
</style>
