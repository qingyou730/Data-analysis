<template>
  <el-dialog title="保存群组" :visible.sync="visible" :before-close="closeDialog" width="600px">
    <el-form>
      <el-form-item label="群组名称" label-width="100px">
        <el-input v-model="name" autocomplete="off" placeholder="请输入群组名称"></el-input>
      </el-form-item>
      <el-form-item label="群组描述" label-width="100px">
        <el-input v-model="desc" autocomplete="off" placeholder="请输入群组描述"></el-input>
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
    props: ['value', 'task_id', 'param', 'model_name'],
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
          this.$error("请输入群组名称");
        }
        if (!this.desc) {
          this.$error("请输入群组描述");
        }
        var param = {
          object: this.$store.state.linkage.object,
          name: this.name,
          desc: this.desc,
          group_type: 'DYNAMIC', // 静态STATIC/动态DYNAMIC  群组管理那里上传是静态  这里是动态
          model_name: this.model_name,
          modules: this.param,
        }
        var url = this.$store.state.api_url.task.model_create_group;
        var param = this.$generateParams(param);
        this.axios.post(url, param).then((res) => {
          var data = res.data ;
          if(data.code==200){
            this.closeDialog() ;
            this.$success("群组保存成功");
          }else{
             this.$error("群组保存失败");
          }
        }).catch((errors) => {
          console.log(errors)
          this.$error("群组保存失败");
        });;
      },
    },
    computed: {},
    watch: {},
  }
</script>

<style>
</style>
