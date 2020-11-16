<template>
  <div class="my-form-row">
    <span class="my-form-label">{{title}} :</span>
    <div style="display: inline-block;">
      <el-select v-model="self_value" collapse-tags filterable multiple  style="width: 400px;">
        <el-option @click.native="checkAll()"  :class="is_check_all ? 'selected' :''" label="全选" value="ALL"></el-option>
      	<el-option @click.native="checkIsCheckAll()" v-for="item in options" :key="item.value" :label="item.name" :value="item.value"></el-option>
      </el-select>
    </div>
  </div>


</template>

<script>
	export default {
    props: ["title", "name", "moduleId", "apis", "value"],
		data() {
			return {
        is_check_all:false,
				self_value:[],
				options: [],
        url_list: {
          // data_list: '/mmp/model/base/platforms/', //属性列表接口
        }
			}
		},
		created() {
		  var url_list = {};
		  for(var v of this.apis){
		    url_list[v.name] = v.api ;
		  }
		  this.url_list = url_list  ;
      //编辑得时候设置值
      if(this.value &&  this.value.length>0){
        this.self_value = this.value  ;
      }

		},
		mounted() {
			this.getData();
		},
		methods:{
      checkIsCheckAll:function() {
        if (this.self_value.length != this.options.length) {
          this.is_check_all = false;
        } else {
          this.is_check_all = true;
        }
      },
      checkAll() { //全选
        if (this.is_check_all == false) {
          console.log("全选");
          this.is_check_all = true;
          var data = [];
          this.options.map((v) => {
            data.push(v.value);
          });
          this.self_value = data ;
        } else {
          console.log("取消选择");
          this.self_value = [];
          this.is_check_all = false;

        }
      },
			getData(){
				var url = this.url_list.data_list ;
				var requestData = this.$generateParams(this.$store.state.linkage);
				this.axios.post(url, requestData).then((rep)=>{
					var data = rep.data ;
					if(data.code != 200){
						console.log("接口请求失败" + 'multi_select1');
					}
					this.options = data.data  ;
				}).catch(function(error) {
          console.log(error) ;
					console.log("接口请求失败"+ 'multi_select2');
				});
			}
		},
		computed: {
			isFollow() {
				return this.$store.state.linkage; //需要监听的数据
			}
		},
		watch: {
			isFollow: {  //联动参数变化的时候
				handler (){
					this.getData();
					this.self_value = [] ;
				},
				// immediate: true,
				deep: true
			},
			self_value: {  //value值变化的时候给上级v-model
				handler: function(val, oldval) {
					this.$emit('input',this.self_value);
				},
				deep: true //对象内部的属性监听，也叫深度监听
			},
		},
	}
</script>

<style>
</style>
