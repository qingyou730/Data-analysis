<template>
  <div>
    <div style="width: 1200px;margin: 0 auto;position: relative;z-index: 1;">
      <span class="w-logo" style="font-size: 40px;">DeepEye</span>
    </div>
    <div class="login-container">
      <el-card id="login-box" class="login_page">
        <span id="password-login-title">修改密码</span>
        <el-input class="login-input" v-model="password" placeholder="请输入新密码" prefix-icon="el-icon-lock" clearable
          show-password></el-input>
        <el-input class="login-input" v-model="password_confirm" placeholder="请确认新密码" prefix-icon="el-icon-lock"
          clearable show-password></el-input>
        <div id="login-error" v-show="isFail">
        </div>
        <el-button class="password-button" @click="onSubmit" type="primary">确定</el-button>
      </el-card>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        isFail: false,
        password_confirm: '',
        password: '',
      }
    },
    mounted() {

    },
    methods: {
      /**
       *提交添加用户表单
       */
      onSubmit: function() {
        var param = {
          "password": this.password.replace(' ', '').replace(' ', ''),
          "user_id": this.$store.state.user.user_id,
        }
        if (!param.user_id) {
          this.$router.push({
            path: '/public/user/login'
          });
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
        if (this.password != this.password_confirm) {
          this.$error('两次密码输入不一致');
          return;
        }
        param.password = this.$md5(param.password);
        var url = this.$store.state.api_url.admin.change_pwd;
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code == 200) {
            this.$success("操作成功");
            //获取登录后的用户信息
            var url = this.$store.state.api_url.auth.logout;
            this.axios.post(url).then((response) => {
              let data = response.data
              if (data.code == 200) {
                this.$store.state.user.user_id = '';
                localStorage.removeItem("APP");
                localStorage.removeItem("APP_NAME");
                this.$store.state.APP = '';
                this.$store.state.APP_NAME = '';
                this.$router.push({
                  path: '/public/user/login'
                });
                this.$router.push({
                  path: '/public/user/login'
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
