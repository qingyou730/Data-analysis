<template>
    <div class="custom-table-home">
        <div class="wrapper">
            <div class="left">

                <div class="custom-header">
                    <span style="display:inline-block;font-size:16px;width:46%" v-if="!custom_left.searValKey">业务报表</span>
                    <div style="position:relative;width:60%" v-if="custom_left.searValKey">
                        <el-input
                            style="width: 100%"
                            placeholder="输入报表名称"
                            ref="left_search"
                            @input='searchNeedcustom($event)'
                            v-model="custom_left.searValue">
                        </el-input>
                        <i slot="suffix" class="el-icon-close close-icon" @click="clearSearVal"></i>
                    </div>
                    <div>
                        <i class="el-icon-search font-i-style" @click="opensearKey"></i>
                        <el-tooltip content="添加文件夹" placement="bottom" popper-class='green-ground'>
                            <i class="el-icon-folder-add font-i-style" @click="addFileFun"></i>
                        </el-tooltip>
                        <el-tooltip content="创建报表" placement="bottom" popper-class='green-ground'>
                            <i class="el-icon-document font-i-style" @click="createCustomItem"></i>
                        </el-tooltip>
                    </div>
                </div>
                <!--文件和报表展示区域 -->
                <div class="custom-docment-wra">
                    <p style="display:none;">{{collpaes_key}}{{collpaes_key_second}}{{collpaes_key_third}}</p>
                    <template v-for="(item, index) in  filter_custom_data">
                        <div class="custom-collapes-item" :key="index">
                            <!-- 一级文件名称区域 -->
                            <div class="doc-top">
                                <div style="width:90%">
                                    <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': item.flag}]" @click="openClolapesItem(index,item)"></i>
                                    <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                                    <div class="collapes-name">{{item.name}}</div>
                                </div>
                                <div>
                                    <el-dropdown placement="bottom"  @command="handleCommandFile($event, item)">
                                        <i class="el-icon-more opcity-none-i" style="transform: rotate(90deg);"></i>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                            <el-dropdown-item command="addcustom">添加报表</el-dropdown-item>
                                            <el-dropdown-item command="delfile">删除</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </div>
                            </div>
                            <div v-if="item.flag" :key="collpaes_key">
                                <!-- 二级级文件名称区域 -->
                                <template v-if="item.children.length>0">
                                    <div class="custom-collapes-item" v-for="(sedcondItem,sedcondIndex) in item.children" :key="sedcondIndex + 'sedcondIndex'">
                                        <div class="doc-top">
                                            <div style="margin-left:24px;width:90%">
                                                <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': sedcondItem.flag}]" @click="openSonClolapes(sedcondIndex,sedcondItem)"></i>
                                                <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                                                <div class="collapes-name">{{sedcondItem.name}}</div>   
                                            </div>
                                            <div>
                                                <el-dropdown placement="bottom"  @command="handleCommandFile($event, sedcondItem)">
                                                    <i class="el-icon-more opcity-none-i" style="transform: rotate(90deg);"></i>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                                        <el-dropdown-item command="addcustom">添加报表</el-dropdown-item>
                                                        <el-dropdown-item command="delfile">删除</el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </div>
                                        </div>


                                        <!-- 三级级级文件名称区域 -->
                                        <div v-if="sedcondItem.flag" :key="collpaes_key_second">
                                            <template v-if="sedcondItem.children.length>0">
                                                <div class="custom-collapes-item" v-for="(thirdItem,thirdIndex) in sedcondItem.children" :key="thirdIndex + 'thirdIndex'">
                                                    <div class="doc-top">
                                                        <div style="margin-left:48px;width:90%">
                                                            <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': thirdItem.flag}]" @click="openLastClolapes(thirdIndex,thirdItem)"></i>
                                                            <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                                                            <div class="collapes-name">{{thirdItem.name}}</div>   
                                                        </div>
                                                        <div>
                                                            <el-dropdown placement="bottom"  @command="handleCommandFile($event, thirdItem)">
                                                                <i class="el-icon-more opcity-none-i" style="transform: rotate(90deg);"></i>
                                                                <el-dropdown-menu slot="dropdown">
                                                                    <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                                                    <el-dropdown-item command="addcustom">添加报表</el-dropdown-item>
                                                                    <el-dropdown-item command="delfile">删除</el-dropdown-item>
                                                                </el-dropdown-menu>
                                                            </el-dropdown>
                                                        </div>
                                                    </div>
                                                    
                                                    <div v-if="thirdItem.flag" :key="collpaes_key_third">
                                                        <!-- 三级报表list区域 -->
                                                        <template v-for="(thirdlist,thirdlistIndex) in thirdItem.customList">
                                                            <div class="custom-list" style="margin-left:72px;" :key="thirdlistIndex+'thirdlistIndex'">
                                                                <div style="width:90%">
                                                                    <i class="el-icon-tickets"></i>
                                                                    <span style="display:inline-block;margin-left:12px">{{thirdlist.name}}</span>
                                                                </div>
                                                                <div>
                                                                    <el-dropdown placement="bottom"  @command="handleCustomList($event, thirdlist)">
                                                                        <i class="el-icon-more" style="transform: rotate(90deg);font-size:16px;cursor:pointer"></i>
                                                                        <el-dropdown-menu slot="dropdown">
                                                                            <el-dropdown-item command="remove">移动</el-dropdown-item>
                                                                            <el-dropdown-item command="del">删除</el-dropdown-item>
                                                                            <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                                                        </el-dropdown-menu>
                                                                    </el-dropdown>
                                                                </div>
                                                            </div>
                                                        </template>
                                                        <!-- 三级报表list区域end -->
                                                    </div>
                                                </div>
                                            </template>
                                            <!-- 三级级级文件名称区域 end -->
                                            
                                            <!-- 二级报表list区域 -->
                                            <template v-for="(sedcondlist,sedcondlistIndex) in sedcondItem.customList">
                                                <div class="custom-list" style="margin-left:48px;" :key="sedcondlistIndex +'sedcondlistIndex'">
                                                    <div style="width:90%">
                                                        <i class="el-icon-tickets"></i>
                                                        <span style="display:inline-block;margin-left:12px">{{sedcondlist.name}}</span>
                                                    </div>
                                                    <div>
                                                        <el-dropdown placement="bottom"  @command="handleCustomList($event, sedcondlist)">
                                                            <i class="el-icon-more" style="transform: rotate(90deg);font-size:16px;cursor:pointer"></i>
                                                            <el-dropdown-menu slot="dropdown">
                                                                <el-dropdown-item command="remove">移动</el-dropdown-item>
                                                                <el-dropdown-item command="del">删除</el-dropdown-item>
                                                                <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                                            </el-dropdown-menu>
                                                        </el-dropdown>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                        <!-- 二级报表list区域end -->
                                    </div>
                                </template>

                                <!-- 一级报表list区域 -->
                                <template v-for="(list,listIndex) in item.customList">
                                    <div class="custom-list" :key="listIndex+'listIndex'">
                                        <div style="width:90%">
                                            <i class="el-icon-tickets"></i>
                                            <span style="display:inline-block;margin-left:12px">{{list.name}}</span>
                                        </div>
                                        <div>
                                            <el-dropdown placement="bottom"  @command="handleCustomList($event, list)">
                                                <i class="el-icon-more" style="transform: rotate(90deg);font-size:16px;cursor:pointer"></i>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item command="remove">移动</el-dropdown-item>
                                                    <el-dropdown-item command="del">删除</el-dropdown-item>
                                                    <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </div>




            <div class="right" @click="deletedFile">123</div>
            <rewritefile-name v-model="refile_name" :id="select_file_id"></rewritefile-name>
            <add-file v-model="add_file" :custom_left="custom_left"></add-file>
            <remove-custom v-model="remove_custom" :custom_left="custom_left" :id="remove_custom_id" v-if="remove_custom"></remove-custom>
            <rename-custom v-model="rename_custom_key" :id="rename_custom_id" ></rename-custom>
            <create-customdia v-model="creat_custom" :custom_left="custom_left" v-if="creat_custom"></create-customdia>
        </div>
    </div>
