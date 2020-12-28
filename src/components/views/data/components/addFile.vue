<template>
  <div class="custom-rewrite-file">
    <el-dialog title="添加文件夹" :visible.sync="value" :before-close="close" :close-on-click-modal="wrapper_no" width="30%">
      <div style="margin:auto">
        <el-input placeholder="请输入文件名称" style="width:60%;margin:0 20%" v-model="file_name">
        </el-input>
      </div>
      <div style="margin:12px 20% 32px; color:red" v-if="custom_left.docment_data.length>0">请选择上级文件夹，默认是一级文件夹</div>
      <div>
        <div style="width:80%;margin:32px 20% 32px">
          <div class="custom-docment-wra custom-docment-wra-remove">
            <p style="display:none;">{{collpaes_key}}{{collpaes_key_second}}{{collpaes_key_third}}</p>
            <template v-for="(item, index) in  custom_left.docment_data">
              <div class="custom-collapes-item" :key="index">
                <!-- 一级文件名称区域 -->
                <div :class="['doc-top', {'active-collapes-bg': item.select_active}]">
                  <div style="width:90%">
                    <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': item.flag}]" @click="openClolapesItem(index,item)"></i>
                    <div @click="seleclFileFun(item)" :class="['collapes-name',{'active-collapes-bg': item.select_active}]"
                      style="cursor:pointer">{{item.name}}</div>
                  </div>
                </div>
                <div v-if="item.flag" :key="collpaes_key">
                  <!-- 二级级文件名称区域 -->
                  <template v-if="item.children.length>0">
                    <div class="custom-collapes-item" v-for="(sedcondItem,sedcondIndex) in item.children" :key="sedcondIndex + 'sedcondIndex'">
                      <div :class="['doc-top', {'active-collapes-bg': sedcondItem.select_active}]">
                        <div style="margin-left:24px;width:90%">
                          <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': sedcondItem.flag}]"
                            @click="openSonClolapes(sedcondIndex,sedcondItem)"></i>
                          <div @click="seleclFileFun(sedcondItem)" :class="['collapes-name',{'active-collapes-bg': sedcondItem.select_active}]"
                            style="cursor:pointer">{{sedcondItem.name}}</div>
                        </div>
                        <div>

                        </div>
                      </div>


                      <!-- 三级级级文件名称区域 -->
                      <div v-if="sedcondItem.flag" :key="collpaes_key_second">
                        <template v-if="sedcondItem.children.length>0">
                          <div class="custom-collapes-item" v-for="(thirdItem,thirdIndex) in sedcondItem.children" :key="thirdIndex + 'thirdIndex'">
                            <div :class="['doc-top', {'active-collapes-bg': thirdItem.select_active}]">
                              <div style="margin-left:48px;width:90%">
                                <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': thirdItem.flag}]"
                                  @click="openLastClolapes(thirdIndex,thirdItem)"></i>
                                <div @click="seleclFileFun(thirdItem)" :class="['collapes-name',{'active-collapes-bg': thirdItem.select_active}]"
                                  style="cursor:pointer">{{thirdItem.name}}</div>
                              </div>
                              <div>

                              </div>
                            </div>

                            <div v-if="thirdItem.flag" :key="collpaes_key_third">

                            </div>
                          </div>
                        </template>
                        <!-- 三级级级文件名称区域 end -->
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="close" size="medium">取 消</el-button>
        <el-button type="primary" @click="submit" size="medium">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    props: ["value", "custom_left"],
    data() {
      return {
        file_name: '',
        fid: '',
        collpaes_key: 1,
        collpaes_key_second: 1,
        collpaes_key_third: 1,
        level: 1,
        wrapper_no: false,
      }
    },
    methods: {
      close() {
        this.$emit("input", false);
      },
      loop(docList) {
        docList.forEach((item, index) => {
          item.select_active = false;
          if (item.children.length > 0) {
            this.loop(item.children);
          }
        })
      },
      seleclFileFun(item) {
        this.fid = item.id;
        this.loop(this.custom_left.docment_data);
        item.select_active = true;
        this.collpaes_key_second++;
        this.level = item.level;
      },
      submit() {
        if (!this.file_name) {
          this.$error("请输入文件名称");
          return;
        }
        if (this.level >= 3) {
          this.$error('文件夹层级最多是三层，不能再添加了');
          return;
        }
        let url = this.$store.state.api_url.dynamicDroup.add_file;
        let data = {
          "fid": this.fid,
          "name": this.file_name,
          "object": "role"
        }
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.$success('修改成功');
            this.fid = '';
            this.file_name = "";
            this.level = null;
            this.close();
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          console.log(errors);
        })
        this.close();
      },
      openClolapesItem(index, item) { //一级折叠操作
        this.$set(this.custom_left.docment_data[index], 'flag', !item.flag);
        this.collpaes_key++;
      },
      openSonClolapes(index, item) { //二级折叠操作
        this.$set(item, 'flag', !item.flag);
        this.collpaes_key_second++;
      },
      openLastClolapes(index, item) { //三级折叠操作
        this.$set(item, 'flag', !item.flag);
        this.collpaes_key_third++;
      },
    },
    mounted() {},
    watch: {
      newName: {
        handler() {
          if (this.newName) {
            this.flag = false;
          }
        }
      }
    }
  }
</script>
<style>
  .custom-rewrite-file .el-dialog .el-dialog__body {
    padding: 0px 6px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
  }

  .custom-rewrite-file .custom-docment-wra-remove {
    min-height: 100px;
    max-height: 200px;
    overflow: auto;
  }
</style>
