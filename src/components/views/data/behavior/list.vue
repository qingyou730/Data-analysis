<template>
  <div>
    <div style="display: inline-block;width: 100%;">
      <span style="margin:0 10px 0 9px;">行为集合</span>
        <el-input @input="getData(true)" v-model="q" placeholder="输入关键字搜索" clearable suffix-icon="el-icon-search"
        style="width: 200px;margin-right: 20px;" />
      对象类型
      <el-select v-model="selects" placeholder style="width: 100px;"  @change="getData(true)">
        <el-option v-for="item in selectList" :key="item.value" :label="item.name" :value="item.value"></el-option>
      </el-select>
      <router-link :to="{path: '/data/behavior/addBehavior?object=' + selects}" v-if="$access('/data/behavior/addBehavior')">
        <el-button size="mini" type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </div>
    <!-- 数据渲染 -->
    <table class="table table-bordered" v-loading="loading">
      <thead>
        <tr>
          <th>集合标题</th>
          <th>集合描述</th>
          <th>事件数</th>
          <th>公共属性数</th>
          <th>创建人</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in groundList">
          <tr :key="index">
            <td>{{ item.name}}</td>
            <td>{{ item.desc }}</td>
            <td>{{ item.eventCount }}</td>
            <td>{{ item.attrCount }}</td>
            <td>{{  $store.state.user_list.hasOwnProperty(item.create_role) ? $store.state.user_list[item.create_role] :  item.create_role}}</td>
            <td>
              <router-link v-if="$access('/data/behavior/addBehavior')" :to="'/data/behavior/addBehavior?id=' + item.id+'&object='+selects">
                <el-button type="text" size="mini">编辑</el-button>
              </router-link>
              <el-button v-if="$access('/data/behavior/delete')" type="text" size="mini" @click="deletedId(item.id);"
                style="padding-left: 12px; box-sizing: border-box; outline: none">删除</el-button>

            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <!-- 分页组件 -->
      <el-pagination  @size-change="handleSizeChange" @current-change="changeCurPage" :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize"  layout="total, sizes, prev, pager, next, jumper"
        :total="totalSize"></el-pagination>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        q:'',
        //遮罩层事件
        handleClose(done) {
          this.$confirm("确认关闭？")
            .then(_ => {
              done();
            })
            .catch(_ => {});
        },
        selects: "",
        pageSize: 10,
        currentPage: 1,
        groundList: [],
        totalSize: 0,
        selectList: [{
          cascade: false,
          name: "角色",
          value: "role"
        }],
        dialogVisible: false,
        operationId: "",
        loading: true,
      };
    },
    methods: {
      handleSizeChange: function(value) {
        this.pageSize = value;
        this.getData();
      },
      changeCurPage: function(value) {
        this.currentPage = value;
        this.getData();
      },
      getData(resetPage) {
        if(resetPage){
          this.currentPage = 1 ;
        }
        this.loading = true;
        var param = this.$generateParams({
          object: this.selects,
          page: this.currentPage,
          page_size: this.pageSize,
          keyword:this.q,
        });
        this.axios
          .post("/mmp/behavior/find_behaviors", param)
          .then(response => {
            this.loading = false;
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            this.groundList = data.data.hits;
            this.totalSize = data.data.total_hits;
          })
          .catch(error => {
            this.loading = false;
            console.log(error);
            this.$error("接口请求失败");
          });
      },
      //删除事件
      deletedId(targetId) {
        this.operationId = targetId;
        this.$confirm("此操作将永久删除该数据,不可恢复, 是否继续?", "提示", {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "danger"
          })
          .then(() => {
            this.delById();
          })
          .catch(() => {
            console.log("删除取消");
          });
      },
      delById() {
        let url = "/mmp/behavior/delete";
        var param = this.$generateParams({
          id: this.operationId
        });
        this.axios
          .post(url, param)
          .then(response => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            if (data.code == 200) {
              this.getData();
              this.$success("删除成功");
              return;
            }
          })
          .catch(error => {
            this.$error("接口请求失败");
          });
      }
    },
    mounted() {
      //查询對象类型
      let param = this.$generateParams({
        object: "role",
        page: 1,
        page_size: 10
      });
      this.axios
        .post("/mmp/model/base/object_type_list", param)
        .then(response => {
          let data = response.data;
          if (data.code != 200) {
            console.log("接口有错返回");
            console.log(response);
          }
          this.selectList = data.data;
          this.selects = this.selectList[0].value;
          //默认数据渲染
          this.getData();
        })
        .catch(error => {
          this.$error("接口请求失败");
        });
    }
  };
</script>
