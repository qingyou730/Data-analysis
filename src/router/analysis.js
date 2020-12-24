import NullComponent from '@/components/public/null.vue'
import AnalysisComponentsAdd from '@/components/views/analysis/components/add.vue'
import AnalysisAgaleList from '@/components/views/analysis/agile/agaleList.vue'
import AnalysisModelTask from '@/components/views/analysis/model/task.vue'
import AnalysisComponentList from '@/components/views/analysis/components/list.vue'
import AnalysisModuleAdd from '@/components/views/analysis/module/addModule.vue'
import AnalysisModuleList from '@/components/views/analysis/module/moduleList.vue'
import AnalysisModelAdd from '@/components/views/analysis/model/addModle.vue'
import AnalysisModelEdit from '@/components/views/analysis/module/edit.vue'
import AnalysisModelList from '@/components/views/analysis/model/modelList.vue'
import AnalysisTaskList from '@/components/views/analysis/task/list.vue'
import AnalysisModelTaskDetail from '@/components/views/analysis/model/taskDetail.vue'
import AnalysisModelViewDetail from '@/components/views/analysis/model/viewDetail.vue'
import AnalysisTaskLookparam from '@/components/views/analysis/task/lookparam.vue'
import AnalysisTaskLooksql from '@/components/views/analysis/task/looksql.vue'
import AnalysisTaskcontrolSee from '@/components/views/analysis/task/controlSee.vue'
import AnalysisComponentsEdit from '@/components/views/analysis/components/edit.vue'


var analysis = [
  {
    path: '/analysis/components/list',
    name: '组件管理-列表',
    component: AnalysisComponentList
  },
  {
    path: '/analysis/components/add',
    name: '组件管理-新增',
    component: AnalysisComponentsAdd
  },
  {
    path: '/analysis/components/edit',
    name: '业务组件-修改',
    component: AnalysisComponentsEdit
  },
  {
    path: '/analysis/components/delete',
    name: '组件管理-删除',
    component: NullComponent
  },
  {
    path: '/analysis/agile/list',
    name: '敏捷分析-视图列表',
    component: AnalysisAgaleList
  },
  {
    path: '/analysis/model/viewDetail',
    name: '敏捷分析-视图详情',
    component: AnalysisModelTask
  },
  {
    path: '/analysis/agile/delete',
    name: '敏捷分析-视图删除',
    component: NullComponent
  },
  {
    path: '/analysis/agile/auth',
    name: '敏捷分析-视图分享',
    component: NullComponent
  },
  {
    path: '/analysis/model/task',
    name: '模型分析-创建任务',
    component: AnalysisModelTask
  },
  {
    path: '/analysis/module/list',
    name: '模块管理-列表',
    component: AnalysisModuleList
  },
  {
    path: '/analysis/module/add',
    name: '模块管理-新增',
    component: AnalysisModuleAdd
  },
  {
    path: '/analysis/module/edit',
    name: '模块管理-修改',
    component: AnalysisModelEdit
  },
  {
    path: '/analysis/module/delete',
    name: '模块管理-删除',
    component: NullComponent
  },
  {
    path: '/analysis/modle/list',
    name: '模型管理-列表',
    component: AnalysisModelList
  },
  {
    path: '/analysis/modle/add',
    name: '模型管理-新增',
    component: AnalysisModelAdd
  },
  {
    path: '/analysis/modle/edit',
    name: '模型管理-修改',
    component: NullComponent
  },
  {
    path: '/analysis/modle/delete',
    name: '模型管理-删除',
    component: NullComponent
  },
  {
    path: '/analysis/task/list',
    name: '我的分析-列表',
    component: AnalysisTaskList
  },
  {
    path: '/analysis/model/taskDetail',
    name: '我的分析-任务详情',
    component: AnalysisModelTask
  },

  {
    path: '/analysis/task/lookparam',
    name: '查看参数',
    component: AnalysisTaskLookparam
  },
  {
    path: '/analysis/task/looksql',
    name: '查看sql',
    component: AnalysisTaskLooksql
  },
  {
    path: '/analysis/task/controlsee',
    name: '参看权限',
    component: AnalysisTaskcontrolSee
  },
  
]

export default analysis
