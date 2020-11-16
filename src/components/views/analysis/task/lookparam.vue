<template>
  <div>
    <el-row>
      <el-col :span="4" style="color: transparent;">1</el-col>
      <el-col :span="16" style="border: 1px solid #ccc">
        <el-collapse v-model="activeNames" style="box-sizing: border-box; padding-left:25px;">
          <el-collapse-item v-for="(item,key) in param_list" :key="key" :title="item.module_type">
            <el-col :span="22" class="task_right">
              <div class="my-form-row">
                <span class="my-form-label-ding">NO:</span>
                <div class="my-form-right" style="display: inline-block;">
                  <el-input :value="item.no"></el-input>
                </div>
              </div>
              <div class="my-form-row">
                <span class="my-form-label-ding">module_type:</span>
                <div class="my-form-right" style="display: inline-block;">
                  <el-input :value="item.module_type"></el-input>
                </div>
              </div>
              <div class="my-form-row">
                <span class="my-form-label-ding">param:</span>
                <div class="my-form-right-param" style="display: inline-block;">
                  <pre v-html="item.param"></pre>
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
export default {
  data() {
    return {
      param_list: "",
      task_id: 0,
      colArr: "",
      activeNames: ""
    };
  },
  methods: {
    //高亮函数
    // output(name, inp) {
    //   name.appendChild(document.createElement("pre")).innerHTML = inp;
    // },
    output(inp) {
      return (document.createElement("pre").innerHTML = inp);
    },
    syntaxHighlight(json) {
      json = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function(match) {
          var cls = "number";
          var color = "#805ac8";
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "key";
              color = "#db5461";
            } else {
              cls = "string";
            }
          } else if (/true|false/.test(match)) {
            cls = "boolean";
          } else if (/null/.test(match)) {
            cls = "null";
          }
          return (
            '<span class="' +
            cls +
            '" style="color:' +
            color +
            '">' +
            match +
            "</span>"
          );
        }
      );
    },
    /**
     * 获取任务参数
     */
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
            this.param_list = data.data[0].modules;
            for (let i = 0; i < this.param_list.length; i++) {
              this.param_list[i].param = JSON.parse(this.param_list[i].param);
              const str = JSON.stringify(
                this.param_list[i].param,
                undefined,
                4
              );
              this.param_list[i].param = str;
              this.param_list[i].param = this.syntaxHighlight(str);
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
  }
  // updated() {
  //   console.log(this.$refs[this.param_list.no])
  // }
};
</script>
<style>
.my-form-right-param {
  width: 870px!important;
  display: inline-block;
  min-height: 200px !important;
}
.my-form-label-ding {
    display: inline-block;
    width: 106px;
    text-align: right;
    vertical-align: top;
    margin-right: 10px;
    line-height: 40px;
}
.my-form-right-param pre {
  outline: 1px solid #ccc;
  padding: 5px;
  margin: 5px;
  font-weight: bold;
  font-size: 16px;
  overflow: scroll;
}
pre .key {
  color: #33adff;
}
.string {
  color: #eece18;
}
</style>