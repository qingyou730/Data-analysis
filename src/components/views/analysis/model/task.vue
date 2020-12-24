<template>
  <el-row class="gray-container" id="model_div">
    <!-- 内部人查看 START -->
      <!-- <el-image :title="ford_decs" :src="isFold()" @click="showConditions" style="position: absolute;top: 10px;right: 50px; width: 14px;"/> -->
      <span v-if="isEdit && type!='cron'"  @click="showConditions" style="cursor:pointer; position: absolute;top: 10px;right: 50px;font-size: 12px;color: #606266;display:inline-block">
        <i class="el-icon-d-arrow-right" :style="{transform: show_condition ? 'rotate(-90deg)':'rotate(90deg)',marginRight:'3px'}"></i>
        {{show_condition?'页面收起':'页面展开'}}
      </span>
<!--    <el-dropdown style="position: absolute;top: 0px;right: 50px; padding: 3px 3px; font-size: 18px" trigger="hover">-->
<!--        <span class="el-dropdown-link">-->
<!--          <img :src="isFold()" @click="showConditions" style="width: 14px"/>-->
<!--        </span>-->
<!--      <el-dropdown-menu slot="dropdown">-->
<!--        <el-dropdown-item>参数</el-dropdown-item>-->
<!--      </el-dropdown-menu>-->
<!--    </el-dropdown>-->
    <el-dropdown  v-if="isEdit && type!='cron' && $access('/analysis/task/controlsee')"  style="position: absolute;top: 0px;right: 20px; padding: 3px 3px; font-size: 18px" trigger="hover"
        @command="handleCommand">
        <span class="el-dropdown-link">
          <i style="cursor: pointer;font-size: 24px; z-index:10000;" type="primary" :class="`el-icon-caret-bottom color-primary`"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="param">参数</el-dropdown-item>
          <el-dropdown-item command="sql" >SQL</el-dropdown-item>
          <el-dropdown-item v-if="type=='task'" ><a style="color: black;" target="_blank" :href="$store.state.api_url.job.yarn_log +'?job_id='+task.task_id">yarn日志</a></el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    <!-- 内部人查看 END -->
    <h2 class="page-title">{{this.model.zhName}}</h2>
    <el-row v-show="show_condition" v-if="load_finish" v-for="step in step_list" :key="step.step" class="step_row">
      <el-col :span="2" class="task_left">
        <el-row>
          <el-col :span="10" class="text-right">
            <span class="step_number">{{step.step}}</span>
          </el-col>
          <el-col :span="10" class="text-left">
            <p class="step_text1">step{{step.step}}</p>
            <p class="step_text2">{{step.step_name}}</p>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="22" class="task_right">

        <!--假如某个步骤中 模块多的话模块中间 选一个 start-->
        <div class="my-form-row">
          <span class="my-form-label">{{moduleGroupName.hasOwnProperty(step.module_group) ? moduleGroupName[step.module_group]: '模块选择'}}
            :</span>
          <div style="display: inline-block;">
            <el-select v-model="step.moduleId" @change="switchModule($event,step)">
              <el-option v-for="(item,index) in step.modules" :key=index :label="module_list[item.mduId].zhName" :value="item.mduId"></el-option>
            </el-select>
            <el-button @click="confirmModule(step)" :type="step.confirmModule ? 'primary' : 'info' " circle icon="el-icon-check"
              size="mini"></el-button>
          </div>
        </div>
        <!--假如某个步骤中 模块多的话模块中间 选一个 end -->


        <template v-for="(step_component,index) in step.step_components" v-if="step.confirmModule">
          <component :title="component_list[step_component.comId].zhName" :apis="component_list[step_component.comId].apis"
            :key="step.moduleId+step_component.comId" :moduleId="step.moduleId" :name="step_component.paramKey" :is="step_component.base_component"
            v-model="step_component.value">
          </component>
        </template>
      </el-col>
    </el-row>

    <!--
    <el-row class="step_row">
      <el-col :span="2" class="task_left">
        <el-row>
          <el-col :span="10" class="text-right">
            <span class="step_number">2</span>
          </el-col>
          <el-col :span="10" class="text-left">
            <p class="step_text1">step2</p>
            <p class="step_text2">属性筛选</p>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="22" class="task_right">
        <span class="my-form-label">筛选条件:</span>
        <user-where></user-where>
      </el-col>
    </el-row>
    -->


    <!--立即分析 保存视图按钮-->
    <el-row v-show="show_condition"  v-if="load_finish"  class="step_row" style="height: 145px;min-height: initial;">
      <el-col :span="2" class="task_left">
        <el-row>
          <el-col :span="10" class="text-right">
            <span class=""> </span>
          </el-col>
          <el-col :span="10" class="text-left">
            <p class="step_text1"> </p>
            <p class="step_text2"> </p>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="22" class="task_right">
        <div class="my-form-row">
          <span class="my-form-label">分析名称 :</span>
          <div class="my-form-right" style="display: inline-block;">
            <el-col :span="12">
              <el-input style="width: 200px;" v-model="task_name" placeholder="请输入分析名称" />
            </el-col>
            <el-col :span="12">

            </el-col>
          </div>
        </div>
        <div class="my-form-row">
          <span class="my-form-label"></span>
          <div class="my-form-right" style="display: inline-block;">
            <el-col :span="12" style="max-width: 685px;">
              <el-button type="primary" @click="submitTask">立即分析</el-button>
              <el-button type="primary" @click="saveView">保存视图</el-button>
              <el-button type="primary" @click="saveCron">定时任务</el-button>
              <el-button type="primary" @click="saveGroup">保存群组</el-button>
              <el-tooltip class="item" effect="dark" content="当完成step2，即可单击此处进行保存" placement="top-start">
                <i class="el-icon-question icon-help"></i>
              </el-tooltip>
              <!--定时任务和保存群组 弹框-->
              <group v-if="group.visible" v-model="group.visible" :param="group.param" :model_name="model.zhName"></group>
              <cron v-if="cron.visible" v-model="cron.visible" :param="cron.param" :model_name="model.zhName" :model="model"
                :step_list="step_list"></cron>
              <save-view v-if="view.visible" v-model="view.visible" :model_name="model.zhName" :model="model"
                :step_list="step_list" :task_id="task.task_id"></save-view>

            </el-col>
            <el-col :span="12">
              <span class="separate">
                <a v-if="convert.convert_type=='agg' && isShowChart('chartBar')" @click="setChartType('chartBar')"
                  class="w-btn" href="javascript:;">
                  <img src="/static/images/icon/bar.png" />
                </a><a v-if="convert.convert_type=='agg' && isShowChart('chartLine')" @click="setChartType('chartLine')"
                  class="w-btn" href="javascript:;">
                  <img src="/static/images/icon/line.png" />
                </a><a v-if="convert.convert_type=='agg' && isShowChart('chartPie')" @click="setChartType('chartPie')"
                  class="w-btn" href="javascript:;">
                  <img src="/static/images/icon/pie.png" />
                </a><a @click="setChartType('chartTable')" v-if="isShowChart('chartTable')" class="w-btn on" href="javascript:;">
                  <img src="/static/images/icon/table.png" />
                </a><a @click="setChartType('funnelTable')" v-if="isShowChart('funnelTable')" class="w-btn on" href="javascript:;">
                  <img src="/static/images/icon/table.png" />
                </a>
                <a @click="setChartType('retainTable')" v-if="isShowChart('retainTable')" class="w-btn on" href="javascript:;">
                  <img src="/static/images/icon/table.png" />
                </a>
              </span>
              <span class="separate" v-if="model.isShowTranspose">
                <el-dropdown placement="bottom" trigger="click">
                  <a class="w-btn" href="javascript:;" style="margin: 0;">
                    <i class="fa fa-exchange" style="font-size: 20px;line-height: 29px;" aria-hidden="true"></i>
                  </a>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :class="convert.convert_type=='agg' ? 'color-primary' :''" @click.native="convertData('agg')">按聚合</el-dropdown-item>
                    <el-dropdown-item :class="convert.convert_type=='date' ? 'color-primary' :''" @click.native="convertData('date')">按日期</el-dropdown-item>
                    <el-dropdown-item :class="convert.convert_type=='group' ? 'color-primary' :''" @click.native="convertData('group')">按分组</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
              <span class="separate" v-if="model.isShowDownload">
                <a class="w-btn" href="javascript:;" @click="download">
                  <img src="/static/images/icon/download.png" />
                </a>
              </span>

              <p>
                <font color="red" style="position: relative;">{{model.downloadContent}}</font>
                <font v-if="show.count>0" color="red" style="position: relative;">(总共{{show.count}}条)</font>
              </p>
            </el-col>
          </div>

        </div>
      </el-col>
    </el-row>

    <!-- 显示设置 排序 筛选 -->
    <el-row class="step_row" v-if="show.show_data && this.model.zhName!='留存分析' && this.model.zhName!='漏斗分析'" style="min-height: auto;">
      <el-col :span="2" class="task_left">
        <el-row>
          <el-col :span="10" class="text-right">
            <span class=""> </span>
          </el-col>
          <el-col :span="10" class="text-left">
            <p class="step_text1"> </p>
            <p class="step_text2"> </p>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="22" class="task_right">
        <div class="my-form-row">
          <span class="my-form-label">显示设置 :</span>
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
              <el-select v-model="condition.field" clearable filterable>
                <el-option v-for="item in show.field_list" :key="item" :value="item" :label="item">{{item}}</el-option>
              </el-select>
              <el-select v-model="condition.op" v-if="show.column_type[condition.field]=='DECIMAL' || show.column_type[condition.field]=='DATE'">
                <el-option v-for="item in op_list" :key="item.name" :value="item.value" :label="item.name"></el-option>
              </el-select>
              <el-select v-model="condition.op" v-if="show.column_type[condition.field]!='DECIMAL' && show.column_type[condition.field]!='DATE'">
                <el-option value="=" label="等于"></el-option>
                <el-option value="<>" label="不等于"></el-option>
              </el-select>
              <!-- 区间的时候显示两个框-->
              <template v-if="condition.op=='BETWEEN'">
                <template v-if="show.column_type[condition.field]!='DATE'">
                  <!--非时间框显示俩文本框-->
                  <el-input v-model="condition.start" placeholder="请输入开始值" style="width: 200px;" />
                  <el-input v-model="condition.end" placeholder="请输入结束值" style="width: 200px;" />
                </template>
                <template v-if="show.column_type[condition.field]=='DATE'">
                  <!--时间框显示俩日期选择器-->
                  <el-date-picker value-format="yyyy-MM-dd" v-model="condition.start" style="width: 200px;" type="date"
                    placeholder="选择日期时间"> </el-date-picker>
                  <el-date-picker value-format="yyyy-MM-dd" v-model="condition.end" style="width: 200px;" type="date"
                    placeholder="选择日期时间"> </el-date-picker>
                </template>

              </template>
              <!-- 不是区间的时候显示一个框-->
              <template v-if="condition.op!='BETWEEN'">
                <el-input v-if="show.column_type[condition.field]!='DATE'" v-model="condition.value" placeholder="请输入条件值"
                  style="width: 200px;" />
                <el-date-picker v-if="show.column_type[condition.field]=='DATE'" value-format="yyyy-MM-dd" v-model="condition.value"
                  style="width: 200px;" type="date" placeholder="选择日期时间"> </el-date-picker>
              </template>

              <el-button @click="removeWhere(conditionIndex)" v-if="show.where.length!=1" type="primary" circle icon="el-icon-minus" size="mini"></el-button>
              <el-button @click="addWhere"  type="primary" circle icon="el-icon-plus" size="mini"></el-button>


              <!--<el-button v-if="conditionIndex==(show.where.length-1)" @click="refreshData" type="primary">确定</el-button>-->

            </el-row>
          </div>
        </div>
        <div class="my-form-row" v-show="this.show.unfold">
          <span class="my-form-label">显示指定列:</span>
          <div style="display: inline-block;">
            <el-select v-model="show.show_col" @change="renderUsecol($event)">
              <el-option label="全部" value="all"></el-option>
              <el-option label="指定列" value="otherCol"></el-option>
            </el-select>
          </div>
          <div class="my-form-row" id="fixcolumn-position-task" v-show="this.show.unfold">
            <span class="my-form-label">配置固定列:</span>
            <div style="display: inline-block;margin-top: 6px;">
              <show-fixcolmn  v-if="openShowFixcolumn" v-model="fixed_column" :indicators="show.field_list" :id="this.task.task_id" :fixed_column_str="fixed_column" :key="show_fixcolmn_num+'key'"></show-fixcolmn>
              <span class="task-col-wrapper">
                <span style="display:inline-block;color:#0e73ff;margin: 0 16px;cursor:pointer" @click="configureFixColumn">{{openShowFixcolumn?"编辑":"添加"}}</span>
                <el-tooltip class="item" effect="dark" content="对数据结果进行条件设设定，且条件持续生效" placement="right">
                  <i class="el-icon-question" style="color:#ccc;margin: 0 16px 0 0;font-size:18px"></i>
                </el-tooltip>
                <el-button type="primary" @click="fixColumnParam()" size="small">确定</el-button>
              </span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>


    <el-row class="step_row" v-if="show.show_data">
      <component :key="show.number" :original_data="convert.original_data" :convert_type="convert.convert_type" v-if="show.show_data"
        :is="show.chart_type" :show_data="show.data" :show_col="show.show_col" :group_field="show.group_field" :select_field="show.select_field"
        :task_id="task.task_id" :fields_mapping="show.fields_mapping" :agg_type="agg_type" :wantUseclo="wantUseclo">
      </component>
      <div class="no-data-container" v-if="show.data.length==0">
        <i class="no-data-icon fa fa-folder-open"></i>
        <p v-if="data_error!=''" style="color: red;">{{data_error}}</p>
        <p v-if="data_error==''">当前无数据结果</p>
      </div>
    </el-row>
    <!--任务进度条-->
