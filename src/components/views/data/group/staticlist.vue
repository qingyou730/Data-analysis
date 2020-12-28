<template>
  <div>
    <div style="display: inline-block; width: 100%">
      <span style="margin: 0 10px 0 9px">群组列表</span>
      <el-input @input="selectOne(true)" v-model="q" placeholder="输入关键字搜索" clearable suffix-icon="el-icon-search" style="width: 200px; margin-right: 20px" />
      对象类型
      <el-select v-model="selects" placeholder style="width: 100px" @change="selectOne(true)">
        <el-option v-for="item in selectList" :key="item.value" :label="item.name" :value="item.value"></el-option>
      </el-select>
      <router-link to="/data/group/add" v-if="$access('/data/group/add')">
        <el-button size="mini"
          @click="countAdd"
          type="primary"
          icon="el-icon-plus"
          class="add-btn"
        ></el-button>
      </router-link>
    </div>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>群组名称</th>
          <th>来源</th>
          <th>群组描述</th>
          <th>群组人数</th>
          <th>数据更新时间</th>
          <th>创建人</th>
          <th>创建时间</th>
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
            <td>{{ item.source }}</td>
            <td><span class="text-length" :title="item.desc">{{ $tools.replaceRowSpace(item.desc)}}</span></td>
            <td>{{ $tools.replaceRowSpace(item.group_num)}}</td>
            <td>{{ $tools.formatTime(item.data_update_time) }}</td>
            <td>
              {{
                $store.state.user_list.hasOwnProperty(item.create_role)
                  ? $store.state.user_list[item.create_role]
                  : item.create_role
              }}
            </td>
            <td>{{ $tools.formatTime(item.create_time) }}</td>
            <!-- 操作按钮 -->
            <td>
              <el-row>
                <!-- 查看成员 -->
                <el-button v-if="$access('/data/group/member')" type="text" size="mini" @click="goMember(item.id, item.group_num)"
                  :displayName="item.id" id="searchMember" style="box-sizing: border-box; outline: none">查看</el-button>

                <el-button v-if="$access('/data/group/delete')" type="text" size="mini" @click="lookId(item)" style="box-sizing: border-box; outline: none">刪除</el-button>

                <el-button v-if="$access('/data/group/convert')" type="text" size="mini" @click="
                    groupTrans = true;
                    lookTransId(item.id);
                  "
                  style="box-sizing: border-box; outline: none">群组转换</el-button>

                <el-dialog title="群组转换" :before-close="closeTransDialog" :visible.sync="groupTrans">
                  <el-form :model="form">
                    <el-form-item label="原群组：" :label-width="formLabelWidth">
                      <el-input v-model="form.name" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="目标对象：" :label-width="formLabelWidth">
                      <el-select v-model="selects" placeholder="请选择活动区域">
                        <el-option v-for="item in selectList" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="目标名称：" :label-width="formLabelWidth">
                      <el-input v-model="form.targetName" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="群组描述：" :label-width="formLabelWidth">
                      <el-input v-model="form.projectDesc" autocomplete="off"></el-input>
                    </el-form-item>
                  </el-form>
                  <div slot="footer" class="dialog-footer">
                    <el-button @click="closeTransDialog">取 消</el-button>
                    <el-button type="primary" @click="
                        groupTrans = false;
                        groundTrans();
                      ">保
                      存</el-button>
                  </div>
                </el-dialog>
              </el-row>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <!-- 分页组件 -->
    <el-pagination @size-change="handleSizeChange" @current-change="changeCurPage" :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="pageTotal"></el-pagination>
  </div>
