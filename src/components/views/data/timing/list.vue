<template>
  <div>
    <div style="display: inline-block;width: 100%;">
      <span style="margin:0 10px 0 9px;">定时任务列表</span>
        <el-input @input="getData(true)" v-model="q" placeholder="输入关键字搜索" clearable suffix-icon="el-icon-search"
        style="width: 200px;margin-right: 20px;" />
      <el-select v-model="search_type" @change="searchType($event)">
        <el-option label="所有人" value="all"></el-option>
        <el-option label="部门" value="department"></el-option>
        <el-option label="仅自己" value="self"></el-option>
      </el-select>
    </div>
    <table class="table table-bordered" v-loading="loading" style="margin-top: 20px;">
      <thead>
        <tr>
          <th>任务名称</th>
          <!-- <th>model_type</th>
          <th>source</th>-->
          <th>描述</th>
          <th>模型</th>
          <th>群组</th>
          <th>类型</th>
          <th>创建时间</th>
          <th>创建人</th>
          <th>更新时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in groundList">
          <tr :key="index">
            <td><span class="text-length"  :title="item.name">{{ item.name}}</span></td>
            <td><span class="text-length"  :title="item.desc">{{ item.desc }}</span></td>
            <td>{{ item.model_name }}</td>
            <td>
              <router-link :to="'/data/group/member?id=' + item.group_id" v-if="item.group_id!=''">{{ item.group_id }}</router-link>
              <span v-else> </span>
            </td>
            <td>{{ type_list[item.type] }}</td>
            <td>{{  $tools.formatTime(item.create_time) }}</td>
            <td>{{ $store.state.user_list.hasOwnProperty(item.create_role) ? $store.state.user_list[item.create_role] :  item.create_role}}</td>
            <td>{{  $tools.formatTime(item.data_update_time) }}</td>
            <td>
              <el-switch @change="enable($event,item)" v-model="item.enable" active-color="#0e73ff" inactive-color="#909399">
              </el-switch>
            </td>
            <td>
              <el-button type="text" size="mini" @click='limitJump(item, index)'>查看</el-button>
              <el-button v-if="$access('/data/timing/delete')" type="text" size="mini" @click="deletedId(item.id);"
                style="padding-left: 12px; box-sizing: border-box; outline: none">删除</el-button>
              <router-link :to="'/data/timing/history?task_id=' +item.id">
                <el-button type="text" size="mini">运行记录</el-button>
              </router-link>
              <template>
                <span style='margin-left:3px; display: inline-block; color: rgba(48, 45, 45, 0.72);' v-if="!item.is_private&&search_type == 'self'">
                  <i class="fa fa-dot-circle-o" aria-hidden="true" style="cursor: pointer;"  @click="openLimit(item, index)"> 仅自己查看</i>
                </span>
                <span style='margin-left:3px; display: inline-block; color: #0d68e6;' v-if="item.is_private && search_type == 'self'">
                  <i class="fa fa-dot-circle-o" aria-hidden="true" style="cursor: pointer;"  @click="openLimit(item, index)"> 仅自己查看</i>
                </span>
              </template>
              <!-- <el-button
                icon="el-icon-delete"
                style="border: none; color: red"
                size="mini"
                title="删除记录"
                @click="deletedId(item.task_id); dialogVisible = true"
              ></el-button>-->
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <el-pagination @size-change="handleSizeChange" @current-change="changeCurPage" :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalSize"></el-pagination>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        q:'',
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
        "filter_type": "user",
        "filter_value": "all",
        "search_type": "self"
      };
    },
    methods: {
       limitJump(item, index) {//权限跳转
        var itemUser = item.create_role;
        var user = this.$store.state.user.user_id;
        if(!item.is_private) {
          this.$router.push('/analysis/model/taskDetail?type=cron&task_id=' +item.id);
        }else{
          if(itemUser == user) {
            this.$router.push('/analysis/model/taskDetail?type=cron&task_id=' +item.id);
          }else{
            this.$box('没有访问该视图的权限，请获取权限后尝试');
          }
        }

      },
      openLimit(item, index) {//权限
        this.$confirm(`确定${item.is_private?'取消':'设置'}仅自己查看功能?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          this.$count('TIMED_TASK','SELF_TIMED_TASK',{'task_id':item.id,type:1});//打点统计
          let url = this.$store.state.api_url.task.is_private_time_task;
          var deleteParam = {
            task_id: item.id,
            enable: !item.is_private
          }
          deleteParam = this.$generateParams(deleteParam);
          this.axios.post(url, deleteParam).then((res) => {
            var data = res.data;
            if (data.code == 200) {
              this.$success("设置成功");
              item.is_private = !item.is_private;
            } else {
              this.$error("设置失败1");
            }
          }).catch((err) => {
            console.log(err, 'err');
            this.$error("设置失败2")
          });
        }).catch(() => {
          this.$count('TIMED_TASK','SELF_TIMED_TASK',{'task_id':item.id,type:0});//打点统计
          console.log("取消设置");
        });
      },
      searchType: function(type) {
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
        localStorage.setItem("time_tasks_search_type",type);
        this.getData(true);
      },
      /**
       * 禁用或者启用定时任务
       * @param {Object} user
       *
       */
      enable: function(value, row) {
        if (!this.$access('/data/timing/list')) {
          this.$error("您没有权限开关定时任务");
          row.enable = !value;
          return;
        }
        if (this.$store.state.user.user_id != row.create_role) {
          this.$error("只允许开关自己的定时任务");
          row.enable = !value;
          return;
        }
        if(value){
          var text = "开启该定时任务吗" ;
        }else{
          var text = "关闭该定时任务吗" ;
        }

        this.$confirm("您确定要"+text+"?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "danger"
          })
          .then(() => {

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
          })
          .catch(() => {
            row.enable = !value;
            return;
            console.log("取消");
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
      getData(resetPage) {
        if(resetPage){
          this.currentPage = 1 ;
        }
        this.loading = true;
        var param = this.$generateParams({
          page: this.currentPage,
          page_size: this.pageSize,
          "filter_type": this.filter_type,
          "filter_value": this.filter_value,
          "keyword":this.q,
        });
        this.axios
          .post("/mmp/task/find_timed_tasks", param)
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
            console.log(error);
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
            this.$count('TIMED_TASK','DROP_TIMED_TASK',{'task_id':targetId,type:1});//打点统计
            this.delById();
          })
          .catch(() => {
            this.$count('TIMED_TASK','DROP_TIMED_TASK',{'task_id':targetId,type:0});//打点统计
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
      if(localStorage.getItem("time_tasks_search_type") && localStorage.getItem("time_tasks_search_type")!='undefined'){
        this.search_type = localStorage.getItem("time_tasks_search_type") ;
      }
      this.searchType(this.search_type);
    }
  };
</script>
<style>
  .timing-border {
    border-bottom: 1px solid #b3b3b3;
    padding-bottom: 5px;
  }
</style>
