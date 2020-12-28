<template>
    <div class="show-need-col">
        <el-row>
            <!-- <span style="display: inline-block;font-size: 22px;color: #0E73FF;cursor:pointer" @click="showCodition">+</span> -->
            <i class="fa fa-filter" aria-hidden="true" style="display: inline-block;cursor:pointer;margin: 0px 4px 0px 15px;color:#0e73ff;" @click="showCodition"></i>
            <span style="display: inline-block;height: 32px;margin-left: 4px;line-height: 32px;">筛选条件</span>
            <i class="el-icon-arrow-right" style="cursor:pointer;margin-left: 10px;" @click="changeCollpoes" v-if="collpoes_key"></i>
            <i class="el-icon-arrow-down" style="cursor:pointer;margin-left: 10px;" @click="changeCollpoesSedcond" v-if="!collpoes_key&&conditionKey"></i>
        </el-row>
        <el-row v-if="conditionKey&&!collpoes_key" style="margin-left: 244px;" :key="select_num+'condition'">
            <template v-for="(item, index) in propData.select_condition">
                <!-- 筛选条件 -->
                <el-row :key="index" style="margin: 0 0 8px 0">
                    <el-select v-model="item.key" clearable filterable placeholder="请选择" value-key="order" @change="renderRightVal(item)">
                        <el-option v-for="(innerele,innerIndex) in report.indicators_field" :key="innerIndex+'first'" :value="innerele" :label="innerele.alias"></el-option>
                    </el-select>
                    <!-- item.condition  -->
                    <template v-if="item.key.hasOwnProperty('task_id')">
                        <el-select v-model="item.condition" v-if="task_field[item.key.task_id][item.key.field]=='DECIMAL' || task_field[item.key.task_id][item.key.field]=='DATE'">
                            <el-option v-for="item in op_list" :key="item.name" :value="item.value" :label="item.name"></el-option>
                        </el-select>
                        <el-select v-model="item.condition" v-if="task_field[item.key.task_id][item.key.field]!='DECIMAL' && task_field[item.key.task_id][item.key.field]!='DATE'">
                            <el-option value="=" label="等于"></el-option>
                            <el-option value="<>" label="不等于"></el-option>
                        </el-select>
                        <!-- 区间的时候显示两个框-->
                        <template v-if="item.condition=='BETWEEN'">
                            <template v-if="task_field[item.key.task_id][item.key.field]!='DATE'">
                                <!--非时间框显示俩文本框-->
                                <el-input v-model="item.start" placeholder="请输入开始值" style="width: 200px;" />
                                <el-input v-model="item.end" placeholder="请输入结束值" style="width: 200px;" />
                            </template>
                            <template v-if="task_field[item.key.task_id][item.key.field]=='DATE'">
                                <!--时间框显示俩日期选择器-->
                                <el-date-picker value-format="yyyy-MM-dd" v-model="item.start" style="width: 200px;" type="date" class="input-date"
                                    placeholder="选择日期时间"> </el-date-picker>
                                <el-date-picker value-format="yyyy-MM-dd" v-model="item.end" style="width: 200px;" type="date"  class="input-date"
                                    placeholder="选择日期时间"> </el-date-picker>
                            </template>
                        </template>
                        <!-- 不是区间的时候显示一个框-->
                        <template v-if="item.condition!='BETWEEN'">
                            <el-input v-if="task_field[item.key.task_id][item.key.field]!='DATE'" v-model="item.value" placeholder="请输入条件值"
                            style="width: 200px;" />
                            <el-date-picker v-if="task_field[item.key.task_id][item.key.field]=='DATE'" value-format="yyyy-MM-dd" v-model="item.value"
                            style="width: 200px;" type="date" placeholder="选择日期时间" class="input-date"> </el-date-picker>
                        </template>
                    </template>
                    <template v-else>
                        <el-select v-model="item.condition" clearable filterable placeholder="等于">
                            <el-option value="=" label="等于"></el-option>
                            <el-option value="<>" label="不等于"></el-option>
                        </el-select>
                        <el-input v-model="item.value" placeholder="请输入条件值" style="width:200px;margin-right:10px;"></el-input>
                    </template>
                    <el-button @click="deletedItem(index)"  v-if="propData.select_condition.length>1" icon="el-icon-minus" type="primary" circle size="mini" ></el-button>
                    <el-button  @click="addItem(index)" icon="el-icon-plus" type="primary" circle size="mini"></el-button>
                </el-row>
            </template>
            
            <!-- 升序和降序 -->
            <el-row  style="margin: 0 0 8px 0">
                <el-select v-model="propData.order.key" clearable filterable placeholder="请选择" value-key="order">
                    <el-option v-for="(innerele,innerIndex) in report.indicators_field" :key="innerIndex+'first'" :value="innerele" :label="innerele.alias"></el-option>
                </el-select>
                <el-select v-model="propData.order.value" clearable filterable placeholder="升序">
                    <el-option label="升序" value="ASC"></el-option>
                    <el-option label="降序" value="DESC"></el-option>
                </el-select>
            </el-row>

            <!-- 显示指定列 -->
            <template v-for="(item, index) in showColdata">
                <el-row  style="margin: 0 0 8px -87px" :key="index+'showCol'">
                    <span :class="{'whether-show-span': index != 0}">显示指定列：</span>
                    <el-select v-model="item.value" clearable filterable placeholder="请选择" value-key="order">
                        <el-option v-for="(innerele,innerIndex) in report.indicators_field" :key="innerIndex+'first'" :value="innerele" :label="innerele.alias"></el-option>
                    </el-select>
                    <el-button @click="deletedshowItem(index)"  v-if="showColdata.length>1" icon="el-icon-minus" type="primary" circle size="mini" ></el-button>
                    <el-button @click="addshowItem(index)" icon="el-icon-plus" type="primary" circle size="mini"></el-button>
                    <el-button type="primary" size="mini" v-if="index==showColdata.length-1" @click="submit();combinationParam()">确认</el-button>
                </el-row>
            </template>
        </el-row>

    </div>
