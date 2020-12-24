<template>
  <div>
    <el-row class="page-titie-box">
      sql临时表
      <router-link to="/hive/mlist/add" v-if="$access('/hive/mlist/add')">
        <el-button size="mini" type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>
    <el-row>
      <el-select v-model="search_type" @change="searchType($event)">
                  <el-option label="所有人" value="all"></el-option>
                  <el-option label="部门" value="department"></el-option>
                  <el-option label="仅自己" value="self"></el-option>
      </el-select>
    </el-row>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>临时表名</th>
            <th>描述信息</th>
            <th>用户名</th>
            <th>类型</th>
            <th>数据库名</th>
            <th>记录数</th>
            <th>sql</th>
            <th>执行状态</th>
            <th>失败原因</th>
            <th>创建时间</th>
            <th>截止时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, index) in groundList">
            <tr :key="index">
              <td>{{ item.id}}</td>
              <td>{{ item.desc }}</td>
              <td>{{  $store.state.user_list.hasOwnProperty(item.username) ? $store.state.user_list[item.username] :  item.username}}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.db_name }}</td>
              <td>{{ $tools.replaceRowSpace(item.count) }}</td>
              <td v-if="item.type=='上传表'" style="cursor: pointer;color:#0e73ff" @click="formatUpSql(item.sql)">{{item.sql?item.sql.slice(0,25)+'...': '--'}}</td>
              <td v-if="item.type=='物化表'" style="cursor: pointer;color:#0e73ff" @click="formatObjSql(item.sql)"> {{item.sql?item.sql.slice(0,25)+'...': '--'}}
              </td>
              <td><font :color="status_list[item.status] ? status_list[item.status].color: '#212529'">{{status_list[item.status]?status_list[item.status].title:item.statuss}}</font></td>
              <td style="cursor: pointer;" @click="alertaFailedmag(item)">{{item.fail_msg?item.fail_msg.substr(0,4):'--'}}</td>
              <td>{{  $tools.formatTime(item.create_time) }}</td>
              <td>{{  $tools.formatTime(item.expired_time) }}</td>

              <!-- 操作按钮 -->
              <td style="padding: 6px 0;">
                <el-row>
                  <!-- 查看成员 -->
                  <el-button
                    v-if="$access('/hive/mlist/pick')&&item.status!='FAILED'"
                    type="text"
                    size="mini"
                    @click="goMember(item)"
                    :displayName="item.id"
                    id="searchMember"
                    style="padding-left: 12px; box-sizing: border-box; outline: none"
                  >查看</el-button>
                  <el-button
                    v-if="$access('/hive/mlist/pick')&&item.status=='FAILED'"
                    type="text"
                    size="mini"
                    @click="alertNOT()"
                    :displayName="item.id"
                    id="searchMember"
                    style="padding-left: 12px; box-sizing: border-box; outline: none"
                  >查看</el-button>
                  <el-button
                    v-if="$access('/hive/mlist/delete')"
                    type="text"
                    size="mini"
                    @click="lookId(item.id)"
                    style="box-sizing: border-box; outline: none"
                  >刪除</el-button>
                  <el-button v-if="$access('/hive/mlist/pick')&&item.type=='上传表'" type="text" size="mini"
                    style="box-sizing: border-box; outline: none;color:#ccc">
                     yarn日志
                  </el-button>
                  <el-button v-if="$access('/hive/mlist/pick')&&item.type=='物化表'" type="text" size="mini"
                    style="box-sizing: border-box; outline: none">
                    <a  target="_blank" :href="$store.state.api_url.job.yarn_log +'?job_id='+item.id">yarn日志</a>
                  </el-button>
                </el-row>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
        :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="total" >
      </el-pagination>


      <!--sql格式显示-->
        <format-sql :sql='sql'  v-if="sqlDialog" v-model="sqlDialog" ></format-sql>
        <format-upsql :sql='upSql'  v-if="upSqlDialog" v-model="upSqlDialog" ></format-upsql>
        <!-- 失败原因 -->
        <el-dialog
          title="失败原因"
          :visible.sync="dialogVisible"
          width="30%"
          >
          <p>{{failedmsg}}</p>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="dialogVisible = false">取消</el-button>
          </span>
