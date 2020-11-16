<template>
    <div class="custom-rewrite-file">
        <el-dialog
            title="添加报表到文件夹"
            :visible.sync="value"
            :close-on-click-modal="wrapper_no"
            width="30%">
            <div style="margin:auto">
                <el-input
                    placeholder="关键字搜索文件夹"
                    style="width:60%;margin:0 20%"
                    suffix-icon="el-icon-search"
                    @input='searchNeedfile($event)'
                    v-model="file_name">
                </el-input>
            </div>
            <div>
                <div style="width:80%;margin:32px 20% 32px">
                    <div class="custom-docment-wra custom-docment-wra-remove">
                        <p style="display:none;">{{collpaes_key}}{{collpaes_key_second}}{{collpaes_key_third}}</p>
                        <template v-for="(item, index) in  docment_list">
                            <div class="custom-collapes-item" :key="index">
                                <!-- 一级文件名称区域 -->
                                <div :class="['doc-top', {'active-collapes-bg': item.select_active}]">
                                    <div style="width:90%">
                                        <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': item.flag}]" @click="openClolapesItem(index,item)"></i>
                                        <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                                        <div @click="seleclFileFun(item)"  :class="['collapes-name',{'active-collapes-bg': item.select_active}]" style="cursor:pointer">{{item.name}}</div>
                                    </div>
                                </div>
                                <div v-if="item.flag" :key="collpaes_key">
                                    <!-- 二级级文件名称区域 -->
                                    <template v-if="item.children.length>0">
                                        <div class="custom-collapes-item" v-for="(sedcondItem,sedcondIndex) in item.children" :key="sedcondIndex + 'sedcondIndex'">
                                            <div :class="['doc-top', {'active-collapes-bg': sedcondItem.select_active}]">
                                                <div style="margin-left:24px;width:90%">
                                                    <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': sedcondItem.flag}]" @click="openSonClolapes(sedcondIndex,sedcondItem)"></i>
                                                    <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                                                    <div @click="seleclFileFun(sedcondItem)"  :class="['collapes-name',{'active-collapes-bg': sedcondItem.select_active}]" style="cursor:pointer">{{sedcondItem.name}}</div>   
                                                </div>
                                                <div>
                                                    
                                                </div>
                                            </div>


                                            <!-- 三级级级文件名称区域 -->
                                            <div v-if="sedcondItem.flag" :key="collpaes_key_second">
                                                <template v-if="sedcondItem.children.length>0">
                                                    <div class="custom-collapes-item" v-for="(thirdItem,thirdIndex) in sedcondItem.children" :key="thirdIndex + 'thirdIndex'">
                                                        <div :class="['doc-top', {'active-collapes-bg': thirdItem.select_active}]">
                                                            <div style="margin-left:48px;width:90%">
                                                                <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': thirdItem.flag}]" @click="openLastClolapes(thirdIndex,thirdItem)"></i>
                                                                <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                                                                <div @click="seleclFileFun(thirdItem)"  :class="['collapes-name',{'active-collapes-bg': thirdItem.select_active}]" style="cursor:pointer">{{thirdItem.name}}</div>   
                                                            </div>
                                                            <div>
                                                                
                                                            </div>
                                                        </div>
                                                        
                                                        <div v-if="thirdItem.flag" :key="collpaes_key_third">
                                                            
                                                        </div>
                                                    </div>
                                                </template>
                                                <!-- 三级级级文件名称区域 end -->
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="close">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    props: ["value","custom_left", "id"],
    data() {
        return{
            file_name: '',
            fid: '',
            collpaes_key: 1,
            collpaes_key_second:1,
            collpaes_key_third:1,
            level: 1,
            docment_list: [],
            newRenderArr: [],
            folder_id: '',
            wrapper_no: false
        }
    },
    methods:{
        close() {
            this.$emit("input", false);
            this.getData();
        },
        loop(docList) {
            docList.forEach((item, index)=>{
                item.select_active = false;
                if(item.children.length>0) {
                    this.loop(item.children);
                }
            })
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
        seleclFileFun(item){
            this.folder_id = item.id;
            this.file_name = item.name;
            this.loop(this.docment_list);
            item.select_active = true;
            this.collpaes_key_second++;
            this.level = item.level;
        },
        getFatherId(tree, id) {//获取children id 对应的father的id
            let obj = {}; 
            tree.forEach((item, index) => {
                if (item.children.length > 0) {
                    item.children.forEach((innerItem, innerIndex) => {
                        if (innerItem.children.length > 0) {
                            innerItem.children.forEach((thirdItem, thirdIndex) => {
                                console.log(thirdItem, thirdItem.id,thirdItem.id == id, id, "item, item.children,")
                                if (thirdItem.id == id) {
                                    obj.levelOne=item.id,
                                    obj.levelTow = innerItem.id
                                    console.log(obj);
                                }
                            })
                        }
                    })
                }
            })
            return obj;
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
        searchNeedfile(val) {//搜索文件夹操作
            this.docment_list = JSON.parse(JSON.stringify(this.custom_left.docment_data));
            if(!val){
                return;
            }
            let flatArr =  this.flatFile(this.docment_list);//扁平话文件夹 并且将文件默认打开
            let filterFile = flatArr.filter((item, index)=>{
                return item.name.indexOf(val) > -1
            })
            if(filterFile.length==0) {
                this.docment_list = [];
                return;
            }
            let treeArr = this.getNeedFile(flatArr, filterFile);
            treeArr = Array.from(new Set(treeArr))
            let resultTree =  this.toTree(treeArr);
            this.docment_list = resultTree;
        },
        submit() {
            if(!this.file_name) {
                this.$error("请选择文件夹");
                return;
            }
            let url = this.$store.state.api_url.custom.move_custom;
            let data = {
                "folder_id": this.folder_id,
                "id": this.id,
                "object": "role"
            }
            let param = this.$generateParams(data);
            this.axios.post(url, param).then((res) => {
                let data = res.data;
                if (data.code == 200) {
                    this.$success('移动成功');
                    this.folder_id = '';
                    this.close();
                }else {
                    this.$error(res.data.msg)
                }
            }).catch((errors) => {
                console.log(errors);
            })
            this.close();
        },
        openClolapesItem(index, item) {//一级折叠操作
            this.$set(item, 'flag', !item.flag);
            this.collpaes_key++;
        },
        openSonClolapes(index, item) {//二级折叠操作
            this.$set(item, 'flag', !item.flag);
            this.collpaes_key_second++;
        },
        openLastClolapes(index, item) {//三级折叠操作
            this.$set(item, 'flag', !item.flag);
            this.collpaes_key_third++;
        },
        getData() {
            this.docment_list = JSON.parse(JSON.stringify(this.custom_left.docment_data));
        }
    },
    created() {
        this.docment_list = JSON.parse(JSON.stringify(this.custom_left.docment_data));
        this.getData();
    },
}
</script>
<style>
.custom-rewrite-file .el-dialog .el-dialog__body{
    padding: 0px 6px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
}
.custom-rewrite-file .el-dialog .el-dialog__header {
    padding: 18px 6px 4px 18px;
    padding-bottom: 10px;
    font-size: 16px;
}
.custom-rewrite-file .custom-docment-wra-remove{
    min-height: 100px;
    max-height: 200px;
    overflow: auto;
}
</style>