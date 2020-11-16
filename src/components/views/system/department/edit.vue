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
        "group_id":"",
      }
    },
    created() {},
    mounted() {
      var id = this.$route.query.id;
      if (!id) {
        this.$error("参数错误");
        this.$router.push({
          path: '/system/department/list'
        });
        return;
      }
      this.group_id = id;

      var url = this.$store.state.api_url.department.detail;
      var param = {
        group_id: id,
      }
      this.axios.post(url, param).then((response) => {
        let data = response.data
        if (data.code == 200) {
          var group = data.data;
          this.desc = group.desc;
          this.group_name = group.group_name;
          this.group_id = group.group_id;
        } else {
          this.$error("请求数据失败");
          this.$router.push({
            path: '/system/department/list'
          });
          return;
        }
      }).catch((error) => {
        this.$error("请求接口失败");
      });
    },
    methods: {
      /**
       * 用户名变的时候修改邮箱
       */
      setEmail:function(){
        console.log("ccc") ;
        if(this.user_id){
          this.email = this.user_id +  'game2sky.com';
        }
      },
      /**
       * 返回列表
       */
      goList: function() {
        this.$router.push({
          path: '/system/department/list'
        });
      },
      /**
       *提交添加用户表单
       */
      onSubmit: function() {
       var param = {
         "desc":  this.desc.replace(' ','').replace(' ',''),
         "group_name":  this.group_name.replace(' ','').replace(' ',''),
         "group_id":this.group_id ,
       }
       if(!param.group_name){
         this.$error('部门名称不允许为空');
         return ;
       }
        var url = this.$store.state.api_url.department.update;
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
