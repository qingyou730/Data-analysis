<template>
  <div class="look-sql">
    <el-row>
      <el-col :span="4" style="color: transparent;">1</el-col>
      <el-col :span="16" style="border: 1px solid #ccc">
        <div
          v-if="flagSql"
          style="width: 100%; height: 50px; color:#ccc; font-size: 16px; text-align:center; line-height:50px"
        >暂无数据</div>
        <el-collapse v-model="activeNames" style="box-sizing: border-box; padding-left:25px;">
          <el-collapse-item v-for="(item,key) in param_list" :key="key" :title="key">
            <el-col :span="22" class="task_right">
              <div class="my-form-row-ding">
                <span class="my-form-label-ding">key:</span>
                <div class="my-form-right" style="display: inline-block;">
                  <el-input :value="key"></el-input>
                </div>
              </div>
              <div class="my-form-row-ding">
                <span class="my-form-label-ding">sql</span>
                <div class="my-form-right-ding">
                  <pre>
                    <code v-html="item" ref="odiv">
                    </code>
                  </pre>
                </div>
              </div>
            </el-col>
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :span="4" style="color: transparent;">1</el-col>
    </el-row>
  </div>
</template>
<script>
import sqlFormatter from "sql-formatter";
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';
export default {
  data() {
    return {
      param_list: {},
      task_id: 0,
      activeNames: "",
      flagSql: false
    };
  },
  methods: {
    getTaskParam() {
      this.task_id = this.$route.query.task_id;
      let url = this.$store.state.api_url.task.find_sql;
      let param = this.$generateParams({
        task_ids: [this.task_id]
      });
      this.axios
        .post(url, param)
        .then(res => {
          let data = res.data;
          if (data.code != 200) {
            console.log(data);
          } else {
            this.param_list = data.data[0].sql;
            if (!JSON.stringify(this.param_list)) {
              this.flagSql = true;
            }
            for (let key in this.param_list) {
              this.param_list[key] = sqlFormatter.format(this.param_list[key]);
              // this.param_list[key] =
              //   "select * from a where b >0 and c = '2019-01-01' group by d having e>0 order by m;";
              // this.param_list[key] = sqlFormatter.format(this.param_list[key]);
              this.flagSql = false;
            }
          }
        })
        .catch(error => {
          this.param_list = {};
          console.log(error);
          this.$error("保存视图失败");
        });
    }
  },
  mounted() {
    this.getTaskParam();
    // this.$refs.odiv.html(this.pa)
  },
  updated() {
    console.log(this.$refs.odiv, this.$refs.odiv.length);
    // for (let i = 0; i < this.$refs.odiv.length; i++) {
    //   this.$nextTick(() => {
    //     this.$refs.odiv[i].forEach(block => {
    //       hljs.highlightBlock(block);
    //     });
    //   });
    // }
    this.$refs.odiv.forEach(block => {
        hljs.highlightBlock(block);
      });
    // this.$nextTick(() => {
    //   this.$refs.odiv.forEach(block => {
    //     hljs.highlightBlock(block);
    //   });
    // });
  }
};
</script>
<style>
.my-form-right-ding {
  width: 870px;
  display: inline-block;
  min-height: 200px !important;
  padding-left: 10px;
  box-sizing: border-box;
}
.my-form-row-ding {
    margin-top: 5px;
}
.my-form-row-ding .my-form-label-ding{
  text-align: left;
  display: inline;
}
.my-form-row-ding .my-form-right{
  width: 689px;
  padding-left: 10px;
  box-sizing: border-box;
}
.look-sql pre {
  outline: 1px solid #ccc;
  padding: 5px;
  margin: 5px;
  font-weight: bold;
  font-size: 16px;
  overflow: scroll;
}
pre .hljs{
  color: black;
  background: #f6f6f6;
}
pre .hljs-string{
  color: #8259d1;
}
pre .hljs-keyword{
  color: #db5360;
}
</style>
