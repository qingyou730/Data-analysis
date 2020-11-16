<template>
  <div>
    <div style="display: inline-block;width: 100%;">
      <span style="margin:0 10px 0 9px;">我的分析</span>
        <el-input @input="getData(true)" v-model="q" placeholder="输入关键字搜索" clearable suffix-icon="el-icon-search"
        style="width: 200px;margin-right: 20px;" />
      <el-select v-model="search_type" @change="searchType($event,true)">
        <el-option label="所有人" value="all"></el-option>
        <el-option label="部门" value="department"></el-option>
        <el-option label="仅自己" value="self"></el-option>
      </el-select>
    </div>
    <table class="table table-bordered" v-loading="loading" >
      <thead>
        <tr>
          <th>任务ID</th>
          <th>任务名称</th>
          <th>模型</th>
          <th>状态</th>
          <th>创建时间</th>
          <th>创建人</th>
          <th>任务开始调度时间</th>
          <th>任务完成时间</th>
          <th>执行花费时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>{{ item.task_id}}</td>
          <td>
            <span class="text-length"  :title="item.task_name">{{ item.task_name ? item.task_name : '--'}}</span>
          </td>
          <td>{{ item.model_name}}</td>
          <td><font :color="status_list[item.status].color">{{status_list[item.status].title}}</font></td>
          <td>{{ $tools.formatTime(item.submit_time)}}</td>
          <td>{{ $store.state.user_list.hasOwnProperty(item.create_role) ? $store.state.user_list[item.create_role] :  item.create_role}}</td>
          <td>{{ $tools.formatTime(item.schedule_time)}}</td>
          <td>{{ $tools.formatTime(item.finish_time)}}</td>
          <td>{{ item.elapsed}}</td>
          <td>
            <el-button type="text" size="mini" @click='limitJump(item, index)'>查看</el-button>
            <el-button v-if="item.status=='ACCEPTED' || item.status=='RUNNING'" type="text" size="mini" @click="cancel(item)">取消任务</el-button>
            <el-button v-if="search_type == 'self'" type="text" size="mini" @click="deleteItem(item, index)">删除</el-button>
            <template>
              <span style='margin-left:3px; display: inline-block; color: rgba(48, 45, 45, 0.72);' v-if="!item.is_private&&search_type == 'self'">
                <i class="fa fa-dot-circle-o" aria-hidden="true" style="cursor: pointer;"  @click="openLimit(item, index)"> 仅自己查看</i>
              </span>
              <span style='margin-left:3px; display: inline-block; color: #0d68e6;' v-if="item.is_private && search_type == 'self'">
                <i class="fa fa-dot-circle-o" aria-hidden="true" style="cursor: pointer;"  @click="openLimit(item, index)"> 仅自己查看</i>
              </span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalData"></el-pagination>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        q:'',
        totalPage: 0,
        totalData: 0,
        currentPage: 1,
        pageSize: 10,
        tableData: [],
        search: "",
        loading: true,
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
      };
    },
    created:function(){
      if(this.$route.query.page){
        this.currentPage = parseInt(this.$route.query.page) ;
      }
    },
    methods: {
      limitJump(item, index) {//权限跳转
        var itemUser = item.create_role;
        var user = this.$store.state.user.user_id;
        if(!item.is_private) {
          this.$router.push('/analysis/model/taskDetail?type=task&task_id=' +item.task_id);
        }else{
          if(itemUser == user) {
            this.$router.push('/analysis/model/taskDetail?type=task&task_id=' +item.task_id);
          }else{
            this.$box('没有访问该视图的权限，请获取权限后尝试');
          }
        }

      },
      deleteItem(item, index) {//删除操作
      this.$confirm('此操作将永久删除该数据,不可恢复, 是否继续?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          this.$count('MODEL','DROP_TASK',{'task_id':item.task_id,type:1});//打点统计
          let url = this.$store.state.api_url.task.delete_task;
          var deleteParam = {
            task_id: item.task_id,
          }
          deleteParam = this.$generateParams(deleteParam);
          this.axios.post(url, deleteParam).then((res) => {
            var data = res.data;
            if (data.code == 200) {
              this.$success("删除成功");
              this.tableData.splice(index, 1);
            } else {
              this.$error("删除失败1");
            }
          }).catch((err) => {
            console.log(err, 'err');
            this.$error("删除失败2")
          });
        }).catch(() => {
          this.$count('MODEL','DROP_TASK',{'task_id':item.task_id,type:0});//打点统计
          console.log("删除取消");
        });
      },
      openLimit(item, index) {//权限
        this.$confirm(`确定${item.is_private?'取消':'设置'}仅自己查看功能?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          this.$count('MODEL','SELF_TASK',{'task_id':item.task_id,type:1});//打点统计
          let url = this.$store.state.api_url.task.is_private;
          var deleteParam = {
            task_id: item.task_id,
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
          this.$count('MODEL','SELF_TASK',{'task_id':item.task_id,type:0});//打点统计
          console.log("取消设置");
        });
      },
      searchType:function(type ,resetPage){
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
        localStorage.setItem("analysis_list_search_type",type);
        this.getData(resetPage);
      },
      /**
       * @param {Object} task
       * 取消任务
       */
      cancel(task) {
        this.$confirm('确定取消任务吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          var url = this.$store.state.api_url.task.kill_task;
          var param = this.$generateParams({
            task_id: task.task_id
          });
          this.axios.post(url, param).then((res) => {
            var data = res.data;
            if (data.code == 200) {
              this.getData();
              this.$success("取消成功");
            } else {
              this.$error("取消失败1");
            }
          }).catch(() => {
            this.$error("取消失败2")
          });
        }).catch((e) => {
          console.log(e);
          console.log("取消1");
        });
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
      // 当前页
      handleCurrentChange(val) {
        this.$router.push({path:"/analysis/task/list",query:{page:val}});
      },
      getData(resetPage) {
        if(resetPage){
          this.currentPage = 1 ;
        }
        this.loading = true;
        let requestUrl = "/mmp/task/find_tasks";
        let data = {
          page_size: this.pageSize,
          page: this.currentPage,
          object: "role",
          "filter_type": this.filter_type,
          "filter_value": this.filter_value,
          keyword:this.q,
        };
        let requestData = this.$generateParams(data);
        this.axios
          .post(requestUrl, requestData)
          .then(rep => {
            this.loading = false;
            if(rep.data.code ==  200){
              this.tableData = rep.data.data.hits;
              this.totalData = rep.data.data.total_hits;
              this.totalPage = rep.data.data.total_page;
            }else{
              this.$error(rep.data.msg);
            }
          })
          .catch((error)=> {
            this.loading = false;
            console.log(error);
          });
      },
    },
    mounted() {
      if(localStorage.getItem("analysis_list_search_type") && localStorage.getItem("analysis_list_search_type")!='undefined'){
        this.search_type = localStorage.getItem("analysis_list_search_type") ;
      }
      this.searchType(this.search_type);
    },

  };
</script>
