import NullComponent from '@/components/public/null.vue'
import hiveList from '@/components/views/hive/mlist/list'
import hiveAdd from '@/components/views/hive/mlist/add'
import hivePick from '@/components/views/hive/mlist/pick'
import sqllabSubmit from "@/components/views/hive/sqllab/submit.vue"
import sqllabQueryList from "@/components/views/hive/sqllab/queryList.vue"
import sqllabstorageList from "@/components/views/hive/sqllab/storageList.vue"
import sqllabaddSavelist from "@/components/views/hive/sqllab/addSavelist.vue"
import sqllabdownLoad from "@/components/views/hive/sqllab/downLoad.vue"
import sqllabLogdownLoad from "@/components/views/hive/log/download.vue"
import HiveLogFilterList from "@/components/views/hive/log/filter_list.vue"
import HiveLogFilterAdd from "@/components/views/hive/log/filter_add.vue"


// import hiveMenuEdit from '@/components/views/hive/menu/edit'
var hive = [{
    path: '/hive/mlist/list',
    name: 'Hive列表',
    component: hiveList
  },
  {
    path: '/hive/mlist/add',
    name: 'Hive新增',
    component: hiveAdd
  },
  {
    path: '/hive/mlist/pick',
    name: 'Hive查看页面',
    component: hivePick
  },
  {
    path: '/hive/mlist/delete',
    name: 'Hive临时表-删除',
    component: hiveList
  },
  {
    path: '/hive/sqllab/submit',
    name: 'SQl编辑器',
    component: sqllabSubmit
  },
  {
    path: '/hive/sqllab/querylist',
    name: 'SQl查询列表',
    component: sqllabQueryList
  },
  {
    path: '/hive/sqllab/storageList',
    name: 'SQl保存列表',
    component: sqllabstorageList
  },
  {
    path: '/hive/sqllab/sqllabaddsavelist',
    name: 'SQl添加保存',
    component: sqllabaddSavelist
  },
  {
    path: '/hive/sqllab/sqllabdownLoad',
    name: 'SQl添加保存',
    component: sqllabdownLoad
  },
  {
    path: '/hive/sqllab/sqllabLogdownLoad',
    name: 'SQl添加保存',
    component: sqllabLogdownLoad
  },
  {
    path: '/hive/log/filter_list',
    name: '游戏日志过滤-任务列表',
    component: HiveLogFilterList
  },
  {
    path: '/hive/log/filter_add',
    name: '游戏日志过滤-添加任务',
    component: HiveLogFilterAdd
  },
]
export default hive
