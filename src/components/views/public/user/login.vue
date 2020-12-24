<template>
  <div style="height: 100%;position: relative;background: url(/static/images/login_background.png);background-size: 100% 100%">
    <el-card id="login-box" class="login_page">
      <span id="password-login-title">账号密码登录</span>
      <el-input class="login-input" v-model="user_id" placeholder="请输入用户名" prefix-icon="el-icon-user" clearable></el-input>
      <el-input class="login-input" v-model="password" placeholder="请输入密码" prefix-icon="el-icon-lock" clearable
                show-password></el-input>
      <div id="login-error" v-show="isFail">
      </div>
      <div id="remenber">
        <el-checkbox v-model="rememberMe">记住我</el-checkbox>
      </div>
      <el-button class="password-button" @click="onSubmit" type="primary">登录</el-button>
    </el-card>
  </div>


</template>

<script>
  export default {
    data() {
      return {
        isFail: false,
        user_id: '',
        password: '',
        rememberMe: true
      }
    },
    mounted() {
      // var param = {
      //   "password": this.password.replace(' ', '').replace(' ', ''),
      //   "user_id": this.user_id.replace(' ', '').replace(' ', ''),
      //   "rememberMe": this.rememberMe
      // }
      // var url = this.$store.state.api_url.auth.login;
      // this.axios.post(url, param).then((response) => {
      //   let data = response.data
      //   if (data.code == 200) {
      //     this.$success("操作成功");
      //     //获取登录后的用户信息
      //     var url = this.$store.state.api_url.admin.login_user;
      //     this.axios.post(url).then((response) => {
      //       let data = response.data
      //       if (data.code == 200) {
      //         var user = data.data ;
      //         this.$store.state.user =  user ;
      //         this.$router.push({
      //           path: '/'
      //         });
      //       } else {
      //         this.$error(data.msg);
      //       }
      //     }).catch((error) => {
      //       this.$error("接口请求失败");
      //     });
      //   } else {
      //     this.$error(data.msg);
      //   }
      // }).catch((error) => {
      //   this.$error("接口请求失败");
      // });
      window.addEventListener('keydown', this.enter);
    },
    methods: {
      /**
       *提交添加用户表单
       */
      enter(e) {
        //如果是回车则执行登录方法
        if (e.keyCode == 13) {
          this.onSubmit();
        }
      },
      onSubmit: function() {
        var param = {
          "password": this.password.replace(' ', '').replace(' ', ''),
          "user_id": this.user_id.replace(' ', '').replace(' ', ''),
          "rememberMe": this.rememberMe
        }
        if (!param.user_id) {
          this.$error('用户名不允许为空');
          return;
        }
        if (!param.password) {
          this.$error('密码不允许为空');
          return;
        }
        if (param.password.length < 6) {
          this.$error('密码长度不小于6位');
          return;
        }
        param.password = this.$md5(param.password);
        var url = this.$store.state.api_url.auth.login;
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code == 200) {
            this.$success("登录成功");
            //获取登录后的用户信息
            var url = this.$store.state.api_url.admin.login_user;
            this.axios.post(url).then((response) => {
              let data = response.data
              if (data.code == 200) {
                var user = data.data;
                this.$store.state.user = user;
                this.$count('LOGIN', 'LOGIN_END', {});
                this.$router.push({
                  path: '/'
                });
              } else {
                this.$error(data.msg);
              }
            }).catch((error) => {
              this.$error("接口请求失败");
            });
          } else {
            this.$error(data.msg);
          }
        }).catch((error) => {
          this.$error("接口请求失败");
        });
      }
    },
    destroyed() {
      window.removeEventListener('keydown', this.enter, false);
    }
  }
</script>
<style>
  #password-login-title {
    text-align: center;
    display: block;
    font-weight: bold;
    color: #0074D9;
    margin-top: 50px;
    margin-bottom: 30px;
  }

  .login_page .login-input {
    width: 80%;
    text-align: center;
    margin-left: 10%;
    margin-bottom: 15px;
  }

  .login_page .login-input .el-input__inner {
    background-color: #fafafa;
  }

  #prompt span {
    font-weight: bold;
    color: red;
    font-size: 13px;
  }

  #prompt #sso {
    color: skyblue;
  }

  #prompt {
    margin-left: 10px;
  }

  #remenber {
    display: flex;
    margin: 0 10% 0 10%;
  }

  #login-error {
    margin: 0 10% 0 10%;
    text-align: center;
    font-weight: bold;
    color: red;
  }

  .login_page .password-button {
    text-align: center;
    display: block;
    margin: 10px auto;
    width: 200px;
  }
</style>