</template>
<script>
import rewritefileName from '../components/rewritefileName'
import addFile from '../components/addFile'
import removeCustom from '../components/removeCustom'
import renameCustom from '../components/renameCustom'
import createCustomdia from '../components/createCustomdia'



export default {
    components:{
        rewritefileName,
        addFile,
        createCustomdia,
        renameCustom,
        removeCustom
    },
    data() {
        return{
            custom_left: {//左边数据集合
                searValue: '',
                searValKey: false,
                docment_data: [],
                custom_list: [],
            },
            filter_custom_data: [],
            collpaes_key: 1,
            collpaes_key_second:1,
            collpaes_key_third:1,

            select_file_id: '',//选中文件id
            refile_name: false,//文件重命名
            add_file: false,//添加文件夹
            creat_custom: false,//添加报表
            creat_custom_id: "",
            remove_custom: false,
            remove_custom_id: "",
            rename_custom_key: false,//报表重新命名
            rename_custom_id: '',//报表id
            collpase_all_key: {//所有文件夹的是否展开记录

            },

        }
    },
    methods: {
        clearSearVal() {//清楚搜索框内的消息
            this.custom_left.searValue = '';
            this.$refs.left_search.focus();
        },
        opensearKey() {//开启搜索功能
            this.custom_left.searValKey = !this.custom_left.searValKey;
            if(!this.$refs.left_search) {
                this.$nextTick(()=>{
                    this.$refs.left_search.$refs.input.focus();
                })
            }
        },
        handneedData(docList, customList) {
            docList.forEach((item, index)=>{
                item.flag = false;
                item.select_active = false;
                item.customList=[];
                customList.forEach((innerItem, innerIndex)=>{
                    if(item.id == innerItem.folder_id){
                        item.customList.push(innerItem);
                    }
                })
                if(item.children.length>0) {
                    this.handneedData(item.children, customList);
                }
            })
        },
        openClolapesItem(index, item) {//一级折叠操作
            this.$set(this.filter_custom_data[index], 'flag', !item.flag);
            this.collpase_all_key[item.id] = !this.collpase_all_key[item.id];
            this.collpaes_key++;
        },
        openSonClolapes(index, item) {//二级折叠操作
            this.$set(item, 'flag', !item.flag);
            this.collpase_all_key[item.id] = !this.collpase_all_key[item.id];
            this.collpaes_key_second++;
        },
        openLastClolapes(index, item) {//三级折叠操作
            this.$set(item, 'flag', !item.flag);
            this.collpase_all_key[item.id] = !this.collpase_all_key[item.id];
            this.collpaes_key_third++;
        },
        deletedFile(id) {//确定删除文件夹子
            this.$confirm('删除后不可恢复，请谨慎处理', '确认删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            }).then(() => {
                let url = this.$store.state.api_url.custom.del_file;
                let data = {
                    "id": id,
                    "object": "role"
                }
                let param = this.$generateParams(data);
                this.axios.post(url, param).then((res) => {
                    let data = res.data;
                    if (data.code == 200) {
                        this.$success("删除成功")
                        this.getDataCustom();
                    }else {
                        this.$error(res.data.msg)
                    }
                }).catch((errors) => {
                    console.log(errors);
                })
            }).catch(() => {

            });
        },
        deletedCustomList(id) {//确定删除Customlist
            this.$confirm('删除后不可恢复，请谨慎处理', '确认删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            }).then(() => {
                let url = this.$store.state.api_url.custom.del_custom_list;
                let data = {
                    "id": id,
                    "object": "role"
                }
                let param = this.$generateParams(data);
                this.axios.post(url, param).then((res) => {
                    let data = res.data;
                    if (data.code == 200) {
                        this.$success("删除成功")
                        this.getDataCustom();
                    }else {
                        this.$error(res.data.msg)
                    }
                }).catch((errors) => {
                    console.log(errors);
                })
            }).catch(() => {

            });
        },
        reWirteFile(id) {
            this.refile_name = true;
            this.select_file_id = id;
        },
        handleCommandFile(command, item) {//文件各种操作

            if(command == 'rename') {
                this.reWirteFile(item.id);
            }
            if(command == 'addcustom') {
                console.log('addcustom');
            }
            if(command == 'delfile') {
                this.deletedFile(item.id);
            }
        },
        handleCustomList(command,item) {//customlist 操作
            if(command == 'rename') {
                this.rename_custom_key = true;
                this.rename_custom_id = item.id;
            }
            if(command == 'remove') {
                this.remove_custom_id = item.id;
                this.remove_custom = true;
            }
            if(command == 'del') {
                this.deletedCustomList(item.id);
            }
        },
        addFileFun() {//添加文件事件
            this.add_file = true;
        },
        createCustomItem() {//创建custom报表
            this.creat_custom = true;
        },
        searchNeedcustom(val) {//搜索list
            this.filter_custom_data = JSON.parse(JSON.stringify(this.custom_left.docment_data));
            if(!val){
                this.handneedData(this.filter_custom_data, this.custom_left.custom_list);
                return;
            }
            let filterCustomlist = this.custom_left.custom_list.filter((item, index)=>{
                return item.name.indexOf(val) > -1
            })
            if(filterCustomlist.length==0) {
                this.filter_custom_data = [];
                return;
            }
            this.handneedData(this.filter_custom_data, filterCustomlist);
            let flatArr =  this.flatFile(this.filter_custom_data);//扁平话文件夹 并且将文件默认打开
            let havecusFile = this.getHaveCusFile(flatArr);//得到有customlist的文件夹
            let treeArr = this.getNeedFile(flatArr, havecusFile);
            let resultTree =  this.toTree(treeArr);
            console.log(resultTree, 'treeArr');
            this.filter_custom_data = resultTree;
        },
        getHaveCusFile(flatArr) {//得到有customlist的文件夹
            let result = [];
            result = flatArr.filter((item, index)=>{
                return item.customList.length>0
            })
            return result;
        },
        flatFile(tree, flatArr=[]) {//扁平话文件夹 并且将文件默认打开
            tree.forEach((item, index) => {
                if (item.children.length > 0) {
                    this.flatFile(item.children, flatArr)
                }
                item.flag = true;
                item.children = [];
                flatArr.push(item);
            });
            return flatArr;
        },
        toTree(data) {//将文件夹数组转化为树形结构
            let result = []
            if (!Array.isArray(data)) {
                return result
            }
            // data.forEach(item => {
            //     delete item.children;
            // });
            let map = {};
            data.forEach(item => {
                map[item.id] = item;
            });
            data.forEach(item => {
                let parent = map[item.fid];
                if (parent) {
                    (parent.children || (parent.children = [])).push(item);
                } else {
                    result.push(item);
                }
            });
            return result;
        },
        getNeedFile(flatArr, havecusFile) {//获取需要的文件夹
            let result = [];
            havecusFile.forEach((item, index)=>{
                result.push(item)
                if(item.fid && item.level == 3) {//三级文件夹时候的操作
                    flatArr.forEach((innerItem, innerIndex)=>{
                        if(innerItem.id == item.fid) {
                            result.push(innerItem);
                            flatArr.forEach((a, aindex)=>{
                                if(a.id == innerItem.fid) {
                                    result.push(a);
                                }
                            })
                        }
                    })
                }
                if(item.fid&&item.level==2) {
                    flatArr.forEach((innerItem, innerIndex)=>{
                        if(innerItem.id == item.fid) {
                            result.push(innerItem);
                        }
                    })
                }
            })
            return result;
        },
        setCollKey(tree, obj) {//扁平话文件夹 并且将文件默认打开
            tree.forEach((item, index) => {
                if (item.children.length > 0) {
                    this.setCollKey(item.children, obj)
                }
                obj[item.id] = false;
            });
        },
        getDataCustom() {
            let url = this.$store.state.api_url.custom.custom_list;
            let data = {
                "object": "role",
                "page": 1,
                "page_size": 100000
            }
            let param = this.$generateParams(data);
            this.axios.post(url, param).then((res) => {
                let data = res.data;
                if (data.code == 200) {
                    this.custom_left.custom_list = data.data.hits;
                    this.getData()
                }else {
                    this.$error(res.data.msg)
                }
            }).catch((errors) => {
                console.log(errors);
            })
        },
        getData() {
            let url = this.$store.state.api_url.custom.find_file_list;
            let data = {
                "object": "role"
            }
            let param = this.$generateParams(data);
            this.axios.post(url, param).then((res) => {
                let data = res.data;
                if (data.code == 200) {
                    this.custom_left.docment_data = data.data;
                    this.filter_custom_data = JSON.parse(JSON.stringify(this.custom_left.docment_data));
                    this.setCollKey(this.custom_left.docment_data, this.collpase_all_key);
                    console.log(this.collpase_all_key);
                    this.handneedData(this.filter_custom_data, this.custom_left.custom_list);
                }else {
                    this.$error(res.data.msg)
                }
            }).catch((errors) => {
                console.log(errors);
            })
        },
    },
    mounted() {
    
    },
    created() {
        // this.handneedData(this.custom_left.docment_data, this.custom_left.custom_list);
        this.getDataCustom();
    },
    watch: {
        refile_name:{
            handler() {
                if(!this.refile_name) {
                    this.getDataCustom()
                }
            }
        },
        add_file:{
            handler() {
                if(!this.add_file) {
                    this.getDataCustom()
                }
            }
        },
        remove_custom:{
            handler() {
                if(!this.remove_custom) {
                    this.getDataCustom()
                }
            }
        }
    }
}
</script>
<style>
.custom-table-home{
    height: calc(100vh - 145px);
}
.custom-table-home .wrapper{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
}
.custom-table-home .wrapper .left{
    width: 18%;
    height: 100%;
    border-radius: 4px;
    padding: 5px 14px;
    box-sizing: border-box;
    background: #E8E8E8;
}
.custom-table-home .wrapper .right{
    width: 78%;
    border-radius: 4px;
    padding: 5px 8px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    box-shadow: 1px 1px 6px #ccc;
    margin: 0 24px;
}
.custom-table-home .wrapper .left .custom-header{
    height: 64px;
    width: 100%;
    border-bottom: 1px solid #ccc;
    line-height: 66px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.custom-table-home .wrapper .left .font-i-style{
    font-size: 20px;
    margin: 0 3px;
    vertical-align: middle;
    cursor: pointer;
}
.custom-table-home .wrapper .left .close-icon{
    position: absolute;
    right: 6px;
    top: 26px;
    font-size: 17px;
    z-index: 1000;
    cursor: pointer;
}


/* 文件和报表区域 */
.custom-docment-wra{
    width: 100%;
    height: calc(100vh - 216px);
    max-height: calc(100vh - 216px);
    overflow-y: auto;
}
.custom-docment-wra .custom-collapes-item{
    width: 100%;
    line-height: 32px;
}
.custom-docment-wra .custom-collapes-item .open-rotate-90{
    transform: rotate(90deg);
}
.custom-docment-wra  .doc-top{
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    height: 32px;
    line-height: 32px;
}
.custom-docment-wra  .doc-top:hover{
    background-color: #ECEEFE;
}
.custom-docment-wra .active-collapes-bg{
    background-color: #ECEEFE;
}
.custom-docment-wra  .doc-top:hover .opcity-none-i{
    opacity: 1;
}
.custom-docment-wra  .doc-top i{
    font-size: 16px;
}
.custom-docment-wra  .doc-top .collapes-name{
    margin-left: 10px;
    display: inline-block;
    width: 60%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.custom-docment-wra  .doc-top .collapes-name:hover{
}
.custom-docment-wra .first-i-class{
    display: inline-block;
    cursor: pointer;
    display: inline-block;
    height: 32px;
    width: 16px;
    /* vertical-align: top; */
    cursor: pointer;
    line-height: -47px;
    line-height: 32px;
    vertical-align: top;
    z-index: 10000;
}
.custom-docment-wra .opcity-none-i{
    opacity: 0;
}
.custom-docment-wra  .custom-list{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 32px;
    line-height: 32px;
    margin-left: 24px;
}
.green-ground{
    background:#0E73FF!important;
}
</style>