<template>
  <div>
    <el-row style="position: relative;box-shadow: 1px 1px 3px #ccc;" ref="midHeight" class="sql-editer">
      <textarea ref="mycode" v-model="code" class="codesql" autofocus="autofocus"></textarea>
    </el-row>
  </div>
</template>
<script>
  import 'codemirror/theme/3024-day.css'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/addon/hint/show-hint.css'


  let CodeMirror = require('codemirror/lib/codemirror')
  require('codemirror/addon/edit/matchbrackets')
  require('codemirror/addon/selection/active-line')
  require('codemirror/mode/sql/sql')
  require('codemirror/addon/hint/show-hint')
  require('codemirror/addon/hint/sql-hint')
  export default {
    props: ["value"],
    name: 'CodeMirror',
    data() {
      return {
        code: '',
        editor: null,
        sqlHeight: 293,
        disH: 300,
        H: 0, //clientY的距离
      }
    },
    created() {
      if (this.value) {
        this.code = this.value;
      }
    },
    methods: {
      changeSqlEnd(sql) {
        let origin = JSON.stringify(sql);
        let result = '';
        let index = origin.indexOf(';');
        if (index > 0) {
          result = origin.substr(index, 1);
          this.changeSqlEnd(result)
        } else {
          return result;
        }
      }
    },
    mounted() {
      let mime = 'sql'
      let theme = '3024-day' //设置主题，不设置的会使用默认主题
      this.editor = CodeMirror.fromTextArea(this.$refs.mycode, {
        mode: 'text/x-hive', // 选择对应代码编辑器的语言，我这边选的是数据库，根据个人情况自行设置即可
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        theme: theme,
        hintOptions: {
          completeSingle: false,
          // 自定义提示选项
          tables: {
            users: ['name', 'score', 'birthDate'],
            countries: ['name', 'population', 'size'],
            hehe: ['name', 'score', 'birthDate'],
          }
        }
      })

      // 代码自动提示功能，记住使用cursorActivity事件不要使用change事件，这是一个坑，那样页面直接会卡死
      this.editor.on('keypress', () => {
        this.editor.showHint()
      });
      this.editor.on('change', () => {
        var reg = new RegExp(/[;；]/, "g")
        var old = this.editor.getValue();
        var newStr = old.replace(reg, '');
        this.code = newStr
        if (newStr != old) {
          this.editor.setValue(newStr);
          this.editor.setCursor(this.editor.lineCount(), 0);
        }
        this.code = this.editor.getValue();
        this.$emit('input', this.code);
      });
      this.$refs.mycode.focus();
      this.editor.focus();
      this.editor.setCursor(this.editor.lineCount(), 0); //进入组件聚焦
      var key = this.$store.state.user.user_id + 'sqlHeight';
      var height = parseInt(localStorage.getItem(key));
      this.sqlHeight = height;
      this.editor.setSize('auto', 260 + 'px');

    },
    watch: {
      //   sqlHeight:{
      //     handler() {
      //       var key = this.$store.state.user.user_id + 'sqlHeight';
      //       localStorage.setItem(key, JSON.stringify(this.sqlHeight));
      //     },
      //     deep: true
      //   },
      //   sqleditorHeight: {
      //     handler() {
      //       this.editor.setSize('auto',this.sqleditorHeight+'px');
      //       this.sqlHeight = this.sqleditorHeight;
      //     }
      //   }
    },
  }
</script>
<style>
  .CodeMirror {
    font-size: 16px;
    font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono,
      DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
  }

  .CodeMirror-code {}

  .sql-editer .cm-s-3024-day.CodeMirror {
    background: #FFFFFF !important;
    color: #3a3432;
  }

  .sql-editer .cm-s-3024-day .CodeMirror-gutters {
    background: #E8E8E8;
    border-right: 0px;
  }

  .sql-editer .cm-s-3024-day span.cm-string {
    color: blue
  }
</style>
