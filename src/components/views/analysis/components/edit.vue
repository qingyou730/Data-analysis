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
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      label-width="0px"
      inline-message="true"
      v-for="(domain, index) in dynamicValidateForm.domains"
      :key="domain.key"
    >
      <el-input v-model="domain.desc" placeholder="接口名称" style="width: 170px;margin:0 10px 0 0 "></el-input>
      <el-input v-model="domain.name" placeholder="英文名称" style="width: 170px;margin:0 10px 0 0 "></el-input>
      <el-input v-model="domain.api" placeholder="接口地址" class="domain"></el-input>
      <el-button @click.prevent="removeDomain(domain)" circle type="text">
        <i class="el-icon-remove" />
      </el-button>
    </el-form-item>
    <el-form-item label-width="0px">
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button @click="onClickCancel">取消</el-button>
      <el-button @click="addDomain">新增域名</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      labelPosition: "left",
      comId: "",
      formLabelAlign: {
        name: "",
        desc: "",
        paraName: "",
        type: "",
        compName: "",
      },
      options: [],
      dynamicValidateForm: {
        domains: [
          {
            desc: "",
            api: "",
            name: "",
            compName: "", //组件名称
          },
        ],
      },
    };
  },
  created() {
    this.$store.state.page_name = "业务组件-新增";
  },
  methods: {
    addDomain() {
      this.dynamicValidateForm.domains.push({
        value: "",
      });
    },
    removeDomain(item) {
      var index = this.dynamicValidateForm.domains.indexOf(item);
      if (index !== -1) {
        this.dynamicValidateForm.domains.splice(index, 1);
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
        };
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
      this.axios
        .post(this.$store.state.api_url.components.add, data)
        .then((response) => {
          let rspData = response.data;
          if (rspData.code != 200) {
            console.log("获取菜单失败");
          }
        })
        .catch((error) => {
          this.$error("请求接口失败");
        });
      this.$router.push("/analysis/components/list");
    },
    onClickCancel() {
      this.$router.push("/analysis/components/list");
    },
  },
  created() {
    this.options = this.$store.state.components_type.components_type;
  },
  mounted() {
    let requestUrl = this.$store.state.api_url.components.detail;
    let comData = null;
    let param = { comId: this.$route.query.comId };
    this.axios
      .post(requestUrl, param)
      .then((rep) => {
        console.log(rep.data.data, "rep");
        comData = rep.data.data;
        if (comData != null) {
          this.formLabelAlign.name = comData.zhName;
          this.formLabelAlign.desc = comData.desc;
          this.formLabelAlign.type = comData.enName;
          this.formLabelAlign.paraName = comData.paramKey;
          this.formLabelAlign.compName = comData.compName;
          this.comId = comData.comId;
          if (comData.apis != null) {
            this.dynamicValidateForm.domains = comData.apis;
          }
        }
      })
      .catch(function (error) {
        alert(error);
      });
  },
};
</script>

<style>
.el-form .el-form-item .domain {
  width: 50%;
}

.el-form .el-form-item .params {
  width: 80%;
}
</style>
