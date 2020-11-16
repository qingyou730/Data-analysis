// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'

import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/element-var.scss' //引入这个文件里修改了elementui的样式
import '@/assets/common.css'
import 'font-awesome/css/font-awesome.css';
import axios from 'axios'
import VueAxios from 'vue-axios'
import axiosUtil from '@/util/axiosUtil.js'
import tools from '@/util/tools.js'
import md5 from 'js-md5';
Vue.prototype.$md5 = md5;
axios.defaults.headers.post['Content-Type'] = 'application/json';








Vue.use(VueAxios, axios);
Vue.use(ElementUI);

import echarts from "echarts";
Vue.prototype.$echarts = echarts;

Vue.prototype.$tools = tools;
Vue.config.productionTip = false

Vue.prototype.$generateParams = function(data){
  var admin = {
    "groups":this.$store.state.user.group,
    "username":this.$store.state.user.user_id,
    "email":this.$store.state.user.email,
  }
  var finalData = {
  	app: this.$store.state.APP.toUpperCase(),
  	role: admin,
  	sign: ''
  }
  finalData.data = data;
  return finalData;
}

Vue.prototype.$success = function(msg) {
  this.$message({
    showClose: true,
    message: msg,
    type: 'success'
  })
}
Vue.prototype.$error = function(msg) {
  this.$message({
    showClose: true,
    message: msg,
    type: 'error'
  })
}
Vue.prototype.$count = function(hideType,action,extra) {
  if(!hideType || !action){
    console.log("埋点的时候hideType action为空");
    return ;
  }
  var param = {
    hideType:hideType,
    action:action,
    extra:extra,
  }
  param = this.$generateParams(param) ;
  var url = this.$store.state.api_url.manage.visit_count;
  this.axios.post(url, param).then((response) => {

  }).catch((errors) => {

  });
}
Vue.prototype.$box = function(msg, jump_url) {
    this.$store.state.dialog_display = true;
    this.$store.state.dialog_tips = msg;
    this.$store.state.jump_url = jump_url;
}

Vue.prototype.$access = function(path) {
  if (this.$store.state.access_menu.hasOwnProperty(path)) {
    return true;
  } else {
    return false;
  }
}
//引入接口地址配置文件
import sjl  from '@/config/sjl.js'
import wr  from '@/config/wr.js'
import components_type from '@/config/componenttype.js'
let api_url = {};
Object.assign(api_url, sjl, wr);
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    view_name:'', //视图查看的时候视图名称
    page_key:0,
    page_name: '页面名称', //显示页面名称
    back: '', //返回按钮的链接地址
    id_count: Date.parse(new Date()), //
    //存放的键值对就是所要管理的状态
    linkageSingle: '',
    linkage: { //全局模型联动参数
      object: 'role', //分析对象
    },
    user_list:{},//所有用户列表
    api_url: api_url, //服务端的接口地址配置
    menu: { //头顶和左侧菜单按钮
      menu_list: [], // 全部菜单按钮
      left_menu: [], //左侧菜单按钮
      default_openeds: [], //默认展开的二级分组
      default_active: '', //默认激活菜单ID
    },
    bread: { //面包屑导航
      first: '',
      second: '',
      third: '',
    },
    module_linkage: { //模块内联动参数

    },
    APP: '',
    APP_NAME: '',
    user: {},
    access_menu:{ //可访问权限按钮

    },
    components_type: components_type, //组件类型
    dialog_display: false,
    dialog_tips: '没有访问该视图的权限，请获取权限后尝试',
    jump_url: '',
    event_page: '',
  },
  mutations: {
    changeDialog (state) {
      // 变更状态
      state.dialog_display = false;
    },
    dialogJump(state, jump_url) {
      state.jump_url = '';
    },
    changeEventPage(state, page) {
      state.event_page = page;
    }
  }
})
//请求接口响应的时候401的时候统一跳转登录界面
axios.interceptors.response.use(
  response => {
    //如果返回错误码是 401 跳转去登录页面
    if (response.data.code == 401) {
      router.push({
        path: '/public/user/login'
      });
      return response
    } else {
      return response
    }
  },
  error => {
    console.log(error);
    return Promise.reject(error)
  }
)
//请求的时候 header头里面增加参数
axios.interceptors.request.use(
  config => {
    var app = '';
    if (localStorage .getItem('APP')) {
      app = localStorage .getItem('APP');
    }
    config.headers.app = app
    return config
  },
  error => {
    return Promise.reject(error)
  })


router.beforeEach((to, from, next) => {
  if (!store.state.user.user_id) { //假如用户ID为空请求当前登录用户并且判断是否已登录
    if (to.path == '/public/user/login') {
      next();
      return;
    }
    var requestUrl = store.state.api_url.admin.login_user;
    axios.post(requestUrl).then((rep) => {
        var data = rep.data;
        if (data.code != 200) {
          console.log('初始化用户失败1!');
        } else {
          var user = data.data;
          store.state.user =  user ;
          if (!store.state.APP) {
            if (localStorage .getItem("APP")) {
              store.state.APP = localStorage .getItem("APP");
              store.state.APP_NAME = localStorage .getItem("APP_NAME");
              next();
              return;
            }
            //判断是否选择游戏
            if (to.path == '/public/user/selectGame') {
              next();
              return;
            } else {
              next({
                path: '/public/user/selectGame'
              })
            }
          } else {
            next();
          }
        }
      })
      .catch(function(error) {
        console.log(error);
        console.log('初始化登录用户失败2!');
      });
  } else { //判断是否选择游戏
    if (!store.state.APP) {
      if (localStorage .getItem("APP")) {
        store.state.APP = localStorage .getItem("APP");
        store.state.APP_NAME = localStorage .getItem("APP_NAME");
        next();
        return;
      }

      if (to.path == '/public/user/selectGame') {
        next();
        return;
      } else {
        next({
          path: '/public/user/selectGame'
        })
      }
    } else {
      next();
    }
  }
})
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  template: '<App/>'
})
