<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-light">新增群组</div>
      </el-col>
    </el-row>
    <el-form
      :label-position="labelPosition"
      label-width="80px"
      :model="formLabelAlign"
    >
      <el-col :span="24">
        <div class="grid-content bg-purple-light" style="margin: 15px 6px">
          Detail
        </div>
      </el-col>
      <el-form-item label="群组名称">
        <el-input v-model="formLabelAlign.name"></el-input>
      </el-form-item>
      <el-form-item label="群组描述">
        <el-input v-model="formLabelAlign.desc"></el-input>
      </el-form-item>
      <el-form-item label="对象类型">
        <el-select v-model="selects" placeholder style @change="selectOne">
          <el-option
            v-for="item in selectList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 上传文件 -->

      <el-row :gutter="20" style="padding-bottom: 15px">
        <el-col :span="1"><div class=" bg-purple">文件上传</div></el-col>
        <el-col :span="6"
          ><input
            id="file"
            name="file"
            required="true"
            type="file"
            multiple="multiple"
            class="input__inner"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/csv-schema"
          />
          <el-col>
            <span class="help-block" style="font-size: 12px">
              请上传一个Excel文件.
              <font color="red">只取第一个表的第一列</font>
            </span>
          </el-col>
        </el-col>
      </el-row>
      <!-- <el-row class="row">
        <el-col :span="8">
          <div class="grid-content bg-purple-light" style="margin: 15px 6px">
            Excel文件
          </div>
        </el-col>
        <el-col :span="16">
          <input
            accept=".xls, .xlsx"
            id="file"
            name="file"
            required="true"
            type="file"
            multiple="multiple"
          />
          <div>
            <span class="help-block" style="font-size: 12px">
              请上传一个Excel文件.
              <font color="red">只取第一个表的第一列</font>
            </span>
          </div>
        </el-col>
      </el-row> -->
    </el-form>
    <div class="row">
      <el-col :span="24">
        <el-button size="mini" type="primary" id="submit" @click="subValue">
        保存
        </el-button>
        <el-button size="mini" type="text" id="addBtn" @click="goback()">返回</el-button>
      </el-col>
    </div>
  </div>
</template>
<script>
import myAxios from "axios";
myAxios.defaults.headers.post["Content-Type"] = "multipart/form-data";
export default {
  data() {
    return {
      labelPosition: "right",
      formLabelAlign: {
        name: "",
        desc: "",
        objType: "",
      },
      selectList: [],
      value: "",
      selects: "",
    };
  },
  methods: {
    goback() {
      //   this.$router.history.back();
      this.$router.go(-1);
    },
    selectOne(event) {
      //change 触发事件
      //直接就拿到当前的这个对象了
    },
    subValue() {
      //js 预备检查
      if (this.formLabelAlign.name == "") {
        this.$error("请填入群组名称");
        return;
      } else if (this.formLabelAlign.desc == "") {
        // this.$error("请输入群组描述");
        // return;
      }
      let inputV = document.getElementById("file");
      if (!inputV.value) {
        this.$error("请选择文件");
        return;
      }
      let param = this.$generateParams({
        desc: this.formLabelAlign.desc,
        name: this.formLabelAlign.name,
        object: this.selects,
      });
      this.$count('GROUP','SAVE_GROUP',{});//打点统计
      this.axios
        .post("/mmp/group/group_create_by_upload", param)
        .then((response) => {
          let data = response.data;
          if (data.code != 200) {
            console.log("接口有错返回");
            this.$error(data.msg);
            return;
          }
          let cGrounpId = data.data.group_id;
          let fs = document.getElementById("file").files[0];
          let formData = new FormData(); //上传文件的数据
          let max_size = 1024 * 1024 * 5; //文件大小的最大值（1024 * 1024 * 5为5M）
          formData.append("file", fs);
          // this.axios.defaults.headers.post['Content-Type'] =
          //   'multipart/form-data'
          myAxios
            .post(
              "/mmp/group/group_upload?group_id=" +
                cGrounpId +
                "&app="+this.$store.state.APP.toUpperCase()+"&create_email=" +
                "lixiaohui@game2sky",
              formData
            )
            .then((response) => {
              // this.axios.defaults.headers.post['Content-Type'] =
              //   'application/json'
              let data = response.data;
              if (data.code == 200) {
                this.formLabelAlign = {
                  name: "",
                  desc: "",
                  objType: "",
                };
                inputV.value = "";
                this.$success("添加成功");
                this.$router.push({'path':'/data/group/list'})
                return;
              }
              if (data.code != 200) {
                console.log("接口有错返回");
                this.$error(data.msg);
                return
              }
            })
            .catch((error) => {
              console.log(error);
              this.$error(error.msg);
              return;
            });
        })
        .catch((error) => {
          console.log(error);
          this.$error(error.msg);
        });
    },
  },
  mounted() {
    let param = this.$generateParams({
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
      })
      .catch((error) => {
        this.$error("接口请求失败");
      });
  },
};
</script>
<style>
.bg-purple {
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 10px 0 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 70px;
}
.input__inner {
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: 0;
  padding: 0 15px;
  -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
</style>
