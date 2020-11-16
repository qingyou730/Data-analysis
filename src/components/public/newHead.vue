<template>
  <div style="background-color: #FFFFFF;position: absolute;width: 100%;">

    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">

      <li role="menuitem" tabindex="-1" class="el-menu-item" style="border-bottom-color: transparent;">
         <router-link to="/" class="first-menu-list w-logo">DeepEye</router-link>
      </li>
      <li role="menuitem" tabindex="-1" class="el-menu-item" style="border-bottom-color: transparent;">
        <router-link to="/public/user/selectGame" class="first-menu-list">{{$store.state.APP_NAME}}</router-link>
      </li>
      <template v-for="v in show_menu_list" v-if="v.isShow">
        <el-submenu v-if="v.children.length >= 1" :key="v.menuId" :index="v.menuId">
          <template slot="title">
            <span class="first-menu-list" v-if="!v.module">{{v.name}}</span>
            <span class="first-menu-list" v-if="v.module">
              <a  @click="refresh('/' + v.module + '/' + v.controller + '/' + v.action,v.name)">{{v.name}}</a>
            </span>
          </template>
          <el-submenu v-for="r in v.children" v-if="r.children.length >= 1 && r.isShow" :key="r.menuId" :index="r.menuId">
            <template slot="title">
              <span v-if="!r.module">{{r.name}}</span>
              <span v-if="r.module">
                <a @click="refresh('/' + r.module + '/' + r.controller + '/' + r.action,r.name)" >{{r.name}}</a>
              </span>
            </template>
            <el-menu-item :key="i.menuId" v-for="i in r.children" v-if="i.isShow" :index="i.menuId">
              <a @click="refresh('/' + i.module + '/' + i.controller + '/' + i.action,i.name)" >{{i.name}}</a>
            </el-menu-item>
          </el-submenu>
          <el-menu-item :key="r.menuId" v-if="r.children.length < 1 && r.isShow" v-for="r in v.children" :index="r.menuId">
            <a @click="refresh('/' + r.module + '/' + r.controller + '/' + r.action,r.name)" >{{r.name}}</a>
          </el-menu-item>
        </el-submenu>
        <el-menu-item v-if="v.children.length < 1 && v.isShow" :key="v.menuId" :index="v.menuId">
          <a @click="refresh('/' + v.module + '/' + v.controller + '/' + v.action,v.name)" class="first-menu-list" >{{v.name}}</a>
        </el-menu-item>
      </template>
    </el-menu>
    <div id="user-info" v-if="this.$store.state.user.hasOwnProperty('user_id')">
      <el-dropdown placement="bottom">
        <span style="display: inline-block;height: 30px; width: 30px; font-size:22px; color: #ccc;"><i class="el-icon-question" style="width: 100%; height:100%"></i></span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item style="height: 20px; line-height:20px"><a @click="countHelp"  href='https://docs.qq.com/doc/DSHN0eFVsdk9wZ1pW' target="view_window">帮助中心</a></el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown placement="bottom">
        <span class="avatar"><img src="/static/images/avatar.png" /></span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <a href="javascript:;" style="cursor: text;">{{this.$store.state.user.user_name}}</a>
          </el-dropdown-item>
          <el-dropdown-item>
            <router-link to="/public/user/changePassword">修改密码</router-link>
          </el-dropdown-item>
          <el-dropdown-item><a href="javascript:;" @click="loginOut">退出</a></el-dropdown-item>
          <el-dropdown-item>
            <router-link @click.native="$count('MODEL','RELEASE_NOTE',{})"  to="/about/version">关于</router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        selectGame: '航海王',
        gameList: [],
        msg: '/content/category/add',
        show_menu_list: [

        ],
        menu_list: [],
        activeIndex: '1',
      }
    },
    methods: {
      countHelp:function(){
        this.$count('MODEL','HELP_CETER',{});//打点统计
      },
      /**
       * 菜单再次点击的时候刷新
       */
      refresh:function(url,name){
        this.$count('MENU','VISIT',{"url":url,name:name});//打点统计
        if(url == this.$route.path && !this.$route.query.page){
          this.$store.state.page_key ++ ;
        }else{
          this.$router.push(url);
        }

      },
      /**
       * @param {Object} game
       * 切换游戏
       */
      changeGame: function(game) {
        this.$store.state.APP = game.app;
        this.$store.state.APP_NAME = game.name;
        localStorage .setItem("APP", game.app);
        localStorage .setItem("APP_NAME", game.name);
        this.$router.push({
          path: '/'
        });
      },
      /**
       * 退出
       */
      loginOut: function() {
        var url = this.$store.state.api_url.auth.logout;
        this.axios.post(url).then((response) => {
          let data = response.data
          if (data.code != 200) {
            this.$error(data.msg);
          } else {
            this.$store.state.user.user_id = '';
            localStorage .removeItem("APP");
            localStorage .removeItem("APP_NAME");
            this.$store.state.APP = '';
            this.$store.state.APP_NAME = '';
            this.$router.push({
              path: '/public/user/login'
            });
          }
        }).catch((error) => {
          this.$error("请求接口失败");
        });
      },
      handleSelect(key, keyPath) {},
      handleCommand(command) {
        var isCommand = ''
        this.selectGame = command.label
      },
      update_menu_list() { //获取已有的菜单列表
        var url = this.$store.state.api_url.menu.list;
        var param = {};
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code != 200) {
            this.$error(data.msg);
          } else {
            this.menu_list = data.data;
            var  access_map={};
            //删除不展示的菜单
            var show_menu_list = JSON.parse(JSON.stringify(data.data));
            for (let first_index = show_menu_list.length - 1; first_index >= 0; first_index--) {
              var first = show_menu_list[first_index];
              if(first.module){
                access_map['/'+first.module+'/'+first.controller+'/'+first.action] = first.name
              }
              for (let second_index = first.children.length - 1; second_index >= 0; second_index--) {
                var second = first.children[second_index];
                if(second.module){
                  access_map['/'+second.module+'/'+second.controller+'/'+second.action] = second.name
                }
                for (let third_index = second.children.length - 1; third_index >= 0; third_index--) {
                  var third = second.children[third_index];
                  if(third.module){
                    access_map['/'+third.module+'/'+third.controller+'/'+third.action] = third.name
                  }
                  if (third.isShow == 0) {
                    second.children.splice(third_index, 1);
                  }
                }
                if (second.isShow == 0) {
                  first.children.splice(second_index, 1);
                }
              }
              if (!first.isShow) {
                show_menu_list.splice(first_index, 1);
              }
            }
            this.$set(this.$store.state,'access_menu',access_map);
            this.show_menu_list = show_menu_list;
          }
        }).catch((error) => {
          console.log(error);
          this.$error("请求接口失败");
        });
      },
      setLeftMenu(node) { //顶部菜单点击之后
        this.$store.state.bread.first = node.name;
        var left_menu = node.children;
        //寻找该模块下的第一个三级菜单跳转到那个菜单去。
        this.$store.state.menu.left_menu = left_menu;
        for (var i in left_menu) {
          var v = left_menu[i];
          if (v.children.length > 0) {
            var current_route = v.children[0];
            var open_id = v.menuId;
            var default_active = current_route.menuId;
            var url = '/' + current_route.module + '/' + current_route.controller + '/' + current_route.action;
            this.$store.state.default_active = default_active;
            this.$store.state.menu.default_openeds = [open_id];

            this.$store.state.bread.second = v.name;
            this.$store.state.bread.third = v.children[0].name;
            if (url != this.$route.path) {
              this.$router.push({
                path: url
              });
            }
            break;
          }
        }
      },
      //页面初始化的时候
      initLeftMenu(first_node) { //顶部菜单点击之后
        var leaf = {};
        var group = {};
        var node = {};
        var module = {};
        var left_menu = [];
        if (this.$route.path == '/') {
          node = first_node;
        } else {
          var find = false;
          for (var first of this.menu_list) {
            if (find) {
              break;
            };
            for (var second of first.children) {
              if (find) {
                break;
              };
              for (var v of second.children) {
                if (('/' + v.module + '/' + v.controller + '/' + v.action) == this.$route.path) {
                  find = true;
                  left_menu = first.children;
                  group = second;
                  module = first;
                  leaf = v;
                };
              }
            }
          }
          if (!find) {
            node = first_node;
          }
        }

        if (find) {
          this.$store.state.bread.first = module.name
          this.$store.state.menu.left_menu = left_menu;
          var current_route = leaf;
          var open_id = group.menuId;
          var default_active = group.menuId;
          var url = '/' + leaf.module + '/' + leaf.controller + '/' + leaf.action;
          this.$store.state.default_active = default_active;
          this.$store.state.menu.default_openeds = [open_id];
          this.$store.state.bread.second = group.name;
          this.$store.state.bread.third = leaf.name;
          return;
        } else {
          this.$store.state.bread.first = node.name
          var left_menu = node.children;
          //寻找该模块下的第一个三级菜单跳转到那个菜单去。
          this.$store.state.menu.left_menu = left_menu;
          for (var i in left_menu) {
            var v = left_menu[i];
            if (v.children.length > 0) {
              var current_route = v.children[0];
              var open_id = v.menuId;
              var default_active = current_route.menuId;
              var url = '/' + current_route.module + '/' + current_route.controller + '/' + current_route
                .action;
              this.$store.state.default_active = default_active;
              this.$store.state.menu.default_openeds = [open_id];

              this.$store.state.bread.second = v.name;
              this.$store.state.bread.third = v.children[0].name;
              if (url != this.$route.path) {
                this.$router.push({
                  path: url
                });
              }
              break;
            }
          }
        }

      }
    },
    mounted() {
      this.update_menu_list();
     var url = this.$store.state.api_url.game.list;
     this.axios.post(url).then((response) => {
       let data = response.data
       if (data.code == 200) {
         this.gameList = data.data;
       } else {
         this.$error(data.msg);
       }
     }).catch((error) => {
       this.$error("接口请求失败");
     });
      //获取所有用户列表 用于显示用户真实姓名
      var url = this.$store.state.api_url.admin.all_user;
      this.axios.post(url).then((response) => {
        let data = response.data
        if (data.code == 200) {
          var temp = {}
          var temp = this.$tools.list2f1f2(data.data.hits,'user_id','user_name') ;
          this.$store.state.user_list = temp ;
        } else {
          this.$error(data.msg);
        }
      }).catch((error) => {
        this.$error("接口请求失败");
      });

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .navbar-nav {
    text-align: right;
  }

  .navbar-nav li {
    float: left;
  }

  .nav>li {
    position: relative;
    display: block;
    text-align: center;
  }

  .navbar-nav>li>a {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .nav>li>a {
    position: relative;
    display: block;
    padding: 10px 15px;
  }

  .navbar-icon-menu i {
    font-size: 25px;
    display: block;
  }

  .navbar-icon-menu span {
    font-size: 11px;
  }

  li {
    list-style: none;
  }

  .navbar-default {
    background-color: #2C3E50;
    color: white;
    border-bottom: 2px solid #2C3E50;
  }

  .navbar-default .navbar-brand {
    color: white;
    padding-left: 20px;
  }

  .navbar-default .navbar-brand:hover,
  .navbar-default .navbar-brand:focus {
    color: white;
  }

  .navbar-default .navbar-text {
    color: #fff
  }

  .navbar-default .navbar-nav>li>a {
    color: #fff
  }

  .navbar-default .navbar-nav>li>a:hover,
  .navbar-default .navbar-nav>li>a:focus {
    color: #e8e4e3;
  }

  .nav a:link {
    color: white;
  }

  #user-info {
    position: absolute;
    right: 20px;
    top: 10px;
  }


</style>
