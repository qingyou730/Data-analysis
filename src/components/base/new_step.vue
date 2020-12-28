<template>
    <div>
        <el-card id="new_step_container">
            <div class="cancel_task" v-if="confirm">
                <el-button size="mini" @click="cancel">取消</el-button>
                <el-button size="mini" @click="calcelTask" type="primary">确定</el-button>
            </div>
            <div id="step_titile">
                <span style="color: black">任务进度</span>
            </div>
            <div style="position: absolute;top: 50%;left: 20%;transform: translate(-50%, -50%);">
                <span class="loader-3"></span>
            </div>
            <div style="position: absolute;top: 50%;left: 60%;transform: translate(-50%, -50%);">
                <p style="color:#939496;" v-if="step === 1">待调度...</p>
                <p style="color:#939496;" v-if="step === 2">调度中</p>
                <p style="color:#939496;" v-if="step > 2">调度完成</p>
                <p style="color:#939496;" v-if="step === 3">计算中...</p>
                <p style="color:#939496;" v-if="step === 4">任务完成</p>
            </div>
            <div style="position: absolute;top: 80%;left: 45%">
                <router-link to="/analysis/task/list">
                    <el-button size="mini">任务列表</el-button>
                </router-link>
                <el-button size="mini" @click="startConfirm">取消任务</el-button>
            </div>
        </el-card>
        <!-- <el-dialog :visible="confirm" :show-close="false" :modal-append-to-body="false" width="15%" title="是否确认取消任务">
            <div style="float: right;margin-bottom: 10px">
                <el-button size="mini" @click="calcelTask">确定</el-button>
                <el-button size="mini" @click="cancel">取消</el-button>
            </div>
        </el-dialog> -->
    </div>
</template>
<script>
    export default {
        props: ["parent_step", "task_id"],
        data() {
            return {
                unfold: false,
                step: 1,
                confirm: false,
                loading: true
            }
        },
        created() {
            this.step = this.parent_step;
        },
        methods: {
            //取消任务
            startConfirm() {
                this.confirm = true;
            },

            //取消任务确定
            calcelTask() {
                this.confirm = true;
                var url = this.$store.state.api_url.task.kill_task;
                var param = this.$generateParams({
                    task_id: this.task_id
                });
                this.axios.post(url, param).then((res) => {
                    var data = res.data;
                    if (data.code == 200) {
                        this.$emit('input', false);
                        this.$success("任务取消成功");
                    } else {
                        this.error(data.hasOwnProperty('msg') ? data.hasOwnProperty('msg') : '任务取消失败');
                    }
                }).catch((e) => {
                    console.log(e);
                    this.$error("取消任务失败");
                });
            },
            //取消任务取消
            cancel() {
                this.confirm = false;
                this.force
            },
        },
        watch: {
            parent_step: function (val) {
                this.step = this.parent_step;
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    #new_step_container * {
        font-size: 12px;
    }

    #new_step_container {
        width: 380px;
        height: 200px;
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        top: 108px;
        border: 1px solid #CCC;
        background: white;
        z-index: 20;
    }
    #new_step_container .cancel_task{
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }
</style>
