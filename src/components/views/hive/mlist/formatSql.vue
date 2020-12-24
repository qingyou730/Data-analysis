<template>
    <el-dialog  :title="status=='success' ? '创建临时表成功' : '创建临时表失败'" :visible.sync="centerDialogVisible" width="30%"  :before-close="close"   >
      <span class="query-list">
        <code v-html="formatSql" ref="odiv" >
        </code>
        <code v-if="msg">{{msg}}}</code>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="close">确定</el-button>
      </span>
    </el-dialog>
</template>

<script>
import sqlFormatter from "sql-formatter";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { Input } from "element-ui";

export default {
  props: ["sql", "value", "change","status" ,"msg"],
  created() {
    this.formatSql = this.sql;
    this.formatSql = sqlFormatter.format(this.formatSql);
  },
  data() {
    return {
      formatSql: "",
      centerDialogVisible: true,
    };
  },
  methods: {
    close() {
      this.centerDialogVisible = false;
      this.$emit("input", false);
      if(this.status=='success'){
        this.$router.push({path:'/hive/mlist/list'});
      }

    },
  },
  mounted() {
    this.$nextTick(() => {
      hljs.highlightBlock(this.$refs.odiv);
    });
  },
};
</script>
<style>
.query-list {
  display: block;
}
.query-list  {
  outline: 0px solid #ccc;
  padding: 5px;
  margin: 5px;
  font-weight: bold;
  font-size: 16px;
  overflow: hidden;
}
.query-list  .hljs {
  color: black;
  background: #f6f6f6;
}
.query-list  .hljs-string {
  color: #8259d1;
}
.query-list  .hljs-keyword {
  color: #db5360;
}
</style>