</template>
<script>
export default {
    props: ["value", "report","task_field", "propData", 'showColdata',"combinationParam"],
    data() {
        return{
            condition: "",
            select_num: 1,
            // propData:{
            //     order:{
            //         key: "",
            //         value:"ASC",
            //     },
            //     select_condition:[{
            //         key: {},
            //         value: '',
            //         condition: '',
            //         "start": "",
            //         "end": "",
            //     }]
            // },
            // showColdata: [
            //     {value: {}}
            // ],
            conditionKey: false,
            show_bottom_key: true,
            collpoes_key: false,
            "op_list": [{
                    name: "等于",
                    value: "="
                },
                {
                    name: "不等于",
                    value: "<>"
                },
                {
                    name: "大于",
                    value: ">"
                },
                {
                    name: "大于等于",
                    value: ">="
                },
                {
                    name: "小于",
                    value: "<"
                },
                {
                    name: "小于等于",
                    value: "<="
                },
                {
                    name: "区间",
                    value: "BETWEEN"
                },
            ],
            // param:{

            // }
        }
    },
     methods:{
        renderRightVal(item) {
            item.value = '';
            item.condition = '='
            item.start = ''
            item.end = '';
        },
        deletedItem(index) {
            if(index==0&&this.propData.select_condition.length==1) {
                this.$error("最后一项，不容许删除");
            }else{
                this.propData.select_condition.splice(index, 1);
            }
        },
        addItem() {
            this.propData.select_condition.push({
                key: {},
                value: '',
                condition: '=',
                "start": "",
                "end": "",
            })
        },
        addshowItem() {
            this.showColdata.push({value: {}})
        },
        deletedshowItem(index) {
            if(index==0&&this.showColdata.length==1) {
                this.$error("最后一项，不容许删除");
            }else{
                this.showColdata.splice(index, 1);
            }
        },
        showCodition() {
            this.conditionKey=!this.conditionKey;
        },
        submit() {
            //判断是否有重复的指定列
            let arr = [];
            this.showColdata.forEach((item, index) => {
                arr.push(item.value);
            })
            let copycolumn = new Set(arr);
            copycolumn = [...copycolumn];
            if(arr.length>copycolumn.length) {
                this.$error('请删除重复指定列');
                return;
            }
            // this.collpoes_key = true;
        },
        changeCollpoes() {
            this.collpoes_key = false;
            this.conditionKey = true;
        },
        changeCollpoesSedcond() {
            this.collpoes_key = true;
        },
        getData() {
            this.task_field['20201109000401_000489']['省_区间内最终'] = "DATE";
        },
    },
    mounted(){
        // if(this.report) {}
    },
}
</script>
<style>
    .show-need-col .el-input__inner {
        -webkit-appearance: none;
        background-color: #fff;
        background-image: none;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: #606266;
        display: inline-block;
        font-size: inherit;
        height: 32px;
        line-height: 32px;
        outline: none;
        padding: 0 15px;
        -webkit-transition: border-color .2s cubic-bezier(0.645, 0.045, 0.355, 1);
        transition: border-color .2s cubic-bezier(0.645, 0.045, 0.355, 1);
        width: 100%;
    }
    .show-need-col  .el-date-editor--date .el-input__inner {
        padding-left: 34px;
    }
    .show-need-col .el-input__icon {
        height: 100%;
        width: 25px;
        text-align: center;
        -webkit-transition: all .3s;
        transition: all .3s;
        line-height: 32px;
    }
    .show-need-col .el-select {
        display: inline-block;
        position: relative;
        margin-right: 6px;
    }
    .show-need-col .custom-margin-right{
        margin-right: 0px!important;
    }
    .show-need-col .custom-margin{
        margin: 0px!important;
    }
    .show-need-col .whether-show-span{
        visibility: hidden;
    }
</style>