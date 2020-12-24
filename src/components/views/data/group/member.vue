<template>
  <div>
    <!-- 下载静态页面 -->
    <el-row>
      成员列表
      <!-- <el-button
        type="primary"
        icon="el-icon-download"
        class="add-btn"
      ></el-button>-->
      <el-button type="primary" icon="el-icon-download" class="add-btn" @click="dialogFormVisible = true"></el-button>

      <el-dialog title :visible.sync="dialogFormVisible">
        <template>
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="city in cities" :label="city.value" :key="city.value">{{ city.name }}</el-checkbox>
          </el-checkbox-group>
        </template>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="
              dialogFormVisible = false
              download()
            ">确
            定</el-button>
        </div>
      </el-dialog>
    </el-row>
    <!-- 列表渲染静态页面 -->
    <template>
      <table class="table table-bordered" v-loading="loading">
        <thead style="">
          <tr>
            <th v-for="(item, index) in tableData[0]" :key="index">{{index}}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, index) in tableData">
            <tr :key="index">
              <td v-for="(col, col_index)  in row" :key="col_index">{{col}}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
    <div style="width: 100%; padding-left: 90%; margin: 18px 0;   box-sizing: border-box;">总共<span style=" color: rgb(62, 143, 255);">{{ total }}</span>条</div>
    <div style="width: 100%; padding-left: 75%; margin: 18px 0; color:#606266; box-sizing: border-box;">只展示前50条的提示，了解更多详情请点击右上方下载按钮</div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        pageSize: 1000000,
        currentPage: 1,
        total: 0,
        //多选数据数据
        dialogFormVisible: false,
        checkAll: false, //全选子选项
        checkedCities: [],
        cities: [],
        isIndeterminate: false, //是否默认选中全选按钮 但不是选中全部子项
        cityOptions: [],
        //table 数据
        tableData: [],
        loading: true,
      };
    },
    methods: {
      getData() {
        let useId = this.$route.query.id;
        let requestUrl = "/mmp/group/group_info_page_by_id";
        let data = {
          group_id: useId,
          page_size: this.pageSize,
          page: this.currentPage
        };
        let requestData = this.$generateParams(data);
        this.axios
          .post(requestUrl, requestData)
          .then(rep => {
            let data = rep.data;
            if (!data.data) {
              this.tableData == [];
              this.loading = false;
              this.$error('没有群组数据');
              return;
            } else {
              this.tableData = data.data.hits.slice(0, 49);
              this.total = data.data.total_hits;
              this.loading = false;
            }
          })
          .catch((error) => {
            this.loading = false;
            alert(error);
          });
      },
      //下载事件
      download() {
        let useId = this.$route.query.id;
        let requestUrl = "/mmp/group/group_info_download";
        let email = this.$store.state.user.email;
        let data = {
          email: email,
          fields: this.checkedCities,
          group_id: useId,
          object: "role"
        };
        let requestData = this.$generateParams(data);
        this.axios
          .post(requestUrl, requestData)
          .then(rep => {
            if (rep.data.code == 200) {
              this.$success("任务提交成功,下载完成后将发送邮件");
              return;
            }
          })
          .catch(function(error) {
            alert(error);
          });
      },

      //多选事件
      handleCheckAllChange(val) {
        this.checkedCities = val ? this.cityOptions : [];
        this.isIndeterminate = false;
      },
      handleCheckedCitiesChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.cities.length;
        this.isIndeterminate =
          checkedCount > 0 && checkedCount < this.cities.length;
      },
      //table 事件
      tableRowClassName({
        row,
        rowIndex
      }) {
        if (rowIndex % 2 == 1) {
          return "warning-row";
        }
        return "";
      }
    },
    mounted() {
      this.getData();
      //拿取字段名称
      let requestUrl = "/mmp/group/group_display_fields";
      let data = {
        object: "role"
      };
      let requestData = this.$generateParams(data);
      this.axios
        .post(requestUrl, requestData)
        .then(rep => {
          this.cities = rep.data.data;
          const data = rep.data.data;
          for (let i = 0; i < data.length; i++) {
            this.cityOptions.push(data[i].value);
          }
        })
        .catch(function(error) {
          console.log(error);
          alert(error);
        });
    }
  };
</script>
<style>
  .el-table .warning-row {
    background: #fafafa;
  }
</style>
