<template>
  <div class="limit-person">
      <el-dialog title="" :visible.sync="display" width="25%" class='dialog-tips' >
      <span style='display: inline-block'>
        <div class='dialog-left'>
         <i class="fa fa-frown-o" aria-hidden="true"></i>
        </div>
        <div class='dialog-right'>
          {{tips}}
        </div>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="close" size="mini">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
    props: ['display', 'tips', 'jump_url'],
    data() {
      return {
        // display: false
      };
    },
    methods: {
      close() {
        this.$store.commit('changeDialog');
        this.$store.commit('dialogJump');
        if(this.jump_url) {
          this.$router.push(this.jump_url);
        }
      }
    },
};
</script>
<style>
.dialog-left{
  font-size: 46px;
  display: inline-block;
  width: 20%;
  margin-left: 50px;
}
.dialog-right{
  display: inline-block;
  width: 50%;
  font-size: 16px;
}
.dialog-tips{
  border-radius: 8px;
}
.limit-person .el-dialog{
  margin-top: 32vh!important;
  border-radius: 5px;
}
.limit-person .el-dialog__wrapper{
  background: #f5f6f7;
}
.limit-person .el-dialog__header .el-dialog__headerbtn{
  display: none;
}
</style>