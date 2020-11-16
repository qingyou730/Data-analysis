<template>
  <div>
    <el-row style="position: relative;" ref="midHeight" class="sql-editer">
      <textarea ref="mycode" v-model="code" class="codesql"  autofocus="autofocus"></textarea>
      <!--<div style="text-align:center; position:absolute; bottom:2px; left:50%;width:50px;height:15px;cursor: pointer;z-index: 100;" ref="moveDiv">
        <i class="fa fa-bars" aria-hidden="true" style="color:#ccc;transform: scalex(2.5);"></i>
      </div>-->
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
    props: ["title", "name", "moduleId", "apis", "value",'editableTabs','sqleditorHeight'],
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
    created(){
      if(this.value){
        this.code = this.value ;
      }
    },
    methods: {
      changeSqlEnd(sql) {
        let origin = JSON.stringify(sql);
        let result = '';
        let index = origin.indexOf(';');
        if(index > 0) {
          result = origin.substr(index, 1);
          this.changeSqlEnd(result)
        }else{
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
      this.editor.on('keypress', ()=> {
        this.editor.showHint()
      });
      this.editor.on('change', () => {
        var reg = new RegExp( /[;；]/ , "g" )
        var old = this.editor.getValue();
        var newStr = old.replace(reg,'');
        this.code = newStr
        if(newStr != old){
          this.editor.setValue(newStr) ;
          this.editor.setCursor(this.editor.lineCount(), 0);
        }
        this.code = this.editor.getValue();
        this.$emit('input', this.code);
      });
      this.$refs.mycode.focus();
      this.editor.focus();
      this.editor.setCursor(this.editor.lineCount(), 0);//进入组件聚焦
      var key = this.$store.state.user.user_id + 'sqlHeight';
      var height = parseInt(localStorage.getItem(key));
      this.sqlHeight = height;
      this.editor.setSize('auto',this.sqlHeight+'px');




      /* 
        拖拽编辑器事件
      */
      // var oDragIcon = this.$refs.moveDiv;
      // // 定义4个变量
      // oDragIcon.onmousedown=(ev) =>{
      //   var disY = 0;//鼠标按下时光标的Y值
      //   // this.disH = 300; // 拖拽前的高
      //   // 给div加点击事件
      //     var ev = ev || window.event;
      //     disY = ev.clientY; // 获取鼠标按下时光标Y的值
      //     this.disH = this.$refs.midHeight.$el.offsetHeight; // 获取拖拽前div的高
      //     document.onmousemove =  (ev) =>{
      //       var ev = ev || window.event;
      //       //拖拽时为了对宽和高 限制一下范围，定义两个变量
      //       this.H = ev.clientY - disY + this.disH;
      //       if(this.H<293){
      //         this.H = 293;
      //       }
      //       if(this.H>445){
      //         this.H = 445;
      //       }
      //       this.editor.setSize('auto',this.H+'px');
      //     }
      //     document.onmouseup = ()=> {
      //       this.sqlHeight = this.$refs.midHeight.$el.offsetHeight;
      //       document.onmousemove = null;
      //       document.onmouseup = null;
      //     }
      // }
    },
    watch:{
      sqlHeight:{
        handler() {
          var key = this.$store.state.user.user_id + 'sqlHeight';
          localStorage.setItem(key, JSON.stringify(this.sqlHeight));
        },
        deep: true
      },
      sqleditorHeight: {
        handler() {
          this.editor.setSize('auto',this.sqleditorHeight+'px');
          this.sqlHeight = this.sqleditorHeight;
        }
      }
    },
  }
</script>
<style>
    .CodeMirror {
          font-size: 18px;
          font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono,
          DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
      }
     .CodeMirror-code{
     }
     .sql-editer .cm-s-3024-day.CodeMirror { background: #FFFFFF!important; color: #3a3432; }
     .sql-editer .cm-s-3024-day .CodeMirror-gutters { background: #E8E8E8; border-right: 0px; }
     .sql-editer .cm-s-3024-day span.cm-string{
       color:blue
     }
</style>
