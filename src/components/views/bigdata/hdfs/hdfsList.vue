<template>
  <div>
    <el-row class="page-titie-box">
      HDFS管理
    </el-row>
    <el-row>
      <el-button type="primary" icon="el-icon-top"  @click="parentDir">上一级</el-button>
      <el-input v-model="dir" style="width: 400px;"><template slot="prepend">目录</template></el-input>
      <el-button type="primary" icon="el-icon-search" @click="listDir(dir)"></el-button>
    </el-row>
    <table class="table table-bordered" v-loading="loading">
      <thead>
        <tr>
          <th>name</th>
          <th>大小 
            <i class="el-icon-caret-bottom" style="margin: 0 5px;font-size:16px;cursor:pointer" @click="sortBig"></i>
            <i class="el-icon-caret-top" style="margin: 0 5px;font-size:16px;cursor:pointer" @click="sortSmall"></i>
            </th>
          <th>副本数</th>
          <th>最后修改时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>
            <a v-if="item.parent" href="javascript:;" @click="listDir(item.uri)">{{ item.name}} </a>
            <a v-if="!item.parent" :href="$store.state.api_url.task.get_file + '?path=' + encodeURIComponent(item.uri)" >{{ item.name}} </a>
          </td>
          <td>{{ item.length_M}}</td>
          <td>{{ item.replication}}</td>
          <td>{{ $tools.formatTime(item.modified_time) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
  export default {
    data() {
      return {
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
      /**
       * 上一层
       */
      parentDir:function(){
        if(this.dir == '/' || !this.dir){
          return ;
        }
        if(this.dir.lastIndexOf('/') == this.dir.length-1){
          this.dir=this.dir.substring(0, this.dir.lastIndexOf('/')) ;
        }
        var path_array = this.dir.split('/');
        if(path_array.length <=4){
          this.dir = '/';
          this.getData();
          return ;
        }
        this.dir=this.dir.substring(0, this.dir.lastIndexOf('/')) ;
        this.dir += '/';
        this.getData();
      },
      /**
       * 列出某个文件夹
       * @param {Object} dir
       */
      listDir: function(dir) {
        if(!dir){
          dir = '/';
        }
        this.dir = dir;
        this.getData();
      },
      sortSmall() {
        var arr = [];
        var firlen = 0;
        var length = this.tableData.length - 1;
        this.tableData.forEach((item, index)=>{
          if(item.length_M == '--') {
            arr[length--] = item;
          }else{
            arr[firlen++] = item;
          }
        });
        let newArr = arr.slice(0,firlen);
        newArr.sort((a, b) => {
          var reg = /^\d+(\.\d+)/;
          let aBig = 1;
          let bBig = 1;
          var num1 = a.length_M.match(reg);
          var num2 = b.length_M.match(reg);
          let aSize = '';
          let bSize = '';
          let amultiple = 1;
          let bmultiple = 1;
          if(num1) {
            let alength = num1[0].length;
            aSize = a.length_M.slice(alength);
            if(aSize == 'KB') {
              amultiple = amultiple * 1000;
            }
            if(aSize == 'MB') {
              amultiple = amultiple * 1000*1000;
            }
          }
          if(num2) {
            let blength = num2[0].length;
            bSize = b.length_M.slice(blength);
            if(bSize == 'KB') {
              bmultiple = bmultiple * 1000;
            }
            if(bSize == 'MB') {
              bmultiple = bmultiple * 1000*1000;
            }
          }
          console.log(num1, num2);
          if(num1 && num2) {
            console.log(num2[0]*bmultiple, num1[0]*amultiple);
            return  num2[0]*bmultiple - num1[0]*amultiple;
          }
          return 1;
        })
        console.log(newArr, 'newarr222');
        this.tableData = arr;
      },
      sortBig() {
        var arr = [];
        var firlen = 0;
        var length = this.tableData.length - 1;
        this.tableData.forEach((item, index)=>{
          if(item.length_M == '--') {
            arr[length--] = item;
          }else{
            arr[firlen++] = item;
          }
        });
        arr.sort((a, b) => {
          var reg = /^\d+(\.\d+)/;
          let aBig = 1;
          let bBig = 1;
          var num1 = a.length_M.match(reg);
          var num2 = b.length_M.match(reg);
          let aSize = '';
          let bSize = '';
          let amultiple = 1;
          let bmultiple = 1;
          if(num1) {
            let alength = num1[0].length;
            aSize = a.length_M.slice(alength);
            if(aSize == 'KB') {
              amultiple = amultiple * 1000;
            }
            if(aSize == 'MB') {
              amultiple = amultiple * 1000*1000;
            }
          }
          if(num2) {
            let blength = num2[0].length;
            bSize = b.length_M.slice(blength);
            if(bSize == 'KB') {
              bmultiple = bmultiple * 1000;
            }
            if(bSize == 'MB') {
              bmultiple = bmultiple * 1000*1000;
            }
          }

          if(num1 && num2) {
            return parseFloat(num1[0])*amultiple - parseFloat(num2[0])*bmultiple;
          }
          return -1;
        })
        this.tableData = arr;
      },
      getData() {
        this.loading = true;
        let requestUrl = this.$store.state.api_url.hdfs.list;
        let data = {
          dir: this.dir,
        };
        let requestData = this.$generateParams(data);
        this.axios.post(requestUrl, requestData).then(rep => {
          this.loading = false;
          if (rep.data.code == 200) {
            this.tableData = rep.data.data;
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
      this.getData();
    },

  };
</script>
