<template>
  <div>
    <el-row class="timing-border" style="padding: 0px 0px 20px 0px">hive临时表-预览-{{ tableName }}</el-row>
    <table class="table">
      <thead style="">
        <tr>
          <th v-for="(item, index) in groundList[0]" :key="index">{{index}}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, index) in groundList">
          <tr :key="index">
            <td  v-for="(col, col_index)  in row" :key="col_index">{{col}}</td>
          </tr>
        </template>
      </tbody>
    </table>
    <div
      style="width: 100%; padding-left: 90%; margin: 18px 0;   box-sizing: border-box;"
    >总共<span style=" color: rgb(62, 143, 255);">{{ totalSize }}</span>条</div>
    <div
      style="width: 100%; padding-left: 90%; margin: 18px 0; color:#606266; box-sizing: border-box;"
    >只展示前{{renderLength}}条的提示</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableName: "",
      groundList: [],
      totalSize: 0,
      renderLength: 0,
    };
  },
  methods: {},
  mounted() {
    this.id = this.$route.query.id;
    this.totalSize = this.$route.query.count;
    let param = this.$generateParams({
      id: this.id
    });
    this.axios
      .post("/manager/hive/pick", param)
      .then(response => {
        let data = response.data;
        if (data.code != 200) {
          console.log("接口有错返回");
          console.log(response);
        }
        this.groundList = data.data.rows;
        this.renderLength = this.groundList.length;
      })
      .catch(error => {
        console.log(error);
        this.$error("接口请求失败");
      });
  }
};
</script>
<style>
.timing-border {
  border-bottom: 1px solid #b3b3b3;
  padding-bottom: 5px;
}
</style>