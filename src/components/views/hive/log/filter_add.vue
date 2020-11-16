<template>
  <el-row class="gray-container">
    <h2 class="page-title">游戏日志过滤-添加任务</h2>
    <el-row class="step_row" style="height: 800%;">
      <div class="my-form-row">
        <span class="my-form-label">日志类型 :</span>
        <div style="display: inline-block;">
          <el-select v-model="log_type"   clearable style="width: 200px;">
            <el-option v-for="v in log_type_list" :key="v" :label="v" :value="v" ></el-option>
          </el-select>
        </div>
      </div>
      <div class="my-form-row">
        <span class="my-form-label">时间范围 :</span>
        <div style="display: inline-block;">
          <el-date-picker
            style="width: 140px;"
            v-model="date"
            type="date"
            value-format="yyyyMMdd"
            :clearable="false"
            >
          </el-date-picker>
          <el-select style="width: 80px;" v-model="start">
            <el-option :key="hour" v-for="hour in option"  :value="hour" :label="hour"></el-option>
          </el-select>
          ~
          <el-select style="width: 80px;" v-model="end">
            <el-option :key="hour" v-for="hour in option"  :value="hour" :label="hour"></el-option>
          </el-select>
        </div>
      </div>
      <div class="my-form-row">
        <span class="my-form-label">IP地址 :</span>
        <div style="display: inline-block;">
          <el-input style="width: 200px;" v-model="ip" placeholder="请输入内网IP地址,多个用英文逗号隔开"></el-input>
        </div>
      </div>
      <div class="my-form-row">
        <span class="my-form-label">关键词 :</span>
        <div style="display: inline-block;">
         <keyword-tree :parent="keywords" :children="keywords.children"
           :logic_op="keywords.logic_op" :add_keyword="add_keyword" :children_num="keywords.children.length" >
         </keyword-tree>
        </div>
      </div>

      <div class="my-form-row">
        <span class="my-form-label">任务名称 :</span>
        <div style="display: inline-block;">
          <el-input style="width: 200px;" v-model="name" placeholder="请输入任务名称"></el-input>
        </div>
      </div>
      <div class="my-form-row">
        <span class="my-form-label"> </span>
        <div style="display: inline-block;">
          <el-button type="primary" @click="submit">提交任务</el-button>
        </div>
      </div>

    </el-row>

  </el-row>
</template>
<script>
  import keywordTree from './keyword_tree';
  export default {
    components: {
      keywordTree,
    },
    data() {
      return {
        name:'',
        ip:'',
        log_type_list: '',
        log_type:[] ,
        time_range:[],
        date:'' ,
        start:'00',
        end:'23',
        option:['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'] ,
        keywords:{
          id:0,
          logic_op:'AND',
          "level":0,
          children:[
            {
              "fid": 0 ,
              'logic_op': 'AND',
              'group_type': 'attr',
              "level":1,
              "id": this.$store.state.id_count++,
              'value': '',
              "children": [],
            }
          ],
        }
      }
    },
    methods: {
      /**
       * 删除某个关键词
       * @param {Object} index
       */
      removeKeyword:function(index){
        this.keywords.splice(index,1) ;
      },
      /**
       * 添加关键词
       */
      addKeyword:function(){
        this.keywords.push({"value":""});
      },
      /**
       * 修改关键词逻辑关系
       */
      change_logic_op:function(){
        if(this.logic_op == 'AND'){
          this.logic_op = 'OR';
        }else{
           this.logic_op = 'AND';
        }
      },
      /**
       * 获取日志类型列表
       */
      getTypeList: function() {
        var requestUrl = this.$store.state.api_url.hdfs.log_type;
        let requestData = this.$generateParams({});
        this.axios.post(requestUrl, requestData).then(rep => {
          if (rep.data.code == 200) {
            this.log_type_list = rep.data.data.type_list ;
            this.log_type =  this.log_type_list[0]
          } else {
            this.$error(rep.data.msg);
          }
        })
        .catch((error) => {
          this.loading = false;
          console.log(error);
        });
      },
      submit:function(){
        var param = this.$tools.makeSubmitParam.keywords(this.keywords);
        if (!param.status) {
          this.$error(param.message);
          return;
        } else {
          var  keywords = JSON.stringify(param.value) ;
        }
        if(!this.name){
          this.$error("请输入任务名称");
          return ;
        }
        if(!this.log_type){
          this.$error("请选择日志类型");
          return ;
        }
        if(parseInt(this.start) > parseInt(this.end)){
          this.$error("开始时间不能大于结束时间");
          return ;
        }
        var web_params = {
          date:this.date,
          start:this.start,
          end:this.end,
          name:this.name,
          log_type:this.log_type,
          logic_op:this.logic_op ,
          keywords:this.keywords,
          ip:this.ip,
        }
        var param = {
          "start_time": this.date + this.start,
          "end_time":   this.date + this.end,
          "name":this.name,
          "type":[this.log_type],
          "logic_op":this.logic_op,
          "ip":this.ip,
          "keyword":keywords,
          "web_params":JSON.stringify(web_params),
        }
        var param = this.$generateParams(param) ;
        var requestUrl = this.$store.state.api_url.hdfs.add_log_filter;
        this.axios.post(requestUrl, param).then(rep => {
          if (rep.data.code == 200) {
            this.$success("操作成功");
            this.$router.push({'path':'/hive/log/filter_list'});
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
       * @param {Object} node
       * @param {Object} group_type
       * 添加关键词
       */
      add_keyword: function(node ,group_type ) {
        var keyword = {
          "fid": node.id,
          'logic_op': 'AND',
          'group_type': group_type,
          "level": node.level + 1,
          "id": this.$store.state.id_count++,
          'value': '',
          "children": [],
        };
        if (group_type  == 'logic_group') { //如果是公式或者逻辑组 给他加俩子属性
          this.add_keyword(keyword, 'attr');
          this.add_keyword(keyword, 'attr');
        }
        node.children.push(keyword);
      },
      /**
       * 获取详情
       */
      getDetail:function(){
        var param = {
          "task_id":this.$route.query.task_id,
        }
        var param = this.$generateParams(param) ;
        var requestUrl = this.$store.state.api_url.hdfs.detail;
        this.axios.post(requestUrl, param).then(rep => {
          if (rep.data.code == 200) {
            var web_params =  JSON.parse(rep.data.data.web_params);

            this.date = web_params.date ;
            this.start =  web_params.start ;
            this.end =  web_params.end ;
            this.name =  web_params.name ;
            this.log_type =  web_params.log_type ;
            this.logic_op  =  web_params.logic_op ;
            this.keywords =  web_params.keywords ;
            this.ip =  web_params.ip ;


          } else {
            this.$error(rep.data.msg);
          }
        })
        .catch((error) => {
          this.loading = false;
          this.$error("该数据参数错误无法查看参数");
          console.log(error);
        });
      },
    },
    mounted() {
      this.getTypeList();
      if(this.$route.query.task_id){
        this.getDetail() ; //如果是编辑 获取详情
      }else{
        var  now = new Date();
        var  now  =   new Date(now.getTime()-86400*1000) ;
        this.date = now.Format('yyyyMMdd') ;
      }
    },

  };
</script>
