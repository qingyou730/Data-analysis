<template>
  <div>
    <el-row style="margin-top: 10px">
      <el-select v-model="search_type" @change="searchType($event)">
        <el-option label="所有人" value="all"></el-option>
        <el-option label="部门" value="department"></el-option>
        <el-option label="仅自己" value="self"></el-option>
      </el-select>
    </el-row>
    <table class="table table-bordered">
      <thead>
      <tr>
        <th>任务ID</th>
        <th>任务名称</th>
        <th>状态</th>
        <th>创建时间</th>
        <th>创建人</th>
        <th>执行花费时间</th>
        <th style="width: 30%">sql</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <template v-for="(item1, index) in tableData">
        <tr :key="index">
          <td>{{ item1.id}}</td>
          <td>{{ item1.task_name }}</td>
          <td><font :color="status_list[item1.status].color">{{status_list[item1.status].title}}</font></td>
          <td>{{ $tools.formatTime(item1.submit_time) }}</td>
          <td>{{ $store.state.user_list.hasOwnProperty(item1.create_role) ?
            $store.state.user_list[item1.create_role] : item1.create_role}}
          </td>
          <td>{{ item1.run_time > 60 ? Math.floor(item1.run_time/60)+'分'+(item1.run_time%60)+'秒' :
            item1.run_time+'秒'}}
          </td>
          <td style="cursor: pointer;" @click="formatSql(item1.sql)"><pre
              style="white-space: nowrap;text-overflow: ellipsis;font-family: inherit;font-size:14px;overflow: hidden;width:40%">
                            {{item1.sql.slice(0,50)}}</pre>
          </td>
          <!-- 操作按钮 -->
          <td style="padding: 6px 0;">
            <el-row>
              <!-- 查看成员 -->
              <el-button v-if="$access('/hive/sqllab/submit')" type="text" size="mini"
                         @click="linkAddTabs(item1)"
                         :displayName="item1.id" id="searchMember"
                         style="padding-left: 12px; box-sizing: border-box; outline: none">查看
              </el-button>
              <el-button v-if="$access('/hive/sqllab/submit')" type="text" size="mini"
                         style="box-sizing: border-box; outline: none">
                <a target="_blank"
                   :href="$store.state.api_url.job.yarn_log +'?job_id='+item1.id">yarn日志</a></el-button>
              <a v-if="item1.status=='SUCCESS'"
                 :href="$store.state.api_url.task.get_file+'?path='+item1.download_path" target="_blank"
                 style="box-sizing: border-box; font-size: 12px; color:#0e73ff;">下载</a>
              <el-button v-if="item1.status!='SUCCESS'&&item1.status!='CANCEL'&&item1.status!='FAILED'" type="text" size="mini" @click="cancelOfflineSql(item1.id)"
                         style="box-sizing: border-box; font-size: 12px; color:#0e73ff;">取消
              </el-button>
            </el-row>
          </td>
        </tr>
      </template>
      </tbody>
    </table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
                   :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize"
                   layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <format-sql :sql='sql' v-if="sqlDialog" v-model="sqlDialog"></format-sql>
  </div>
</template>
<script>
  import formatSql from './formatSql.vue';
  import sqlFormatter from "sql-formatter";

  export default {
    props: ["addHiveTabs", "value", "reqDownkey"],
    components: {
      formatSql
    },
    data() {
      return {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        tableData: [],
        status_list: {
          'SUCCESS': {title: "成功", color: "#3e8fff"},
          'FAILED': {title: "失败", color: "red"},
          'ACCEPTED': {title: "等待调度", color: "#A6A9AD"},
          'RUNNING': {title: "正在运行", color: "#A6A9AD"},
          'CANCEL': {title: "已取消", color: "red"},
        },
        sqlDialog: false,
        "filter_type": "user",
        "filter_value": "",
        "search_type": "self",
      }
    },
    methods: {
      downloadExcel(item) {
        console.log(item);
      },
      searchType(type) {
        if (type == 'all') {
          this.filter_value = 'all'
        }
        if (type == 'self') {
          this.filter_type = 'user';
          this.filter_value = this.$store.state.user.user_id;
        }
        if (type == 'department') {
          this.filter_type = 'group';
          this.filter_value = this.$store.state.user.group;
        }
        this.getData();
      },
      getData() {
        this.loading = true;
        let requestUrl = this.$store.state.api_url.heightAnalysis.sql_list;
        let data = {
          page_size: this.pageSize,
          page: this.currentPage,
          object: "role",
          "filter_type": this.filter_type,
          "filter_value": this.filter_value,
        };
        let requestData = this.$generateParams(data);
        this.axios
            .post(requestUrl, requestData)
            .then(rep => {
              this.loading = false;
              if (rep.data.code == 200) {
                this.tableData = rep.data.data.hits;
                this.total = rep.data.data.total_hits;
                this.totalPage = rep.data.data.total_page;
              } else {
                this.$error(rep.data.msg);
              }
            })
            .catch((error) => {
              this.loading = false;
              console.log(error);
            });
      },
      formatSql(sql) {
        this.sql = sql;
        this.sqlDialog = true;
      },


      //注意
      linkToEdit(item1) {
        this.$router.push({
          path: '/hive/sqllab/submit',
          query: {linkSql: item1.sql, name: item1.task_name, type: 'download', 'id': item1.id}
        })
      },
      linkAddTabs(item1) {//添加tabs标签查看记录
        this.addHiveTabs.sql = item1;
        this.$emit('input', true);
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

      cancelOfflineSql(id){
        let data = {
          sql_id: id,
        };
        let requestData = this.$generateParams(data);
        let requestUrl = this.$store.state.api_url.heightAnalysis.cancel_offline_sql;
        this.axios
            .post(requestUrl, requestData)
            .then(rep => {
              this.loading = false;
              if (rep.data.code == 200) {
                this.$success("任务取消成功")
                this.getData()
              } else {
                this.$error(rep.data.msg);
              }
            })
            .catch((error) => {
              this.loading = false;
              console.log(error);
            });
      }
    },
    mounted() {
      this.filter_type = 'user';
      this.filter_value = this.$store.state.user.user_id;
      this.getData();
    },
    watch: {
      reqDownkey: {
        handler() {
          this.getData();
        }
      }
    }

  }
</script>