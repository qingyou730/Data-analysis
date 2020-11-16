<template>
  <div>
    <el-row class="page-titie-box">
      模块管理
      <router-link to="/analysis/module/add" v-if="$access('/analysis/module/add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>

    <!-- 数据渲染 -->
    <table class="table table-bordered" v-loading="loading">
      <thead>
        <tr>
          <th>ID</th>
          <th>模块名称</th>
          <th>英文名称</th>
          <th>模块类型</th>
          <th>模块类别</th>
          <th>描述</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in tableData">
          <tr :key="index">
            <td>{{ item.mduId}}</td>
            <td>{{ item.zhName}}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.moduleGroup }}</td>
            <td>{{ item.moduleType }}</td>
            <td>{{ item.desc }}</td>
            <td>
              <el-button type="text" size="mini" v-if="$access('/analysis/module/edit')" @click='onClickMod(index,item)'>修改</el-button>
              <el-button type="text" size="mini" v-if="$access('/analysis/module/delete')" @click='onClickDel(index,item)'>删除</el-button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="tableData.filter(data => !search || data.zhName.toLowerCase().includes(search.toLowerCase())).length">
    </el-pagination>

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
    methods: {
      getData() {
        this.loading = true;
        let requestUrl = this.$store.state.api_url.module.list;
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
        this.comIds = row.comIds
        this.dialogTableVisible = true;
      },
      onClickDel(index, row) {
        this.$confirm("此操作将永久删除该数据,不可恢复, 是否继续?", "提示", {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "danger"
          })
          .then(() => {
            let delUrl = this.$store.state.api_url.module.delete;
            this.axios.post(delUrl, {
              "mduId": row.mduId
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
      },
      onClickMod(index, row) {
        const mduId = row.mduId;
        // this.$router.push({path: "/analysis/module/add",query: {row:row}});
        this.$router.push({
          path: "/analysis/module/edit",
          query: {
            mduId: mduId
          }
        });
      }
    },
    created() {
      this.$store.state.page_name = "模块管理-列表";
    },
    mounted() {
      this.getData();
    }
  }
</script>
