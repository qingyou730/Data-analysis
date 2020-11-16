<template>
  <div>
    <el-row>
      <el-col :span="4" v-for="(game) in game_list" :key="game.app" style="cursor: pointer;" @click.native="changeGame(game)">
        <el-card :body-style="{ padding: '0px' }" style="text-align: center;">
          <img width="180" height="240" :src="game.avatar" class="image">
          <div style="padding: 14px;">
            <span>{{game.name}}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        isFail: false,
        user_id: '',
        password: '',
        game_list: [],
      }
    },
    mounted() {
      var url = this.$store.state.api_url.game.list;
      this.axios.post(url).then((response) => {
        let data = response.data
        if (data.code == 200) {
          this.game_list = data.data ;
        } else {
          this.$error(data.msg);
        }
      }).catch((error) => {
        this.$error("接口请求失败");
      });
    },
    methods: {
      changeGame:function(game){
        this.$store.state.APP = game.app ;
        this.$store.state.APP_NAME = game.name ;
        localStorage .setItem("APP", game.app);
        localStorage .setItem("APP_NAME", game.name);
        this.$router.push({
          path: '/'
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

  .login-input {
    width: 80%;
    text-align: center;
    margin-left: 10%;
    margin-bottom: 15px;
  }

  .login-input .el-input__inner {
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

  .password-button {
    text-align: center;
    display: block;
    margin: 10px auto;
    width: 200px;
  }
</style>
