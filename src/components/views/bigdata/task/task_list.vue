<template>
  <div>
    <div style="display: inline-block;width: 100%;">
      <span style="margin:0 10px 0 9px;"> 引擎类型 :</span>
      <el-select v-model="engines" clearable multiple collapse-tags @change="getData(true)">
        <el-option v-for="v in engines_list" :key="v" :label="v" :value="v"></el-option>
      </el-select>
      <span style="margin:0 10px 0 9px;"> 任务状态 :</span>
      <el-select v-model="status" clearable multiple collapse-tags @change="getData(true)">
        <el-option v-for="v in status_list" :key="v" :label="v" :value="v"></el-option>
      </el-select>
      <span style="margin:0 10px 0 9px;"> 标签 :</span>
      <el-select v-model="tags" clearable multiple collapse-tags filterable @change="getData(true)" style="width: 300px;">
        <el-option v-for="v in tag_list" :key="v.id" :label="v.name" :value="v.id"></el-option>
      </el-select>
      <span style="margin:0 10px 0 9px;"> 配置ID :</span>
      <el-input v-model="conf_id" placeholder="配置ID多个请用英文逗号隔开" @input="getData(true)" clearable style="width: 300px;margin-right: 20px;" />

    </div>
    <table class="table table-bordered" v-loading="loading">
      <thead>
        <tr>
          <th>任务ID</th>
          <th>配置ID</th>
          <th>任务名称</th>
          <th>参数</th>
          <th>提交时间</th>
          <th>允许运行时间</th>
          <th>运行时间</th>
          <th>优先级</th>
          <th>花费时长</th>
          <th>引擎</th>
          <th>重试次数</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>{{ item.job_id}}</td>
          <td>{{ item.conf_id}}</td>
          <td>{{ item.describe}}</td>
          <td><span class="text-length"  :title="JSON.stringify(item.args)">{{ item.args}}</span></td>
          <td>{{ item.created_time}}</td>

          <td>{{ item.allowed_time}}</td>
          <td>{{ item.running_time}}</td>
          <td>{{ item.priority}}</td>

          <td>{{ item.cost_time}}</td>
          <td>{{ item.engine}}</td>
          <td>{{ item.failed_count}}</td>
          <td>
            <a :href="'/job/get_job_yarn_logs?job_id='+item.job_id" >
              <el-button type="text" size="mini">下载日志</el-button>
            </a>
            <el-button type="text" size="mini">优先运行</el-button>
            <el-button type="text" size="mini">重试</el-button>
            <el-button type="text" size="mini">废弃</el-button>
            <el-button type="text" size="mini">KILL</el-button>
          </td>
        </tr>
      </tbody>
    </table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
      :page-sizes="[2,5,10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalData"></el-pagination>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        conf_id: '',
        engines: [],
        status: [],
        tags: [],

        engines_list: ['PY_SPARK', 'SPARK', 'MAP_REDUCE', 'TEZ', 'SHELL', 'JAVA', 'PYTHON', 'WORK_FLOW'],
        status_list: ['ACCEPTED', 'PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED', 'KILLED'],
        tag_list: [],
        dir: '/',
        totalPage: 0,
        totalData: 0,
        currentPage: 1,
        pageSize: 10,
        tableData: [],
        search: "",
        loading: true,
        "filter_type": "user",
        "filter_value": "all",
        "search_type": "self",
      };
    },
    methods: {
      getTagList: function() {
        var requestUrl = this.$store.state.api_url.job.tag_list;
        let requestData = this.$generateParams({});
        this.axios.post(requestUrl, requestData).then(rep => {
            if (rep.data.code == 200) {
              this.tag_list = rep.data.data;
            } else {
              this.$error(rep.data.msg);
            }
          })
          .catch((error) => {
            this.loading = false;
            console.log(error);
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
      getData() {
        this.loading = true;
        let requestUrl = this.$store.state.api_url.job.task_list;
        let data = {
          page_size: this.pageSize,
          page: this.currentPage,
          engines: this.engines,
          status: this.status,
          conf_id: this.conf_id ? this.conf_id.split(',') : [],
          tags: this.tags,
        };
        let requestData = data;
        this.axios.post(requestUrl, requestData).then(rep => {
            this.loading = false;
            if (rep.data.code == 200) {
              if (rep.data.code == 200) {
                this.tableData = rep.data.data.hits;
                this.totalData = rep.data.data.total_hits;
                this.totalPage = rep.data.data.total_page;
              } else {
                this.$error(rep.data.msg);
              }
            } else {
              this.$error(rep.data.msg);
            }
          })
          .catch((error) => {
            this.loading = false;
            console.log(error);
          });
      },
    },
    mounted() {
      this.getTagList();
      this.getData();
    },

  };
</script>
