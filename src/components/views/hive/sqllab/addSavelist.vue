<template>
  <div>
    <el-row class="timing-border" style="padding: 0 0 10px 0">添加保存的查询</el-row>
    <el-row>
      <el-col :span="2">
        <div class="grid-content bg-purple" style="color: transparent;">.</div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content bg-purple-light">
          <el-form
            label-width="100px"
            class="demo-dynamic"
            label-position="rigth"
            :span="10"
          >
            <el-form-item label="标签">
              <el-input v-model="saveName"></el-input>
            </el-form-item>
            <el-form-item label="描述信息">
              <el-input v-model="saveDesc"></el-input>
            </el-form-item>
            <!--<el-form-item label="数据库">
              <el-select v-model="saveDatabase">
                <el-option v-for="item in symbolList" :value="item" :key="item"></el-option>
              </el-select>
            </el-form-item>-->
            <el-form-item label="sql">
              <el-input
                type="textarea"
                :rows="4"
                placeholder="请输入sql"
                v-model="saveSql">
              </el-input>
            </el-form-item>
            <el-row>
              <el-col :span="3">
                <div class="grid-content bg-purple" style="color: transparent;">.</div>
              </el-col>
              <el-col :span="14">
                <el-button type="primary" id="submit" @click="submitSaveParam()">保存<i class="el-icon-upload el-icon--right"></i></el-button>
                <el-button type="primary" @click="formatSql">格式化SQL</el-button>
                <el-button type="primary" @click="goBack">返回<i class="el-icon-back el-icon--right"></i></el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple"></div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import sqlFormatter from "sql-formatter";

export default {
  data() {
    return {
        saveDesc: '',
        saveName: '',
        saveSql: '',
        saveDatabase: ''
    };
  },
  mounted() {
    console.log(this.$route);
    if(this.$route.query) {
      this.saveDesc = this.$route.query.desc;
      this.saveName = this.$route.query.task_name;
      this.saveSql = this.$route.query.sql;
    }
  },
  methods: {
      formatSql() {
        this.saveSql = sqlFormatter.format(this.saveSql);
      },
      goBack() {
        this.$router.go(-1); 
      },
      submitSaveParam() {
        if(!this.saveSql) {
          this.$error('请输入查询sql');
          return;
        }
        if(!this.saveName) {
          this.$error('请输入保存名称');
          return;
        }
        if(!this.saveDesc) {
          this.$error('请输入保存描述');
          return;
        }
        this.storageDialog = false;
        let requestUrl = "/mmp/sql/save_sql_task";
        let data = {
          sql: this.saveSql,
          task_name: this.saveName,
          desc: this.saveDesc,
        };
        let requestData = this.$generateParams(data);
        this.axios
          .post(requestUrl, requestData)
          .then(rep => {
            if(rep.data.code ==  200){
              this.$success('保存成功');
            }else{
              this.$error(rep.data.msg);
            }
          })
          .catch((error)=> {
            console.log(error);
          }); 
      },
  },
};
</script>
<style>
.timing-border {
  border-bottom: 1px solid #b3b3b3;
  margin-bottom: 25px;
}
.hive-input .inline-b {
  display: inline-block;
  padding: 2px 1px 2px 0px;
  box-sizing: border-box;
  width: 43%;
}
</style>