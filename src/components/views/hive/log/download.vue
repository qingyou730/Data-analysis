<template>
  <div>
    <el-row class="page-titie-box">
      游戏日志下载
    </el-row>
    <el-row>
      <span style="display: inline-block; margin-left:20px">日志类型： </span>
      <el-select v-model="logValue" placeholder="请选择" multiple >
            <el-option
                v-for="item in logOptions"
                :key="item"
                :label="item"
                :value="item">
            </el-option>
        </el-select>
        <span style="display: inline-block; margin-left:20px">查询时间： </span>
        <div style="display: inline-block">
            <el-date-picker
                v-model="logDate"
                type="datetimerange"
                range-separator="至"
                format="yyyy-MM-dd HH"
                start-placeholder="开始时间"
                end-placeholder="结束时间">
            </el-date-picker>
        </div>
        <span style="display: inline-block; margin-left:20px">IP： </span>
        <el-input v-model="ipValue" placeholder="请输入服务器内网ip，多个英文逗号分隔" style="width:350px"></el-input>

        <!-- <span style="display: inline-block; margin-left:20px">关键词： </span>
        <el-input v-model="keyWord" placeholder="请输入关键词" style="width:200px"></el-input> -->
        <span style="display: inline-block; margin-left:60px"> </span>
        <el-button size="small" type="primary" @click="searchRes">搜索</el-button>
    </el-row>
    <table class="table table-bordered" >
      <thead>
        <tr>
          <th>name</th>
          <th>大小</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>
          {{ item.name}}
            <!-- <a v-if="item.parent" href="javascript:;" @click="listDir(item.uri)">{{ item.name}} </a> -->
            <!-- <a v-if="!item.parent" :href="$store.state.api_url.task.get_file + '?path=' + encodeURIComponent(item.uri)" >{{ item.name}} </a> -->
          </td>
          <td>{{ item.length_M}}</td>
          <td>
            <a :href="$store.state.api_url.task.get_file + '?path=' + encodeURIComponent(item.uri)">下载</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { Loading } from 'element-ui';
Date.prototype.Format = function (fmt) {
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "H+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
  export default {
    data() {
      return {
        logValue: '',
        logOptions: [],
        logDate: '',
        ipValue: "",
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
        loadingInstanceDownlog: null,
      };
    },
    methods: {
        datedifference(sDate1, sDate2) {
            var dateSpan, tempDate, iDays;
            sDate1 = Date.parse(sDate1);
            sDate2 = Date.parse(sDate2);
            dateSpan = sDate2 - sDate1;
            dateSpan = Math.abs(dateSpan);
            iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
            return iDays;
        },
        searchRes() {
            if(!this.logValue.length >= 1) {
                this.$error('请选择日志类型');
                return;
            }
            if(this.logDate.length<1) {
                this.$error('请选择时间范围');
                return;
            }
            if(!this.ipValue) {
                this.$error('请输入ip');
                return;
            }
            var start = new Date(this.logDate[0]).getTime();
            var end = new Date(this.logDate[1]).getTime();
            var timeRange = 24*60*60*1000;
            var paramDate = [];
            if(end - start >timeRange ) {
                this.$error('时间范围不能大于24小时');
                end = start + timeRange;
                this.$set(this.logDate,1, new Date(end))
                paramDate[0] = new Date(start).Format('yyyyMMddHH');
                paramDate[1] = new Date(end).Format('yyyyMMddHH');
                return;
            }else{
                paramDate[0] = new Date(start).Format('yyyyMMddHH');
                paramDate[1] = new Date(end).Format('yyyyMMddHH');
            }
            let requestUrl = this.$store.state.api_url.heightAnalysis.gameLogdownloadSearch;
            let data = {
                start_time: paramDate[0],
                end_time: paramDate[1],
                ip: this.ipValue,
                type: this.logValue,
            };

            let requestData = this.$generateParams(data);
            this.loadingInstanceDownlog = Loading.service({ fullscreen: true });//开启加载
            this.axios.post(requestUrl, requestData).then(rep => {
            if (rep.data.code == 200) {
                this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                  this.loadingInstanceDownlog.close();
                });
                this.tableData = rep.data.data;
                if(this.tableData.length == 0) {
                    this.$success('暂无数据')
                }                   
            } else {
              this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                this.loadingInstanceDownlog.close();
              });
              this.$error(rep.data.msg);
            }
            })
            .catch((error) => {

                this.loading = false;
                console.log(error);
            });
        },

        getOptions(){
            let requestUrl = this.$store.state.api_url.heightAnalysis.logType;
            this.axios.post(requestUrl).then(rep => {
            if (rep.data.code == 200) {
                this.logOptions = rep.data.data.type_list;
            } else {
                this.$error(rep.data.msg);
            }
            })
            .catch((error) => {
                this.loading = false;
                console.log(error);
            });
        },



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
          this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            this.loadingInstanceDownlog.close();
          });
          this.loading = false;
          console.log(error);
        });
      },
    },
    mounted() {
    //   this.getData();
      this.getOptions();
    },
    destroyed() {
      this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
        this.loadingInstanceDownlog.close();
      });
    },

  };
</script>
