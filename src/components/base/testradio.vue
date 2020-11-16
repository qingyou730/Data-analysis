<template>
    <el-radio-group v-model="intValue" size="small" @change="processData(domain)">
        <div class="int-radio">
            <el-radio label="a">使用离散数字</el-radio>
        </div>
        <div class="int-radio">
            <el-radio label="b">使用默认区间</el-radio>
        </div>
        <div class="int-radio">
            <el-radio label="c">使用等间距</el-radio>
        </div>
        <div class="int-radio">
            <el-radio label="d">使用自定义区间</el-radio>
        </div>
    </el-radio-group>
</template>

<script>
    export default{
        data(){
            return {
                intValue: ''
            }
        }
    }
</script>

<style>
</style>
