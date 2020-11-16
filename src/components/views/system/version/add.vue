<template>
  <el-form label-width="150px">
    <el-form-item label="版本号 : ">
      <el-input v-model="version_num" placeholder="请输入版本号" style="width:400px;"></el-input>
    </el-form-item>
    <el-form-item label="上线时间 : ">
       <el-date-picker
            v-model="online_time"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择上线时间">
          </el-date-picker>
    </el-form-item>

    <template v-for="(row,index) in features">
      <el-form-item :key="'features'+index"  v-if="index==0" label="新增功能 : ">
        {{index+1}}.<el-input v-model="row.value" placeholder="请输入新增功能" style="width:400px;"></el-input>
          <el-button @click="addRow(features)" type="primary" circle icon="el-icon-plus" size="mini"></el-button>
      </el-form-item>
      <el-form-item :key="'features'+index"  v-else label="">
        {{index+1}}.<el-input v-model="row.value" placeholder="请输入新增功能" style="width:400px;"></el-input>
        <el-button @click="removeRow(features)" type="primary" circle icon="el-icon-minus" size="mini"></el-button>
      </el-form-item>
    </template>


    <template v-for="(row,index) in optimizes">
      <el-form-item :key="'optimizes'+index"  v-if="index==0" label="功能优化 : ">
        {{index+1}}.<el-input v-model="row.value" placeholder="请输入功能优化" style="width:400px;"></el-input>
          <el-button @click="addRow(optimizes)" type="primary" circle icon="el-icon-plus" size="mini"></el-button>
      </el-form-item>
      <el-form-item :key="'optimizes'+index"  v-else label="">
        {{index+1}}.<el-input v-model="row.value" placeholder="请输入功能优化" style="width:400px;"></el-input>
        <el-button @click="removeRow(optimizes)" type="primary" circle icon="el-icon-minus" size="mini"></el-button>
      </el-form-item>
    </template>


    <template v-for="(row,index) in bugfixs">
      <el-form-item :key="'bugfixs'+index"  v-if="index==0" label="历史bug修复 : ">
        {{index+1}}.<el-input v-model="row.value" placeholder="请输入历史bug修复" style="width:400px;"></el-input>
          <el-button @click="addRow(bugfixs)" type="primary" circle icon="el-icon-plus" size="mini"></el-button>
      </el-form-item>
      <el-form-item :key="'bugfixs'+index"  v-else label="">
        {{index+1}}.<el-input v-model="row.value" placeholder="请输入历史bug修复" style="width:400px;"></el-input>
        <el-button @click="removeRow(bugfixs)" type="primary" circle icon="el-icon-minus" size="mini"></el-button>
      </el-form-item>
    </template>








    <el-form-item>
      <el-button type="primary" @click="onSubmit">保存</el-button>
      <el-button @click="goList">返回</el-button>
    </el-form-item>

  </el-form>

</template>

<script>
  // var rounter_options =  wrouter.options.routes
  export default {
    data() {
      return {
        "version_num": "",
        //新增功能、功能优化、历史bug修复
        "features": [{"value":""}],
        "bugfixs": [{"value":""}],
        "optimizes":[{"value":""}],
        "sort":0 ,
        "online_time":"" ,// 上线时间
        "id":"" ,
      }
    },
    created() {},
    mounted() {
      if(this.$route.query.id){
        this.id = this.$route.query.id ;
        this.getEditData();
      }

    },
    methods: {
      /**
       * 增加一行
       * @param {Object} item
       */
      addRow:function(item){
        item.push({"value":""}) ;
      },
      /**
       * 删除一行
       * @param {Object} item
       * @param {Object} index
       */
      removeRow:function(item,index){
        item.splice(index,1);
      },
      /**
       * 用户名变的时候修改邮箱
       */
      setEmail:function(){
        if(this.user_id){
          this.email = this.user_id +  '@game2sky.com';
        }
      },
      /**
       * 返回列表
       */
      goList:function(){
        this.$router.push({path:'/system/version/list'});
      },
      /**
       *提交添加用户表单
       */
      onSubmit:function() {
        var features = [] ;
        var bugfixs = [] ;
        var optimizes = [] ;
        for(var v of this.features){
          if(v.value){
            features.push(v.value) ;
          }
        }
        for(var v of this.bugfixs){
          if(v.value){
            bugfixs.push(v.value) ;
          }
        }
        for(var v of this.optimizes){
          if(v.value){
            optimizes.push(v.value) ;
          }
        }
        var param = {
          "version_num":  this.version_num.replace(' ','').replace(' ',''),
          "features":  features,
          "bugfixs": bugfixs,
          "optimizes":  optimizes,
          "online_time":this.online_time ,
        }
        if(this.id){
          param.id = this.id ;
        }
        if(!param.version_num){
          this.$error('版本号不允许为空');
          return ;
        }
        if(!param.online_time){
          this.$error('请选择上线时间');
          return ;
        }
        if(features.length==0 && bugfixs.length==0 && optimizes.length==0){
          this.$error('新增功能、功能优化、历史bug修复不能都为空');
          return ;
        }
        var url = this.$store.state.api_url.version.add;
        param = this.$generateParams(param) ;
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code == 200) {
            this.$success("操作成功");
            this.goList();
          } else {
            this.$error(data.msg);
          }
        }).catch((error) => {
          this.$error("接口请求失败");
        });
      },
      /**
       * 获取编辑的旧数据
       */
      getEditData:function(){
        var url = this.$store.state.api_url.version.detail;
        var param = {
          id : this.id,
        }
        param = this.$generateParams(param) ;
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code == 200) {
            var detail = data.data ;
            if(detail.bugfixs.length > 0){
              var bugfixs = [] ;
              for(var v of detail.bugfixs ){
                bugfixs.push({"value":v}) ;
              }
              this.bugfixs = bugfixs ;
            }
            if(detail.optimizes.length > 0){
              var optimizes = [] ;
              for(var v of detail.optimizes ){
                optimizes.push({"value":v}) ;
              }
              this.optimizes = optimizes ;
            }
            if(detail.features.length > 0){
              var features = [] ;
              for(var v of detail.features ){
                features.push({"value":v}) ;
              }
              this.features = features ;
            }
            this.online_time  = detail.online_time ?   detail.online_time : '' ;
            this.version_num = detail.version_num ;
          } else {
            this.$error("请求数据失败");
            this.$router.push({
              path: '/system/admin/list'
            });
            return;
          }
        }).catch((error) => {
          this.$error("请求接口失败");
        });
      }
    }
  }
</script>
