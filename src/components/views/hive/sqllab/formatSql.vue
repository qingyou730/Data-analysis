<template>
  <div class="sql-dialog">
    <el-dialog title="sql" :visible.sync="centerDialogVisible" width="30%" :close-on-click-modal = "false"  @close='close'>
      <span class="query-list">
        <pre>
                <code v-html="formatSql" ref="odiv">
                </code>
            </pre>
      </span>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="close">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import sqlFormatter from "sql-formatter";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { Input } from "element-ui";

export default {
  props: ["sql", "value", "change"],
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
.query-list pre {
  outline: 0px solid #ccc;
  padding: 5px;
  margin: 5px;
  font-weight: bold;
  font-size: 16px;
  overflow: scroll;
}
.query-list pre .hljs {
  color: black;
  background: #f6f6f6;
}
.query-list pre .hljs-string {
  color: #8259d1;
}
.query-list pre .hljs-keyword {
  color: #db5360;
}
.sql-dialog .el-dialog__header .el-dialog__close {
  display: none;
}
</style>