<!--    <step v-if="task.showStep " v-model="task.showStep" :task_id="task.task_id" :parent_step="task.step"> </step>-->
    <new_step v-if="task.showStep" v-model="task.showStep" :task_id="task.task_id" :parent_step="task.step"> </new_step>
    <view-otherclo v-model="viewCloflag" :field_list="show.field_list" :wantUseclo="wantUseclo"></view-otherclo>
    <fix-column v-model="fixcolmunFlag" :indicators="show.field_list" :id="this.task.task_id" @changeFixcolmnFun="changeFixcolmnFun" 
      @configureFixColumn="configureFixColumn" @showFixcolmnFun="showFixcolmnFun"></fix-column>

  </el-row>

</template>

<script>
  import eventWhere from '@/components/base/event_where.vue'
  import timer from '@/components/base/timer'
  import single from '@/components/base/single'
  import multipleSelect from '@/components/base/multiple_select.vue'
  import linkageSingle from '@/components/base/linkage_single'
  import eventGroup from '@/components/base/event_group'
  import userWhere from '@/components/base/user_where'
  import analyzeObject from '@/components/base/analyze_object'
  import userAgg from '@/components/base/user_agg.vue'
  import moduleLinkage from '@/components/base/module_linkage.vue'
  import moduleLinkageSuffix from '@/components/base/module_linkage_suffix.vue'
  import attrGroup from '@/components/base/attr_group.vue'
  import step from '@/components/base/step.vue'
  import eventIndicators from '@/components/base/event_indicators.vue'
  import timeSingle from '@/components/base/time_single.vue'
  import group from './group.vue';
  import cron from './cron.vue';
  import saveView from './saveView.vue';
  import chartBar from "@/components/charts/chartBar.vue"
  import chartTable from "@/components/charts/chartTable.vue"
  import chartLine from "@/components/charts/chartLine.vue"
  import chartPie from "@/components/charts/chartPie.vue"
  import retainedEvent from "@/components/base/retained_event.vue"
  import retainedTime from "@/components/base/retained_time.vue"
  import retainTable from "@/components/charts/remainTable.vue"
  import funnelTable from "@/components/charts/funnelTable.vue"
  import attrIndicators from "@/components/base/attr_indicators.vue"
  import moduleLinkageConfigurable from "@/components/base/module_linkage_configurable.vue"
  import timeUnit from "@/components/base/time_unit.vue"
  import attrDimension from "@/components/base/attr_dimension.vue"
  import eventDimension from "@/components/base/event_dimension.vue"
  import timeDetail from "@/components/base/time_detail.vue"
  import viewOtherclo from "./viewOtherclo.vue"
  import funnel from "@/components/base/funnel.vue"
  import windowPeriod from "@/components/base/window_period.vue"
  import dynamicSingle from "@/components/base/dynamicSingle.vue"
  import newStep from "@/components/base/new_step.vue"
  import routineFixedobj from "@/components/base/routine_fixedobj.vue"
  import dynamicLinksingle from "@/components/base/dynamic_linksingle.vue"
  import fixColumn from './fixColumn.vue';
  import showFixcolmn from './showFixcolmn';

  

  import {
    Loading
  } from 'element-ui';
  import New_step from "../../../base/new_step";
  // let loadingInstance1 = Loading.service({ fullscreen: true });
  export default {
    components: {
      New_step,
      chartBar,
      chartTable,
      chartLine,
      chartPie,
      group,
      cron,
      saveView,
      timer,
      single,
      multipleSelect,
      userWhere,
      eventWhere,
      linkageSingle,
      moduleLinkageSuffix,
      eventGroup,
      analyzeObject,
      userAgg,
      moduleLinkage,
      attrGroup,
      step,
      eventIndicators,
      timeSingle,
      retainedEvent,
      retainedTime,
      retainTable,
      funnelTable,
      attrIndicators,
      moduleLinkageConfigurable,
      timeUnit,
      attrDimension,
      eventDimension,
      timeDetail,
      viewOtherclo,
      funnel,
      windowPeriod,
      dynamicSingle,
      newStep,
      routineFixedobj,
      dynamicLinksingle,
      fixColumn,
      showFixcolmn
    },
    data() {
      return {
        show_fixcolmn_num: 0,
        openShowFixcolumn: false, //显示配置的固定列falg
        fixed_column: [],
        fixcolmunFlag: false, //固定列弹框
        fixColumnDialog: false, //固定列dialong
        flag: true,//防抖
        data_error: '', //数据加载失败原因
        agg_type: "", //指标类型
        can_save_view: false, //是否可以保存为视图
        type: "task", // task-我的分析查看  cron-计划任务查看  view-视图查看
        isEdit: false, //是否是编辑
        model: {}, //模型详情
        load_finish: false,
        step_list: [], //模型下面的每个步骤
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
        view_name: "", //视图名称
        view_desc: "", //视图描述
        viewCloflag: false,//指定列弹框
        wantUseclo: [],//想要展示的列
        renderwantClo: false,
        task_name:"",
        show_submit: true,
        show_condition: true,
        ford_decs: "页面收起",
        task: {
          showStep: false,
          step: 1,
          task_id: '',
          timer: null,
        },
        show: {
          unfold: false,
          show_data: false,
          show_col: 'all',//默认显示列数
          data: [],
          "order_field": "",
          "order_type": "ASC",
          where: [{
                "field": '',
                "op": "=",
                "value": "",
                "start": "",
                "end": "",
              }],
          field_list: [],
          chart_type: '',
          group_field: [],
          select_field: [],
          fields_mapping: [],
          number: 1,
          count: 0, //总共多少条数据
          column_type: {},
        },
        //坐标轴转换
        convert: {
          convert_type: 'agg',
          original_data: [],
          original_group_by: [],
          original_select_field: [],
        },
        moduleGroupName: {
          "object_select": "对象类型",
          "where": "筛选类型",
          "group": "分组类型",
          "agg": "指标类型",
        },
        cron: { //计划任务
          visible: false,
          cronParam: {},
          gropParam: {},

        },
        group: { //保存群组
          visible: false,
          param: {},
        },
        view:{ //保存群组
          visible: false,
        },
        "op_list": [{
            name: "等于",
            value: "="
          },
          {
            name: "不等于",
            value: "<>"
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
          {
            name: "区间",
            value: "BETWEEN"
          },
        ],
        downloadWhere: "",
      }
    },
    methods: {
      showFixcolmnFun() {
        this.openShowFixcolumn = true;
        this.show_fixcolmn_num++; //重新渲染展示组件
      },
      configureFixColumn() {
        this.fixcolmunFlag = !this.fixcolmunFlag;
      },
      changeFixcolmnFun(list) {
        this.fixed_column = list;
      },
      fixColumnParam() { //固定列参数拼接
        // this.show.where = '';
        // this.show.order = "";
        // this.show.specified_column = [];
        var where=[];
        // console.log(paramWhere,"param")
        // if(type=="download") {
        //   where = paramWhere;
        // }
        for (var column of this.fixed_column) {
          //数值
          if (column.type == 'number') {
            if (column.op == 'BETWEEN') {
              if (column.start != '' && column.end != '' && column.start && column.end) {
                where.push('(' + column.column + ' ' + column.op + " " + column.start +
                  "  AND  " + column.end + ")")
              }
            } else {
              if (column.value != '' && column.value) {
                where.push('(' + column.column + ' ' + column.op + " " + column.value +
                  ')');
              }
            }
          }
          //字符串   
          if (column.type == 'string') {
            if (column.op == 'BETWEEN') {
              if (column.start != '' && column.end != '' && column.start && column.end) {
                where.push('(' + column.column + ' ' + column.op + " '" + column.start +
                  "'  AND  '" + column.end + "')")
              }
            } else {
              if (column.value != '' && column.value) {
                where.push('(' + column.column + ' ' + column.op + " '" + column.value +
                  "'" + ')');
              }
            }
          }
          //固定维度
          if (column.type == 'dimension') {
            //固定维度全选时候
            if(column.is_check_all) {
              //  where.push('(' + column.column + ' ' + '=' + ' ' + '1==1' + ')')
            }else{
              //固定维度的多选情况
              if (column.multiple && column.values.length > 0) {
                var in_array = [];
                for (var in_value of column.values) {
                  in_array.push("'" + in_value + "'")
                }
                where.push('(' + column.column + ' ' + 'IN' + "(" + in_array.join(
                    ',') +
                  ")" + ')');
              }

              //固定维度的单选情况
              if (!column.multiple && column.value != '') {
                where.push('(' + column.column + ' ' + '=' + " '" + column.value +
                  "'" + ')');
              }
            }
          }
          //时间类型
          if (column.type == 'time') {
            if (column.time_type == 'STATIC') {
              if (column.op == '=') {
                var value = new Date(column.value);
                if (column.time_granularity == 'DATE') {
                  value = value.Format('yyyy-MM-dd');
                }
                if (column.time_granularity == 'HOUR') {
                  value = value.Format('yyyy-MM-dd HH');
                }
                if (column.time_granularity == 'SECOND') {
                  value = value.Format('yyyy-MM-dd HH:mm:ss');
                }
                where.push('(' + column.column + ' ' + column.op + " '" + value +
                  "')")
              } else { //column.op == 'between'
                var start = new Date(column.time_range[0]);
                var end = new Date(column.time_range[1]);
                if (column.time_granularity == 'DATE') {
                  start = start.Format('yyyy-MM-dd');
                  end = end.Format('yyyy-MM-dd');
                }
                if (column.time_granularity == 'HOUR') {
                  start = start.Format('yyyy-MM-dd HH');
                  end = end.Format('yyyy-MM-dd HH');
                }
                if (column.time_granularity == 'SECOND') {
                  start = start.Format('yyyy-MM-dd HH:mm:ss');
                  end = end.Format('yyyy-MM-dd HH:mm:ss');
                }
                where.push('(' + column.column + ' ' + 'BETWEEN' + " '" + start +
                  "'  AND  '" + end + "')")
              }
            } else {
              var time_units = column.time_units;
              var time_value = column.time_value;
              var end = new Date().Format('yyyy-MM-dd 23:59:59');
              var start = (new Date(new Date(end).getTime() - 86400 * 1000 * (1 - 1))).Format(
                'yyyy-MM-dd 00:00:01');
              if (time_units == 'HOURS') { //最近N小时
                var end = (new Date(new Date().getTime() - 3600 * 1000)).Format('yyyy-MM-dd HH:59:59');
                var start = (new Date(new Date().getTime() - 3600 * 1000 * time_value)).Format(
                  'yyyy-MM-dd HH:00:01');
              }
              if (time_units == 'DAYS') { //最近N天
                var end = new Date().Format('yyyy-MM-dd 23:59:59');
                var start = (new Date(new Date(end).getTime() - 86400 * 1000 * (time_value - 1))).Format(
                  'yyyy-MM-dd 00:00:01');
                if (column.only_one) {
                  var end = new Date(start).Format(
                    'yyyy-MM-dd 23:59:59')
                }
              }
              if (time_units == 'WEEK') { //最近N周
                var today = new Date();
                var now = today.getDay();
                var start = new Date(today.getTime() - 86400 * 1000 * (now - 1));
                var end = new Date(today.getTime() + 86400 * 1000 * (7 - now));

                var end = end.Format('yyyy-MM-dd 23:59:59');
                var start = (new Date(new Date(end).getTime() - 86400 * 1000 * (time_value * 7 - 1))).Format(
                  'yyyy-MM-dd 00:00:01');
                if (column.only_one) {
                  var end = new Date(new Date(start).getTime() + 86400 * 1000 * 6).Format(
                    'yyyy-MM-dd 23:59:59')
                }
              }
              if (time_units == 'MONTH') { //最近月小时
                var now = new Date();
                var now2 = new Date();
                var start = new Date();
                var end = new Date();
                start.setMonth(now.getMonth() - (time_value - 1));
                var start = start.Format('yyyy-MM-01 00:00:01');
                now.setMonth(now.getMonth() + 1);
                now.setDate(0);
                var end = now.Format('yyyy-MM-dd 23:59:59');
                if (column.only_one) {
                  var start_object = new Date(start);
                  start_object.setMonth(start_object.getMonth() + 1);
                  start_object.setDate(0);
                  end = start_object.Format('yyyy-MM-dd 23:59:59');
                }
              }

              var start = new Date(start);
              var end = new Date(end);
              if (column.time_granularity == 'DATE') {
                start = start.Format('yyyy-MM-dd');
                end = end.Format('yyyy-MM-dd');
              }
              if (column.time_granularity == 'HOUR') {
                start = start.Format('yyyy-MM-dd HH');
                end = end.Format('yyyy-MM-dd HH');
              }
              if (column.time_granularity == 'SECOND') {
                start = start.Format('yyyy-MM-dd HH:mm:ss');
                end = end.Format('yyyy-MM-dd HH:mm:ss');
              }
              if (column.op == 'BETWEEN') {
                where.push('(' + column.column + ' ' + 'BETWEEN' + " '" + start +
                  "'  AND  '" + end + "')")
              } else {
                where.push('(' + column.column + ' ' + column.op + " '" + start +
                  "')")
              }

            }
          }
        }

        //显示设置参数拼接
        this.refreshData(where);
      },
      changeRencloData() {
        this.show.number++;
      },
      download: function() {
        let loadingInstance2 = Loading.service({//加載效果
        fullscreen: true
        });
        if (this.show.show_data) {
          this.fixColumnParam();
          // var where = [];
          // for (var v of this.show.where) {
          //   if (v.field && v.value.trim() && v.op != 'BETWEEN') {
          //     where.push(' ' + v.field + ' ' + v.op + " '" + v.value.trim() + "' ");
          //   }
          //   if (v.field && v.start.trim() && v.end.trim() && v.op == 'BETWEEN') {
          //     where.push(' (' + v.field + ' ' + v.op + " '" + v.start.trim() + "' AND '" + v.end.trim() + "' )");
          //   }
          // }
          // if (where.length > 0) {
          //   where = where.join(' AND ');
          // } else {
          //   where = '';
          // }
          var designateColumns = this.show.show_col=='otherCol'?this.wantUseclo:[];
          var url = this.$store.state.api_url.task.get_csv_path;
          var param = this.$generateParams({
            "designateColumns": designateColumns,
            task_id: this.task.task_id,
            type: this.type,
            where:this.downloadWhere,
          });
          this.axios.post(url, param).then((res) => {
            var data = res.data;
            if (data.code == 200) {
              var url = this.$store.state.api_url.task.get_file + '?path=' +data.data.pathName ;
              window.location.href=url;
              this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                loadingInstance2.close();
              });
            } else {
              this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                loadingInstance2.close();
              });
              this.$error(data.msg) ;
            }
          }).catch((error) => {
            this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                loadingInstance2.close();
            });
          console.log(error);
          this.$error("加载数据失败");
        });
      } else {
        this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                loadingInstance2.close();
              });
        this.$error("请核对当前任务是否有数据");
      }
    },
    convertData: function(convert_type) { //坐标轴转换

      if (convert_type == 'agg') { //按照聚合 返回原始数据
        this.show.data = this.convert.original_data;
        this.show.group_field = this.convert.original_group_by;
        this.show.select_field = this.convert.original_select_field;
        this.$count('CHART','TRANSLATION_AXIS',{"type":'按聚合'});//打点统计
      }
      try {
        if (convert_type == 'date') {
          this.$count('CHART','TRANSLATION_AXIS',{"type":'按日期'});//打点统计
          var res = this.$tools.convertToDate(this.convert.original_data, this.convert.original_group_by, this.convert
            .original_select_field);
          this.show.data = res;
          this.show.chart_type = 'chartTable';
        }
        if (convert_type == 'group') {
          this.$count('CHART','TRANSLATION_AXIS',{"type":'按分组'});//打点统计
          var res = this.$tools.convertToGroup(this.convert.original_data, this.convert.original_group_by, this.convert
            .original_select_field);
          this.show.data = res;
          this.show.chart_type = 'chartTable';
        }
      } catch (error) {
        this.$error(error.message);
        return;
      }
      this.convert.convert_type = convert_type;
      this.show.number++; //刷新key  让组件重新渲染
    },
    /**
     * @param {Object} chart_type
     * 设置图标可视化的时候的图标类型
     */
    setChartType: function(chart_type) {
      this.show.chart_type = chart_type;
    },
    debug: function() {
      this.task.task_id = 'keepData';
      this.initData();
    },
    /**
     * 显示设置处展开收起
     */
    doFold: function() {
      this.show.unfold = !this.show.unfold;
    },
    /**
     * 确认模块选择
     */
    confirmModule: function(step) {
      if (step.confirmModule) {
        step.confirmModule = false;
        //初始化模块参数
        this.switchModule(step.moduleId, step);
      } else {
        step.confirmModule = true;
        if (step.module_group == 'agg') {
          this.agg_type = step.module_type;
        }
      }


    },
    /**
     * 步骤切换模块
     */
    switchModule: function(moduleId, step) {
      var module = this.module_list[moduleId];
      step.moduleId = moduleId;
      step.module_type = module.moduleType.trim();
      step.module_type = module.moduleType.trim();
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
      this.$set(step, 'step_components', step_components);
      if (step.module_group == 'agg') {
        this.agg_type = step.module_type;
      }
    },
    /**
     *初始化每个步骤的组件
     */
    initComponts: function() { //初始化步骤的业务组件
      for (var i in this.step_list) {
        var step = this.step_list[i];

        var module = this.module_list[step.moduleId];
        step.module_type = module.moduleType.trim();
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
        this.$set(step, 'step_components', step_components);
      }
    },
    /**
     * 显示设置处点击确定的时候刷新数据
     */
    refreshData(where) {

      this.convert.convert_type = 'agg';
      var order = {};
      // var where = [];
      if (this.show.order_field != '') {
        order[this.show.order_field] = this.show.order_type == 'ASC';
      }
      for (var v of this.show.where) {
        if (v.field && v.value.trim() && v.op != 'BETWEEN') {
          where.push(' `' + v.field + '` ' + v.op + " '" + v.value.trim() + "' ");
        }
        if (v.field && v.start.trim() && v.end.trim() && v.op == 'BETWEEN') {
          where.push(' (`' + v.field + '` ' + v.op + " '" + v.start.trim() + "' AND '" + v.end.trim() + "' )");
        }
      }
      if (where.length > 0) {
        where = where.join(' AND ');
      } else {
        where = '';
      }
      this.downloadWhere = where;
      var url = this.$store.state.api_url.task.find_data;
      var param = this.$generateParams({
        task_id: this.task.task_id,
        type: this.type,
        order_fields: order,
        page: 1,
        page_size: 500,
        where: where,
      });
      this.$count('CHART','DISPLAY_DATA',{"type":this.type,task_id:this.task.task_id});//打点统计
      this.axios.post(url, param).then((res) => {
        var data = res.data;
        if (data.code == 200) {
          let count = data.data.count;
          data = data.data.table.table;
          if (data.length > 0) {
            this.show.data = data;
            this.convert.original_data = data;
            this.changeRencloData();
            // this.show.count =  data.data.count ;
            this.show.count = count;
          } else {
            this.show.data = [];
            this.convert.original_data = [];
            this.show.count = 0;
          }
        } else {
          this.show.data = [];
          this.convert.original_data = [];
          this.show.count = 0;
        }
        this.show.number++;
      }).catch((error) => {
        console.log(error);
        this.$error("加载数据失败");
      });
    },

    /**
     * 增加条件
     */
    addWhere:function(){
      this.show.where.push({
        "field": '',
        "op": "=",
        "value": "",
        "start": "",
        "end": "",
      }) ;
    },
    /**
     * 删除where
     */
    removeWhere:function(index){
      this.show.where.splice(index,1) ;
    },

    /**
     * 首次加载数据
     */
    initData: function() {
      this.data_error = '';
      var url = this.$store.state.api_url.task.find_data;
      var param = this.$generateParams({
        task_id: this.task.task_id,
        type: this.type,
        order_fields: {},
        page: 1,
        page_size: 500,
        where: "",
      });
      this.axios.post(url, param).then((res) => {
        var data = res.data;
        this.convert.convert_type = 'agg';
        if (data.code == 200) {
          var list = data.data.table.table;
          var where = [];
          var field_list = [];
          this.show.column_type = data.data.columnType;
          if (list.length > 0) {
            var row = list[0];
            for (var field in row) {
              field_list.push(field);
            }
            this.show.data = list;
            this.show.field_list = field_list;
            this.show.show_data = true;
            this.show.group_field = data.data.meta.group_fields;
            this.show.select_field = data.data.meta.metric_fields;
            this.show.fields_mapping = data.data.meta.fields_mapping;
            this.convert.original_data = list;
            this.convert.original_group_by = data.data.meta.group_fields;
            this.convert.original_select_field = data.data.meta.metric_fields;
            this.show.number++;
            this.show.count = data.data.count;
          } else { //没数据
            this.show.data = [];
            this.show.field_list = [];
            this.show.show_data = true;
            this.convert.original_data = [];
            this.convert.original_group_by = [];
            this.convert.original_select_field = [];
            this.show.number++;
            this.show.count = 0;
          }
        } else {
          this.show.data = [];
          this.show.field_list = [];
          this.show.show_data = true;
          this.data_error = data.msg;
          console.log("加载数据请求接口失败");
        }
      }).catch((error) => {
        console.log(error);
        this.$error("加载数据失败");
      });
    },
    /**
     * 查询任务分析进度
     */
    taskProgress: function(status) {
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
        "CANCELED": 4,
      }
      if(status){
        this.task.step = status_step[status];
      }else{
        this.task.step = 1;
      }
      this.task.showStep = true;
      this.task.timer = setInterval(() => {
        if (!this.task.showStep) {
          clearInterval(this.task.timer);
          this.task.timer = null;
          return;
        }
        this.axios.post(url, param).then((res) => {
          var status = res.data.data.status;
          var step = status_step[status];
          this.task.step = step;
          if (step == 4) {
            clearInterval(this.task.timer);
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
    cleanOldData: function() {
      this.show.show_data = false;
      this.show.unfold = false;
      this.show.data = [];
      this.show.order_field = '';
      this.show.order_type = '';
      this.show.where = [];
      this.task = {
        showStep: false,
        step: 1,
        task_id: '',
        timer: null,
      };
    },
    //提交任务
    submitTask: function() {
      if(!this.flag) {
          this.$error('请勿重复点击提交');
          return;
      }
      this.flag=false;//防抖
      setTimeout(() => {
          this.flag=true;
      }, 5000);
      this.type =  "task" ;
      this.can_save_view = true;
      clearInterval(this.task.timer);
      this.cleanOldData();
      var data = {};
      data["model_name"] = this.model.zhName;
      var modules = [];


      //指标 和 分组  需要判断指标和分组里面不允许重复
      var  aggs = [] ;
      var  group_by =  [] ;

      for (var step of this.step_list) {
        var list = [];
        var module = {
          no: step.step,
          module_type: step.module_type,
        };
        if (!step.confirmModule) {
          if (step.module_group == 'agg') {
            this.$error("必须选择指标");
            return;
          }
          if (step.module_group == 'object_select') {
            this.$error("必须选择分析对象");
            return;
          }
          continue;
        }
        var module_param = {};
        for (var component of step.step_components) {
          var param = this.$tools.makeSubmitParam[component.base_component](component.value);
          if (!param.status) {
            this.$error(param.message);
            return;
          } else {
            module_param[component.paramKey] = param.value;
          }
          if(component.paramKey == 'aggs' || component.paramKey == 'agg_by'){
            aggs = component.value ;
          }
          if(component.paramKey == 'group_by'){
            group_by = component.value ;
          }
        }
        module.param = JSON.stringify(module_param);
        modules.push(module);
      };

      //分组 和 指标 字段不允许重复判断
      var rs = this.$tools.makeSubmitParam.compareAggAndGroup(aggs,group_by) ;
      if (!rs.status) {
        this.$error(rs.message);
        return;
      }

      data["modules"] = modules;

      var web_params = {};
      web_params.model = this.model;
      web_params.step_list = this.step_list;
      data["web_params"] = JSON.stringify(web_params);
      data["task_name"] = this.task_name.trim() ;
      var url = this.$store.state.api_url.task.task_submit;
      var param = this.$generateParams(data);
      this.axios.post(url, param).then((res) => {
        var data = res.data;
        this.task_name = '';
        // this.$success("提交成功任务ID:" + data.data.task_id);
        // this.view_name = data.data.task_id;
        this.task.task_id = data.data.task_id;
        // this.task.task_id = '20200630092435_000042';
        this.task.step = 1;
        this.taskProgress();
      }).catch((errors) => {
        console.log(errors)
        this.$error("任务提交失败");
      });;
    },
    /**
     * 保存定时任务
     */
    saveCron: function() {
      var modules = [];

      //指标 和 分组  需要判断指标和分组里面不允许重复
      var  aggs = [] ;
      var  group_by =  [] ;

      for (var step of this.step_list) {
        var list = [];
        var module = {
          no: step.step,
          module_type: step.module_type,
        };
        if (!step.confirmModule) {
          if (step.module_group == 'agg') {
            this.$error("必须选择指标");
            return;
          }
          if (step.module_group == 'object_select') {
            this.$error("必须选择分析对象");
            return;
          }
          continue;
        }
        var module_param = {};
        for (var component of step.step_components) {
          var param = this.$tools.makeSubmitParam[component.base_component](component.value);
          if (!param.status) {
            this.$error(param.message);
            return;
          } else {
            module_param[component.paramKey] = param.value;
          }
          if(component.paramKey == 'aggs' || component.paramKey == 'agg_by'){
            aggs = component.value ;
          }
          if(component.paramKey == 'group_by'){
            group_by = component.value ;
          }
        }
        module.param = JSON.stringify(module_param);
        modules.push(module);
      };
      //分组 和 指标 字段不允许重复判断
      var rs = this.$tools.makeSubmitParam.compareAggAndGroup(aggs,group_by) ;
      if (!rs.status) {
        this.$error(rs.message);
        return;
      }
      this.cron.param = modules;
      this.cron.visible = true;
    },
    //保存群组
    saveGroup: function() {
      var modules = [];
      for (var step of this.step_list) {
        var list = [];
        var module = {
          no: step.step,
          module_type: step.module_type,
        };
        if (!step.confirmModule) {
          if (step.module_group == 'object_select') {
            this.$error("必须选择分析对象");
            return;
          }
          if (step.module_group == 'where') {
            this.$error("请选择筛选条件");
            return;
          }
          continue;
        }
        if (step.module_group != 'object_select' && step.module_group != 'where') { //保存群组的时候只需要分析对象和筛选条件
          continue;
        }
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
      this.group.param = modules;
      this.group.visible = true;
    },
    //查看参数
    handleCommand: function(val) {
      if (val == "param") {
        let id = this.$route.query.task_id;
        this.$router.push({
          path: "/analysis/task/lookparam",
          query: {
            task_id: id
          }
        })
      } else if (val == "sql") {
        let id = this.$route.query.task_id;
        this.$router.push({
          path: "/analysis/task/looksql",
          query: {
            task_id: id
          }
        });
      }
    },
    /**
     * 保存视图
     */
    saveView: function() {
      if (!this.task.task_id) {
        this.$error("分析之后才能保存为视图");
        return;
      }
      if (!this.can_save_view) {
        this.$error("请点击分析之后再保存为视图");
        return;
      }
      this.view.visible = true;
    },
    /**
     * 编辑任务的时候初始化参数
     */
    edit: function(task_id) {
      let loadingInstance1 = Loading.service({
        fullscreen: true
      });
      this.task.task_id = task_id;
      this.isEdit = true;
      var task_info = '';
      if (this.type == 'task') { //我的分析 详情
        this.show_condition=false;
        var task_detail_url = this.$store.state.api_url.task.find_sql;
        var param = this.$generateParams({
          task_ids: [task_id]
        });
      }
      if (this.type == 'view') { //我的视图 详情
        var task_detail_url = this.$store.state.api_url.view.detail;
        var param = this.$generateParams({
          view_id: task_id
        });
      }
      if (this.type == 'cron') { //定时任务 详情
        var task_detail_url = this.$store.state.api_url.task.timed_task_detail;
        var param = this.$generateParams({
          task_id: task_id
        });
      }
      this.axios.post(task_detail_url, param).then((res) => {
        if (res.data.code == 200) {
          if (this.type == "view" || this.type == "cron") {
            var task_info = res.data.data;
            if(this.type == "cron"){
              //权限判断
              var itemUser = task_info.create_role;
              var user = this.$store.state.user.user_id;
              if(task_info.is_private && itemUser != user) {
                this.$box('没有访问该视图的权限，请获取权限后尝试', '/data/timing/list');
              }
            }
            if(this.type == 'view'){
              this.$store.state.view_name = task_info.view_name;
            }
            if(this.type == 'cron'){
              this.$store.state.view_name = task_info.name;
            }
          }
          if (this.type == "task") {
            var task_info = res.data.data[0];
            //权限判断
            var itemUser = task_info.create_role;
            var user = this.$store.state.user.user_id;
            if(task_info.is_private && itemUser != user) {
              this.$box('没有访问该视图的权限，请获取权限后尝试', '/analysis/task/list');
            }
            this.$store.state.view_name = task_info.task_name ? task_info.task_name : task_info.task_id;
          }
          if (this.type == 'task') {
            if(task_info.status == 'SUCCESS' || task_info.status == 'FAILED' || task_info.status == 'CANCELED'){
              this.initData();
            }else{
              this.taskProgress(task_info.status );
            }
          }else{
            this.initData();
          }
          var web_params = JSON.parse(task_info.web_params);
          this.model = web_params.model;
          for (let q in this.model.chartType) {
            if (this.model.chartType[q] == "retainTable") {
              this.show.chart_type = 'retainTable';
            }
            if (this.model.chartType[q] == "funnelTable") {
              this.show.chart_type = 'funnelTable';
            }
          }
          if (this.show.chart_type == '') {
            this.show.chart_type = 'chartTable'
          }
          this.step_list = web_params.step_list;
          this.agg_type = this.step_list[this.step_list.length - 1].module_type;
          //获取所有 mduId
          this.model.stepModule.map((step, index) => {
            step.modules.map((v) => {
              this.mduIds.push(v.mduId);
            });
          })
          var modules_detail_url = this.$store.state.api_url.task.modules_detail;
          var componts_detail_url = this.$store.state.api_url.task.components_detail;

          //请求模块详情
          this.axios.post(modules_detail_url, {
            mduIds: this.mduIds.join(',')
          }).then((res) => {
            var data = res.data;
            var module_list = this.$tools.list2map(data.data, 'mduId');
            this.module_list = module_list;
            data.data.map((module) => {
              module.comIds.map((v) => {
                this.comIds.push(v.uid);
              })
            });
            //模块加载完之后请求业务组件详情
            this.axios.post(componts_detail_url, {
              comIds: this.comIds.join(',')
            }).then((res) => {
              var data = res.data;
              var component_list = this.$tools.list2map(data.data, 'comId');
              this.component_list = component_list;
              this.load_finish = true;
              this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                loadingInstance1.close();
              });
            }).catch((errors) => {
              this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                loadingInstance1.close();
              });
              console.log(errors);
              console.log("加载模块详情失败.task1");
            })
          }).catch((errors) => {
            this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
              loadingInstance1.close();
            });
            console.log(errors);
            console.log("加载模块详情失败.task1");
          })
        } else {
          this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance1.close();
          });
          this.$error(res.data.msg);
          console.log("加载任务详情失败.task1");
        }
      }).catch((errors) => {
        console.log(errors);
        this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
          loadingInstance1.close();
        });
        console.log("加载任务详情失败.task1");
      })


    },
    /**
     * 添加模型的时候初始化参数
     */
    add: function(mid) {
      this.$store.state.linkage.object = 'role'  ;
      //请求模型详情
      var model_detail_url = this.$store.state.api_url.task.find_model_detail;
      var param = {
        mid: mid
      };
      this.axios.post(model_detail_url, param).then((res) => {
        var data = res.data;
        if (data.code != 200) {
          this.$error("加载模型详情失败");
          return;
        }
        this.model = data.data;
        for (let q in this.model.chartType) {
          if (this.model.chartType[q] == "retainTable") {
            this.show.chart_type = 'retainTable';
          }
          if (this.model.chartType[q] == "funnelTable") {
            this.show.chart_type = 'funnelTable';
          }
        }
        if (this.show.chart_type == '') {
          this.show.chart_type = 'chartTable'
        }
        var step_list = [];
        this.model.stepModule.map((step, index) => {
          this.$set(step, 'module', step.modules[0]); //每个步骤默认选中第一个step
          this.$set(step, 'moduleId', step.module.mduId);
          this.$set(step, 'step', index + 1);
          this.$set(step, 'module_group', step.module_type);
          this.$set(step, 'module_type', '');
          this.$set(step, 'confirmModule', false);
          step_list.push(step);
          step.modules.map((v) => {
            this.mduIds.push(v.mduId);
          });
        })
        this.step_list = step_list;
        var modules_detail_url = this.$store.state.api_url.task.modules_detail;
        var componts_detail_url = this.$store.state.api_url.task.components_detail;

        //请求模块详情
        this.axios.post(modules_detail_url, {
          mduIds: this.mduIds.join(',')
        }).then((res) => {
          var data = res.data;
          var module_list = this.$tools.list2map(data.data, 'mduId');
          this.module_list = module_list;
          data.data.map((module) => {
            module.comIds.map((v) => {
              this.comIds.push(v.uid);
            })
          });
          //模块加载完之后请求业务组件详情
          this.axios.post(componts_detail_url, {
            comIds: this.comIds.join(',')
          }).then((res) => {
            var data = res.data;
            var component_list = this.$tools.list2map(data.data, 'comId');
            this.component_list = component_list;
            this.initComponts();
            this.load_finish = true;
          }).catch((errors) => {
            console.log(errors);
            console.log("加载模块详情失败.task1");
          })
        }).catch((errors) => {
          console.log(errors);
          console.log("加载模块详情失败.task1");
        })
      }).catch((err) => {
        this.$error("加载模型详情失败");
      });
    },

    isShowChart(chartType) {
      if (this.model.chartType == null) {
        return true
      }
      for (let chart of this.model.chartType) {
        if (chartType == chart) {
          return true
        }
      }
      return false
    },
    renderUsecol(type){
      // this.show.number++;
      if(type == 'all'){
        this.renderwantClo = false;
        this.viewCloflag = false;
        this.wantUseclo = [];
      }
      if(type =='otherCol'){
        this.wantUseclo = [];
        this.viewCloflag = true;
        this.renderwantClo = true;
      }
    },
    showConditions(){
      this.show_condition = !this.show_condition
    },
    isFold(){
      if (this.show_condition){
        this.ford_decs = "页面收起"
        return "/static/images/icon/fordup.png"
      } else {
        this.ford_decs = "页面展开"
        return "/static/images/icon/unford.png"
      }
    }
  },
  created() {
      this.$store.state.page_name = "多维分析";
      var get = this.$route.query;
      if (get.hasOwnProperty('type')) {
        this.type = get.type;
      }
      if (get.hasOwnProperty('mid')) {
        this.can_save_view = true;
        this.add(get.mid);
        return;
      }
      if (get.hasOwnProperty('task_id')) {
        this.can_save_view = true;
        this.edit(get.task_id);
        return;
      }
      //没有参数默认跑去多维分析
      this.add('5efc3d74a3b0e46fee96f1df'); //这是多维分析的模型ID
    },
    mounted() {

    },
    beforeDestroy: function() {
      this.$store.state.view_name = "";
      clearInterval(this.task.timer);
    }
  }
</script>

