<template>
    <div>
        <el-row class="person-collapse">
            <!-- <el-col  style="color:transparent;background:#363d45">
                .
            </el-col> -->
            <el-col>
                <el-collapse v-model="storage_activeNames" @change="handleChange">
                        <el-row class="person-list-render">
                            <el-input
                                placeholder="请输入关键词搜索"
                                prefix-icon="el-icon-search"
                                style="height:30px;background:#363d45;"
                                class="search-input-collapse"
                                @input="searKeyword('person')"
                                v-model="personServal">
                            </el-input>
                            <div v-for="(item,index) in savePersonData" :key="item.id" class="save-render-div">
                                <!--<el-tooltip class="item" effect="dark" :content="item.id" placement="bottom-start">
                                    <p>
                                        <input type="text" @blur="changSavename($event,item)" :value="item.desc" :ref="item.id">
                                    </p>
                                </el-tooltip>-->
                                <el-tooltip placement="bottom-start" class="item" effect="dark">
                                    <div slot="content">
                                        <input type="text" :value="item.id" style="background:#000;color:white;border:none" :ref="item.id+'copy'">
                                        <span @click="copyItemId(item.id)" style="cursor:pointer">复制</span>
                                    </div>
                                    <p>
                                        <input type="text" @blur="changSavename($event,item)"  :value="item.desc.length>12?item.desc.substr(0,10)+'...':item.desc" :ref="item.id">
                                    </p>
                                </el-tooltip>
                                <el-dropdown trigger="click" class="select-term" placement="bottom-start" @command="saveHandleCommand($event, item, index)">
                                    <span class="el-dropdown-link">
                                     <i class="el-icon-more"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" style="background:#363D45;border:1px solid black">
                                        <el-dropdown-item  command="delete" style="color: #c0c4cc;">删除</el-dropdown-item>
                                        <el-dropdown-item  command="reName" style="color: #c0c4cc;">重命名</el-dropdown-item>
                                        <el-dropdown-item  command="up" style="color: #c0c4cc;" v-if="!item.is_top">置顶</el-dropdown-item>
                                        <el-dropdown-item  command="reduction" style="color: #c0c4cc;" v-if="item.is_top">取消置顶</el-dropdown-item>
                                        <el-dropdown-item  command="delay" style="color: #c0c4cc;" v-if="item.expired_warn" >延时设置</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <i class="fa fa-arrow-up" aria-hidden="true" v-if="item.is_top" style="float:right;margin-right: 8px;"></i> 
                                <el-tooltip class="item" effect="dark" placement="bottom-start" :content="item.remainTip">
                                    <i class="el-icon-warning-outline" aria-hidden="true" v-if="item.expired_warn" 
                                    style="float:right;margin-right: 16px;color:red;cursor: pointer;"></i> 
                                </el-tooltip>
                            </div>
                            <div class="save-pagination" style="padding-bottom: 20px;">
                                <span class="pagination-left" title="上一页" @click="saveUpPage"><i class="el-icon-arrow-left"></i></span>
                                <span class="pagination-rigth" title="下一页" @click="saveNextPage"><i class="el-icon-arrow-right"></i></span>
                            </div>
                        </el-row>
                </el-collapse>
            </el-col>
        </el-row>
        <el-dialog
            title="确认信息"
            :visible.sync="delay_dialog"
            width="20%"
            >
            <el-input v-model="delayDays" placeholder="请输入要延期的天数"></el-input>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delay_dialog = false">放弃修改</el-button>
                <el-button type="primary" @click="submitDelay()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    props: ["addHiveTabs", "value","rerenderhiveData"],
    data() {
        return{
            storage_activeNames:[],
            savePersoncurrentPage: 1,
            savePersonTotalPage: null,
            savePersonpageSize: 10,
            savePersonData: [],
            personServal: '',
            lockValue: false,
            //部门数据
            departDeparData: [],
            departDeparcurrentPage: 1,
            departDeparTotalPage: null,
            departDeparpageSize: 10,
            departtotal: null,
            derpartServal: '',
            total: 0,
            "filter_type": "user",
            "filter_value": "",
            "search_type":"self",
            today: '今天',
            delayDays: null,
            delay_dialog: false,
            delay_id: null,
            delay_data: null,
        }
    },
    methods: {
        linkAddTabs(item) {//添加tabs标签查看记录
            this.addHiveTabs.sql = item;
            this.$emit('input', true);
        },
        copyItemId(id) {
            var attr = `${id}copy`;
            var Url2 = this.$refs[attr][0]
            // console.log(this.$refs[id][0], attr, '====');
            // console.log(this.$refs, '====');
            Url2.select(); // 选择对象
            try {
                if (document.execCommand('copy', false, null)) {
                    document.execCommand("Copy");
                    this.$success("复制成功");
            } else {
                this.$error("复制失败，请手动复制");
            }
            } catch (err) {
                this.$error("复制失败，请手动复制");
            }
        },
        delayDate(item) {
            this.delay_dialog = true;
            this.delay_id = item.id;
            this.delay_data = item;
        },
        submitDelay() {
            if(!Number(this.delayDays)) {
                this.$error("请输入大于0整数");
                return;
            }
            if(this.delayDays < 1) {
                this.$error("请输入大于0整数");
                return;
            }
            let requestUrl = "/manager/hive/extend_expired";
            //判断过期天数是否小于0
            let extend_day = null;
            if(this.delay_data.remain_days<0) {
                extend_day = Math.abs(this.delay_data.remain_days) + Number(this.delayDays);
            }
            let data = {
                "extend_day": extend_day ? extend_day : this.delayDays,
                "id": this.delay_id
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                if(rep.data.code ==  200){
                    this.getData();
                    this.$success('操作成功');
                    this.delayDays = null;
                    this.delay_id = "";
                    this.delay_dialog = false;
                    // total_hits
                }else{
                    this.$error(rep.data.msg);
                }
            })
            .catch((error)=> {
                this.loading = false;
                console.log(error);
            });
        },
        handleChange(param){
            if(param[0]=="1" || param[1]=="1") {
                this.getData();
            }
            if(param[0]=="2" || param[1]=="2") {
                this.getDertData();
            }
        },
        //changName event
        changSavename(val,item) {
            if(val.target.value == item.desc) {
                return;
            }
            let requestUrl = "/manager/hive/rename";
            let data = {
                id: item.id,
                "new_name": val.target.value
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                if(rep.data.code ==  200){
                    this.$success('操作成功');
                    this.getData();
                    this.getDertData();
                    // total_hits
                }else{
                    this.$error(rep.data.msg);
                }
            })
            .catch((error)=> {
                this.loading = false;
                console.log(error);
            });
        },
        changDerpartname(val,item, index) {
            if(val == "delete") {
                this.deletedList(item.id, index)
            }
            if(command == 'up') {
                this.sqlToup(item);
            }
            if(command == "reduction") {
                this.cancelUp(item)
            }
        },
        //置顶事件
        sqlToup(item) {
            let requestUrl = "/manager/hive/set_top";
            let data = {
                // "is_private": !item.is_private,
                "id": item.id
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                if(rep.data.code ==  200){
                    this.$success("操作成功");
                    this.getData();
                    // total_hits
                }else{
                    this.$error(rep.data.msg);
                }
            })
            .catch((error)=> {
                console.log(error);
            });
        },
        cancelUp(item) {
            let requestUrl ="/manager/hive/unset_top";
            let data = {
                // "is_private": !item.is_private,
                "id": item.id
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                if(rep.data.code ==  200){
                    this.$success("操作成功");
                    this.getData();
                }else{
                    this.$error(rep.data.msg);
                }
            })
            .catch((error)=> {
                console.log(error);
            });
        },
        //列表事件
        deletedList(id, index) {
            this.$confirm('此操作将永久删除该任务，不可恢复，是否继续？', '提示', {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(() => {
                let url = "/manager/hive/delete";
                var deleteParam = {
                    id: id,
                }
                deleteParam = this.$generateParams(deleteParam);
                this.axios.post(url, deleteParam).then((res) => {
                    var data = res.data;
                    if (data.code == 200) {
                        this.$success("删除成功");
                        this.savePersonData.splice(index, 1);
                    } else {
                        this.$error(res.data.msg);
                    }
                }).catch((err) => {
                    console.log(err, 'err');
                    this.$error(err)
                });
            }).catch(() => {
                console.log("删除取消");
            });
        },
        reNameFun(id) {
            this.$refs[id][0].focus();
            this.$refs[id][0].select();
        },
        
        //save list 翻页
        saveUpPage() {
            this.savePersoncurrentPage--;
            if(this.savePersoncurrentPage < 1) {
                this.savePersoncurrentPage = 1;
                this.$error('当前页是第一页')
                return;
            }
            this.getData();
        },
        saveNextPage(){
            this.savePersoncurrentPage++;
            if(this.savePersoncurrentPage > this.savePersonTotalPage) {
                this.savePersoncurrentPage = this.savePersonTotalPage;
                this.$error('已经是最后一页了');
                return;
            }
            this.getData();
        },
        //depart 翻页
        departUpPage() {
            this.departDeparcurrentPage--;
            if(this.departDeparcurrentPage < 1) {
                this.departDeparcurrentPage = 1;
                this.$error('当前页是第一页')
                return;
            }
            this.getDertData();
        },
        departNextPage(){
            this.departDeparcurrentPage++;
            if(this.departDeparcurrentPage > this.departDeparTotalPage) {
                this.departDeparcurrentPage = this.departDeparTotalPage;
                this.$error('已经是最后一页了');
                return;
            }
            this.getDertData();
        },
        //save 下拉事件
        saveHandleCommand(command,item, index) {
            if(command == "delete") {
                this.deletedList(item.id, index)
            }
            if(command == "reName") {
                this.reNameFun(item.id)
            }
            if(command == 'up') {
                this.sqlToup(item);
            }
            if(command == "reduction") {
                this.cancelUp(item)
            }
            if(command == "delay") {
                this.delayDate(item);
            }
        },
        lockLimit(item) {
            // this.lockValue = !this.lockValue;
            let requestUrl = this.$store.state.api_url.heightAnalysis.sql_private;
            let data = {
                "is_private": !item.is_private,
                "sql_id": item.id
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                if(rep.data.code ==  200){
                    this.$success("操作成功");
                    this.getData();
                    // total_hits
                }else{
                    this.$error(rep.data.msg);
                }
            })
            .catch((error)=> {
                this.loading = false;
                console.log(error);
            });
        },
        //depart下拉事件
        departHandleCommand(command,item) {
        },
        departlockLimit(item) {
            this.lockValue = !this.lockValue;
        },
        //keyword 搜索
        searKeyword(key) {
            this.getData(true, this.personServal);
        },
        getData(key, keyword) {
            let requestUrl = "/manager/hive/find";
            let data = {
                page_size: this.savePersonpageSize,
                page: this.savePersoncurrentPage,
                "keyword": key ? keyword : '',
                "materialize": false,
                filter_type: "user",
                filter_value: "all"
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                if(rep.data.code ==  200){
                    this.savePersonData = rep.data.data.hits;
                    this.savePersonData.forEach((item)=>{
                        if(item.remain_days<=0) {
                            // item.remain_days = 0;
                            item.remainTip = '该任务还有0天到期，到期后将自动删除，请及时处理';
                        }else{
                            item.remainTip = '该任务还有' + item.remain_days + '天到期，到期后将自动删除，请及时处理';
                        }
                    })
                    this.total = rep.data.data.total_hits;
                    this.savePersonTotalPage = rep.data.data.total_page;
                    // total_hits
                }else{
                    this.$error(rep.data.msg);
                }
            })
            .catch((error)=> {
                this.loading = false;
                console.log(error);
            });
        },

        getDertData(key, keyword) {
            this.loading = true;
            let requestUrl = "/manager/hive/find";
            let data = {
                "page": 1,
                "page_size": 10,
                keyword: key ? keyword : '',
                filter_type: "user",
                filter_value: "all"
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                if(rep.data.code ==  200){
                    this.departDeparData = rep.data.data.hits;
                    this.departtotal = rep.data.data.total_hits;
                    this.departDeparTotalPage = rep.data.data.total_page;
                    // total_hits
                }else{
                    this.$error(rep.data.msg);
                }
            })
            .catch((error)=> {
                this.loading = false;
                console.log(error);
            });
        }
    },
    mounted() {
        this.filter_type = 'user';
        this.filter_value =  this.$store.state.user.user_id ;
        this.getData();

    },
    watch: {
        rerenderhiveData:{
            handler() {
                console.log(111111);
                this.getData();
            }
        }
    }
}
</script>
<style>
.person-collapse .el-collapse{
  border-bottom: none!important;
  border-top: none!important;
}
.el-collapse-item .person-collapse .el-collapse .el-collapse-item .el-collapse-item__wrap{
  background-color: #272E36!important;
  color:#A3ACBB!important;
  border-bottom: none;
}
.el-collapse-item .person-collapse .el-collapse .el-collapse-item .el-collapse-item__wrap:hover{
  color:#fff;
}
.person-collapse .el-collapse .el-collapse-item .el-collapse-item__content{
  margin-left: 28px;
  color:#A3ACBB!important;
  font-size: 13px;
  line-height: 1.7692307692;
}
.person-collapse .el-collapse .el-collapse-item .el-collapse-item__content:hover{
  color:#fff;
}
.el-collapse-item__content .person-collapse .el-input__inner{
    height: 30px;
    background: #363d45;
    border: none;
    -webkit-appearance: none;
    background-image: none;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #fff;
    display: inline-block;
    font-size: inherit;
    line-height: 30px;
    outline: none;
    padding-left: 35px;
    -webkit-transition: border-color .2s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: border-color .2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 80%;
}
.person-collapse .el-input__prefix {
    position: absolute;
    height: 100%;
    left: 5px;
    top: -5px;
    text-align: center;
    color: #c0c4cc;
    -webkit-transition: all .3s;
    transition: all .3s;
}
/*渲染save   list*/
.person-list-render .save-render-div{
    line-height: 16px;
    width: 95%;
    height: 16px;
    line-height: 16px;
    padding: 6px 0px 6px 6px;
    font-size: 14px;
    margin-top: 6px;
    position: relative;
}
.person-list-render .save-render-div:hover{

}
.person-list-render .save-render-div p{
    width: 63%;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
}
.person-list-render .save-render-div p:hover{
    color: #fff;
    cursor: pointer;
    white-space: normal;
}
.el-collapse-item__content .person-list-render .save-render-div p input{
    width: 100%;
    height: 100%;
    background-color: #272E36;
    color: #c0c4cc;
    border: 1px solid transparent;
    outline: none;
}
.person-list-render .save-render-div p input:hover{
    color: #fff;
    cursor: pointer;
}
.person-list-render .save-render-div .select-term{
    float: right;
    position: relative;
    display: inline-block;
    font-size: 24px;
}
.person-list-render .save-render-div .select-term .el-dropdown-link{
    font-size: 20px;
    color: #c0c4cc;
    cursor: pointer;
}
/**
save 分页
**/
.person-list-render .save-pagination{
    text-align: right;
    font-size: 16px;
    margin-top: 10px;
    margin-right: 1%;
}
.person-list-render .save-pagination span{
    margin: 0 6px;
}
.person-list-render .save-pagination span:hover{
    color: #fff;
    cursor: pointer;
}
</style>