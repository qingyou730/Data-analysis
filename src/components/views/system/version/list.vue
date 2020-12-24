<template>
  <div>
    <el-row class="page-titie-box">
      版本管理
      <router-link to="/system/version/add" v-if="$access('/system/version/add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>
    <table class="table table-bordered" v-loading="loading" >
      <thead>
        <tr>
          <th>ID</th>
          <th>版本号</th>
          <th>上线时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row,index) in data">
          <tr :key="row.id">
            <td>{{row.id}}</td>
            <td>{{row.version_num}}</td>
            <td>{{row.online_time}}</td>
            <td>
              <router-link :to="'/system/version/add?id=' + row.id" v-if="$access('/system/version/edit')">
                <el-button type="text" size="mini">编辑</el-button>
              </router-link>
              <el-button v-if="$access('/system/version/delete')"  type="text" size="mini" @click="deleteData(index,row.id)">刪除</el-button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
      <el-pagination @size-change="handleSizeChange($event)" @current-change="handleCurrentChange($event)"
        :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="page_size" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
  </div>
</template>
<script>
  // import menuPermission from "./menu_permission.vue"
  export default {
    components: {
      // menuPermission
    },
    data() {
      return {
        loading: true,
        page: 1,
        page_size: 20,
        data: [],
        total: 0,
        showRole: false,
        edit_user: {},
        role_list: [],
        isIndeterminate: false, //全选按钮的半选状态
        checkAll: false,
        is_version: false,
        dialogFormVisible: false,
        formLabelWidth: '80px',
        usePaword: '',
        user_id : '',
        departmap:{},
        search:{  //搜索参数
          user_id:'',
          group_id:'',
        },
      }
    },
    methods: {
      /**
       * 搜索
       */
      doSearch:function(){
        this.page = 1 ;
        this.getData();
      },
      /**
       * 禁用或者启用游戏
       * @param {Object} user
       *
       */
      enable: function(value, user) {
        if (!this.$access('/system/version/edit')) {
          this.$error("您没有权限修改用户信息");
          user.enabled = !value;
          return;
        }
        let url = this.$store.state.api_url.version.enabled;
        var param = {
          enabled: value,
          user_id: user.user_id,
        }
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            this.$success("操作成功");
          } else {
            this.$error("操作失败");
          }
        }).catch((error) => {
          console.log(error);
          this.$error("操作失败2")
        });
      },
      /**
       * @param {Object} user
       * 打开或者关闭游戏
       */
      openGame: function(value, user) {
        if (!this.$access('/system/version/edit')) {
          this.$error("您没有权限修改用户信息");
          user.enabled = !value;
          return;
        }
        if (value) {
          var url = this.$store.state.api_url.version.open_game;
        } else {
          var url = this.$store.state.api_url.version.close_game;
        }
        var param = {
          user_id: user.user_id,
        }
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            this.$success("操作成功");
          } else {
            this.$error("操作失败");
          }
        }).catch((error) => {
          console.log(error);
          this.$error("操作失败2")
        });
      },
      showRoleDialog: function(user) {
        var user_id = user.user_id;
        this.checkAll = false;
        //重新加载一遍用户信息
        var url = this.$store.state.api_url.version.detail;
        var param = {
          user_id: user_id,
        }
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code == 200) {
            var user = data.data;
            if (!user.hasOwnProperty('roles')) {
              this.$set(user, 'roles', []);
            }
            this.edit_user = user;
            var is_version = false;
            if (user.roles.indexOf('version') >= 0) {
              is_version = true;
            }
            this.is_version = is_version;
            this.showRole = true;
          } else {
            this.$error("请求数据失败");
            return;
          }
        }).catch((error) => {
          this.$error("请求接口失败");
        });
      },
      handleSizeChange: function(page_size) {
        this.page_size = page_size;
        this.page = 1;
        this.getData();
      },
      handleCurrentChange: function(page) {
        this.page = page;
        this.getData();
      },
      getData: function() {
        this.loading = true;
        let url = this.$store.state.api_url.version.list;
        var param = {
          "page": this.page,
          "page_size": this.page_size,
        }
        param = this.$generateParams(param) ;
        this.axios.post(url, param).then((response) => {
          let data = response.data
          this.loading = false;
          if (data.code == 200) {
            if(data.hasOwnProperty('data') && data.data.hasOwnProperty('hits')){
              this.total = data.data.total_hits;
              this.data = data.data.hits;
            }else{
              this.total = 0;
              this.data =[];
            }
          } else {
            this.$error(data.msg);
          }
        }).catch((error) => {
          this.loading = false;
          console.log(error) ;
          this.$error("接口请求失败");
        });
      },
      /**
       * 关闭弹窗
       */
      closeDialog: function() {
        this.showRole = false;
      },
      /**
       * 保存角色组
       */
      saveRole: function() {
        var url = this.$store.state.api_url.version.update_role;
        var update = {
          "roles": this.edit_user.roles,
          "user_id": this.edit_user.user_id,
        }
        if (this.is_version) {
          if (update.roles.indexOf('version') < 0) {
            update.roles.push('version');
          }
        }
        this.axios.post(url, update).then((response) => {
          let data = response.data
          if (data.code != 200) {
            this.$error('接口请求失败');
            console.log(response)
          } else {
            this.$success('操作成功');
            this.closeDialog();
          }
        }).catch((error) => {
          console.log(error);
          this.$error('接口请求失败');
        });
      },
      /**
       * @param {Object} val权限按钮点击事件
       */
      handleCheckAllChange: function(val) {
        var all_value = this.$tools.array_column(this.role_list, 'role_id');
        this.edit_user.roles = val ? all_value : [];
        this.isIndeterminate = false;
      },
      handleCheckedRoleChange: function(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.role_list.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.role_list.length;
      },
      /**
       * @param {Object} index
       * @param {Object} role_id
       * 删除
       */
      deleteData(index, id) {
        this.$confirm('此操作将永久删除该数据,不可恢复, 是否继续?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          let url = this.$store.state.api_url.version.delete;
          var deleteParam = {
            id: id,
          }
          deleteParam =  this.$generateParams(deleteParam) ;
          this.axios.post(url, deleteParam).then((res) => {
            var data = res.data;
            if (data.code == 200) {
              this.$success("删除成功");
              this.data.splice(index, 1);
            } else {
              this.$error("删除失败1");
            }
          }).catch(() => {
            this.$error("删除失败2")
          });
        }).catch(() => {
          console.log("删除取消");
        });
      },
      //重置密码
      resetPassword(row) {
        this.dialogFormVisible = true;
        this.user_id = row.user_id;
        console.log(row,this.user_id, "重置密码");
      },
      submitPaw() {
        if(!this.usePaword) {
          this.$error('请输入重置密码');
          return;
        }
        if(this.usePaword.length<6) {
          this.$error('密码长度小于6位');
          return;
        }
        let paw = this.$md5(this.usePaword);
        let url = '/app/auth/user/reset_pwd';
          var deleteParam = {
            user_id: this.user_id,
            password: paw
          }
          this.axios.post(url, deleteParam).then((res) => {
            var data = res.data;
            if (data.code == 200) {
              this.dialogFormVisible = false;
              this.usePaword = '';
              this.user_id = '';
              this.$success("重置成功");
            } else {
              this.$error("重置失败1");
            }
          }).catch(() => {
            this.$error("重置失败2")
          });
      }
    },
    created() {},
    mounted() {
      this.getData();
      //获取所有部门
      var url = this.$store.state.api_url.department.list;
      var param = {
        "page":1,
        "page_size":1000,
      }
      this.axios.post(url, param).then((response) => {
        let data = response.data
        if (data.code == 200) {
          for(var v of data.data.hits){
            this.$set( this.departmap,v["group_id"],v["group_name"]) ;
          }
        } else {
          this.$error(data.msg);
        }
      }).catch((error) => {
        console.log(error);
        this.$error("接口请求失败");
      });


      var url = this.$store.state.api_url.role.list;
      var param = {
        "game": this.$store.state.APP.toUpperCase(),
        "page": 1,
        "page_size": 100000,
      }
      this.axios.post(url, param).then((response) => {
        let data = response.data
        if (data.code == 200) {
          var role_list = data.data.hits;
          this.role_list = role_list;
        } else {
          this.$error(data.msg);
        }
      }).catch((error) => {
        console.log(error);
        this.$error("接口请求失败");
      });
    }
  }
</script>
