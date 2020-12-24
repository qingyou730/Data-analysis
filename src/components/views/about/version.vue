<template>
  <div :style="'height:'+(this.clientHeight - 145)+'px'">
    <el-row style="height: 100%;margin: 0 auto;">
      <el-col :span="4" style="height: 100%;background-color: #E8E8E8;margin-right: 10px;border-radius: 6px;padding: 15px;">
        <h2 style="color:#0E73FF;font-weight: bold;">版本迭代</h2>
        <p style="text-indent: 2em;line-height: 30px;cursor: pointer;" v-for="(row,index) in data" :key="row.id" @click="setData(row,false)">{{row.version_num}}{{index==0 ? "（最新）":''}}</p>
        <p style="text-indent: 2em;line-height: 30px;cursor: pointer;" @click="setData({},true)">版本1.0.0</p>
      </el-col>
      <el-col :span="15" style="height: 100%;border: 1px solid #E8E8E8 ;padding: 15px;">
        <template v-if="isFirst">
           <h4>上线时间：2020年8月27日</h4>
           <p style="text-indent:2em">使用手册参考文档: <a target="_blank" href="https://alidocs.dingtalk.com/document/edit?dentryKey=RBZ3WEnxlSk1xxoN">https://alidocs.dingtalk.com/document/edit?dentryKey=RBZ3WEnxlSk1xxoN</a></p>
        </template>
        <template v-else>
           <h4>上线时间：{{formatDate(detail.online_time)}}</h4>
          <el-row v-if="detail.features && detail.features.length>0">
            <h4>新增功能:</h4>
            <p style="text-indent:2em" :key="index" v-for="(row,index) in detail.features">{{index+1}}.{{row}}</p>
          </el-row>
          <el-row v-if="detail.optimizes && detail.optimizes.length>0">
            <h4>功能优化:</h4>
            <p style="text-indent:2em" :key="index" v-for="(row,index) in detail.optimizes">{{index+1}}.{{row}}</p>
          </el-row>
          <el-row v-if="detail.bugfixs && detail.bugfixs.length>0">
            <h4>历史bug修复:</h4>
            <p style="text-indent:2em" :key="index" v-for="(row,index) in detail.bugfixs">{{index+1}}.{{row}}</p>
          </el-row>
        </template>
      </el-col>
      <el-col :span="4"></el-col>
    </el-row>
  </div>
</template>
<script>
  // import menuPermission from "./menu_permission.vue"
  export default {
    components: {
      // menuPermission
    },
    data() {
      return {
        isFirst: true,
        clientHeight: 100,
        loading: true,
        page: 1,
        page_size: 20,
        data: [],
        detail: {}, //右侧详情
      }
    },
    methods: {
      /**
       * 格式化上线时间
       */
      formatDate:function(t){
        var timestamp =  new Date(t);
        return timestamp.Format("yyyy年MM月dd日");
      },
      getData: function() {
        this.loading = true;
        let url = this.$store.state.api_url.version.list;
        var param = {
          "page": this.page,
          "page_size": 10000,
        }
        param = this.$generateParams(param);
        this.axios.post(url, param).then((response) => {
          let data = response.data
          this.loading = false;
          if (data.code == 200) {
            if (data.hasOwnProperty('data') && data.data.hasOwnProperty('hits')) {
              this.total = data.data.total_hits;
              this.data = data.data.hits;
              if (this.data.length > 0) {
                this.detail = this.data[0];
                this.isFirst = false;
              }
            } else {
              this.total = 0;
              this.data = [];
            }
          } else {
            this.$error(data.msg);
          }
        }).catch((error) => {
          this.loading = false;
          console.log(error);
          this.$error("接口请求失败");
        });
      },
      //点击某个版本号设置右侧内容
      setData: function(detail, isFirst) {
        this.detail = detail;
        this.isFirst = isFirst;
      },
    },
    created() {},
    mounted() {
      this.getData();
      var html = document.documentElement;
      var clientHeight = html.clientHeight;
      this.clientHeight = clientHeight;
    }
  }
</script>
