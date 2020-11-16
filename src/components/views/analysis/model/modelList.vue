<template>
  <div>
    <el-row class="page-titie-box">
      模型管理
      <router-link to="/analysis/modle/add" v-if="$access('/analysis/modle/add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>

    <!-- 数据渲染 -->
    <table class="table table-bordered" v-loading="loading">
      <thead>
        <tr>
          <th>ID</th>
          <th>模型名称</th>
          <th>描述</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in tableData">
          <tr :key="index">
            <td>{{ item.mid}}</td>
            <td>
              <router-link target="_blank" :to="'/analysis/model/task?mid=' +item.mid">
                <el-button type="text" size="mini">{{item.zhName}}</el-button>
              </router-link>
            </td>
            <td>{{ item.desc }}</td>
            <td>
              <el-button type="text" size="mini" v-if="$access('/analysis/modle/add')" @click='onClickMod(index,item)'>修改</el-button>
              <el-button type="text" size="mini" v-if="$access('/analysis/modle/delete')" @click='onClickDel(index,item)'>删除</el-button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        currentPage: 1,
        pageSize: 10,
        tableData: [],
        search: '',
        dialogTableVisible: false,
        comIds: [],
        loading: true,
      }
    },
    created() {
      this.$store.state.page_name = "模型管理-列表";
    },
    methods: {
      getData() {
        this.loading = true;
        let requestUrl = this.$store.state.api_url.model.list;
        this.axios.post(requestUrl).then((rep) => {
            this.tableData = rep.data.data;
            this.loading = false;
          })
          .catch((error) => {
            this.loading = false;
            alert(error);
          });
      },
      handleSizeChange(val) {
        this.pageSize = val;
      },
      // 当前页
      handleCurrentChange(val) {
        this.currentPage = val;
      },
      setComponentData(row, index) {
        this.comIds = row.stepModule
        this.dialogTableVisible = true;
      },
      onClickDel(index, row) {

        this.$confirm("此操作将永久删除该数据,不可恢复, 是否继续?", "提示", {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "danger"
          })
          .then(() => {
            let delUrl = this.$store.state.api_url.model.delete;
            this.axios.post(delUrl, {
              "mid": row.mid
            }).then((rep) => {
              if (rep.data.code != 200) {
                this.$message(rep.data.msg)
              } else {
                this.getData();
                this.$success('删除成功')
              }
            })
          })
          .catch(() => {
            console.log("删除取消");
          });
        // let delUrl = this.$store.state.api_url.model.delete;
        // this.axios.post(delUrl, {
        //   "mid": row.mid
        // }).then((rep) => {
        //   var repData = rep.data;
        //   if (rep.data.code != 200) {
        //     this.$message('删除失败')
        //   } else {
        //     this.tableData.splice(index, 1);
        //   }
        // })
      },
      onClickMod(index, row) {
        console.log(row)
        this.$router.push({
          path: "/analysis/modle/add",
          query: {
            id: row.mid
          }
        });
      }
    },
    mounted() {
      this.getData();
    }
  }
</script>
