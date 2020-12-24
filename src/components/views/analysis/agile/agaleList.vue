<template>
  <div class="s-list">
    <div style="margin: 0 0 10px 20px;">
      分析模型
    </div>
    <div style="width: 100%;height: 100px;margin-bottom: 0px;">
      <el-card shadow="hover" v-for="model in modelList" :key="model.id" class="box-card">
        <div @click="onClickModel(model)">
          <div class="font-icon">
            <el-image :src="model.icon"></el-image>
          </div>
          <div class="content">
            <div class="title">{{model.title}}</div>
            <div>{{model.desc}}</div>
          </div>
        </div>
      </el-card>
    </div>
    <div style="text-align:right;margin-right: 30px;visibility: hidden;">
      <el-button @click="dialogVisible = true" type="text" >
        <el-image style="width: 50px;" :src="ellipsis"></el-image>
      </el-button>
    </div>
    <div style="background: #f5f5f5;width: 100%;height: 5px;margin: 0"></div>

    <el-dialog :visible.sync="dialogVisible" width="50%">
      <div v-for="(model,index) in otherModelList" :key="model.id">
        <el-row v-if="index%2==1" style="z-index: 1;">
          <div @click="onClickModel(model)" class="dialog-box">
            <div class="font-icon">
              <el-image :src="model.icon"></el-image>
            </div>
            <div class="content">
              <div class="title">{{model.title}}</div>
              <div>{{model.desc}}</div>
            </div>
          </div>
        </el-row>
        <div v-if="index%2==0">
          <div @click="onClickModel(model)" class="dialog-box">
            <div class="font-icon">
              <el-image :src="model.icon"></el-image>
            </div>
            <div class="content">
              <div class="title">{{model.title}}</div>
              <div>{{model.desc}}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <div style="padding-top: 20px ;">
      <div style="display: inline-block;width: 100%;">
        <span style="margin:0 10px 0 9px;">视图列表</span>
        <el-input @change="doSearch" v-model="search" placeholder="输入关键字搜索" suffix-icon="el-icon-search" clearable
          style="width: 10%;" />
        <el-button type="text" style="float: right;color: #939393;margin-right: 30px;" @click="onclickRefresh"><i class="el-icon-refresh"></i>刷新</el-button>
      </div>
      <table class="table table-bordered" v-loading="loading">
        <thead>
          <tr>
            <th>视图名称</th>
            <th>视图描述</th>
            <th>分析模型</th>
            <th>创建人</th>
            <th>创建时间</th>
            <th>最近修改人</th>
            <th>最近修改时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, index) in tableData">
            <tr :key="index">
              <td><span class="text-length" :title="row.view_name">{{ row.view_name}}</span></td>
              <td><span class="text-length" :title="row.note">{{ row.note ? row.note : '--'}}</span></td>
              <td>{{ row.model_type}}</td>
              <td>{{ $store.state.user_list.hasOwnProperty( row.role.username) ? $store.state.user_list[row.role.username] :  row.role.username}}</td>
              <td>{{ $tools.formatTime(row.create_time)}}</td>
              <td>{{ $store.state.user_list.hasOwnProperty( row.last_modify_user) ? $store.state.user_list[row.last_modify_user] :  row.last_modify_user}}</td>
              <td>{{ $tools.formatTime(row.update_time)}}</td>
              <td>
                <router-link v-if="$access('/analysis/model/viewDetail')" :to="'/analysis/model/taskDetail?type=view&task_id=' +row.view_id">
                  <el-button type="text" size="mini">查看</el-button>
                </router-link>
                <el-button type="text" size="mini" v-if="$access('/analysis/agile/auth')" @click="onclickShare(index,row)">权限</el-button>
                <el-button v-if="$access('/analysis/agile/delete')" slot="reference" type="text" size="mini" @click="onclickDelete(index,row)">删除</el-button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="totolData">
      </el-pagination>
      <el-dialog title="权限管理" :visible.sync="dialogShareFlag" :before-close="closeShareDialog" width="45%">
        <el-form>
          <el-form-item label="分享视图" :label-width="formLabelWidth">
            <el-select v-model="shared_users" multiple filterable placeholder="请选择" size='large' style="width: 60%">
              <el-option v-for="item in userList" :key="item.user_id" :label="item.user_name" :value="item.user_id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="视图地址" :label-width="formLabelWidth">
            <el-input v-model="view_url" style="width:60%" ref='tarurl'></el-input>
            <el-button style="display: inline-block" @click="copyUrl">复制链接</el-button>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="closeShareDialog">取 消</el-button>
          <el-button size="mini" type="primary" @click="submitPersons">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        totolData: 0,
        currentPage: 1,
        pageSize: 10,
        tableData: [],
        search: '',
        dialogVisible: false,
        loading: true,
        ellipsis: "/static/images/icon/ellipsis.png",
        modelList: [],
        otherModelList: [],
        shared_users: [],
        view_id: '',
        view_url: '',
        userList: [],
        dialogShareFlag: false,
        formLabelWidth: '120px'
      }
    },
    created() {
      this.$store.state.page_name = "敏捷分析";
    },
    methods: {
      closeShareDialog: function() {
        this.$count('MODEL', 'AUTHORITY_VIEW', {
          'view_id': this.view_id,
          type: 0
        }); //打点统计
        this.dialogShareFlag = false;
      },
      doSearch: function() {
        this.currentPage = 1;
        this.getData();
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
      getData() {
        var requestUrl = this.$store.state.api_url.view.list;


        let data = {
          "filter_type": "user",
          "filter_value": this.$store.state.user.user_id,
          "keyword": this.search,
          page_size: this.pageSize,
          page: this.currentPage,
        }
        let requestData = this.$generateParams(data);
        this.loading = true;
        this.axios.post(requestUrl, requestData).then((rep) => {
            this.tableData = rep.data.data.hits;
            this.totolData = rep.data.data.total_hits;
            this.loading = false;
          })
          .catch((error) => {
            this.loading = false;
            console.log(error);
          });
      },
      getModel() {
        let requestUrl = this.$store.state.api_url.model.list;
        let models = []
        this.modelList = []
        this.otherModelList = []
        this.axios.post(requestUrl).then((rep) => {
            if (rep.data.code == 200) {
              models = rep.data.data;
              let showModelArray = []
              for (let model of models) {
                if (model.isShow) {
                  showModelArray.push(model)
                }
              }

              showModelArray.sort((model_first, model_second) => {
                return model_first.displayOrder - model_second.displayOrder
              })

              for (let index in showModelArray) {
                let show = {
                  id: index,
                  icon: "/static/images/icon/" + showModelArray[index].iconName + ".png",
                  title: showModelArray[index].zhName,
                  desc: showModelArray[index].desc,
                  router: '/analysis/model/task?mid=' + showModelArray[index].mid
                }
                if (index < 4) {
                  this.modelList.push(show)
                } else {
                  this.otherModelList.push(show)
                }
              }
            }
          })
          .catch((error) => {
            alert(error);
          });
      },
      onClickModel(model) {
        this.$count('MODEL', 'MODEL_ANALYZE', {
          'model_name': model.title
        }); //打点统计
        this.$router.push(model.router)
      },
      onclickRefresh() {
        this.getData();
      },
      onclickDelete(index, row) {
        this.$confirm('此操作将永久删除该视图,不可恢复, 是否继续?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          var id = row.view_id;
          let data = {
            view_id: row.view_id,
          }
          let requestData = this.$generateParams(data);
          let requestUrl = this.$store.state.api_url.view.delete;
          this.$count('VIEW', 'DROP_VIEW', {
            view_id: row.view_id,
            type: 1
          }); //打点统计
          this.axios.post(requestUrl, requestData).then(response => {
            if (response.data.code == 200) {
              this.tableData.splice(index, 1);
            } else {
              this.$error();
            }
          }).catch(error => {
            console.log(error)
          })
        }).catch(() => {
          this.$count('VIEW', 'DROP_VIEW', {
            view_id: row.view_id,
            type: 0
          }); //打点统计
          console.log("删除取消");
        });
      },
      //查询权限接⼝
      getSearch() {
        let data = {
          view_id: this.view_id,
        }
        let requestData = this.$generateParams(data);
        let requestUrl = this.$store.state.api_url.view.view_users;
        this.axios.post(requestUrl, requestData).then(response => {
          if (response.data.code == 200) {
            let dataList = response.data.data.view_users.filter(item => item != this.$store.state.user.user_id)
            this.shared_users = dataList;
            dataList = [];
          } else {
            this.$error();
          }
        }).catch(error => {
          console.log(error)
        })
      },
      //分享事件
      onclickShare(index, row) {
        this.dialogShareFlag = true;
        this.view_id = row.view_id;
        this.$count('VIEW', 'UPDATE_VIEW', {
          "view_id": this.view_id
        }); //打点统计
        let linkUrl = window.location.href.replace('/analysis/agile/list', '/analysis/model/viewDetail')
        this.view_url = `${linkUrl}?task_id=${row.view_id}&type=view`;
        this.getSearch();
      },
      submitPersons() {
        let data = {
          view_id: this.view_id,
          shared_users: this.shared_users
        }
        let requestData = this.$generateParams(data);
        let requestUrl = this.$store.state.api_url.view.update_view_users;
        this.$count('MODEL', 'AUTHORITY_VIEW', {
          'view_id': this.view_id,
          type: 1
        }); //打点统计
        this.axios.post(requestUrl, requestData).then(response => {
          if (response.data.code == 200) {
            this.shared_users = [];
            this.view_url = ''
            this.$success('操作成功');
            this.dialogShareFlag = false;
            return;
          } else {
            this.$error();
          }
        }).catch(error => {
          console.log(error)
        })
      },

      //获取用户列表
      getUserList() {
        let requestUrl = this.$store.state.api_url.admin.all_user;
        this.axios.post(requestUrl).then(response => {
          if (response.data.code == 200) {
            let dataList = [];
            dataList = response.data.data.hits;
            dataList = dataList.filter(item => item.user_id != this.$store.state.user.user_id)
            this.userList = dataList;
          } else {
            this.$error();
          }
        }).catch(error => {
          console.log(error)
        })
      },
      //复制功能
      copyUrl() {
        this.$count('VIEW', 'COPY_LINK', {
          "view_id": this.view_id
        }); //打点统计
        var Url2 = this.$refs.tarurl;
        Url2.select(); // 选择对象
        try {
          if (document.execCommand('copy', false, null)) {
            document.execCommand("Copy");
            this.$success("复制成功，赶快去钉钉发送给TA吧！");
          } else {
            alert("复制失败，请手动复制");
          }
        } catch (err) {
          alert("复制失败，请手动复制");
        }
      }
    },
    mounted() {
      this.getData();
      this.getModel();
      this.getUserList();
    }
  }