</el-dialog>
  </div>
</template>
<script>
 import formatSql from '../sqllab/formatSql.vue';
 import formatUpsql from './formatSql.vue';

export default {
  components: {
    formatSql,
    formatUpsql
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      groundList: [],
      total: 0,
      delId: "",
      sql: '',
      upSql: '',
      "filter_type": "user",
      "filter_value": "",
      "search_type":"self",
      sqlDialog: false,
      upSqlDialog: false,
      dialogVisible:false,
      failedmsg: '',
      status_list: {
        SUCCESS: { title: "成功", color: "#3e8fff" },
        FAILED: { title: "失败", color: "red" },
        ACCEPTED: { title: "等待调度", color: "#A6A9AD" },
        RUNNING: { title: "正在运行", color: "#A6A9AD" },
        CANCELED: { title: "已取消", color: "red" },
      },
    };
  },
  methods: {
    searchType(type){
            if(type == 'all'){
                this.filter_value = 'all'
            }
            if(type =='self'){
                this.filter_type = 'user';
                this.filter_value =  this.$store.state.user.user_id ;
            }
            if(type=='department'){
                this.filter_type = 'group';
                this.filter_value =  this.$store.state.user.group ;
            }
            this.getData();
        },
    //失败弹窗
    alertaFailedmag(item) {
      if(item.fail_msg) {
        this.failedmsg = item.fail_msg;
        this.dialogVisible = true;
      }else{
         return;
      }
    },
    //任务FAILED提示
    alertNOT() {
      this.$error('任务状态是失败, 不支持查看');
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    // 当前页
    handleCurrentChange(val) {
      this.page = val;
      this.getData();
    },
    formatUpSql(sql){
      if(!sql){
        return;
      }
      this.upSql = sql;
      this.upSqlDialog=true;
    },
    formatObjSql(sql) {
      if(!sql){
        return;
      }
      this.sql = sql;
      this.sqlDialog=true;
    },
    //获取数据
    getData() {
      var param = this.$generateParams({
        page: this.page,
        page_size: this.pageSize,
        "materialize": false,
        filter_type: "user",
        filter_value: "all",
        object: "role",
        "filter_type": this.filter_type,
        "filter_value": this.filter_value,
      });
      this.axios
        .post("/manager/hive/find", param)
        .then(response => {
          let data = response.data;
          if (data.code != 200) {
            console.log("接口有错返回");
            console.log(response);
          }
          if(!data.data.hits) {
            this.groundList = [];
            return
          }
          this.groundList = data.data.hits;
          this.total = data.data.total_hits;
        })
        .catch(error => {
          console.log(error);
          this.$error("接口请求失败");
        });
    },
    //查看成员方法
    goMember(item) {
      if(item.status&&item.status=='ACCEPTED') {
        this.$error('任务状态是正在调度，不支持查看');
        return;
      }
      this.$router.push({
        path: "/hive/mlist/pick",
        query: {
          id: item.id,
          count: item.count
        }
      });
    },
    //删除事件
    lookId(table_name) {
      this.delId = table_name;
      this.$confirm("此操作将永久删除该数据,不可恢复, 是否继续?", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "danger"
      })
        .then(() => {
          this.delById();
        })
        .catch(() => {
          console.log("删除取消");
        });
    },
    delById() {
      var param = this.$generateParams({
        id: this.delId
      });
      this.axios
        .post("/manager/hive/delete", param)
        .then(response => {
          let data = response.data;
          if (data.code != 200) {
            console.log("接口有错返回");
            console.log(response);
          }
          if (data.code == 200) {
            this.$success("删除成功");
            this.getData();
            return;
          }
        })
        .catch(error => {
          this.$error("接口请求失败");
        });
    }
  },
  mounted() {
    this.filter_type = 'user';
    this.filter_value =  this.$store.state.user.user_id ;
    this.getData();
  }
};
</script>
<style>
.timing-border {
  border-bottom: 1px solid #b3b3b3;
  padding-bottom: 5px;
}
</style>
