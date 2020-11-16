<template>
  <div>
    <el-row class="page-titie-box">
      业务组件
      <router-link to="/analysis/components/add" v-if="$access('/analysis/components/add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>

    <!-- 数据渲染 -->
    <table class="table table-bordered" v-loading="loading">
      <thead>
        <tr>
          <th>ID</th>
          <th>组件名称</th>
          <th>显示名称</th>
          <th>描述</th>
          <th>提交参数名称</th>
          <th>组件类型</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in tableData">
          <tr :key="index">
            <td>{{ item.comId}}</td>
            <td>{{ item.compName}}</td>
            <td>{{ item.zhName }}</td>
            <td>{{ item.desc }}</td>
            <td>{{ item.paramKey }}</td>
            <td>{{ item.enName }}</td>
            <td>
              <el-button type="text" v-if="$access('/analysis/components/edit')" size="mini" @click='onClickMod(index,item)'>修改</el-button>
              <el-button type="text" v-if="$access('/analysis/components/delete')" size="mini" @click='onClickDel(index,item)'>删除</el-button>
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
        loading: true,
      }
    },
    methods: {
      getData() {
        this.loading = true;
        var param = {
          page: this.currentPage,
          page_size: this.pageSize,
        };
        let requestUrl = this.$store.state.api_url.components.list;
        this.axios.post(requestUrl,param).then((rep) => {
            this.loading = false;
            this.tableData = rep.data.data;
          })
          .catch((error) => {
            this.loading = false;
            alert(error);
          });
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
      // 当前页
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getData();
      },
      onClickDel(index, row) {
        this.$confirm("此操作将永久删除该数据,不可恢复, 是否继续?", "提示", {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "danger"
          })
          .then(() => {
            let delUrl = this.$store.state.api_url.components.delete;
            this.axios.post(delUrl, {
              "comId": row.comId
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
        // this.$router.push({
        //     path: "/analysis/components/add",
        //     query: {
        //         row: row
        //     }
        // });
        this.$router.push({
          path: "/analysis/components/edit",
          query: {
            comId: row.comId
          }
        });
      },
    },
    created() {
      this.$store.state.page_name = "业务组件-列表";
    },
    mounted() {
      this.getData();
    }
  }
</script>
