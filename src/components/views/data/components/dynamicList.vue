<template>
  <div>

    <el-row style="height:32px;line-height:16px;padding: 0px 0px 0px 2px;border-bottom: 1px solid rgb(204, 204, 204);margin: 23px 5px;font-size: 16px;">群组列表</el-row>
    <el-row>
      <el-input
        placeholder="请输入关键字搜索"
        suffix-icon="el-icon-search"
        style="width:160px;margin-left: 5px;"
        @input="searchRelultFun"
        v-model="searchVal">
      </el-input>
      <el-select v-model="selectVal" placeholder="请选择" @change="searchRelultFun">
        <el-option v-for="item in obj_options" :key="item.value" :label="item.name" :value="item.value"></el-option>
      </el-select>
    </el-row>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>群组名称</th>
          <th>群组描述</th>
          <th>创建人</th>
          <th>创建时间</th>
          <th>最近修改人</th>
          <th>最近修改时间</th>
          <th>对象类型</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in searchGroupList">
          <tr :key="index" v-if="item.folder_id == open_folder_id">
            <td>
              {{item.name}}
            </td>
            <td>
              {{item.desc}}
            </td>
            <td>{{$store.state.user_list.hasOwnProperty(item.create_user.username) ? $store.state.user_list[item.create_user.username] :  item.last_modify_user.username}}</td>
            <td>{{ $tools.formatTime(item.create_time)}}</td>
            <td>{{$store.state.user_list.hasOwnProperty(item.last_modify_user.username) ? $store.state.user_list[item.last_modify_user.username] :  item.last_modify_user.username}}</td>
            <td>{{ $tools.formatTime(item.last_modify_time)}}</td>
            <td>
              {{object_map[item.object_type]}}
            </td>
            
            <!-- 操作按钮 -->
            <td>
              <el-row>
                <!-- 查看成员 -->
                <el-button v-if="$access('/data/dynamic/add')" type="text" size="mini" @click="edit(item.id, item.folder_id)"
                  style="box-sizing: border-box; outline: none">编辑</el-button>
                <el-button v-if="$access('/data/dynamic/add')" type="text" size="mini" @click="delItem(item)" style="box-sizing: border-box; outline: none">刪除</el-button>
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
    props: ["openEditKey", "getDataCustom","open_folder_id"],
    data() {
      return {
        searchVal:"",
        selectVal:"role",
        currentPage: 1,
        obj_options:[],
        pageTotal: 0,
        search: "",
        selects: "",
        pageSize: 10,
        groundList: [],
        searchGroupList:[],
        value: "角色",
        dialogVisible: false,
        groupTrans: false,
        delId: "",
        formLabelWidth: "120px",
        object_map:{},
      };
    },
    methods: {
      searchRelultFun() {
          this.searchGroupList = this.groundList.filter(item=>{
            return item.name.indexOf(this.searchVal)>-1 && item.object_type == this.selectVal;
          });
      },
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
      edit(id, folder_id) {
        this.openEditKey(id, folder_id);
      },

      //删除群主事件
      delItem(item) { //确定删除Customlist
        this.$confirm('删除后不可恢复，请谨慎处理', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          let url = this.$store.state.api_url.dynamicDroup.del_dynamic_group;
          let data = {
            "id": item.id,
            "object": "role"
          }
          let param = this.$generateParams(data);
          this.axios.post(url, param).then((res) => {
            let data = res.data;
            if (data.code == 200) {
              this.$success("删除成功")
              this.getData();
              this.getDataCustom();
            } else {
              this.$error(res.data.msg)
            }
          }).catch((errors) => {
            console.log(errors);
          })
        }).catch(() => {

        });
      },
      /**
       * 获取对象类型列表
       */
      get_object_list: function() {
        var param = this.$generateParams({
          object: "role",
          page: 1,
          page_size: 10,
        });
        var $url = this.$store.state.api_url.public.object_type_list;
        this.axios
          .post($url, param)
          .then((response) => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
              console.log(response);
            }
            this.obj_options = data.data;
            this.obj_options.forEach(item=>{
              this.object_map[item.value] = item.name;
            })
          })
          .catch((error) => {
            this.$error("接口请求失败");
          });
      },
      getData() {
        let url = this.$store.state.api_url.dynamicDroup.dynamic_group_list;
        var param = this.$generateParams({
          page: this.currentPage,
          page_size: 999999999,
          is_all: this.$access('/data/dynamic/add'),
        });
        this.axios
          .post(url, param)
          .then((response) => {
            let data = response.data;
            this.groundList = data.data.hits;
            this.pageTotal = data.data.total_hits;
            this.searchRelultFun();
          })
          .catch((error) => {
            this.$error("接口请求失败");
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
    created() {
      this.getData();
    },
    mounted() {
      this.get_object_list() ;
    },
    updated() {},
  };
</script>
