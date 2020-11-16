<template>
  <el-row class="gray-container">

    <el-row class="step_row" v-for="(item,key) in param_list" :key="key">
      <el-col :span="2" class="task_left">
        <el-row>
          <el-col :span="10" class="text-right">
            <!-- <span class="step_number">{{this.step_list.length+1}}</span> -->
          </el-col>
          <el-col :span="10" class="text-left">
            <!--  <p class="step_text1">step{{this.step_list.length+1}}</p>
          <p class="step_text2">立即分析</p> -->
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="22" class="task_right">
        <div class="my-form-row">
          <span class="my-form-label">NO:</span>
          <div class="my-form-right" style="display: inline-block;">
            <el-input :value="item.no"></el-input>
          </div>
        </div>
        <div class="my-form-row">
          <span class="my-form-label">module_type:</span>
          <div class="my-form-right" style="display: inline-block;">
            <el-input :value="item.module_type"></el-input>
          </div>
        </div>
        <div class="my-form-row">
          <span class="my-form-label">param:</span>
          <div class="my-form-right" style="display: inline-block;">
            <el-input :value="item.param"></el-input>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row class="step_row" v-if="sql_list != null">
      <template v-for="(item,key) in sql_list">
        <el-col :span="2" class="task_left" :key="item">
          <el-row>
            <el-col :span="10" class="text-right">
            </el-col>
            <el-col :span="10" class="text-left">
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="22" class="task_right" :key="key">
          <div class="my-form-row">
            <span class="my-form-label">{{key}}</span>
            <div class="my-form-right" style="display: inline-block;">
              <el-input :value="item"></el-input>
            </div>
          </div>
        </el-col>
      </template>
    </el-row>



    
    <!--立即分析 保存视图按钮-->
    <el-row class="step_row" style="height: 145px;min-height: initial;">
      <el-col :span="2" class="task_left">
        <el-row>
          <el-col :span="10" class="text-right">
            <!-- <span class="step_number">{{this.step_list.length+1}}</span> -->
          </el-col>
          <el-col :span="10" class="text-left">
            <!--  <p class="step_text1">step{{this.step_list.length+1}}</p>
            <p class="step_text2">立即分析</p> -->
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="22" class="task_right">
        <div class="my-form-row">
          <span class="my-form-label">视图名称:</span>
          <div class="my-form-right" style="display: inline-block;">
            <el-col :span="12">
              <el-input style="width: 200px;" v-model="view_name" placeholder="请输入视图名称" />
            </el-col>
            <el-col :span="12">
    
            </el-col>
          </div>
        </div>
        <div class="my-form-row">
          <span class="my-form-label"></span>
          <div class="my-form-right" style="display: inline-block;">
            <el-col :span="12">
              <el-button type="primary" @click="submitTask">立即分析</el-button>
              <el-button type="primary" @click="saveView">保存视图</el-button>
              <!-- <el-button type="primary" >定时任务</el-button>
              <el-button type="primary" >保存用户包</el-button>
              <el-tooltip class="item" effect="dark" content="当完成step2，即可单击此处进行保存" placement="top-start">
                <i class="el-icon-question icon-help"></i>
              </el-tooltip> -->
            </el-col>
            <el-col :span="12">
              <a class="w-btn" href="javascript:;">
                <img src="/static/images/icon/line.png" />
              </a><a class="w-btn" href="javascript:;">
                <img src="/static/images/icon/pie.png" />
              </a><a class="w-btn on" href="javascript:;">
                <img src="/static/images/icon/table.png" />
              </a><a class="w-btn" :href="show.show_data ? '/mmp/task/download_task_data/KOP/'+task.task_id:'javascript:;'">
                <img src="/static/images/icon/download.png" />
              </a>
              <p>
                <font color="red">(页面展示500条数据，下载后可查看全部)</font>
              </p>
            </el-col>
            <!-- <el-button type="primary" >定时任务</el-button>
            <el-button type="primary" >保存用户包</el-button> -->
          </div>
    
        </div>
      </el-col>
    </el-row>

    <!-- 显示设置 排序 筛选 -->
    <el-row class="step_row" v-if="show.show_data  && show.data.length>0" style="min-height: auto;">
      <el-col :span="2" class="task_left">
        <el-row>
          <el-col :span="10" class="text-right">
            <!-- <span class="step_number">{{this.step_list.length+1}}</span> -->
          </el-col>
          <el-col :span="10" class="text-left">
            <!--  <p class="step_text1">step{{this.step_list.length+1}}</p>
        <p class="step_text2">立即分析</p> -->
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="22" class="task_right">
        <div class="my-form-row">
          <span class="my-form-label">显示设置:</span>
          <div v-show="this.show.unfold" style="display: inline-block;">
            <el-select v-model="show.order_field">
              <el-option v-for="item in show.field_list" :key="item" :value="item" :label="item">{{item}}</el-option>
            </el-select>
            <el-select v-model="show.order_type">
              <el-option label="升序" value="ASC"></el-option>
              <el-option label="降序" value="DESC"></el-option>
            </el-select>
          </div>
          <!--显示设置处展开收起按钮-->
          <i :class="show.unfold ? 'el-icon-caret-right unfold color-primary' : 'el-icon-caret-bottom unfold color-primary' "
            @click="doFold"></i>
        </div>
        <div v-show="this.show.unfold" class="my-form-row">
          <span class="my-form-label"></span>
          <div style="display: inline-block;">
            <el-row v-for="(condition,conditionIndex) in show.where" :key="conditionIndex" class="form-item-row">
              <el-select v-model="condition.field">
                <el-option :value="condition.field" :label="condition.field"></el-option>
              </el-select>
              <el-select v-model="condition.op">
                <el-option v-for="item in op_list" :key="item.name" :value="item.value" :label="item.name"></el-option>
              </el-select>
              <el-input v-model="condition.value" placeholder="请输入条件值" style="width: 200px;" />
              <el-button v-if="conditionIndex==(show.where.length-1)" @click="refreshData" type="primary">确定</el-button>
            </el-row>
          </div>

        </div>
      </el-col>
    </el-row>


    <el-row class="step_row" v-if="show.show_data">
      <table class="data-table" v-if="show.data.length>0">
        <tr>
          <th v-for="(v,k) in show.data[0]" :key="k">
            {{k}}
          </th>
        </tr>
        <tr v-for="(row,index) in show.data" :key="index">
          <td v-for="(col,colIndex) in row" :key="colIndex">{{col}}</td>
        </tr>

      </table>
      <div class="no-data-container"   v-if="show.data.length==0">
         <font-awesome-icon  class="no-data-icon"  icon="folder-open" /></i>
         <p>当前无数据结果</p>
      </div>
    </el-row>



    <!--任务进度条-->
    <step v-if="task.showStep" v-model="task.showStep" :task_id="task.task_id" :parent_step="task.step"> </step>


  </el-row>

