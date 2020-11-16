<template>
  <el-form label-width="150px">
    <el-form-item label="所属游戏 : ">
      <el-select v-model="game">
        <el-option :key="g.app" v-for="g in game_list"  :label="g.name" :value="g.app"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="角色名称 : ">
      <el-input v-model="name" style="width:400px;"></el-input>
    </el-form-item>
    <el-form-item label="角色描述 : ">
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
        "name": "",
        "game": "",
        "game_list": [],
      }
    },
    created() {},
    mounted() {
      let game_list_url = this.$store.state.api_url.game.list;
      this.axios.post(game_list_url, {}).then((res) => {
        var data = res.data;
        if (data.code == 200) {
          this.game_list =  data.data ;
        } else {
          this.$error("获取游戏列表失败 role_add");
        }
      }).catch(() => {
        this.$error("获取游戏列表失败 role_add")
      });
    },
    methods: {
      /**
       * 返回列表
       */
      goList: function() {
        this.$router.push({
          path: '/system/role/list'
        });
      },
      /**
       *提交添加用户表单
       */
      onSubmit: function() {
        var param = {
          "desc": this.desc.replace(' ', '').replace(' ', ''),
          "name": this.name.replace(' ', '').replace(' ', ''),
          "game": this.game.replace(' ', '').replace(' ', ''),
          "menu_ids": [],
        }
        if (!param.name) {
          this.$error('角色名称不允许为空');
          return;
        }
        if (!param.game) {
          this.$error('所属游戏不允许为空');
          return;
        }
        let url = this.$store.state.api_url.role.add;
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
