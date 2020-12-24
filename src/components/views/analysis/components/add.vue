<template>
  <el-form :label-position="labelPosition" label-width="180px" :model="formLabelAlign">
    <el-form-item label="组件名称">
      <el-input v-model="formLabelAlign.compName" class="params" placeholder="组件名称用于管理"></el-input>
    </el-form-item>
    <el-form-item label="显示名称">
      <el-input v-model="formLabelAlign.name" class="params" placeholder="显示名称,比如属性分组和事件分组都可以显示为分组"></el-input>
    </el-form-item>
    <el-form-item label="描述">
      <el-input v-model="formLabelAlign.desc" class="params"></el-input>
    </el-form-item>
    <el-form-item label="提交参数名称">
      <el-input v-model="formLabelAlign.paraName" class="params"></el-input>
    </el-form-item>
    <el-form-item label="组件类型">
      <el-select v-model="formLabelAlign.type">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label-width="0px" inline-message='true' v-for="(domain, index) in dynamicValidateForm.domains" :key="domain.key">
      <el-input v-model="domain.desc" placeholder="接口名称" style="width: 170px;margin:0 10px 0 0 "></el-input>
      <el-input v-model="domain.name" placeholder="英文名称" style="width: 170px;margin:0 10px 0 0 "></el-input>
      <el-input v-model="domain.api" placeholder="接口地址" class="domain"></el-input>
      <el-button @click.prevent="removeDomain(domain)" circle type="text"><i class="el-icon-remove" /></el-button>
    </el-form-item>
    <el-form-item label-width="0px">
      <el-button type="primary" @click="submit">立即创建</el-button>
      <el-button @click="onClickCancel">取消</el-button>
      <el-button @click="addDomain">新增域名</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  export default {
    data() {
      return {
        labelPosition: 'left',
        comId: '',
        formLabelAlign: {
          name: '',
          desc: '',
          paraName: '',
          type: '',
          compName: '',
        },
        options: [{
            value: 'nonlinkageSingle',
            label: '非联动下拉框'
          }, {
            value: 'linkageSingle',
            label: '联动下拉框'
          }, {
            value: 'timer',
            label: '时间选择组件'
          }, {
            value: 'eventGroup',
            label: '事件分组组件'
          },
          {
            value: 'analyzeObject',
            label: '分析对象'
          },
          {
            value: 'single',
            label: '单选下拉框'
          },
          {
            value: 'multipleSelect',
            label: '多选下拉框'
          },
          {
            value: 'userAgg',
            label: '属性指标'
          },
          {
            value: 'userWhere',
            label: '属性筛选'
          },
          {
            value: 'eventWhere',
            label: '事件筛选'
          },
          {
            value: 'moduleLinkage',
            label: '模块内联动'
          },
          {
            value: 'moduleLinkageSuffix',
            label: '模块内联动有后缀'
          },
          {
            value: 'attrGroup',
            label: '属性分组',
          },
          {
            value: 'eventIndicators',
            label: '事件指标'
          },
          {
            value: 'timeSingle',
            label: '周期单选'
          },
          {
            value: 'retainedEvent',
            label: '留存事件'
          },
          {
            value: 'retainedTime',
            label: '留存时间'
          },
          {
            value: 'attrIndicators',
            label: '属性指标（新）'
          },
          {
            value: 'moduleLinkageConfigurable',
            label: '可配置级联框'
          },
          {
            value: 'timeUnit',
            label: '时间单位'
          },
          {
            value: 'attrDimension',
            label: '属性维度'
          },
          {
            value: 'funnel',
            label: '漏斗_步骤'
          },
          {
            value: 'windowPeriod',
            label: '漏斗_窗口期'
          },
        ],
        dynamicValidateForm: {
          domains: [{
            desc: '',
            api: '',
            name: '',
            compName: '', //组件名称
          }],
        },
      }
    },
    created() {
      this.$store.state.page_name = "业务组件-新增";
    },
    methods: {
      addDomain() {
        this.dynamicValidateForm.domains.push({
          value: '',
        });
      },
      removeDomain(item) {
        var index = this.dynamicValidateForm.domains.indexOf(item)
        if (index !== -1) {
          this.dynamicValidateForm.domains.splice(index, 1)
        }
      },
      submit() {
        var apis = [];
        for (var index in this.dynamicValidateForm.domains) {
          var api = {
            api: this.dynamicValidateForm.domains[index].api,
            name: this.dynamicValidateForm.domains[index].name,
            desc: this.dynamicValidateForm.domains[index].desc,
            sort: index,
          }
          apis.push(api);
        }
        var data = {
          comId: this.comId,
          desc: this.formLabelAlign.desc,
          enName: this.formLabelAlign.type,
          paramKey: this.formLabelAlign.paraName,
          uid: this.formLabelAlign.type,
          zhName: this.formLabelAlign.name,
          compName: this.formLabelAlign.compName,
          apis: apis,
        };
        this.axios.post(this.$store.state.api_url.components.add, data).then((response) => {
          let rspData = response.data;
          if (rspData.code != 200) {
            console.log("获取菜单失败")
          }
        }).catch((error) => {
          this.$error("请求接口失败");
        })
        this.$router.push('/analysis/components/list')
      },
      onClickCancel() {
        this.$router.push('/analysis/components/list')
      }
    },
    mounted() {
      this.options = this.$store.state.components_type.components_type;
      this.comId = '';
      if (this.$route.query.row != null) {
        this.formLabelAlign.name = this.$route.query.row.zhName;
        this.formLabelAlign.desc = this.$route.query.row.desc;
        this.formLabelAlign.type = this.$route.query.row.enName;
        this.formLabelAlign.paraName = this.$route.query.row.paramKey;
        this.formLabelAlign.compName = this.$route.query.row.compName;
        this.comId = this.$route.query.row.comId;
        if (this.$route.query.row.apis != null) {
          this.dynamicValidateForm.domains = this.$route.query.row.apis;
        }
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
</style>