</script>
<style>
  .s-list .el-card.box-card {
    width: 23%;
    height: 100%;
    float: left;
    margin-left: 1.6%;
    cursor: pointer;
    border: #FFF;
    color: #303133;
    -webkit-transition: .3s;
    transition: .3s;
  }

  .s-list .box-card .font-icon {
    float: left;
    width: 15%;
    margin: 10px 0 0 0;
  }

  .s-list .box-card .font-icon i {
    font-size: 40px;
    color: #0e73ff;
  }

  .s-list .box-card .content {
    float: left;
    width: 85%;
    height: 100%;
  }

  .s-list .box-card .content .title {
    font-weight: bold;
  }

  .s-list .dialog-box {
    width: 44%;
    height: 100%;
    float: left;
    margin-left: 1.6%;
    margin-bottom: 20px;
    cursor: pointer;
    z-index: 999;
  }

  .s-list .dialog-box .font-icon {
    float: left;
    width: 15%;
    margin: 10px 0 0 0;
  }

  .s-list .dialog-box .font-icon i {
    font-size: 40px;
    color: #0e73ff;
  }

  .s-list .dialog-box .content {
    float: left;
    width: 85%;
    height: 100%;
  }

  .s-list .dialog-box .content .title {
    font-weight: bold;
  }
</style>
