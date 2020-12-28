<template>
  <div>
    <div style="padding: 0 0 0 10px;"></div>
    <table class="table table-bordered" style="margin-top: 6px;">
      <thead>
        <tr>
          <th>参数名称</th>
          <th>参数类型</th>
          <th>绑定变量</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in public_variable_list">
          <tr :key="'public_'+index">
            <td>{{item.name.length>10?item.name.substr(0,9)+'...':item.name}}</td>
            <td>{{paramType[item.type]}}</td>
            <td>{{item.extraVariable}}</td>
        
            <!-- 操作按钮 -->
            <td>
              <el-row>
                <!-- 查看成员 -->
                <el-button type="text" disabled size="mini" style="box-sizing: border-box; outline: none">编辑</el-button>
                <el-button type="text" disabled size="mini" >删除</el-button>
              </el-row>
            </td>
          </tr>
        </template>
        <template v-for="(item, index) in renderValue">
          <tr :key="index">
            <td>{{item.name.length>10?item.name.substr(0,9)+'...':item.name}}</td>
            <td>{{paramType[item.type]}}</td>
            <td>{{item.extraVariable}}</td>

            <!-- 操作按钮 -->
            <td>
              <el-row>
                <!-- 查看成员 -->
                <el-button type="text" size="mini" @click="edit(item, index)" style="box-sizing: border-box; outline: none">编辑</el-button>
                <el-button type="text" size="mini" @click="delParam(index)">删除</el-button>
              </el-row>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script>
  export default {
    props: ["value", "editParamFun", "openParamDia","public_variable_list"],
    data() {
      return {
        paramType: {
          string: '字符串',
          date: "日期",
          time: "时间",
          number: "数值",
          dimension: "固定维度",
        },
        renderValue: null,
      }
    },
    methods: {
      edit(item, index) {
        this.editParamFun(item, index);
        this.openParamDia();
      },
      delParam(index) {
        this.$confirm('删除后不可恢复，请谨慎处理?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          this.value.splice(index, 1);
        }).catch(() => {

        });
      },
    },
    created() {
      if (this.value.length != 0) {
        this.renderValue = JSON.parse(JSON.stringify(this.value));
        this.renderValue.forEach(item => {
          item.extraVariable = [];
          if (item.variable.length > 0) {
            item.variable.forEach(innerItem => {
              item.extraVariable.push(innerItem.alias);
            })
          }
          item.extraVariable = item.extraVariable.join(',')
        })
        console.log(this.renderValue, "renderValue==");
      }
    },
  }
</script>
