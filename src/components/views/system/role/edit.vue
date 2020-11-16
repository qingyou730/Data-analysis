<template>
  <el-form label-width="150px">
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
        "role_id": '',
      }
    },
    created() {},
    mounted() {
      var id = this.$route.query.id;
      if (!id) {
        this.$error("参数错误");
        this.$router.push({
          path: '/system/role/list'
        });
        return;
      }
      this.role_id = id;

      var url = this.$store.state.api_url.role.detail;
      var param = {
        role_id: id,
      }
      this.axios.post(url, param).then((response) => {
        let data = response.data
        if (data.code == 200) {
          var role = data.data;
          this.desc = role.desc;
          this.name = role.name;
        } else {
          this.$error("请求数据失败");
          this.$router.push({
            path: '/system/role/list'
          });
          return;
        }
      }).catch((error) => {
        this.$error("请求接口失败");
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
          "role_id":this.role_id,
          "desc": this.desc.replace(' ', '').replace(' ', ''),
          "name": this.name.replace(' ', '').replace(' ', ''),
        }
        if (!param.name) {
          this.$error('角色名称不允许为空');
          return;
        }
        let url = this.$store.state.api_url.role.update;
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
