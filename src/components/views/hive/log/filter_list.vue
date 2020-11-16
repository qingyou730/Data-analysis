<template>
  <div>
    <div style="display: inline-block;width: 100%;">
      <span style="margin:0 10px 0 9px;">游戏日志过滤-任务列表</span>
        <el-input @input="getData(true)" v-model="q" placeholder="输入关键字搜索" clearable suffix-icon="el-icon-search"
        style="width: 200px;margin-right: 20px;" />
      <el-select v-model="search_type" @change="searchType($event)">
        <el-option label="所有人" value="all"></el-option>
        <el-option label="部门" value="department"></el-option>
        <el-option label="仅自己" value="self"></el-option>
      </el-select>
      <router-link to="/hive/log/filter_add" v-if="$access('/hive/log/filter_add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </div>

    <table class="table table-bordered" v-loading="loading">
      <thead>
        <tr>
          <th>任务ID</th>
          <th>任务名称</th>
          <th>状态</th>
          <th>创建人</th>
          <th>创建时间</th>
          <th>任务开始调度时间</th>
          <th>任务完成时间</th>
          <th>执行花费时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>
            {{item.id}}
          </td>
          <td>{{ item.name}}</td>
          <td><font :color="status_list[item.status].color">{{status_list[item.status].title}}</font></td>
          <td>{{  $store.state.user_list.hasOwnProperty(item.creator) ? $store.state.user_list[item.creator] :  item.creator}}</td>
          <td>{{ $tools.formatTime(item.create_time)}}</td>
          <td>{{ $tools.formatTime(item.schedule_time)}}</td>
          <td>{{ $tools.formatTime(item.finish_time)}}</td>
          <td>{{ item.elapsed}}</td>
          <td>
            <router-link :to="'/hive/log/filter_add?task_id='+item.id"><el-button type="text" size="mini">查看</el-button></router-link>
            <a v-if="item.status =='SUCCESS'" :href="$store.state.api_url.task.get_file + '?path=' + item.download_path "><el-button type="text" size="mini">下载</el-button></a>
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
        dir: '/',
        totalPage: 0,
        totalData: 0,
        currentPage: 1,
        pageSize: 10,
        tableData: [],
        search: "",
        loading: true,
        status_list: {
          'SUCCESS': {
            title: "成功",
            color: "#3e8fff"
          },
          'FAILED': {
            title: "失败",
            color: "red"
          },
          'ACCEPTED': {
            title: "等待调度",
            color: "#A6A9AD"
          },
          'RUNNING': {
            title: "正在运行",
            color: "#A6A9AD"
          },
          'CANCELED': {
            title: "已取消",
            color: "red"
          },
        },
        "filter_type": "user",
        "filter_value": "all",
        "search_type": "self",
      };
    },
    methods: {
      getData(resetPage) {
        if(resetPage){
          this.currentPage = 1 ;
        }
        this.loading = true;
        let requestUrl = this.$store.state.api_url.hdfs.hdfs_log_list;
        let data = {
          page_size: this.pageSize,
          page: this.currentPage,
          'keyword':this.q,
          "filter_type": this.filter_type,
          "filter_value": this.filter_value,
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
        localStorage.setItem("log_filter__list_search_type",type);
        this.getData();
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
    },
    mounted() {
      if(localStorage.getItem("log_filter__list_search_type") && localStorage.getItem("log_filter__list_search_type")!='undefined'){
        this.search_type = localStorage.getItem("log_filter__list_search_type") ;
      }
      this.searchType(this.search_type);
    },

  };
</script>
