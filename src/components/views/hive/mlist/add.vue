<template>
  <div>
    <el-row class="timing-border" style="padding: 0 0 10px 0">创建hive临时表</el-row>
    <el-row>
      <el-col :span="2">
        <div class="grid-content bg-purple" style="color: transparent;">.</div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content bg-purple-light">
          <el-form
            :model="data"
            ref="data"
            label-width="100px"
            class="demo-dynamic"
            label-position="rigth"
            :span="10"
          >
            <el-form-item label="描述信息">
              <el-input v-model="data.desc"></el-input>
            </el-form-item>
            <el-form-item label="字段与类型" inline="true" class="hive-input">
              <!-- <el-input v-model="value" class="inline-b" placeholder="字段"></el-input>
              <el-select v-model="type" class="inline-b">
                <el-option
                  v-for="(item) in typelist"
                  :label="item.name"
                  :key="item.value"
                  :value="item.value"
                ></el-option>
              </el-select>
              <el-button
                plain
                style="width: 8%; height: 38px; padding: 2px 1px 2px 0px;  box-sizing: border-box; display: inline-block;"
                @click="addItem"
              >添加</el-button>-->

              <template v-for="(item, index) in data.columns" >
                <el-input v-model="item.value"  class="inline-b" :key="item.id" placeholder="字段名不能为中文"></el-input>
                <el-select v-model="item.type" class="inline-b" :key="index + 'fildname'">
                  <el-option
                    v-for="(clo) in typelist"
                    :label="clo.name"
                    :value="clo.value"
                    :key="clo.value+'fildtype'"
                  ></el-option>
                </el-select>
                <el-button
                  plain
                  style="width: 8%; height: 38px; padding: 2px 1px 2px 0px;  box-sizing: border-box; display: inline-block;"
                  @click="addItem"
                  v-if="index == 0"
                  :key="item.id+'add'"
                >添加</el-button>
                <el-button
                  plain
                  style="width: 8%; height: 38px; padding: 2px 1px 2px 0px;  box-sizing: border-box; display: inline-block;"
                  @click="delItem(index)"
                  v-if="index >= 1"
                  :key="item.id + 'delete'"
                >删除</el-button>
              </template>
            </el-form-item>
            <el-form-item label="分隔符">
              <el-select v-model="data.split_char">
                <el-option v-for="item in symbolList" :value="item" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="有效时长">
              <el-select v-model="data.effective_days">
                <el-option v-for="item in timeArr" :value="item" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="数据源文件">
              <div style="border: 1px solid #DCDFE6; box-sizing: border-box; padding-left: 30px">
                <input
                  id="file"
                  name="file"
                  required="true"
                  type="file"
                  multiple="multiple"
                  class="inline-b"
                />
                <span class="help-block" style="font-size: 12px; color: red">请上传一个txt文件.</span>
              </div>
            </el-form-item>
            <el-row>
              <el-col :span="10">
                <div class="grid-content bg-purple" style="color: transparent;">.</div>
              </el-col>
              <el-col :span="14">
                <el-button @click="submit()">提交</el-button>
                <el-button @click="goBack()">返回</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple"></div>
      </el-col>
    </el-row>

    <!--sql格式显示-->
    <format-sql :key="number" :msg="msg" :sql="sql"  v-if="showSqlDialog" v-model="showSqlDialog" :status="status" ></format-sql>

  </div>
