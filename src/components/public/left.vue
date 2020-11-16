<template>
    <el-row class="tac w-left-menu">
        <el-col :span="24" class="left-menu-box">
            <el-menu :default-active="$store.state.menu.default_active" :default-openeds="$store.state.menu.default_openeds"
                class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" text-color="#fff"
                active-text-color="#ffd04b">

                <el-submenu v-for="v in $store.state.menu.left_menu" :index="v.menuId" :key="v.menuId">
                    <template slot="title">
                        <span>{{v.name}}</span>
                    </template>
                    <el-menu-item @click="setBread(v.name,r.name)" :key="r.menuId" v-if="r.isShow" v-for="r in v.children"
                        :index="r.menuId">
                        <router-link :to="'/' + r.module + '/' + r.controller + '/' + r.action">{{r.name}} <i>
                                <font-awesome-icon icon="chevron-right" /></i></router-link>
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </el-col>
    </el-row>

</template>

<script>
    export default {
        methods: {
            handleOpen(key, keyPath) {
                return;
                console.log(key, keyPath);
            },
            handleClose(key, keyPath) {
                return;
                console.log(key, keyPath);
            },
            setBread(second, third) {
                this.$store.state.bread.second = second;
                this.$store.state.bread.third = third;
            }
        },
        computed: {
            title() {
                return this.$store.state.bread.first + '_' + this.$store.state.bread.second + '_' + this.$store.state.bread
                    .third; //需要监听的数据
            }
        },
        watch: {
            title(newVal, oldVal) {
                document.title = newVal;
            }
        },
        data() {
            return {}
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    .w-left-menu .el-submenu {
        margin: 0 0 10px 0;
        background-color: #1ABC9C;
        border-radius: 5px;
    }

    .w-left-menu .el-submenu__title {
        margin-top: 2px;
        height: 40px;
        line-height: 40px
    }

    .w-left-menu .el-submenu .el-submenu__title:hover {
        background-color: #1ABC9C !important;
    }

    .w-left-menu .el-submenu .el-menu-item {
        background-color: #fff;
        color: #333 !important;
        height: 40px;
        line-height: 40px;
        border: 1px solid #ddd;
        padding: 0 20px !important;
        border-top: 0;
    }

    .w-left-menu .el-submenu .el-menu-item i {
        float: right;
    }

    .w-left-menu .el-submenu .el-menu-item a {
        color: #333;
    }

    .w-left-menu .left-menu-box {}

    .w-left-menu .el-menu {
        border: none;
        background-color: #f5f5f5;
    }
</style>
