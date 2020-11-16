import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import A from '@/components/A'
import system from '@/router/system'
import content from '@/router/content'
import analysis from '@/router/analysis'
import doc from '@/router/doc'
import bigdata from '@/router/bigdata'
import custom from '@/router/custom'


import publicRouter from '@/router/public'  //public 是关键词 改为publicRouter
import  data from '@/router/data'
import AnalysisAgaleList from '@/components/views/analysis/agile/agaleList.vue'

import hive from '@/router/hive';
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
      path: '/',
      name: '默认路由',
      component: AnalysisAgaleList
    },
    {
      path: '/a',
      name: 'a',
      component: A
    }
  ].concat(system, content, analysis, data, hive, publicRouter,doc,bigdata,custom)
})
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
