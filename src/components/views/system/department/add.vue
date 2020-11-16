<template>
  <el-form label-width="150px">
    <el-form-item label="部门名称 : ">
      <el-input v-model="group_name" @change="setEmail" style="width:400px;"></el-input>
    </el-form-item>
    <el-form-item label="部门描述 : ">
      <el-input v-model="desc" style="width:400px;"></el-input>
    </el-form-item>
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
        "desc": "",
        "group_name": "",
      }
    },
    created() {},
    mounted() {
    },
    methods: {
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
        this.$router.push({path:'/system/department/list'});
      },
      /**
       *提交添加用户表单
       */
      onSubmit:function() {
        var param = {
          "desc":  this.desc.replace(' ','').replace(' ',''),
          "group_name":  this.group_name.replace(' ','').replace(' ',''),
        }
        if(!param.group_name){
          this.$error('部门名称不允许为空');
          return ;
        }
        var url = this.$store.state.api_url.department.add;
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
      }
    }
  }
</script>
