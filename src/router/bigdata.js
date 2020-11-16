import BigDataHdfsList from '@/components/views/bigdata/hdfs/hdfsList.vue'
import BigDataTaskList from '@/components/views/bigdata/task/task_list.vue'
export default [{
    path: '/bigdata/hdfs/list',
    name: 'HDFS管理',
    component: BigDataHdfsList
  },
  {
    path: '/bigdata/task/task_list',
    name: '任务管理',
    component: BigDataTaskList
  }
]
