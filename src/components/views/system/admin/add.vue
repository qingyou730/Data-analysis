<template>
  <el-form label-width="150px">
    <el-form-item label="用户名 : ">
      <el-input v-model="user_id" @change="setEmail" placeholder="请输入和公司邮箱一致的拼音" style="width:400px;"></el-input>
    </el-form-item>
    <el-form-item label="所属部门 : ">
      <el-select filterable v-model="group" placeholder="请选择所属部门" style="width:400px;">
        <el-option v-for="(item,index) in department_list"  :key="index" :label="item.group_name" :value="item.group_id" ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="真实姓名 : ">
      <el-input v-model="user_name" placeholder="请输入真实姓名" style="width:400px;"></el-input>
    </el-form-item>
    <el-form-item label="密码 : ">
      <el-input v-model="password" style="width:400px;" show-password></el-input>
    </el-form-item>
    <el-form-item label="手机号 : ">
      <el-input v-model="mobile" style="width:400px;"></el-input>
    </el-form-item>
    <el-form-item label="邮箱 : ">
      <el-input v-model="email" placeholder="请正确填写邮箱,离线任务会发送到该邮箱地址" type="mail" style="width:400px;"></el-input>
    </el-form-item>
    <el-form-item label="描述 : ">
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
        "email": "",
        "mobile": "",
        "group":'',
        "password": "",
        "user_id": "",
        "user_name": "",
        "department_list":[],
      }
    },
    created() {},
    mounted() {
      let url = this.$store.state.api_url.department.list;
      var param = {
        "page":1,
        "page_size":1000,
      }
      this.axios.post(url, param).then((response) => {
        let data = response.data
        if (data.code == 200) {
          this.department_list = data.data.hits;
        } else {
          this.$error(data.msg);
        }
      }).catch((error) => {
        console.log(error);
        this.$error("接口请求失败");
      });

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
        this.$router.push({path:'/system/admin/list'});
      },
      /**
       *提交添加用户表单
       */
      onSubmit:function() {
        var param = {
          "desc":  this.desc.replace(' ','').replace(' ',''),
          "email":  this.email.replace(' ','').replace(' ',''),
          "group":  this.group.replace(' ','').replace(' ',''),
          "mobile":  this.mobile.replace(' ','').replace(' ',''),
          "password":  this.password.replace(' ','').replace(' ',''),
          "user_name": this.user_name.replace(' ','').replace(' ',''),
          "user_id":  this.user_id.replace(' ','').replace(' ',''),
        }
        if(!param.user_id){
          this.$error('用户名不允许为空');
          return ;
        }
        if(!param.group){
          this.$error('请选择部门');
          return ;
        }
        if(!param.user_name){
          this.$error('真实姓名不允许为空');
          return ;
        }
        if(!param.password){
          this.$error('密码不允许为空');
          return ;
        }
        if(param.password.length<6){
          this.$error('密码长度不小于6位');
          return ;
        }
        if(!param.mobile){
          this.$error('手机号不允许为空');
          return ;
        }
        if(param.mobile.length!=11){
          this.$error('请输入11位的手机号码');
          return ;
        }
        if(!param.email){
          this.$error('邮箱不允许为空');
          return ;
        }
        param.password = this.$md5( param.password ) ;
        var url = this.$store.state.api_url.admin.add;
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
