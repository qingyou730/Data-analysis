<template>
    <div class="view-other-col">
        <el-dialog title="显示指定列" :visible.sync="value" top="35vh" :before-close="closeDialog">
            <div style="margin-top: 2px">
                <el-checkbox-group v-model="checkboxGroup" size="mini" ref="multipleTable">
                    <el-checkbox :label="item" border v-for="(item, index) in field_list" :key="index"></el-checkbox>
                </el-checkbox-group>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="$emit('input', false);checkboxGroup = []">取 消</el-button>
                <el-button type="primary" @click="closeDialog">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    props: ["value", "field_list", "wantUseclo"],
    data() {
        return{
            checkboxGroup: [],
        }
    },
    methods: {
        closeDialog() {
            for(var item of this.checkboxGroup) {
                this.wantUseclo.push(item);
            }
            this.$emit('input', false);
            this.checkboxGroup = [];
        }
    },
    mounted() {
        if(this.$refs.multipleTable) {
            this.$refs.multipleTable.clearSelection();
        }
    }
}
</script>
<style>
    .view-other-col .el-dialog__body{
        padding: 6px 20px;
        color: #606266;
        font-size: 14px;
        word-break: break-all;
        border: 1px solid #F5F5F5;
    }
    .view-other-col .el-dialog__body .el-checkbox{
        margin-bottom: 6px;
    }
    .view-other-col .el-dialog__body .el-checkbox-group label:nth-child(1){
        margin-left: 10px;
    }
</style>