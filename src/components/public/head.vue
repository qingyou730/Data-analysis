<template>
    <el-row class="navbar-default">
        <el-col :span="4">
        </el-col>
        <el-col :span="24">
            <ul class="nav navbar-nav navbar-right navbar-icon-menu" style="float: right;">
                <li v-for="v in menu_list">
                    <a href="javascript:;" @click="setLeftMenu(v)">
                        <i>
                            <font-awesome-icon :icon="v.icon" /></i>
                        <span>{{v.name}}</span>
                    </a>
                </li>
            </ul>
        </el-col>
    </el-row>

</template>

<script>
    export default {
        data() {
            return {
                msg: '/content/category/add',
                menu_list: [

                ],
                activeIndex: '1',
            }
        },
        methods: {
            handleSelect(key, keyPath) {},
            update_menu_list() { //获取已有的菜单列表
                var url = this.$store.state.api_url.menu.list;
                var param = {};
                this.axios.post(url, param).then((response) => {
                    let data = response.data
                    if (data.code != 200) {
                        console.log("获取菜单失败")
                    }
                    this.menu_list = data.data;
                    console.log(this.menu_list)
                    this.initLeftMenu(this.menu_list[0]);
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
</style>
