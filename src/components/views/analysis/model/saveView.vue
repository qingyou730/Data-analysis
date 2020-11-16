<template>
  <el-dialog title="保存视图" :visible.sync="visible" :before-close="closeDialog" width="600px">
    <el-form>
      <el-form-item label="视图名称" label-width="100px">
        <el-input v-model="name" autocomplete="off" placeholder="请输入视图名称"></el-input>
      </el-form-item>
      <el-form-item label="视图描述" label-width="100px">
        <el-input v-model="desc" autocomplete="off" placeholder="请输入视图描述"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    props: ['value', 'task_id', 'param', 'model_name','model','step_list'],
    data() {
      return {
        name: "",
        desc: "",
        visible: true,
      }
    },
    created() {
      // this.visible = true  ;
    },
    mounted() {},
    methods: {
      /**
       * 关闭弹窗
       */
      closeDialog: function() {
        this.visible = false;
        this.$emit('input', false);
      },
      save: function() {
        if (!this.name) {
          this.$error("请输入视图名称");
          return  ;
        }
        var url = this.$store.state.api_url.view.create_view
        var param = {
          "model_type": this.model.zhName, //[complex, path, funnel, event, attr_day, object_event
          "note": this.desc.trim(),
          "task_id": this.task_id,
          "view_name": this.name,
          "web_params": "my_web_params",
        }
        var web_params = {};
        web_params.model = this.model;
        web_params.step_list = this.step_list;
        param["web_params"] = JSON.stringify(web_params);
        param = this.$generateParams(param);
        this.axios.post(url, param).then((res) => {
          var data = res.data ;
          if(data.code==200){
            this.closeDialog() ;
            this.$success("视图保存成功");
          }else{
             this.$error(data.msg);
             return  ;
          }
        }).catch((errors) => {
          console.log(errors)
          this.$error("视图保存失败");
        });;
      },
    },
    computed: {},
    watch: {},
  }
</script>

<style>
</style>
