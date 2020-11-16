<template>
    <div class="person-collapse">
        <el-row>
            <!-- <el-col  style="color:transparent;background:#363d45">
                .
            </el-col> -->
            <el-col>
                <el-collapse v-model="storage_activeNames" @change="handleChange">
                    <el-collapse-item  name="1" >
                        <template slot="title">
                            <i class="el-icon-folder-add" style="font-size:18px;margin-left:6px"></i><span style="margin-left:12px">个人</span>
                        </template>
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
                                <p @click="linkAddTabs(item)"><input type="text" @blur="changSavename($event,item)" :value="item.task_name.length>12?item.task_name.substr(0,10)+'...':item.task_name" :ref="item.id"></p>
                                <el-dropdown trigger="click" class="select-term" placement="bottom-start" @command="saveHandleCommand($event, item, index)">
                                    <span class="el-dropdown-link">
                                     <i class="el-icon-more"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" style="background:#363D45;border:none">
                                        <el-dropdown-item  command="delete" style="color: #c0c4cc;">删除</el-dropdown-item>
                                        <el-dropdown-item  command="reName" style="color: #c0c4cc;">重命名</el-dropdown-item>
                                        <el-dropdown-item  command="up" style="color: #c0c4cc;" v-if="!item.is_top">置顶</el-dropdown-item>
                                        <el-dropdown-item  command="reduction" style="color: #c0c4cc;" v-if="item.is_top">取消置顶</el-dropdown-item>
                                        <el-dropdown-item   style="color: #c0c4cc;" command="secret">
                                             <i class="fa fa-dot-circle-o" aria-hidden="true" style="cursor: pointer;" v-if="!item.is_private" > 仅自己可见</i>
                                             <i class="fa fa-dot-circle-o" aria-hidden="true" style="cursor: pointer;color:#fff;" v-if="item.is_private"> 取消仅自己可见</i>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <i class="fa fa-key" aria-hidden="true" v-if="item.is_private" style="float:right;margin-right: 8px;"></i>
                                <i class="fa fa-arrow-up" aria-hidden="true" v-if="item.is_top" style="float:right;margin-right: 8px;"></i> 
                            </div>
                            <div class="save-pagination">
                                <span class="pagination-left" title="上一页" @click="saveUpPage"><i class="el-icon-arrow-left"></i></span>
                                <span class="pagination-rigth" title="下一页" @click="saveNextPage"><i class="el-icon-arrow-right"></i></span>
                            </div>
                        </el-row>
                    </el-collapse-item>
                    <el-collapse-item  name="2">
                        <template slot="title">
                            <i class="el-icon-folder-add"  style="font-size:18px;margin-left:6px"></i><span style="margin-left:12px">部门</span>
                        </template>
                        <el-row class="person-list-render">
                            <el-input
                                placeholder="请输入关键词搜索"
                                prefix-icon="el-icon-search"
                                style="height:30px;background:#363d45;"
                                class="search-input-collapse"
                                @input="searKeyword('depart')"
                                v-model="derpartServal">
                            </el-input>
                            <div v-for="(item,index) in departDeparData" :key="item.id" class="save-render-div">
                                <p @click="linkAddTabs(item)"><input type="text" @blur="changDerpartname($event,item)" :value="item.task_name.length>12?item.task_name.substr(0,11)+'...':item.task_name" disabled></p>
                                <!-- <el-dropdown trigger="click" class="select-term" placement="bottom-start" @command="departHandleCommand($event, item, index)">
                                    <span class="el-dropdown-link">
                                     <i class="el-icon-more"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" style="background:#363D45;border:1px solid black">
                                        <el-dropdown-item  command="delete" style="color: #c0c4cc;">删除</el-dropdown-item>
                                        <el-dropdown-item  command="reName" style="color: #c0c4cc;">重命名</el-dropdown-item>
                                        <el-dropdown-item  command="up" style="color: #c0c4cc;" @click.native="departNextPage">置顶</el-dropdown-item>
                                        <el-dropdown-item   style="color: #c0c4cc;">
                                             <i class="fa fa-dot-circle-o" aria-hidden="true" style="cursor: pointer;" v-if="!lockValue"  @click="departlockLimit(item)"> 仅自己可见</i>
                                             <i class="fa fa-dot-circle-o" aria-hidden="true" style="cursor: pointer;color:#fff;" v-if="lockValue" @click="departlockLimit(item)"> 仅自己可见</i>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown> -->
                            </div>
                            <div class="save-pagination">
                                <span class="pagination-left" title="上一页" @click="departUpPage"><i class="el-icon-arrow-left"></i></span>
                                <span class="pagination-rigth" title="下一页" @click="departNextPage"><i class="el-icon-arrow-right"></i></span>
                            </div>
                        </el-row>
                    </el-collapse-item>
                </el-collapse>
            </el-col>
        </el-row>
    </div>
</template>
<script>
export default {
    props: ["addHiveTabs", "value","rerenderperData"],
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
        }
    },
    methods: {
        linkAddTabs(item) {//添加tabs标签查看记录
            this.addHiveTabs.sql = item;
            this.$emit('input', true);
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
            if(val.target.value == item.task_name) {
                return;
            }
            let requestUrl = this.$store.state.api_url.heightAnalysis.sql_rename;
            let data = {
                "sql_id": item.id,
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
        },
        //列表事件
        deletedList(id, index) {
            this.$confirm('此操作将永久删除该任务，不可恢复，是否继续？', '提示', {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(() => {
                let url = this.$store.state.api_url.heightAnalysis.delete_save_sql;
                var deleteParam = {
                    sql_id: id,
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
            if(command == 'secret') {
                this.lockLimit(item)
            }
        },
        //置顶事件
        sqlToup(item) {
            let requestUrl = this.$store.state.api_url.heightAnalysis.sql_uptop;
            let data = {
                // "is_private": !item.is_private,
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
                console.log(error);
            });
        },
        cancelUp(item) {
            let requestUrl = this.$store.state.api_url.heightAnalysis.cancel_sql_up;
            let data = {
                // "is_private": !item.is_private,
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
                console.log(error);
            });
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
            if(key=='person') {
                 this.getData(true, this.personServal);
            }else{
                this.getDertData(true, this.derpartServal);
            }
        },
        getData(key, keyword) {
            let requestUrl = "/mmp/sql/save_sql_list";
            let data = {
                page_size: this.savePersonpageSize,
                page: this.savePersoncurrentPage,
                object: "role",
                "filter_type": this.filter_type,
                "filter_value": this.filter_value,
                keyword: key ? keyword : '',
            };
            let requestData = this.$generateParams(data);
            this.axios
            .post(requestUrl, requestData)
            .then(rep => {
                if(rep.data.code ==  200){
                    this.savePersonData = rep.data.data.hits;
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
            let requestUrl = "/mmp/sql/save_sql_list";
            let data = {
                page_size: this.departDeparpageSize,
                page: this.departDeparcurrentPage,
                object: "role",
                "filter_type": "group",
                "filter_value": this.$store.state.user.group ,
                keyword: key ? keyword : '',
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
        console.log(this.rerenderperData, 'rerenderdata===');
        this.filter_type = 'user';
        this.filter_value =  this.$store.state.user.user_id ;
        this.getData();
    },
    watch: {
        rerenderperData:{
            handler() {
                this.getData();
                this.getDertData();
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