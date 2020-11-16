<template>
  <div class="down-sql-dialog">
    <el-dialog  :visible.sync="visible" width="30%"  @close="close" :modal-append-to-body = "false">
      <el-form>
        <el-form-item label="任务名称" label-width="100px">
          <el-input v-model="name" autocomplete="off" placeholder="请输入任务名称"></el-input>
          <p style="color: red;">下载结果将离线邮件通知，请注意查收邮件</p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
</div>
</template>

<script>
  export default {
    props: ['value','sql',"hiveDownKey","addHiveDownKey", "reqDownkey"],
    data() {
      return {
        name: "",
        desc: "",
        visible: false,
      }
    },
    created() {
      // this.visible = true  ;
      if(this.value) {
        this.visible=true;
      }
    },
    mounted() {
      
    },
    methods: {
      /**
       * 关闭弹窗
       */
      close() {
        this.visible = false;
        this.$emit('input', false);
      },
      save() {
        if (!this.name) {
          this.$error("请输入任务名称");
          return ;
        }
        var url = this.$store.state.api_url.sql.submit_sql_download
        var param = {
          "sql": this.sql, //[complex, path, funnel, event, attr_day, object_event
          "task_name": this.name.trim(),
        }
        param = this.$generateParams(param);
        this.axios.post(url, param).then((res) => {
          var data = res.data ;
          if(data.code==200){
            this.close() ;
            this.$success("任务提交成功");
            this.addHiveDownKey();
          }else{
             this.$error(data.msg);
             return  ;
          }
        }).catch((errors) => {
          console.log(errors)
          this.$error("任务提交失败");
        });;
      },
    },
    computed: {},
    watch: {},
  }
</script>

<style>

.down-sql-dialog .el-dialog__wrapper{
  background: rgba(0, 0, 0, 0.4);
}
</style>
