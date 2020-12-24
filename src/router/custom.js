import NullComponent from '@/components/public/null.vue'
import CustomHome from '@/components/views/custom/base/index.vue'
// import ContentNewsAdd from '@/components/views/content/news/add'
// import ContentCategoryList from '@/components/views/content/category/list'
// import ContentCategoryAdd from '@/components/views/content/category/add'


var custom = [{
    path: '/custom/base/home',
    name: '自定义报表首页',
    component: CustomHome
  },
  {
    path: '/custom/report/add',
    name: '自定义报-新增报表',
    component: NullComponent
  },
  {
    path: '/custom/report/delete',
    name: '自定义报-删除报表',
    component: NullComponent
  },
  {
    path: '/custom/report/publish',
    name: '自定义报表-发布',
    component: NullComponent
  },
  {
    path: '/custom/folder/add',
    name: '自定义报表-新增文件夹',
    component: NullComponent
  },
  {
    path: '/custom/folder/delete',
    name: '自定义报表-删除文件夹',
    component: NullComponent
  },
  {
    path: '/custom/folder/share',
    name: '自定义报表-分享文件夹',
    component: NullComponent
  },
]

export default custom
