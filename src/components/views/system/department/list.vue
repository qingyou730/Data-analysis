<template>
  <div>
    <el-row class="page-titie-box">
      部门管理
      <router-link to="/system/department/add" v-if="$access('/system/department/add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th style="width:200px">ID</th>
          <th style="width:200px">部门名称</th>
          <th style="width:200px">描述</th>
          <th style="width:200px">操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row,index) in data">
          <tr :key="row.group_id">
            <td>{{row.group_id}}</td>
            <td>{{row.group_name }}</td>
            <td>{{row.desc}}</td>
            <td>
              <router-link :to="'/system/department/edit?id=' + row.group_id" v-if="$access('/system/department/edit')">
                <el-button type="text" size="mini">编辑</el-button>
              </router-link>
              <el-button   v-if="$access('/system/department/delete')"  type="text" size="mini" @click="deleteData(index,row.group_id)">刪除</el-button>
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
        page: 1,
        page_size: 20,
        data: [],
        search: '',
        total: 0,
        showRole: false,
        edit_user: {},
        role_list: [],
        isIndeterminate: false, //全选按钮的半选状态
        checkAll: false,
        is_department: false,
        dialogFormVisible: false,
        formLabelWidth: '80px',
        usePaword: '',
        user_id : '',
      }
    },
    methods: {
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
        let url = this.$store.state.api_url.department.list;
        var param = {
          "game": "kop",
          "page": this.page,
          "page_size": this.page_size,
        }
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code == 200) {
            this.total = data.data.total_hits;
            this.data = data.data.hits;
          } else {
            this.$error(data.msg);
          }
        }).catch((error) => {
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
      deleteData(index, group_id) {
        this.$confirm('此操作将永久删除该数据,不可恢复, 是否继续?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          let url = this.$store.state.api_url.department.delete;
          var deleteParam = {
            group_id: group_id,
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
      let url = this.$store.state.api_url.role.list;
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
