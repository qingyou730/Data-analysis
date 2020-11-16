<template>
  <el-form ref="form" :model="form" label-width="100px">
    <el-form-item label="上级菜单">
      <el-select v-model="form.fid" placeholder="请选择上级菜单">
        <el-option @click.native="changeLevel(0)" label="作为一级菜单" value="0"></el-option>
        <template v-for="first in menu_list">
          <el-option @click.native="changeLevel(1)" :key="first.menuId" :label="first.name" :value="first.menuId">
          </el-option>
          <el-option @click.native="changeLevel(2)" v-if="index != first.children.length-1 " v-for="(second,index) in first.children"
            :key="second.menuId" :label="'　　├ ' + second.name" :value="second.menuId"></el-option>
          <el-option @click.native="changeLevel(2)" v-if="index == first.children.length-1 " v-for="(second,index) in first.children"
            :key="second.menuId" :label="'　　└ ' + second.name" :value="second.menuId"></el-option>
        </template>
      </el-select>
    </el-form-item>
    <el-form-item label="菜单名称">
      <el-input v-model="form.name"></el-input>
    </el-form-item>
    <el-form-item label="排序值">
      <el-input v-model="form.sort" placeholder="请输入排序值"></el-input>
    </el-form-item>
    <el-form-item v-if="form.level==1" label="图标CSS">
      <el-input v-model="form.icon" placeholder="请输入fa类名比如home"></el-input>
      <div class="sub-title"><a href="http://fontawesome.dashgame.com/" target="_blank">请输入fontawesome图标CSS</a></div>
    </el-form-item>

    <el-form-item label="是否显示菜单">
      <el-radio v-model="form.isShow" label="1">是</el-radio>
      <el-radio v-model="form.isShow" label="0">否</el-radio>
    </el-form-item>

    <el-form-item label="是否可分配">
      <el-radio v-model="form.set" :label="true">是</el-radio>
      <el-radio v-model="form.set" :label="false">否</el-radio>
    </el-form-item>

    <el-form-item label="URL">
      <el-select v-model="form.url" placeholder="请选择网址" filterable clearable>
        <el-option :key="k" v-for="(v,k) in url_list" :label="v.path" :value="v.path"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="关联API">
      <el-tree ref="tree" :data="api_list" show-checkbox node-key="id" :props="defaultProps" :default-checked-keys="form.apis">
      </el-tree>
    </el-form-item>


    <el-form-item>
      <el-button type="primary" @click="onSubmit">保存</el-button>
      <el-button>取消</el-button>
    </el-form-item>

  </el-form>

</template>

<script>
  // var rounter_options =  wrouter.options.routes
  export default {
    data() {
      return {
        form: {
          fid: "0",
          name: '',
          icon: '',
          isShow: '1',
          url: '',
          sort: '0',
          set: true,
          level: 1,
          apis: [],
        },
        menu_list: [], //已有的父亲菜单
        url_list: this.$router.options.routes,
        api_list: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
      }
    },
    created() {
      this.$store.state.page_name = "菜单管理-修改";
    },
    mounted() {
      var id = this.$route.query.id;
      if (!id) {
        this.$error("参数错误");
        this.$router.push({
          path: '/system/menu/list'
        });
        return;
      }
      this.update_menu_list();

      var url = this.$store.state.api_url.menu.detail;
      var param = {
        menuId: id,
      }
      this.axios.post(url, param).then((response) => {
        let data = response.data
        if (data.code == 200) {
          var menu_detail = data.data;
          this.form.menuId = menu_detail.menuId;
          this.form.name = menu_detail.name;
          this.form.icon = menu_detail.icon;
          this.form.fid = menu_detail.fid;
          if (this.form.fid == '') {
            this.form.fid = '0';
          }
          this.form.isShow = menu_detail.isShow.toString();
          this.form.set = menu_detail.set
          this.form.sort = menu_detail.sort;
          this.form.level = menu_detail.level;
          if (menu_detail.controller) {
            this.form.url = '/' + menu_detail.module + '/' + menu_detail.controller + '/' +
              menu_detail.action;
          }
          if (!menu_detail.hasOwnProperty('apis')) {
            menu_detail.apis = []
          } else {
            if (!menu_detail.apis) {
              menu_detail.apis = []
            }
          }
          this.form.apis = menu_detail.apis;
        } else {
          this.$error("请求数据失败");
          this.$router.push({
            path: '/system/menu/list'
          });
          return;
        }
      }).catch((error) => {
        this.$error("请求接口失败");
      });

      //获取所有接口列表
      var url = this.$store.state.api_url.menu.api_list;
      var param = {};
      this.axios.post(url, param).then((response) => {
        let data = response.data
        if (data.code != 200) {
          console.log("接口有错返回")
          console.log(response)
          return;
        } else {
          this.api_list = data.data;
        }
      }).catch((error) => {
        this.$error("请求接口失败");
      });

    },
    methods: {
      /**
       * @param {Object} var
       * @param {Object} group
       * 关联API的多选和取消选择
       */
      changeApiGroup: function(value, group) {
        for (var v of group.children) {
          var index = this.form.apis.indexOf(v.id);
          if (index >= 0) {
            if (!value) { //取消选择
              this.form.apis.splice(index, 1);
            }
          } else {
            if (value) { //全选
              this.form.apis.push(v.id);
            }
          }
        }
      },
      update_menu_list() { //获取已有的菜单列表
        var url = this.$store.state.api_url.menu.list;
        var param = {};
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code != 200) {
            console.log("接口有错返回")
            console.log(response)
          }
          this.menu_list = data.data;
        }).catch((error) => {
          this.$message({
            showClose: true,
            message: '接口请求失败',
            type: 'error'
          })
        });
      },
      changeLevel(parent_level) {
        console.log(parent_level)
        this.form.level = parent_level + 1;
      },
      onSubmit() {
        var apis = [];
        var tree_node = this.$refs.tree.getCheckedNodes();
        for (var v of tree_node) {
          if (v.hasOwnProperty('api')) {
            apis.push(v.id)
          }
        }
        this.form.apis = apis;

        var param = {
          "action": "",
          "controller": "",
          "fid": '',
          "icon": "",
          "isShow": 1,
          "module": "",
          "name": "",
          "sort": 0,
          "set": this.form.set,
          "apis": this.form.apis,
        }
        if (this.form.fid) {
          param.fid = this.form.fid;
          if (param.fid == '0') {
            param.fid = '';
          }
        }
        param.icon = this.form.icon.trim();
        param.name = this.form.name.trim();
        param.isShow = this.form.isShow;
        this.form.sort = parseInt(this.form.sort)
        if (isNaN(this.form.sort)) {
          this.form.sort = 0;
        }
        param.sort = this.form.sort;
        if (!param.name) {
          this.$message({
            showClose: true,
            message: '菜单名称不允许为空',
            type: 'error'
          });
          return;
        }
        var url_nodes = this.form.url.split('/');
        if (!url_nodes[1] || !url_nodes[2] || !url_nodes[3]) {
          param.module = ''
          param.controller = ''
          param.action = ''
        } else {
          param.module = url_nodes[1]
          param.controller = url_nodes[2]
          param.action = url_nodes[3]
        }
        //编辑和添加是同一个接口 编辑的时候需要传menuId
        param.menuId = this.form.menuId;
        var url = this.$store.state.api_url.menu.add;
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code == 200) {
            this.$success("修改成功");
            this.$router.push({
              path: '/system/menu/list'
            });
          } else {
            this.$error("接口请求失败");
          }
        }).catch((error) => {
          this.$error("接口请求失败");
        });
      }
    }
  }
</script>
