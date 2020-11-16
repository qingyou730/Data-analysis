<template>
  <div id="step_container">
    <div id="step_titile">
      <el-row>
        <el-col :span="8">
          <el-button size="mini" class="border-none">任务进度</el-button>
        </el-col>
        <el-col :span="8"><span> &nbsp;</span>
          <p style="text-align: center;" v-if="confirm">
            <el-button size="mini" @click="calcelTask" class="border-none">确定</el-button>
            <el-button size="mini" @click="cancel" class="border-none">取消</el-button>
          </p>
        </el-col>
        <el-col :span="8" style="text-align: right;padding-right: 60px;" >
          <el-dropdown placement="bottom">
            <i style="cursor: pointer;font-size: 20px;" type="primary" :class="unfold ? 'el-icon-caret-right color-primary' : 'el-icon-caret-bottom color-primary ' "  ></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item ><router-link to="/analysis/task/list"><el-button size="mini" class="border-none">任务列表</el-button></router-link></el-dropdown-item>
              <el-dropdown-item ><el-button size="mini" @click="startConfirm" class="border-none">取消任务</el-button></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>


          <!-- <p>
            <el-button size="mini" class="border-none">查看任务列表</el-button>
            <el-button size="mini" @click="startConfirm" class="border-none">取消任务</el-button>
          </p>
          <p style="text-align: right;" v-if="confirm">
            <el-button size="mini" @click="calcelTask" class="border-none">确定</el-button>
            <el-button size="mini" @click="cancel" class="border-none">取消</el-button>
          </p> -->
        </el-col>
      </el-row>
    </div>
    <div id="step_number">
      <span :class="step>=1 ? 'step step1 on' : 'step step1 '">1</span>
      <span :class="step>=2 ? 'line step2 on' : 'line step2 '"><em v-if="step==1"></em> </span>
      <span :class="step>=2 ? 'step step2 on' : 'step step2 '">2</span>
      <span :class="step>=3 ? 'line step3 on' : 'line step3 '"><em v-if="step==2"></em></span>
      <span :class="step>=3 ? 'step step3 on' : 'step step3 '">3</span>
      <span :class="step>=4 ? 'line step4 on' : 'line step4 '"><em v-if="step==3"></em></span>
      <span :class="step>=4 ? 'step step4 on' : 'step step4 '">4</span>
    </div>
    <div id="step_row">
      <span :class="step==1 ? 'step1 first  on' : 'step1 first '">待调度</span><span :class="step==2 ? 'step2   on' : 'step2  ' ">调度中</span><span
        :class="step==3 ? 'step3   on' : 'step23  ' ">计算中</span><span :class="step==4 ? 'step4   on' : 'step4  ' ">任务完成</span>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["parent_step", "task_id"],
    data() {
      return {
        unfold:false ,
        step: 1,
        confirm: false
      }
    },
    created(){
      this.step = this.parent_step  ;
    },
    methods: {
      //取消任务
      startConfirm() {
        this.confirm = true;
      },

      //取消任务确定
      calcelTask() {
        this.confirm = true;
        var url = this.$store.state.api_url.task.kill_task;
        var param = this.$generateParams({
          task_id: this.task_id
        });
        this.axios.post(url,param).then((res)=>{
          var data = res.data ;
          if(data.code == 200){
            this.$emit('input', false);
            this.$success("任务取消成功");
          }else{
            this.error(data.hasOwnProperty('msg') ? data.hasOwnProperty('msg') : '任务取消失败' ) ;
          }
        }).catch((e)=>{
          console.log(e) ;
          this.$error("取消任务失败");
        });
      },
      //取消任务取消
      cancel() {
        this.confirm = false;
        this.force
      },
    },
    watch: {
      parent_step: function(val) {
        this.step = this.parent_step;
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
