<template>
  <div>
    <el-row class="page-titie-box">定时任务运行记录</el-row>
    <table class="table table-bordered" v-loading="loading" >
      <thead>
        <tr>
          <th>任务ID</th>
          <th>模型</th>
          <th>状态</th>
          <th>创建时间</th>
          <th>创建人</th>
          <th>任务开始调度时间</th>
          <th>任务完成时间</th>
          <th>执行花费时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in groundList" :key="index">
          <td>{{ item.task_id }}</td>
          <td>{{ item.model_name}}</td>
          <td><font :color="status_list[item.status].color">{{status_list[item.status].title}}</font></td>
          <td>{{ item.submit_time}}</td>
          <td>{{  $store.state.user_list.hasOwnProperty(item.create_role) ? $store.state.user_list[item.create_role] :  item.create_role}}</td>
          <td>{{ item.schedule_time}}</td>
          <td>{{ item.finish_time}}</td>
          <td>{{ item.elapsed}}</td>
        </tr>
      </tbody>
    </table>
      <el-pagination  @size-change="handleSizeChange" @current-change="changeCurPage" :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize"  layout="total, sizes, prev, pager, next, jumper"
        :total="totalSize"></el-pagination>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        selects: "",
        selectList: [{
          cascade: false,
          name: "角色",
          value: "role"
        }],
        groundList: [],
        totalSize: 0,
        dialogVisible: false,
        operationId: "",
        pageSize: 10,
        loading: true,
        currentPage: 1,
        tatalPage: 1,
        type_list: {
          "COVER": '全部覆盖',
          'INCREMENT': '增量更新',
        },
        status_list:{
          'SUCCESS':{title:"成功",color:"#3e8fff"},
          'FAILED':{title:"失败",color:"red"},
          'ACCEPTED':{title:"等待调度",color:"#A6A9AD"},
          'RUNNING':{title:"正在运行",color:"#A6A9AD"},
          'CANCELED':{title:"已取消",color:"red"},
        },
        "filter_type": "user",
        "filter_value": "all",
        "search_type":"self",
        "task_id":"",
      };
    },
    methods: {
      searchType:function(type){
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
      /**
       * 禁用或者启用定时任务
       * @param {Object} user
       *
       */
      enable: function(value, row) {
        console.log(row);
        if (!this.$access('/data/timing/list')) {
          this.$error("您没有权限开关定时任务");
          row.enable = !value;
          return;
        }
        if(this.$store.state.user.user_id != row.create_role){
          this.$error("只允许开关自己的定时任务");
          row.enable = !value;
          return;
        }
        let url = this.$store.state.api_url.task.timed_task_enable;
        var param = {
          enable: value,
          task_id: row.id,
        }
        var param = this.$generateParams(param);
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            this.$success("操作成功");
          } else {
            this.$error("操作失败");
          }
        }).catch((error) => {
          console.log(error);
          this.$error("操作失败2")
        });
      },
      //遮罩层事件
      handleClose(done) {
        this.$confirm("确认关闭？")
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      //对象类型查询
      getData() {
        this.loading = true;
        var param = this.$generateParams({
          page: this.currentPage,
          page_size: this.pageSize,
          task_ids:[this.task_id] ,
        });
        var url =  this.$store.state.api_url.task.history;
        this.axios
          .post(url, param)
          .then(response => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            this.$tools.replaceSpace(data.data.hits);
            this.groundList = data.data.hits;
            this.totalSize = data.data.total_hits;
            this.totalSize = data.data.total_hits;
            this.tatalPage = data.data.total_page
            this.loading = false;
          })
          .catch(error => {
            this.loading = false;
            this.$error("接口请求失败");
          });
      },
      //图标创建事件
      createdId(targetId) {
        this.operationId = targetId;
        this.$router.push({
          path: "/data/timing/crechart",
          query: {
            id: this.operationId
            // name: idArr[0].name,
            // desc: idArr[0].desc,
            // upData: idArr[0].data_update_time,
            // cRole: idArr[0].create_role,
            // cTime: idArr[0].create_time,
            // source: idArr[0].source,
          }
        });
      },
      //删除事件
      deletedId(targetId) {
        this.operationId = targetId;
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
      //分页事件
      delById() {
        let url = "/mmp/task/delete_timed_task";
        var param = this.$generateParams({
          task_id: this.operationId
        });
        this.axios
          .post(url, param)
          .then(response => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            console.log(data, "resuult");
            if (data.code == 200) {
              this.getData();
              this.$success("删除成功");
              return;
            }
          })
          .catch(error => {
            this.$error("接口请求失败");
          });
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
      changeCurPage(val) {
        this.getData();
      },
    },
    mounted() {
      var task_id = this.$route.query.task_id;
      this.$count('TIMED_TASK','TIMED_TASK_RECORD',{'task_id':task_id});//打点统计
      if (!task_id) {
        this.$error("参数错误");
        this.$router.push({
          path: '/data/timing/list'
        });
        return;
      }
      this.task_id = task_id ;
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
