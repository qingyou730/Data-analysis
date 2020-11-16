<template>
  <div>
    <el-row class="page-titie-box">
      角色管理
      <router-link to="/system/role/add" v-if="$access('/system/role/add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>角色ID</th>
          <th>角色名称</th>
          <th>角色描述</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row,index) in data">
          <tr :key="row.role_id">
            <td>{{row.role_id}}</td>
            <td>{{row.name}}</td>
            <td>{{row.desc}}</td>
            <td>
              <router-link :to="'/system/role/edit?id=' + row.role_id" v-if="$access('/system/role/edit')">
                <el-button type="text" size="mini">编辑</el-button>
              </router-link>
              <span v-if="$access('/system/role/delete')">
                <span style="color: #409EFF">/</span>
                <el-button type="text" size="mini" @click="deleteData(index,row.role_id)">刪除</el-button>
              </span>
              <span v-if="$access('/system/role/permission')">
                <span style="color: #409EFF">/</span>
                <el-button type="text" size="mini" @click="showAuthDialog(row.role_id)">授权</el-button>
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
    <!--菜单权限分配 start-->
    <menu-permission :key="auth_role_id" :role_id="auth_role_id" v-if="showAuth" v-model="showAuth"></menu-permission>
    <!--菜单权限分配 end-->
  </div>
</template>
<script>
  import menuPermission from "./menu_permission.vue"
  export default {
    components: {
      menuPermission
    },
    data() {
      return {
        page: 1,
        page_size: 20,
        data: [],
        search: '',
        total: 0,
        showAuth: false,
        auth_role_id: '', //分配权限的角色ID
      }
    },
    methods: {
      showAuthDialog: function(role_id) {
        this.auth_role_id = role_id;
        this.showAuth = true;
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
        let url = this.$store.state.api_url.role.list;
        var param = {
          "page": this.page,
          "page_size": this.page_size,
        }
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code == 200) {
            this.total = data.data.total_hits;
            this.data = data.data.hits;
            // console.log(data.data) ;
          } else {
            this.$error(data.msg);
          }
        }).catch((error) => {
          this.$error("接口请求失败");
        });
      },
      /**
       * @param {Object} index
       * @param {Object} role_id
       * 删除
       */
      deleteData(index, role_id) {
        this.$confirm('此操作将永久删除该数据,不可恢复, 是否继续?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          let url = this.$store.state.api_url.role.delete;
          var deleteParam = {
            role_id: role_id,
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
    },
    created() {},
    mounted() {
      this.getData();
    }
  }
</script>
