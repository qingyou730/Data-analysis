<template>
  <div>
    <el-row class="page-titie-box">
      用户管理
      <router-link to="/system/admin/add" v-if="$access('/system/admin/add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>
    <el-row>
      <el-select @change="doSearch"  v-model="search.group_id" style="width: 150px;" clearable="">
        <el-option label="==请选择部门==" value=""></el-option>
        <el-option v-for="(v,k) in departmap" :key="k" :label="v" :value="k"></el-option>
      </el-select>
      <el-input @change="doSearch"   v-model="search.user_id" style="width: 150px;"  placeholder="请输入用户名" clearable=""></el-input>
    </el-row>
    <table class="table table-bordered" v-loading="loading" >
      <thead>
        <tr>
          <th>用户名</th>
          <th>真实姓名</th>
          <th>部门</th>
          <th>邮箱</th>
          <th>手机号</th>
          <th>是否启用</th>
          <th>是否开启该游戏</th>
          <th>描述</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row,index) in data">
          <tr :key="row.user_id">
            <td>{{row.user_id}}</td>
            <td>{{row.user_name}}</td>
            <td>{{departmap.hasOwnProperty(row.group) ? departmap[row.group] :  row.group}}</td>
            <td>{{row.email}}</td>
            <td>{{row.mobile}}</td>

            <td>
              <el-switch @change="enable($event,row)" v-model="row.enabled" active-color="#0e73ff" inactive-color="#909399">
              </el-switch>
            </td>
            <td>
              <el-switch @change="openGame($event,row)" v-model="row.access" active-color="#0e73ff" inactive-color="#909399">
              </el-switch>
            </td>
            <td>{{row.desc}}</td>
            <td>
              <router-link :to="'/system/admin/edit?id=' + row.user_id" v-if="$access('/system/admin/edit')">
                <el-button type="text" size="mini">编辑</el-button>
              </router-link>
              <span v-if="$access('/system/admin/delete')">
                <span style="color: #409EFF">/</span>
                <el-button type="text" size="mini" @click="deleteData(index,row.user_id)">刪除</el-button>
              </span>
              <span v-if="$access('/system/admin/edit')">
                <span style="color: #409EFF">/</span>
                <el-button type="text" size="mini" @click="showRoleDialog(row)">角色组</el-button>
              </span>
              <span v-if="$access('/system/admin/reset')">
                <span style="color: #409EFF">/</span>
                <el-button type="text" size="mini" @click="resetPassword(row)">重置密码</el-button>
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
      <el-pagination @size-change="handleSizeChange($event)" @current-change="handleCurrentChange($event)"
        :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="page_size" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    <!--分配角色组 start-->
    <el-dialog title="角色组" :visible.sync="showRole" :before-close="closeDialog" width="800px">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      <div style="margin: 15px 0;"></div>
      <el-checkbox style="width: 180px;" disabled v-model="is_admin">超级管理员</el-checkbox>
      <el-checkbox-group v-model="edit_user.roles" @change="handleCheckedRoleChange">
        <el-checkbox style="width: 180px;" v-for="v in role_list" :label="v.role_id" :key="v.role_id">{{v.name}}</el-checkbox>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </div>
    </el-dialog>
    <!--分配角色组 end -->
    <!-- 重置密码遮罩 -->
    <el-dialog title="重置密码" :visible.sync="dialogFormVisible" width="35%">
    <el-form>
      <el-form-item label="密码" :label-width="formLabelWidth">
        <el-input v-model="usePaword" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitPaw">确 定</el-button>
    </div>
  </el-dialog>
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
        is_admin: false,
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
        if (!this.$access('/system/admin/edit')) {
          this.$error("您没有权限修改用户信息");
          user.enabled = !value;
          return;
        }
        let url = this.$store.state.api_url.admin.enabled;
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
        if (!this.$access('/system/admin/edit')) {
          this.$error("您没有权限修改用户信息");
          user.enabled = !value;
          return;
        }
        if (value) {
          var url = this.$store.state.api_url.admin.open_game;
        } else {
          var url = this.$store.state.api_url.admin.close_game;
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
        var url = this.$store.state.api_url.admin.detail;
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
            var is_admin = false;
            if (user.roles.indexOf('admin') >= 0) {
              is_admin = true;
            }
            this.is_admin = is_admin;
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
        let url = this.$store.state.api_url.admin.list;
        var param = {
          "game": "kop",
          "page": this.page,
          "page_size": this.page_size,
          "group_id":this.search.group_id,
          "user_id":this.search.user_id,
        }
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
        var url = this.$store.state.api_url.admin.update_role;
        var update = {
          "roles": this.edit_user.roles,
          "user_id": this.edit_user.user_id,
        }
        if (this.is_admin) {
          if (update.roles.indexOf('admin') < 0) {
            update.roles.push('admin');
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
      deleteData(index, user_id) {
        this.$confirm('此操作将永久删除该数据,不可恢复, 是否继续?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          let url = this.$store.state.api_url.admin.delete;
          var deleteParam = {
            user_id: user_id,
          }
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
        "game": "kop",
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
