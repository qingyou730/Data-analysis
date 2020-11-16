import NullComponent from '@/components/public/null.vue'
import DataGroupList from '@/components/views/data/group/list.vue'
import DataGroupAdd from '@/components/views/data/group/add.vue'
import DataGroupMember from '@/components/views/data/group/member.vue'
import DataBehaviorList from '@/components/views/data/behavior/list.vue'
import DataBehaviorAdd from '@/components/views/data/behavior/addBehavior.vue'
import DataCronList from '@/components/views/data/timing/list.vue'
import DataCreChart from '@/components/views/data/timing/chart.vue'
import TaskDetail from '@/components/views/analysis/model/task.vue'
import DataCronHistory from '@/components/views/data/timing/history.vue'

var data = [
	{
		path: '/data/group/list',
		name: '群组管理-列表',
		component: DataGroupList
	},
	{
		path: '/data/group/member',
		name: '群组管理-成员列表',
		component: DataGroupMember,
	},
	{
		path: '/data/group/add',
		name: '群组列表-新增',
		component: DataGroupAdd
	},
  {
  	path: '/data/group/delete',
  	name: '群组列表-删除',
  	component: NullComponent
  },
  {
  	path: '/data/group/convert',
  	name: '群组列表-群组转换',
  	component: NullComponent
  },
	{
		path: '/data/behavior/list',
		name: '行为集合-列表',
		component: DataBehaviorList
	},
	{
		path: "/data/behavior/addBehavior",
		name: '行为集合-新增',
		component: DataBehaviorAdd
	},
  {
  	path: "/data/behavior/delete",
  	name: '行为集合-删除',
  	component: NullComponent
  },
	{
		path: "/data/timing/list",
		name: '定时任务列表',
		component: DataCronList
	},
  {
  	path: "/data/timing/history",
  	name: '定时任务-运行记录',
  	component: DataCronHistory
  },
  {
  	path: "/data/timing/delete",
  	name: '定时任务-删除',
  	component: NullComponent
  },
  {
  	path: "/data/timing/enable",
  	name: '定时任务列表',
  	component: NullComponent
  },
	{
		path: "/data/timing/crechart",
		name: '创建图标',
		component: DataCreChart
	},
  {
  	path: "/data/timing/detail",
  	name: '定时任务-查看',
  	component: TaskDetail
  },

]

export default data
