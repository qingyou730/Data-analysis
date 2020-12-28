<template>
  <div>
    <div style="display: inline-block; width: 100%">
      <span v-if="false" style="margin: 0 10px 0 9px">公共变量列表</span>
      对象类型
      <el-select v-model="selects" placeholder style="width: 100px" @change="getData(true)">
        <el-option v-for="item in selectList" :key="item.value" :label="item.name" :value="item.value"></el-option>
      </el-select>
      <el-button v-if="$access('/data/variable/add')" @click="show_add=true;edit_id=''" type="primary" icon="el-icon-plus"
        class="add-btn"></el-button>
    </div>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>参数名称</th>
          <th>参数标识</th>
          <th>是否是范围参数</th>
          <th>变量名称</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in groundList">
          <tr :key="index">
            <td>
              <span class="text-length" :title="item.name">{{
                item.name
              }}</span>
            </td>
            <td>{{ item.field }}</td>
            <td>{{ item.is_scope ? '是' : '否' }}</td>
            <td>{{ item.variable_name}}</td>
            <!-- 操作按钮 -->
            <td>
              <el-row>

                <el-button v-if="$access('/data/variable/add')" type="text" size="mini" @click="deleteVariable(item)" style="box-sizing: border-box; outline: none">刪除</el-button>
                <el-button v-if="$access('/data/variable/add')" type="text" size="mini" @click="showEdit(item)" style="box-sizing: border-box; outline: none">编辑</el-button>

              </el-row>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <!-- 分页组件 -->
    <el-pagination @size-change="handleSizeChange" @current-change="changeCurPage" :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="pageTotal"></el-pagination>
    <add-public-variable :id="edit_id" v-if="show_add" v-model="show_add"></add-public-variable>
  </div>

</template>
<script>
  import addPublicVariable from "@/components/views/data/components/addPublicVariable.vue"
  export default {
    components: {
      addPublicVariable
    },
    data() {
      return {
        edit_id: "",
        show_add: false,
        q: "", //搜索关键词
        currentPage: 1,
        pageTotal: 0,
        search: "",
        selects: "",
        pageSize: 10,
        groundList: [],
        selectList: [{
          cascade: false,
          name: "角色",
          value: "role"
        }],
        formLabelWidth: "120px",
      };
    },
    methods: {
      /**
       * 展示编辑弹出框
       */
      showEdit:function(variable){
        this.edit_id = variable.id ;
        this.show_add = true  ;
      },
      //对象类型查询事件
      getData(resetPage) {
        if (resetPage) {
          this.currentPage = 1;
        }
        var param = this.$generateParams({
          object: this.selects,
          page: this.currentPage,
          page_size: this.pageSize,
          // keyword: this.q,
        });
        var url = this.$store.state.api_url.public_variable.list;
        this.axios
          .post(url, param)
          .then((response) => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            if (!data.data) {
              this.groundList = [];
              return;
            } else {
              this.$tools.replaceSpace(data.data.hits);
              this.groundList = data.data.hits;
              this.pageTotal = data.data.total_hits;
            }
          })
          .catch((error) => {
            console.log(error);
            this.$error("接口请求失败");
          });
      },
      //删除群主事件
      deleteVariable(variable) {
        console.log(variable) ;
        var url = this.$store.state.api_url.public_variable.delete;
        this.$confirm("此操作将永久删除该数据,不可恢复, 是否继续?", "提示", {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "danger",
          })
          .then(() => {
            var param = this.$generateParams({
              id: variable.id,
            });
            this.axios
              .post(url, param)
              .then((response) => {
                let data = response.data;
                if (data.code != 200) {
                  console.log("接口有错返回");
                  console.log(response);
                }
                if (data.code == 200) {
                  this.getData() ;
                }
              })
              .catch((error) => {
                this.$error("接口请求失败");
              });
          })
          .catch(() => {
            console.log("删除取消");
          });
      },
      //分页事件
      //当前页改变触发的事件
      fenYe(val) {
        this.currentPage = val;
        this.getData();
      },
      changeCurPage(val) {
        this.fenYe(val);
      },
      //改变上一页数据
      changePrePage(val) {
        this.fenYe(val);
      },
      changeNexPage(val) {
        this.fenYe(val);
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
    },
    created() {},
    mounted() {
      //请求select选项中的数据
      var param = this.$generateParams({
        object: "role",
        page: 1,
        page_size: 10,
      });
      this.axios
        .post("/mmp/model/base/object_type_list", param)
        .then((response) => {
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
        .catch((error) => {
          this.$error("接口请求失败");
        });
    },
    watch:{
      show_add: {
        handler(val, oldval) {
          this.getData();
        },
        deep: true, //对象内部的属性监听，也叫深度监听
      },
    },
    updated() {},
  };
</script>
