<template>
   <div> 
          <div style="color: #ccc; heigth: 50px; font-size: 16px" class="row-bg" v-if="sql_status!='ACCEPTED'&&sql_status!='SUCCESS'">运行一个查询，以在此显示结果</div>
          <div v-if="sql_status=='ACCEPTED'" class="tab-pane-center">
              <i class="el-icon-loading"></i>
              <span v-if="1">加载中</span>
          </div>
          <div v-if="sql_status=='SUCCESS'">
              <table class="table table-bordered">
                <thead>
                    <tr>
                        <th v-for="(item, index) in statusTable[0]" :key="index">{{index}}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(row, index) in statusTable">
                        <tr :key="index">
                            <td  v-for="(col, col_index)  in row" :key="col_index">{{col}}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <el-pagination  @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
              :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
          </div>
    </div>
</template>

<script>
export default {
    props: ['sql_status', 'statusTable'],
    data() {
        return{

        }
    },
}
</script>