</template>
<script>
  export default {
    data() {
      return {
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
        value: "角色",
        dialogVisible: false,
        groupTrans: false,
        delId: "",
        //群组转换数据
        transId: "",
        form: {
          name: "",
          region: "",
          date1: "",
          date2: "",
          delivery: false,
          type: [],
          resource: "",
          desc: "",
          targetName: "",
          projectDesc: "",
        },
        formLabelWidth: "120px",
      };
    },
    methods: {
      closeTransDialog: function() {
        this.$count("GROUP", "TRAHSLATION_GROUP", {
          group_id: this.transId,
          type: 0,
        }); //打点统计
        this.groupTrans = false;
      },
      countAdd: function() {
        this.$count("GROUP", "UPLOAD_FILE", {}); //打点统计
      },
      //对象类型查询事件
      selectOne(resetPage) {
        if (resetPage) {
          this.currentPage = 1;
        }
        var param = this.$generateParams({
          object: this.selects,
          page: this.currentPage,
          page_size: this.pageSize,
          keyword: this.q,
        });
        this.axios
          .post("/mmp/group/group_list_page_query", param)
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
      //查看成员列表事件
      goMember(itemId, group_num) {
        var idArr = this.groundList.filter((item) => item.id == itemId);
        this.$router.push({
          path: "/data/group/member",
          query: {
            id: idArr[0].id,
          },
        });
      },
      //遮罩层事件
      handleClose(done) {
        this.$confirm("确认关闭？")
          .then((_) => {
            done();
          })
          .catch((_) => {});
      },
      //删除群主事件
      lookId(item) {
        if (item.create_role != this.$store.state.user.user_id) {
          this.$error("只允许删除自己的群组!");
          return;
        }
        this.delId = item.id;
        this.$confirm("此操作将永久删除该数据,不可恢复, 是否继续?", "提示", {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "danger",
          })
          .then(() => {
            this.$count("GROUP", "DROP_GROUP", {
              group_id: item.id,
              type: 1
            }); //打点统计
            this.delById();
          })
          .catch(() => {
            this.$count("GROUP", "DROP_GROUP", {
              group_id: item.id,
              type: 0
            }); //打点统计
            console.log("删除取消");
          });
      },
      delById() {
        var param = this.$generateParams({
          group_id: this.delId,
        });
        this.axios
          .post("/mmp/group/del_group", param)
          .then((response) => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            if (data.code == 200) {
              var param = this.$generateParams({
                object: this.selects,
                page: this.currentPage,
                page_size: 10,
              });
              this.axios
                .post("/mmp/group/group_list_page_query", param)
                .then((response) => {
                  let data = response.data;
                  if (data.code != 200) {
                    console.log("接口有错返回");
                    console.log(response);
                  }
                  this.groundList = data.data.hits;
                  this.pageTotal = data.data.total_hits;
                  this.currentPage = data.data.total_page;
                })
                .catch((error) => {
                  this.$error("接口请求失败");
                });
            }
          })
          .catch((error) => {
            this.$error("接口请求失败");
          });
      },
      //群组转换
      lookTransId(itemId) {
        this.transId = itemId;
        var idArr = this.groundList.filter((item) => item.id == itemId);
        this.form.name = idArr[0].name;
      },
      groundTrans() {
        var param = this.$generateParams({
          goal_desc: this.form.projectDesc,
          goal_name: this.form.targetName,
          goal_object: {
            id: this.selects,
            name: this.selects == "role" ? "角色" : "设计",
          },
          original_id: this.transId,
        });
        this.$count("GROUP", "TRAHSLATION_GROUP", {
          group_id: this.transId,
          type: 1,
        }); //打点统计
        this.axios
          .post("/mmp/group/group_transfer_job", param)
          .then((response) => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            if (data.code == 200) {
              this.$success("群主转换完成");
              //  this.$error
            }
          })
          .catch((error) => {
            this.$error("接口请求失败");
          });
      },
      //分页事件
      //当前页改变触发的事件
      fenYe(val) {
        this.currentPage = val;
        this.selectOne();
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
        this.selectOne();
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
          this.selectOne();
        })
        .catch((error) => {
          this.$error("接口请求失败");
        });
    },
    updated() {},
  };
</script>
