<template>
  <el-dialog title="定时任务" :visible.sync="visible" :before-close="closeDialog" width="600px">
    <el-form>
      <el-form-item label="更新类型" label-width="100px">
        <el-radio-group v-model="type">
          <el-radio label="COVER">全部覆盖</el-radio>
          <el-radio label="INCREMENT">增量更新</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="执行周期" label-width="100px">
        <el-select v-model="rule">
          <el-option label="天(每天调度一次)" value="DAY">天(每天调度一次)</el-option>
          <el-option label="近一周(每周与提交日相同的星期n调度)" value="LAST_WEEK">近一周(每周与提交日相同的星期n调度)</el-option>
          <el-option label="近一月(每月与提交日相同的n号调度)" value="LAST_MONTH">近一月(每月与提交日相同的n号调度)</el-option>
          <el-option label="每周(每周一调度一次)" value="WEEK">每周(每周一调度一次)</el-option>
          <el-option label="每月(每月1号调度一次)" value="MONTH">每月(每月1号调度一次)</el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="任务名称" label-width="100px">
        <el-input v-model="cronName" autocomplete="off" placeholder="请输入任务名称"></el-input>
      </el-form-item>
      <el-form-item label="任务描述" label-width="100px">
        <el-input v-model="cronDesc" autocomplete="off" placeholder="请输入任务描述"></el-input>
      </el-form-item>
      <el-form-item label="补数据" label-width="100px" v-if="type=='INCREMENT'">
        <el-date-picker v-model="compensate_start" type="date" placeholder="不选日期就是不补">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="保存群组" label-width="100px">
        <el-radio-group v-model="saveGroup">
          <el-radio label="false">否</el-radio>
          <el-radio label="true">是</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="saveGroup=='true'" label="群组名称" label-width="100px">
        <el-input v-model="groupName" autocomplete="off" placeholder="请输入群组名称"></el-input>
      </el-form-item>
      <el-form-item v-if="saveGroup=='true'" label="群组描述" label-width="100px">
        <el-input v-model="groupDesc" autocomplete="off" placeholder="请输入群组描述"></el-input>
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
    props: ['value', 'task_id', 'param', 'model_name','step_list','model'],
    data() {
      return {
        rule: 'DAY', //执行周期
        type: 'COVER', //INCREMENT-批量更新 COVER-全部覆盖
        cronName: "",
        cronDesc: "",
        groupName: "",
        groupDesc: "",
        compensate_start: "", //补数据开始日期
        saveGroup: 'false',
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
        if (!this.cronName) {
          this.$error("请输入任务名称");
        }
        if (!this.cronDesc) {
          this.$error("请输入任务描述");
        }
        var taskParam = {
          object: this.$store.state.linkage.object,
          name: this.cronName,
          rule: this.rule,
          type: this.type,
          desc: this.cronDesc,
          compensate_start: this.compensate_start,
          model_name: this.model_name,
          modules: this.param,
          group_id: '',
          enable:true,
        };
        var web_params = {};
        web_params.model = this.model;
        web_params.step_list = this.step_list;
        taskParam["web_params"] = JSON.stringify(web_params);


        if (this.saveGroup == 'true') { //保存为定时任务的时候同时保存为群组
          var groupParam = {
            object: this.$store.state.linkage.object,
            name: this.groupName,
            desc: this.groupDesc,
            group_type: 'DYNAMIC', // 静态STATIC/动态DYNAMIC  群组管理那里上传是静态  这里是动态
            model_name: this.model_name,
            modules: this.param,
          }
          var url = this.$store.state.api_url.task.model_create_group;
          var groupParam = this.$generateParams(groupParam);
          this.axios.post(url, groupParam).then((res) => {
            var data = res.data;
            if (data.code == 200) {  //保存群组成功之后再保存定时任务
              taskParam.group_id = data.data.group_id ;
              var url = this.$store.state.api_url.task.create_timed_task;
              var submitParam = this.$generateParams(taskParam);
              this.axios.post(url, submitParam).then((res) => {
                var data = res.data;
                if (data.code == 200) {
                  this.closeDialog();
                  this.$success("定时任务保存成功");
                } else {
                  this.$error("定时任务保存失败");
                }
              }).catch((errors) => {
                console.log(errors)
                this.$error("定时任务保存失败");
              });
            } else {
              this.$error("群组保存失败1");
            }

          }).catch((errors) => {
            console.log(errors)
            this.$error("群组保存失败2");
          });
        } else { //仅保存定时任务
          var url = this.$store.state.api_url.task.create_timed_task;
          var submitParam = this.$generateParams(taskParam);
          this.axios.post(url, submitParam).then((res) => {
            var data = res.data;
            if (data.code == 200) {
              this.closeDialog();
              this.$success("定时任务保存成功");
            } else {
              this.$error("定时任务保存失败");
            }
          }).catch((errors) => {
            console.log(errors)
            this.$error("定时任务保存失败");
          });
        }
      },
    },
    computed: {},
    watch: {},
  }
</script>

<style>
</style>
