<template>
  <div>
    <div style="display: inline-block;width: 100%;">
      <span style="margin:0 10px 0 9px;">事件文档</span>
        <el-select v-model="event_id" @change="setData($event)"  filterable>
          <el-option  :key="index" v-for="(item,index) in event_list" :label="item.name" :value="item.id"></el-option>
        </el-select>
    </div>
    <table class="table table-bordered" v-loading="loading">
      <thead>
        <tr>
          <th>字段</th>
          <th>字段真实位置</th>
          <th>描述</th>
          <th>类型</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in public_attr_list" :key="'public'+index">
          <td>{{ item.id }}</td>
          <td>{{ item.realValue}}</td>
          <td>{{ item.name}}</td>
          <td>公共属性</td>
        </tr>
        <tr v-for="(item, index) in data " :key="'privite'+index">
          <td>{{ item.id }}</td>
          <td>{{ item.realValue}}</td>
          <td>{{ item.name}}</td>
          <td>私有属性</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        data:[],
        event_list: [],
        totalPage: 0,
        totalData: 0,
        currentPage: 1,
        pageSize: 10,
        tableData: [],
        event_id: "",
        loading: true,
        public_attr_list:[],
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
        "search_type": "self"
      };
    },
    methods: {
      setData:function(event_id){
        for(var v of this.event_list){
          if(v.id == event_id){
            this.data = v.attrList ;
            this.$count('MODEL','EVENT_DOCUMENT',{event_id:v.id,event_name:v.name});//打点统计
            break;
          }
        }
      },
      linkSetData() {
        if(this.$route.query.event_id) {
          this.event_id = this.$route.query.event_id;
          this.$store.commit('changeEventPage', this.$route.query.page);
        }
        for(var v of this.event_list){
          if(v.id == this.event_id){
            this.data = v.attrList ;
            this.$count('MODEL','EVENT_DOCUMENT',{event_id:v.id,event_name:v.name});//打点统计
            break;
          }
        }
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
        var event_attr_url = this.$store.state.api_url.task.event_attr;
        var param = this.$generateParams();
        this.axios.post(event_attr_url, param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            this.event_list = data.data.eventMappingList;
            this.public_attr_list = data.data.publicMappingList ;
            // this.event_id = this.event_list[0]["id"] ;
            // this.setData(this.event_id);
          } else {
            console.log("数据加载失败");
          }
          this.loading = false;
        }).catch((errors) => {
          this.loading = false;
          console.log(errors);
          console.log("数据加载失败");
        })
      },
    },
    mounted() {
      this.getData();
      this.linkSetData();
    },
  };
</script>
