<template>
  <el-form label-position="left" label-width="180px">
    <el-form-item label="模型名称">
      <el-input v-model="name" class="params"></el-input>
    </el-form-item>
    <el-form-item label="模型描述">
      <el-input v-model="desc" class="params"></el-input>
    </el-form-item>
    <el-form-item label="图标名称">
      <el-input v-model="iconName" class="params"></el-input>
    </el-form-item>
    <el-form-item label="是否展示">
      <el-select v-model="isShow">
        <el-option label="是" value="true"></el-option>
        <el-option label="否" value="false"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="展示排序值">
      <el-input v-model="displayOrder" class="params"></el-input>
    </el-form-item>
    <el-form-item label="支持的图表类型">
      <el-select v-model="chartType" multiple collapse-tags>
        <el-option v-for="chart of chartOptions" :key="chart.value" :label="chart.label" :value="chart.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="是否支持下载">
      <el-select v-model="isShowDownload">
        <el-option label="是" value="true"></el-option>
        <el-option label="否" value="false"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="是否支持转换">
      <el-select v-model="isShowTranspose">
        <el-option label="是" value="true"></el-option>
        <el-option label="否" value="false"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="下载文案配置">
      <el-input v-model="downloadContent" class="params"></el-input>
    </el-form-item>
    <div v-for="(step,i) in steps" :key='i' class="model-step">
      <!-- <el-card style="width: 80%;margin-bottom: 20px;"> -->
      <div>
        <span>{{label + (i + 1)}}</span>
        <el-button @click="onRemoveStep(step)" type="text" style="float: right;"><i class="el-icon-remove" /></el-button>
      </div>
      <el-divider></el-divider>
      <el-form-item label="步骤名称">
        <el-input v-model="step.step_name" style="width: 27%;"></el-input>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="step.module_type" placeholder="请选择" @change="onChangeType(step,i)">
          <el-option v-for="item in modelTypes" :key="item.value" :label="item.name" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择模块">
        <el-select v-model="step.selectMdu" placeholder="请选择" multiple collapse-tags @change="onChangeModule(step)">
          <el-option v-for="item in showModules[i]" :key="item.value" :label="item.name" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- </el-card> -->
    </div>
    <el-form-item label-width="0px">
      <el-button type="primary" @click="submit">立即创建</el-button>
      <el-button @click="onClickCancel">取消</el-button>
      <el-button @click="onAddStep">新增步骤</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  export default {
    data() {
      return {
        name: '',
        desc: '',
        label: "步骤",
        mid: '',
        modelTypes: [],
        modelType: [],
        moduleList: [],
        steps: [{
          sort: 1,
          module_type: '',
          modules: [],
          selectMdu: [],
          step_name: ''
        }],
        showModules: [],
        iconName: '',
        isShow: 'false',
        displayOrder: -1,
        chartType: ['chartTable'],
        isShowTranspose: 'false',
        isShowDownload: 'false',
        downloadContent: '',
        chartOptions: [{
            label: '柱状图',
            value: 'chartBar'
          },
          {
            label: '折线图',
            value: 'chartLine'
          },
          {
            label: '饼状图',
            value: 'chartPie'
          },
          {
            label: '表格',
            value: 'chartTable'
          },
          {
            label: '留存表格',
            value: 'retainTable'
          },
          {
            label: '漏斗表格加漏斗图',
            value: 'funnelTable'
          }
        ]
      }
    },
    created() {
      this.$store.state.page_name = "模型管理-新增";
    },
    methods: {
      onAddStep() {
        this.steps.push({
          sort: this.steps.length + 1,
          module_type: '',
        })
      },
      onRemoveStep(item) {
        var index = this.steps.indexOf(item)
        if (index !== -1) {
          this.steps.splice(index, 1)
        }
      },
      onClickCancel() {
        this.$router.push('/analysis/modle/list')
      },
      submit() {
        let requestData = {
          "app": "kop",
          "desc": this.desc,
          "mid": this.mid,
          "status": true,
          "stepModule": this.steps,
          "zhName": this.name,
          "iconName": this.iconName,
          "isShow": this.isShow,
          "displayOrder": this.displayOrder,
          "chartType": this.chartType,
          "isShowTranspose": this.isShowTranspose,
          "isShowDownload": this.isShowDownload,
          "downloadContent": this.downloadContent,
        }
        this.axios.post(this.$store.state.api_url.model.add, requestData).then((response) => {
          if (response.data.code == 200) {
            this.$message({
              message: '提交参数成功',
              type: 'success'
            })
            this.$router.push('/analysis/modle/list')
          } else {
            this.$message({
              message: '提交参数失败',
              type: 'error'
            })
          }
        }).catch((error) => {
          this.$message("error")
        })
      },
      showModuleType(step, index) {
        this.showModules[index] = [];
        for (let i in this.modelList) {
          if (this.modelList[i].moduleGroup == step.module_type) {
            this.showModules[index].push({
              name: this.modelList[i].zhName,
              value: this.modelList[i].mduId,
            })
          }
        }
      },
      onChangeType(step, index) {
        step.modules = [];
        step.selectMdu = [];
        this.showModuleType(step, index)
      },
      onChangeModule(step) {
        step.modules = [];
        for (let i in step.selectMdu) {
          let module = {};
          module.mduId = step.selectMdu[i];
          let obj = this.modelList.find((item) => item.mduId == module.mduId);
          module.name = obj.name;
          step.modules.push(module);
        }
      }
    },
    mounted() {
      this.axios.post(this.$store.state.api_url.module.type).then((response) => {
        if (response.data.code == 200) {
          this.modelTypes = response.data.data;
        }
      }).catch((error) => {
        this.$message(error);
      })

      this.axios.post(this.$store.state.api_url.module.list).then((response) => {
        if (response.data.code == 200) {
          this.modelList = response.data.data;
        }
      }).catch((error) => {
        this.$message(error);
      })


      this.mid = '';
      if (this.$route.query.id != null) {
        this.mid = this.$route.query.id
        let param = {
          mid: this.mid
        }
        this.axios.post(this.$store.state.api_url.model.detail, param).then(res => {
          if (res.data.code == 200) {
            let data = res.data.data
            this.desc = data.desc
            this.state = data.state
            this.name = data.zhName
            this.iconName = data.iconName
            this.isShow = data.isShow + ''
            this.displayOrder = data.displayOrder
            this.chartType = data.chartType
            this.isShowTranspose = data.isShowTranspose + ''
            this.isShowDownload = data.isShowDownload + ''
            this.downloadContent = data.downloadContent
            if (data.stepModule != null) {
              this.steps = data.stepModule
              for (let i in this.steps) {
                this.showModuleType(this.steps[i], i)
                let step = this.steps[i];
                this.$set(step, "selectMdu", []);
                let translateSelectMdu = [];
                for (let j in step.modules) {
                  // step.selectMdu.push(step.modules[j].mduId);
                  translateSelectMdu.push(step.modules[j].mduId)
                }
                this.$set(step, 'selectMdu', translateSelectMdu);
              }
            }
          }
        }).catch(error => {
          this.$error("获取参数错误，错误信息：" + error)
        })
      }
    }
  }
</script>

<style>
  .el-form .el-form-item .domain {
    width: 50%;
  }

  .el-form .el-form-item .params {
    width: 80%;
  }

  .model-step {
    box-shadow: 2px 2px 4px rgba(0, 0, 0, .22);
    padding: 20px 10px 10px 10px;
    width: 80%;
    border-radius: 10px;
    margin-bottom: 20px;
  }
</style>
