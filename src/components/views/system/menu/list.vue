<template>
  <div>
    <el-row class="page-titie-box">
      菜单管理
      <router-link to="/system/menu/add" v-if="$access('/system/menu/add')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>
    </el-row>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>菜单ID</th>
          <th>菜单名称</th>
          <th>菜单图标</th>
          <th>菜单地址</th>
          <th>排序值</th>
          <th>是否显示</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(first,first_index) in menu_list">
          <tr :key="first.menuId">
            <td>{{first.menuId}}</td>
            <td>{{first.name}}</td>
            <td>{{first.icon}}</td>
            <td>{{first.module ? '/' +first.module + '/' + first.controller + '/' + first.action:''}}</td>
            <td>{{first.sort}}</td>
            <td>{{first.isShow ? '是' :'否'}}</td>
            <td>
              <router-link :to="'/system/menu/edit?id=' + first.menuId" v-if="$access('/system/menu/edit')" >
                <el-button type="text" size="mini">编辑</el-button>
              </router-link>
              <span v-if="$access('/system/menu/delete')">
                <span style="color: #409EFF">/</span>
                <el-button type="text" size="mini" @click="deleteMenu(first_index,first.menuId,menu_list,first)">刪除</el-button>
              </span>

            </td>
          </tr>
          <template v-for="(second,second_index) in first.children">
            <tr :key="second.menuId">
              <td>{{second.menuId}}</td>
              <td v-if="second_index != (first.children.length-1)"><span class="space1"></span>├─{{second.name}}</td>
              <td v-if="second_index == (first.children.length-1)"><span class="space1"></span>└─{{second.name}}</td>
              <td>{{second.icon}}</td>
              <td>{{second.module ? '/' +second.module + '/' + second.controller + '/' + second.action:''}}</td>
              <td>{{second.sort}}</td>
              <td>{{second.isShow ? '是' :'否'}}</td>
              <td>
                <router-link :to="'/system/menu/edit?id=' + second.menuId" v-if="$access('/system/menu/edit')">
                  <el-button type="text" size="mini">编辑</el-button>
                </router-link>
                <span v-if="$access('/system/menu/delete')">
                  <span style="color: #409EFF">/</span>
                  <el-button type="text" size="mini" @click="deleteMenu(second_index,second.menuId,first.children,second)">刪除</el-button>
                </span>

              </td>
            </tr>

            <template v-for="(third,third_index) in second.children">
              <tr :key="third.menuId">
                <td>{{third.menuId}}</td>
                <td v-if="third_index != second.children.length-1"><span class="space1"></span>├─<span class="space"></span>├─
                  {{third.name}}</td>
                <td v-if="third_index == second.children.length-1"><span class="space1"></span>├─<span class="space"></span>└─
                  {{third.name}}</td>
                <td>{{third.icon}}</td>
                <td>{{third.module ? '/' +third.module + '/' + third.controller + '/' + third.action:''}}</td>
                <td>{{third.sort}}</td>
                <td>{{third.isShow ? '是' :'否'}}</td>
                <td>
                  <router-link :to="'/system/menu/edit?id=' + third.menuId" v-if="$access('/system/menu/edit')">
                    <el-button type="text" size="mini">编辑</el-button>
                  </router-link>
                  <span v-if="$access('/system/menu/delete')">
                    <span style="color: #409EFF">/</span>
                    <el-button type="text" size="mini" @click="deleteMenu(third_index,third.menuId,second.children,third)">刪除</el-button>
                  </span>
                </td>
              </tr>
            </template>
          </template>
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
        menu_list: [],
        search: ''
      }
    },
    methods: {
      tt:function(){
        if(this.$store.state.APP == 'kop'){
          this.$store.state.APP = 'dmc'
        }else{
          this.$store.state.APP = 'kop'
        }
      },
      deleteMenu(index, menuId, parent, node) {
        if (node.children.length > 0) {
          this.$error("请先删除该菜单下的子菜单");
          return;
        }
        this.$confirm('此操作将永久删除该菜单,不可恢复, 是否继续?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'danger'
        }).then(() => {
          var url = this.$store.state.api_url.menu.delete;
          var deleteParam = {
            menuId: menuId,
          }
          this.axios.post(url, deleteParam).then((res) => {
            var data = res.data;
            if (data.code == 200) {
              this.$success("删除成功");
              parent.splice(index, 1);
              //删除某个元素
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
    created() {
      this.$store.state.page_name = "菜单管理-列表";
    },
    mounted() {
      let requestUrl = this.$store.state.api_url.menu.list;
      this.axios.post(requestUrl).then((response) => {
        let data = response.data
        if (data.code != 200) {
          console.log("接口有错返回")
          console.log(response)
        }
        this.menu_list = data.data;
      }).catch((error) => {
        this.$error('接口请求失败');
      });
    }
  }
</script>
