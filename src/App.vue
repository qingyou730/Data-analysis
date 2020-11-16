<template>
  <div id="app">
    <el-container v-if="module && module != 'public'" style="margin: 0;">
      <el-header style="height: auto;margin: 0;padding: 0;">
        <!-- <myheader></myheader> -->
        <new-header></new-header>
      </el-header>
      <el-container v-if="$route.path!='/hive/sqllab/submit'">
        <el-container class="w-main">
          <el-main style="">
            <div class="view-name-box" v-if="$store.state.view_name">
               <a class="back-button"  href="javascript:;" @click="$router.go(-1)"><i class="el-icon-back"></i></a>
               <span class="view-name-title">{{$store.state.view_name}}</span>
            </div>
            <div class="view-name-box" v-if="$route.path == '/doc/event/event_attr'"  @click="$router.push({path: '/doc/event/event_table', query: {page: $store.state.event_page}})">
               <a class="back-button"  href="javascript:;"><i class="el-icon-back"></i></a>
                <span class="view-name-title" style="cursor:pointer">返回</span>
            </div>
            <el-row style="width: 100%;" class="container-row">
              <!-- 							<el-col :span="24" class="container-title">
								<el-page-header :content="$store.state.page_name"  @back="goBack">
								</el-page-header>
							</el-col> -->
              <el-col :span="24" class="form-container">
                <router-view :key="$store.state.page_key + ($route.query.page ? $route.query.page : 1)" />
              </el-col>
            </el-row>
          </el-main>
        </el-container>
      </el-container>
      <div class="sql-container" v-if="$route.path=='/hive/sqllab/submit'">
        <div class="view-name-box" v-if="$store.state.view_name">
            <a class="back-button"  href="javascript:;" @click="$router.go(-1)"><i class="el-icon-back"></i></a>
            <span class="view-name-title">{{$store.state.view_name}}</span>
        </div>
          <!-- 							<el-col :span="24" class="container-title">
            <el-page-header :content="$store.state.page_name"  @back="goBack">
            </el-page-header>
          </el-col> -->
        <div  class="sql-wrapper-first">
          <router-view :key="$store.state.page_key + ($route.query.page ? $route.query.page : 1)" />
        </div>
      </div>
    </el-container>
    <div class="w-container"  v-if="module == 'public'" style="margin: 0;">
      <router-view />
    </div>
    <dialog-tips :display='$store.state.dialog_display' :tips='$store.state.dialog_tips' :jump_url='$store.state.jump_url'></dialog-tips>
  </div>
</template>

<script>
  import myheader from '@/components/public/head.vue'
  import left from '@/components/public/left.vue'
  import newHeader from '@/components/public/newHead.vue'
  import dialogTips from '@/components/base/dialog.vue'
  export default {
    name: 'App',
    components: {
      myheader: myheader,
      left: left,
      newHeader: newHeader,
      dialogTips: dialogTips
    },
    data(){
      return {
        'module':'' ,//当前是哪个模块
      }
    },
    methods: {
      /**
       * 页面点击返回按钮事件处理
       */
      goBack: function() {

      },
      setModule:function(path){
        var parse_path = path.split('/') ;
        this.module = parse_path[1] ;
        if(path=='/'){ //首页敏捷看板
          this.module = 'analysis' ;
        }
      }
    },
    mounted() {
      //判断当前是哪个模块
      this.setModule(this.$route.path) ;

    },
    watch: {
      $route: {
        handler(val, oldVal) {
          this.setModule(this.$route.path) ;
        },
        deep: true
      }
    },
  }
</script>

<style>
  #app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .w-left {
    width: 250px;
    margin: 0;
    pooverflow-y: auto;
    position: fixed;
    top: 81px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 0 5px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .sql-container {
    margin-top: 63px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    position: relative;
    min-height: 93vh;
    width: 100%;
    padding: 0 5px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background: #fff;
  }
  .sql-wrapper-first{
    width: 100%;
    min-height: 100%;
  }
  .w-main {
    padding-top: 20px;
    margin-top: 20px;
  }

  .container-row {
    background: #fff;
    border-radius: 5px;
    border: 1px solid #ddd;
  }

  .container-title {
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  .container-title .el-page-header {
    height: 40px;
    line-height: 40px;
    display: block;
  }

  .container-title .el-page-header__left {
    float: right;
    margin: 0;
  }

  .container-title .el-page-header__content {
    font-size: 14px;
  }

  .container-title .el-page-header__left:after {
    content: none;
  }
</style>
