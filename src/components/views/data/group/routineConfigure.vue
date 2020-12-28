<template>
  <div>
    <template v-for="(wrapperItem,index) in options">
      <div :key="index+num" style="margin:6px 0">
        <span>分析对象：</span><span>{{wrapperItem.name}}</span>
        <span style="display:inline-block; margin-left:150px">选择群组：</span>
        <el-select v-model="paramObj[wrapperItem.value]" placeholder="请选择" @change="handle($event, wrapperItem.value)">
          <el-option
            v-for="item in dynamicList.filter(item=>item.object_type==wrapperItem.value)"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
    </template>
    <div>
      <el-button type="primary" @click="submit" v-if="$access('/data/group/routineadd')">确认</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return{
        options:[],
        paramObj: {},
        dynamicList:[],
        value: '',
        num:0,
      }
    },
    methods:{
      submit() {
        for(var value in this.paramObj){
          if(!this.paramObj[value]) {
            this.$error("分析对象不能没有默认群组");
            return;
          }
        }
        let url = this.$store.state.api_url.dynamicDroup.routine_bind_group;
        let data = {
           "bind_json": JSON.stringify(this.paramObj),
        }
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.$success('绑定成功');
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          console.log(errors);
        })
        console.log(this.paramObj);
      },
      getOptions() {
        let url = this.$store.state.api_url.dynamicDroup.object_type_list;
        let data = {
        }
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.options = data.data;
            this.options.forEach(item=>{
              this.paramObj[item.value] = "";
            })
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          console.log(errors);
        })
      },
      handle(val, key) {
        this.num++;
      },
      getDynamicList(){
        let url = this.$store.state.api_url.dynamicDroup.dynamic_group_list;
        let data = {
          "is_all": true,
          page: 1,
          page_size: 100000
        }
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.dynamicList = data.data.hits;
            this.initData();
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          console.log(errors);
        })
      },
      initData() {
        let url = this.$store.state.api_url.dynamicDroup.get_routine_bind_group;
        let data = {
        }
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            if(data.data) {
              this.paramObj = JSON.parse(data.data.bind_json)
            }
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          console.log(errors);
        })
      },
    },
    created() {
      this.getOptions();
      this.getDynamicList()
    },
    mounted() {
    },
  }
</script>