</template>

<script>
  import timer from '@/components/base/timer'
  import single from '@/components/base/single'
  import linkageSingle from '@/components/base/linkage_single'
  import eventGroup from '@/components/base/event_group'
  import userWhere from '@/components/base/user_where'
  import analyzeObject from '@/components/base/analyze_object'
  import userAgg from '@/components/base/user_agg.vue'
  import moduleLinkage from '@/components/base/module_linkage.vue'
  import attrGroup from '@/components/base/attr_group.vue'
  import step from '@/components/base/step.vue'
  export default {
    components: {
      timer,
      single,
      userWhere,
      linkageSingle,
      eventGroup,
      analyzeObject,
      userAgg,
      moduleLinkage,
      attrGroup,
      step,
    },
    data() {
      return {
        param_list: {},
        load_finish: false,
        step_list: [],
        sql_list: [],
        module_list: {

        },
        mduIds: [],
        comIds: [],
        component_list: { //业务组件详情

        },
        url_list: {
          module_detail: '/app/model/find_module_detail/', //模块详情
          component_detail: '/app/model/find_component_detail/', //业务组件详情
        },
        view_name: "", //任务名称
        show_submit: true,
        task: {
          showStep: false,
          step: 1,
          task_id: '',
          timer: null,
        },
        show: {
          unfold: false,
          show_data: false,
          data: [],
          "order_field": "",
          "order_type": "ASC",
          where: [],
          field_list: [],
        },

        "op_list": [{
            name: "等于",
            value: "="
          },
          {
            name: "大于",
            value: ">"
          },
          {
            name: "大于等于",
            value: ">="
          },
          {
            name: "小于",
            value: "<"
          },
          {
            name: "小于等于",
            value: "<="
          },
        ],
      }
    },
    created() {
      this.$store.state.page_name = "多维分析";
    },
    methods: {
      /**
       * 显示设置处展开收起
       */
      doFold: function() {
        this.show.unfold = !this.show.unfold;
      },
      initComponts: function() { //初始化步骤的业务组件

        for (var i in this.step_list) {
          var step = this.step_list[i];
          var module = this.module_list[step.moduleId];
          var step_components = [];
          for (var comId of module.comIds) {
            var component = this.component_list[comId.uid];
            var step_component = {};
            step_component.comId = component.comId;
            step_component.title = component.zhName;
            step_component.base_component = component.enName;
            step_component.paramKey = component.paramKey;
            step_component.value = null;
            step_components.push(step_component)
          }
          step.step_components = step_components;
        }
      },
      /**
       * 显示设置处点击确定的时候刷新数据
       */
      refreshData() {
        var order = {};
        var where = [];
        if (this.show.order_field != '') {
          order[this.show.order_field] = this.show.order_type == 'ASC';
        }
        for (var v of this.show.where) {
          if (v.field && v.value.trim()) {
            where.push(' `' + v.field + '` ' + v.op + " '" + v.value.trim() + "' ");
          }
        }
        if (where.length > 0) {
          where = where.join(' AND ');
        } else {
          where = '';
        }
        var url = this.$store.state.api_url.task.find_data;
        var param = this.$generateParams({
          task_id: this.task.task_id,
          order_fields: order,
          page: 1,
          page_size: 500,
          where: where,
        });
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            data = data.data.table.table;
            if (data.length > 0) {
              this.show.data = data;
            }
          } else {

          }
        }).catch((error) => {
          console.log(error);
          this.$error("加载数据失败");
        });
      },
      /**
       * 首次加载数据
       */
      initData() {
        var url = this.$store.state.api_url.task.find_data;
        var param = this.$generateParams({
          task_id: this.task.task_id,
          order_fields: {},
          page: 1,
          page_size: 500,
          where: "",
        });
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            var list = data.data.table.table;
            var where = [];
            var field_list = [];
            if (list.length > 0) {
              var row = list[0];
              for (var field in row) {
                field_list.push(field);
                where.push({
                  "field": field,
                  "op": "=",
                  "value": ""
                });
              }
              this.show.data = list;
              this.show.field_list = field_list;
              this.show.where = where;
              this.show.show_data = true;
            }else{ //没数据
              this.show.data = [];
              this.show.field_list = [];
              this.show.where = [];
              this.show.show_data = true;
            }
          } else {
            console.log("加载数据请求接口失败") ;
          }
        }).catch((error) => {
          console.log(error);
          this.$error("加载数据失败");
        });
      },
      /**
       * 查询任务分析进度
       */
      taskProgress() {
        this.show_submit = false;
        var url = this.$store.state.api_url.task.progress;
        let param = this.$generateParams({
          task_id: this.task.task_id,
        })
        var status_step = {
          "wait": 1,
          "ACCEPTED": 2,
          "RUNNING": 3,
          "SUCCESS": 4,
          "FAILED": 4,
        }
        this.task.timer = setInterval(() => {
          if (!this.task.showStep) {
            clearInterval(this.task.timer);
            this.task.timer = null;
            this.task.step = 1;
            return;
          }
          this.axios.post(url, param).then((res) => {
            var status = res.data.data.status;
            var step = status_step[status];
            this.task.step = step;
            if (step == 4) {
              this.task.status = status;
              setTimeout(() => {
                this.task.showStep = false;
              }, '1500');
            }
            if (status == 'SUCCESS') {
              this.initData(); //首次加载数据
            }
          }).catch((error) => {
            console.log(error);
          });
        }, 5000)
      },
      //提交任务
      submitTask() {
        var data = {};
        data["model_name"] = "属性分析";

        var modules = [];
        for (var step of this.step_list) {
          var list = [];
          var module = {
            no: step.step,
            module_type: step.module_type,
          };
          var module_param = {};
          for (var component of step.step_components) {
            var param = this.$tools.makeSubmitParam[component.base_component](component.value);
            if (!param.status) {
              this.$error(param.message);
              return;
            } else {
              module_param[component.paramKey] = param.value;
            }
          }
          module.param = JSON.stringify(module_param);
          modules.push(module);

        };

        data["modules"] = modules;
        data["web_params"] = "my_web_params";
        var url = this.$store.state.api_url.task.task_submit;
        var param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          // this.$success("提交成功任务ID:" + data.data.task_id);
          this.view_name = data.data.task_id;
          this.task.task_id = data.data.task_id;
          //this.task.task_id = '20200630092435_000042';
          this.task.step = 1;
          this.task.showStep = true;
          this.taskProgress();
        }).catch((errors) => {
          console.log(errors)
          this.$error("任务提交失败");
        });;
      },
      /**
       * 保存视图
       */
      saveView() {
        if (!this.view_name) {
          this.$error("请输入视图名称");
          return;
        }
        if (!this.task.task_id) {
          this.$error("分析之后才能保存为视图");
          return;
        }
        var url = this.$store.state.api_url.view.create_view
        var param = {
          "model_type": "attr_day", //[complex, path, funnel, event, attr_day, object_event
          "note": this.view_name.trim(),
          "task_id": this.task.task_id,
          "view_name": this.view_name,
          "web_params": "my_web_params",
        }
        param = this.$generateParams(param);
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code != 200) {
            console.log(data);
            this.$error(data.hasOwnProperty('msg') ? data.msg : "保存视图失败");
          } else {
            this.$success("保存视图成功");
          }
        }).catch((error) => {
          console.log(error);
          this.$error("保存视图失败");
        });
        console.log(this.task.task_id);
      },
      /**
       * 获取任务参数
       */
      getTaskParam() {
        var url = this.$store.state.api_url.task.find_sql;
        var param = this.$generateParams({
          task_ids: [this.task.task_id],
        });
        this.axios.post(url, param).then((res) => {
          var data = res.data;
          if (data.code != 200) {
            console.log(data);
            // this.$error(data.hasOwnProperty('msg') ? data.msg : "获取失败");
          } else {
            this.param_list = data.data[0].modules;
            this.sql_list = data.data[0].sql;
            console.log(this.sql_list)
          }
        }).catch((error) => {
          this.param_list = {};
          console.log(error);
          this.$error("保存视图失败");
        });
      }

    },
    mounted() {
      var get = this.$route.query;
      if (!get.hasOwnProperty("task_id")) {
        this.$error("参数错误");
        return;
      } else {
        this.task.task_id = get.task_id;
      }
      this.initData();
      this.getTaskParam();
    }
  }
</script>
