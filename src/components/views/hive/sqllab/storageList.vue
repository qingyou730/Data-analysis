<template>
  <div>
    <el-row class="page-titie-box">
      保存的查询列表
      <!--<router-link to="/hive/sqllab/sqllabaddsavelist" v-if="$access('/hive/sqllab/sqllabaddsavelist')">
        <el-button type="primary" icon="el-icon-plus" class="add-btn"></el-button>
      </router-link>-->
    </el-row>
    <el-row style="margin-top: 30px">
      <el-select v-model="search_type" @change="searchType($event)">
        <el-option label="所有人" value="all"></el-option>
        <el-option label="部门" value="department"></el-option>
        <el-option label="仅自己" value="self"></el-option>
      </el-select>
    </el-row>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>任务ID</th>
          <th>任务名称</th>
          <th>创建时间</th>
          <th>创建人</th>
          <th style="width: 30%">sql</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in tableData">
          <tr :key="index">
            <td>{{ item.id}}</td>
            <td>{{ item.task_name }}</td>
            <td>{{ item.submit_time }}</td>
            <td>{{ $store.state.user_list.hasOwnProperty(item.create_role) ? $store.state.user_list[item.create_role] :  item.create_role}}</td>
            <td style="cursor: pointer;" @click="formatSql(item.sql)">
                <pre style="white-space: nowrap;text-overflow: ellipsis;font-family: inherit;font-size:14px;overflow: hidden;width:40%">
                {{item.sql.slice(0,50)}}</pre>
            </td>
            <!-- 操作按钮 -->
            <td style="padding: 6px 0 6px 6px;">
                <el-button
                  v-if="$access('/hive/sqllab/storageList')"
                  type="text"
                  size="mini"
                  @click="linkToEdit(item)"
                  style="box-sizing: border-box; font-size: 1px; color:#0e73ff; text-align: center"
                >
                  查看
                </el-button>
                <!--<el-button
                  v-if="$access('/hive/sqllab/storageList')"
                  type="text"
                  size="mini"
                  @click="saveEditPage(item)"
                  style="box-sizing: border-box; font-size: 1px; color:#0e73ff; text-align: center"
                >
                  编辑
                </el-button>-->
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!--sql格式显示-->
    <format-sql :sql='sql'  v-if="sqlDialog" v-model="sqlDialog" ></format-sql>
  </div>
</template>
<script>
import formatSql from './formatSql.vue';
export default {
    props: [],
    components: {
        formatSql
    },
    data() {
        return{
            currentPage: 1,
            pageSize: 10,
            tableData: [],
            total: 0,
            "filter_type": "user",
            "filter_value": "",
            "search_type":"self",
            sql: '',
            sqlDialog: false
        }
    },
    methods: {
        //跳转套sql编辑页
        linkToEdit(item) {
            this.$router.push({ path: '/hive/sqllab/submit', query: { linkSql: item.sql, name: item.task_name,type:'save','id':item.id}})
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.getData();
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getData();
        },
        searchType(type){
            if(type == 'all'){
            this.filter_value = 'all'
            }
            if(type =='self'){
            this.filter_type = 'user';
            this.filter_value =  this.$store.state.user.user_id ;
            }
            if(type=='department'){
            this.filter_type = 'group';
            this.filter_value =  this.$store.state.user.group ;
            }
            this.getData();
        },
        saveEditPage(item) {
          this.$router.push({ path: '/hive/sqllab/sqllabaddsavelist', query: { sql: item.sql, desc: item.desc, task_name: item.task_name }})
        },
        formatSql(sql) {
            this.sql = sql;
            this.sqlDialog=true;
      },
        getData() {
            this.loading = true;
            let requestUrl = "/mmp/sql/save_sql_list";
            let data = {
                page_size: this.pageSize,
                page: this.currentPage,
                object: "role",
                "filter_type": this.filter_type,
                "filter_value": this.filter_value,
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                this.loading = false;
                if(rep.data.code ==  200){
                this.tableData = rep.data.data.hits;
                this.total = rep.data.data.total_hits;
                this.totalPage = rep.data.data.total_page;
                }else{
                this.$error(rep.data.msg);
                }
            })
            .catch((error)=> {
                this.loading = false;
                console.log(error);
          });
        }
    },
    mounted() {
        this.filter_type = 'user';
        this.filter_value =  this.$store.state.user.user_id ;
        this.getData();
    },
    created() {
    },
    watch: {

    }
}
</script>