</template>
<script>
import myAxios from "axios";
myAxios.defaults.headers.post["Content-Type"] = "multipart/form-data";
import formatSql from './formatSql.vue';
import sqlFormatter from "sql-formatter";
export default {
  components: {
    formatSql
  },
  data() {
    return {
      number:1,
      sql:"",//建表sql
      showSqlDialog:false,
      status:"",
      msg:"",
      data: {
        columns: [{ value: "", type: "string" , id: new Date().getTime()}],
        desc: "",
        effective_days: "",
        path: "",
        split_char: "",
        table_name: "",
        hive_id : "" ,
      },
      typelist: [
        { name: "int", value: "int" },
        { name: "float", value: "float" },
        { name: "double", value: "double" },
        { name: "date", value: "date" },
        { name: "string", value: "string" },
        { name: "boolean", value: "boolean" },
      ],
      // value: "",
      // type: "",
      //分隔符集合
      symbolList: [",", "#"],
      //有效时长集合
      timeArr: ["5天", "10天", "15天", "30天"],
      //提交数据路径
      submitPath: "",
    };
  },
  methods: {
    addItem() {
      this.data.columns.push({ value: "", type: "string", id:new Date().getTime()});
    },
    delItem(index) {
      // let index = this.data.columns.indexOf(item);
      if (index > 0) {
        this.data.columns.splice(index, 1);
      }
    },
    //提交事件
    submit() {
      this.number++;
      //提交文件操作
      let fs = document.getElementById("file").files[0];
      let formData = new FormData(); //上传文件的数据
      let max_size = 1024 * 1024 * 5; //文件大小的最大值（1024 * 1024 * 5为5M）
      formData.append("file", fs);
      //预检验证
      // if(!this.data.desc){
      //   this.$error("请完善表单信息");
      //   return;
      // }
      if(!this.data.desc){
        this.$error("请输入描述");
        return;
      }
      if(!this.data.split_char){
        this.$error("请选择分分隔符");
        return;
      }
      if(!this.data.effective_days){
        this.$error("请选择有效时间");
        return;
      }
      if(!this.data.columns[0].value){
        this.$error("请完善字段信息");
        return;
      }
      if(!fs){
        this.$error("请上传文件");
        return;
      }

      myAxios
        .post("/file/upload?path=/user/hadoop", formData)
        .then((response) => {
          let data = response.data;
          if (data.code != 200) {
            this.$error(data.msg);
            return  ;
          }
          var  file_path = data.data.file_path ;
          var  hive_id = data.data.hive_id ;
          //提交数据调控
          let sumObj = {
            columns: [
              // { value: "", type: "" }
            ],
            desc: "",
            effective_days: "",
            file_path: "",
            split_char: "",
            table_name: "",
          };
          // let filedOne = this.value.toString() + " " + this.type.toString();
          // sumObj.columns.push(filedOne);
          for (let i = 0; i < this.data.columns.length; i++) {
            let cloData =
              this.data.columns[i].value.toString() +
              " " +
              this.data.columns[i].type.toString();
            sumObj.columns.push(cloData);
          }
          sumObj.desc = this.data.desc;
          sumObj.effective_days = parseInt(this.data.effective_days);
          sumObj.table_name = this.data.table_name;
          sumObj.split_char = this.data.split_char;
          sumObj.file_path = file_path;
          sumObj.hive_id = hive_id;
          let param = this.$generateParams(sumObj);
          this.axios
            .post("/manager/hive/create", param)
            .then((response) => {
              let data = response.data;
              if (data.code != 200) {
                if(data.data.hasOwnProperty('create_table_sql')){
                  this.sql = data.data.create_table_sql ;
                  this.showSqlDialog = true;
                  this.status = "error";
                  this.msg = data.msg ;
                }else{
                  this.$error(response.data.msg);
                }
              }
              if (data.code == 200) {
                if(data.data.hasOwnProperty('create_table_sql')){
                  this.sql = data.data.create_table_sql ;
                  this.showSqlDialog = true;
                  this.status = "success";
                  this.msg = "";
                }else{
                  this.$success("Hive临时表添加成功");
                  this.$router.push({path:'/hive/mlist/list'});
                }
              }
            })
            .catch((error) => {
              console.log(error);
              this.$error("接口请求失败");
            });
        })
        .catch((error) => {
          console.log(error);
          this.$error("接口请求失败");
        });
    },
    //返回事件
    goBack() {
      this.$router.go(-1);
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
