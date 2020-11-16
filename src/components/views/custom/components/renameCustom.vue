<template>
    <div class="custom-rewrite-file">
        <el-dialog
            title="重命名报表名称"
            :visible.sync="value"
            :close-on-click-modal="wrapper_no"
            width="30%">
            <p style="border-top: 1px solid #ccc"></p>
            <div style="margin:24px 0">
                <span style="display: inline-block;margin-left: 48px;">报表名称：</span>
                <el-input style="width:65%;height:32px" v-model="newName"></el-input>
                <div style="margin: 12px 0 0 127px; color:red" v-if="flag">报表名称不能为空</div>
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
    props: ["value", "id"],
    data() {
        return{
            newName: '',
            flag: false,
            wrapper_no:false,
        }
    },
    methods:{
        close() {
            this.$emit("input", false);
        },
        submit() {
            if(!this.newName) {
                this.flag = true;
                return;
            }
            let url = this.$store.state.api_url.custom.rename_file;
            let data = {
                "id": this.id,
                "new_name": this.newName,
                "object": "role"
            }
            let param = this.$generateParams(data);
            this.axios.post(url, param).then((res) => {
                let data = res.data;
                if (data.code == 200) {
                    this.$success('修改成功')
                    this.close();
                }else {
                    this.$error(res.data.msg)
                }
            }).catch((errors) => {
                console.log(errors);
            })
        },
    },
    watch: {
        newName:{
            handler() {
                if(this.newName) {
                    this.flag = false;
                }
            }
        }
    }
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
    padding: 12px 6px 4px 8px;
    padding-bottom: 10px;
    font-size: 16px;
}
</style>