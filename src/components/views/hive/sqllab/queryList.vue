<template>
  <div>
    <el-button type="text" @click="centerDialogVisible = true">点击打开 Dialog</el-button>

    <el-dialog title="sql" :visible.sync="centerDialogVisible" width="30%">
        <span class="query-list">
            <pre>
                <code v-html="sql" ref="odiv">
                </code>
            </pre>
        </span>

      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import sqlFormatter from "sql-formatter";
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';

export default {
  props: ['sql'],
  created() {
      this.sql = "select object_id from aggMergeTable group by object_id having (sum(step1599478592022_) > '0') OR(sum(step1599478592025_) > '0') group by object_id having (sum(step1599478592022_) > '0') OR(sum(step1599478592025_) > '0') group by object_id having (sum(step1599478592022_) > '0') OR(sum(step1599478592025_) > '0')" ;
      this.sql = sqlFormatter.format(this.sql);
  },
  data() {
    return {
      centerDialogVisible: false,
    };
  },
  updated() {
    hljs.highlightBlock(this.$refs.odiv);
  }
};
</script>
<style>
.query-list {
    display: block;
}
.query-list pre {
  outline: 1px solid #ccc;
  padding: 5px;
  margin: 5px;
  font-weight: bold;
  font-size: 16px;
  overflow: scroll;
}
.query-list pre .hljs{
  color: black;
  background: #f6f6f6;
}
.query-list pre .hljs-string{
  color: #8259d1;
}
.query-list pre .hljs-keyword{
  color: #db5360;
}
</style>