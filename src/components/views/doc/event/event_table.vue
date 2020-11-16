<template>
    <div>
        <el-input v-model="searEvent" placeholder="输入关键词进行搜索" style="width:200px" @input="getData(true)"></el-input>
        <table class="table table-bordered" v-loading="loading">
            <thead>
                <tr>
                    <th>事件中文名称</th>
                    <th>事件英文名称</th>
                    <th>事件备注</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in event_list" :key="'public'+index">
                    <td><router-link :to="{ path: '/doc/event/event_attr', query: { event_id: item.id, page: currentPage}}">{{ item.name }}</router-link></td>
                    <td>{{ item.id }}</td>
                    <td>{{item.realValue}}</td>
                </tr>
            </tbody>
        </table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
                :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="totalData" >
            </el-pagination>
    </div>
</template>
<script>
export default {
    data() {
        return{
            data:[],
            event_list: [],
            totalPage: 0,
            totalData: 0,
            currentPage: 1,
            pageSize: 10,
            tableData: [],
            event_id: "",
            loading: true,
            public_attr_list: [],
            searEvent: '',
        }
    },
    methods: {
        handleSizeChange(val) {
            this.pageSize = val;
            this.getData();
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getData();
        },
        getData(searchKey) {
            this.loading = true;
            var event_table_url = this.$store.state.api_url.event.event_table_url;
            let data = {
                page_size: this.pageSize,
                page: searchKey ? 1 : this.currentPage,
                "keyword": this.searEvent ? this.searEvent : '',
            }
            var param = this.$generateParams(data);
            this.axios.post(event_table_url, param).then((res) => {
            var data = res.data;
            if (data.code == 200) {
                this.event_list = data.data.hits;
                this.totalData = data.data.total_hits ;
                // this.event_id = this.event_list[0]["id"] ;
            } else {
                console.log("数据加载失败");
            }
            this.loading = false;
        }).catch((errors) => {
          this.loading = false;
          console.log(errors);
          console.log("数据加载失败");
        })
      },
    },
    created() {
        if(this.$route.query.page) {
            this.currentPage = this.$route.query.page;
        }
    },  
    mounted() {
        this.getData();
    },

}
</script>