<template>
	<el-form :label-position="labelPosition" label-width="180px">
		<el-form-item label="模块名称">
			<el-input v-model="zhName" class="params"></el-input>
		</el-form-item>
		<el-form-item label="英文名称">
			<el-input v-model="name" class="params"></el-input>
		</el-form-item>
		<el-form-item label="模块类型">
			<template>
				<el-select v-model="moduleGroup" placeholder="请选择">
					<el-option v-for="item in moduleTypes" :key="item.value" :label="item.name" :value="item.value">
					</el-option>
				</el-select>
			</template>
		</el-form-item>
		<el-form-item label="模块类别">
			<el-input v-model="moduleType" class="params"></el-input>
		</el-form-item>
		<el-form-item label="详情描述">
			<el-input v-model="desc" class="params"></el-input>
		</el-form-item>
		<el-form-item label="组件选择">
			<el-select v-model="components" @change="onChangeComponent" multiple collapse-tags placeholder="请选择" style="width: 300px;">
				<el-option v-for="item in options" :key="item.value" :label="item.compName" :value="item.comId">
				</el-option>
			</el-select>
		</el-form-item>
		<el-form-item v-for="(comId,index) in comIds" :key='index' :label="findComponentName(comId.uid)">
			<el-input placeholder="请输入排序值 仅限数字" class="params" v-model="comId.sort" onkeyup="this.value=this.value.replace(/[^\d.]/g,'');"
			 maxlength="2" />
		</el-form-item>
		<el-form-item label-width="0px">
			<el-button type="primary" @click="submit">保存</el-button>
			<el-button @click="onClickCancel">取消</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	export default {
		data() {
			return {
				zhName: '',
				name: '',
				moduleGroup: '',
				desc: '',
				mduId: '',
				comIds:[],
				sortIndex: [],
				components: [],
				sortComponents: [],
				labelPosition: 'left',
				options: [],
				moduleTypes: [],
				moduleType: ''
			}
		},
		methods: {
			submit() {
				let data = {
					desc: this.desc,
					mduId: this.mduId,
					moduleGroup: this.moduleGroup,
					moduleType: this.moduleType,
					name: this.name,
					zhName: this.zhName,
					comIds: this.comIds,
				}
				console.log(data.comIds)
				this.axios.post(this.$store.state.api_url.module.add, data).then((response) => {
					if (response.data.code == 200) {
						this.$message("添加模块成功");
					} else {
						this.$message(response.data.msg);
					}
				}).catch((error) => {
					this.$message(error);
				})
				this.$router.push('/analysis/module/list')
			},
			onClickCancel() {
				this.$router.push('/analysis/module/list')
			},
			findComponentName(component) {
				for (let i in this.options) {
					if (this.options[i].comId == component) {
						return this.options[i].compName;
					}
				}
			},
			onChangeComponent(){
				for(var index = this.comIds.length-1;index>=0;index--){
					var isInSortComponent = false;
					this.components.forEach(component => {
						if (this.comIds[index].uid == component) {
							isInSortComponent = true;
						}
					})
					if (!isInSortComponent) {
						this.comIds.splice(index,1);
					}
				}
				this.components.forEach(component => {
					var comId = {
						uid: component,
						desc: this.findComponentName(component),
					}
					let isInArray = false;
					let pos = 0;
					for (let i in this.comIds) {
						if (this.comIds[i].uid == component) {
							isInArray = true;
							pos = i;
						}
					}
					if (!isInArray) {
						this.comIds.push(comId);
					} 
				})
			}
		},
		created() {
			this.$store.state.page_name = "模块管理-新增";
		},
		mounted() {
			this.axios.post(this.$store.state.api_url.components.list).then((response) => {
                this.options = response.data.data;
			}).catch((error) => {
				this.$message(error);
			})

			this.axios.post(this.$store.state.api_url.module.type).then((response) => {
				this.moduleTypes = response.data.data;
			}).catch((error) => {
				this.$message(error);
			})

			this.mduId = '';
			// if (this.$route.query.row != null) {
			// 	this.name = this.$route.query.row.name;
			// 	this.desc = this.$route.query.row.desc;
			// 	this.moduleGroup = this.$route.query.row.moduleGroup;
			// 	this.moduleType = this.$route.query.row.moduleType;
			// 	this.zhName = this.$route.query.row.zhName;
			// 	this.mduId = this.$route.query.row.mduId;
			// 	if (this.$route.query.row.comIds != null) {
			// 		this.sortComponents = []
			// 		this.sortIndex = []
			// 		this.components = []
			// 		this.comIds = this.$route.query.row.comIds
			// 		for (let i in this.$route.query.row.comIds) {
			// 			this.components.push(this.$route.query.row.comIds[i].uid);
			// 			this.sortComponents.push(this.$route.query.row.comIds[i]);
			// 			this.sortIndex.push(this.$route.query.row.comIds[i].sort);
			// 		}
			// 	}
            // }
            let requestUrl = this.$store.state.api_url.module.detail;
            let mduData = null;
            let param = { mduId: this.$route.query.mduId };
            this.axios
                .post(requestUrl, param)
                .then((rep) => {
                    console.log(rep.data.data, "rep");
                    mduData = rep.data.data;
                    if (mduData != null) {
                        this.name = mduData.name;
                        this.desc = mduData.desc;
                        this.moduleGroup = mduData.moduleGroup;
                        this.moduleType = mduData.moduleType;
                        this.zhName = mduData.zhName;
                        this.mduId = mduData.mduId;
                        if (mduData.comIds != null) {
                            this.sortComponents = []
                            this.sortIndex = []
                            this.components = []
                            this.comIds = mduData.comIds
                            for (let i in mduData.comIds) {
                                this.components.push(mduData.comIds[i].uid);
                                this.sortComponents.push(mduData.comIds[i]);
                                this.sortIndex.push(mduData.comIds[i].sort);
                            }
                        }
                    }
                })
                .catch(function (error) {
                    alert(error);
                });
		}
	}
</script>

<style>
	.el-form .el-form-item .domain {
		width: 50%;
	}

	.el-form .el-form-item .params {
		width: 80%;
	}
</style>
