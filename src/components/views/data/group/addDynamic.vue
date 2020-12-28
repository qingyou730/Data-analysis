<template>
  <div class="custom-table-home group-table-home">
    <div class="wrapper">
      <div class="left">
      
        <div class="custom-header">
          <span style="display:inline-block;font-size:16px;width:46%" v-if="!custom_left.searValKey">群组文件夹管理</span>
          <div style="position:relative;width:60%" v-if="custom_left.searValKey">
            <el-input style="width: 100%" placeholder="输入群组名称" ref="left_search" @blur="opensearKey" @input='searchNeedfile($event)'
              v-model="custom_left.searValue">
            </el-input>
            <i slot="suffix" class="el-icon-close close-icon" @click="clearSearVal"></i>
          </div>
          <div>
            <i class="el-icon-search font-i-style" @click="opensearKey"></i>
            <el-tooltip content="添加文件夹" placement="bottom" popper-class='green-ground'>
              <i class="el-icon-folder-add font-i-style" @click="addFileFun"></i>
            </el-tooltip>
            <el-tooltip content="创建群组" placement="bottom" popper-class='green-ground'>
              <i class="el-icon-document font-i-style" @click="createCustomItem"></i>
            </el-tooltip>
          </div>
        </div>
        <!--文件和群组展示区域 -->
        <div class="custom-docment-wra">
          <p style="display:none;">{{collpaes_key}}{{collpaes_key_second}}{{collpaes_key_third}}</p>
          <template v-for="(item, index) in  filter_custom_data">
            <div class="custom-collapes-item" :key="index">
              <!-- 一级文件名称区域 -->
              <div class="doc-top">
                <div style="width:90%">
                  <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': item.flag}]" @click="openClolapesItem(index,item)"></i>
                  <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                  <div @click="show_data(item)" class="collapes-name">{{item.name}}</div>
                </div>
                <div>
                  <el-dropdown placement="bottom" @command="handleCommandFile($event, item)">
                    <i class="el-icon-more opcity-none-i" style="transform: rotate(90deg);"></i>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="rename" v-if="$access('/data/dynamic/add_folder')">重命名</el-dropdown-item>
                      <el-dropdown-item command="addcustom" >添加群组</el-dropdown-item>
                      <el-dropdown-item command="delfile" v-if="$access('/data/dynamic/add_folder')">删除</el-dropdown-item>
                      <el-dropdown-item command="showShare" v-if="$access('/data/dynamic/add')">分享</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
              <div v-if="item.flag" :key="collpaes_key">
                <!-- 二级级文件名称区域 -->
                <template v-if="item.children.length>0">
                  <div class="custom-collapes-item" v-for="(sedcondItem,sedcondIndex) in item.children" :key="sedcondIndex + 'sedcondIndex'">
                    <div class="doc-top">
                      <div style="margin-left:24px;width:90%">
                        <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': sedcondItem.flag}]"
                          @click="openSonClolapes(sedcondIndex,sedcondItem)"></i>
                        <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                        <div @click="show_data(sedcondItem)" class="collapes-name">{{sedcondItem.name}}</div>
                      </div>
                      <div>
                        <el-dropdown placement="bottom" @command="handleCommandFile($event, sedcondItem)">
                          <i class="el-icon-more opcity-none-i" style="transform: rotate(90deg);"></i>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="rename" v-if="$access('/data/dynamic/add_folder')">重命名</el-dropdown-item>
                            <el-dropdown-item command="addcustom" >添加群组</el-dropdown-item>
                            <el-dropdown-item command="delfile" v-if="$access('/data/dynamic/add_folder')">删除</el-dropdown-item>
                            <el-dropdown-item command="showShare" v-if="$access('/data/dynamic/add')">分享</el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                      </div>
                    </div>


                    <!-- 三级级级文件名称区域 -->
                    <div v-if="sedcondItem.flag" :key="collpaes_key_second">
                      <template v-if="sedcondItem.children.length>0">
                        <div class="custom-collapes-item" v-for="(thirdItem,thirdIndex) in sedcondItem.children" :key="thirdIndex + 'thirdIndex'">
                          <div class="doc-top">
                            <div style="margin-left:48px;width:90%">
                              <i :class="['el-icon-caret-right', 'first-i-class',{'open-rotate-90': thirdItem.flag}]"
                                @click="openLastClolapes(thirdIndex,thirdItem)"></i>
                              <i class="el-icon-folder-opened" style="vertical-align:middle;height:38px;margin: 0 0 0 12px;"></i>
                              <div @click="show_data(thirdItem)" class="collapes-name">{{thirdItem.name}}</div>
                            </div>
                            <div>
                              <el-dropdown placement="bottom" @command="handleCommandFile($event, thirdItem)">
                                <i class="el-icon-more opcity-none-i" style="transform: rotate(90deg);"></i>
                                <el-dropdown-menu slot="dropdown">
                                  <el-dropdown-item command="rename" v-if="$access('/data/dynamic/add_folder')">重命名</el-dropdown-item>
                                  <el-dropdown-item command="addcustom" >添加群组</el-dropdown-item>
                                  <el-dropdown-item command="delfile" v-if="$access('/data/dynamic/add_folder')">删除</el-dropdown-item>
                                  <el-dropdown-item command="showShare" v-if="$access('/data/dynamic/add')">分享</el-dropdown-item>
                                </el-dropdown-menu>
                              </el-dropdown>
                            </div>
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



      <div class="right group-right">
        <creat-dynamicgroup v-if="create_report_key" v-model="create_report_key" :key="create_report_num+'creat-group'+rigth_show_num"
          :open_edit_group="open_edit_group" :custom_left="custom_left" :add_folder_id="add_folder_id" :edit_group_id="edit_group_id"
          :closeEditKey="closeEditKey" :closeeditGgroup="closeeditGgroup" :getDataCustom="getDataCustom" :clearEditId="clearEditId"></creat-dynamicgroup>
        <dynamic-list :open_folder_id="open_folder_id" v-else :openEditKey="openEditKey" :getDataCustom="getDataCustom" :key="'grouplist'+rigth_show_num"></dynamic-list>
      </div>




    </div>
    <add-file v-model="add_file" :custom_left="custom_left"></add-file>
    <rewritefile-name v-model="refile_name" :id="select_file_id" :name="select_file_name" :key="file_newname_key+'file'"
      v-if="refile_name"></rewritefile-name>
    <remove-custom v-model="remove_custom" :custom_left="custom_left" :id="remove_custom_id" v-if="remove_custom"></remove-custom>
    <rename-custom v-model="rename_custom_key" :id="rename_custom_id" :name="select_custom_name" :key="file_newname_key+'custom'"></rename-custom>
    <create-customdia v-model="creat_custom" :custom_left="custom_left" v-if="creat_custom" :dia_add_folder_id="dia_add_folder_id"
      :create_report_key="create_report_key" :changeReportData="changeReportData" :changeIDfid="changeIDfid"></create-customdia>
      
    <!-- 文件夹权限管理弹出框 -->  
    <el-dialog title="权限管理" :visible.sync="dialogShareFlag" :before-close="closeShareDialog" width="45%">
      <el-form>
        <el-form-item label="分享报表" :label-width="formLabelWidth">
          <el-select v-model="shared_users" multiple filterable placeholder="请选择" size='large' style="width: 60%">
            <el-option v-for="item in userList" :key="item.user_id" :label="item.user_name" :value="item.user_id">
            </el-option>
          </el-select>
          <div style="color:#CBD0D7;">分享后，该一级文件夹下的所有报表均会共享。</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeShareDialog">取 消</el-button>
        <el-button type="primary" @click="saveAccess()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import creatDynamicgroup from '../components/creatDynamicgroup'
  import addFile from '../components/addFile'
  import rewritefileName from '../components/rewritefileName'
  import removeCustom from '../components/removeCustom'
  import renameCustom from '../components/renameCustom'
  import createCustomdia from '../components/createCustomdia'
  import dynamicList from '../components/dynamicList'



  import {
    Loading
  } from 'element-ui';



  export default {
    components: {
      creatDynamicgroup,
      addFile,
      rewritefileName,
      removeCustom,
      renameCustom,
      createCustomdia,
      dynamicList
    },
    data() {
      return {
        open_folder_id:'',//当前正在查看的文件夹ID 
        add_file: false, //添加文件夹
        custom_left: { //左边数据集合
          searValue: '',
          searValKey: false,
          docment_data: [],
          custom_list: [],
        },
        filter_custom_data: [], //render use 文件夹
        open_edit_group: false,
        edit_group_id: "",



        collpaes_key: 1,
        collpaes_key_second: 1,
        collpaes_key_third: 1,

        select_file_id: '', //选中文件id
        select_file_name: "",
        select_custom_name: "",
        refile_name: false, //文件重命名
        add_file: false, //添加文件夹
        creat_custom: false, //添加群组
        creat_custom_id: "",
        remove_custom: false,
        remove_custom_id: "",
        rename_custom_key: false, //群组重新命名
        rename_custom_id: '', //群组id
        create_report_key: false, //是否展示右侧添加群主页面
        add_folder_id: '',
        edit_folder_id: '',
        create_report_num: 0,
        file_newname_key: 0, //文件夹key绑定

        rigth_show_id: "", //右侧数据展示id
        rigth_show_num: 0, //右侧数据展示key

        right_show_folder_id: "", //右侧数据展示folder——id
        right_show_key: false,

        dia_add_folder_id: "",
        collpase_all_key: { //所有文件夹的是否展开记录

        },
        loadingInstance2: null,
        dialogShareFlag:false ,
        dialogShareFlag: false, //是否想显示分享对话框标识
        formLabelWidth: '120px',
        shared_users: [], //分享给谁
        share_folder_id: '', //要分享的文件夹ID
        userList: [], //所有的用户列表

      }
    },
    methods: {
      /**
       * 展示某个文件夹下的群组数据
       */
      clearEditId() {
        this.edit_group_id = "";
      },
      show_data:function(folder){
        this.open_folder_id =  folder.id ;
        this.create_report_key = false ;
      },
      addFileFun() { //添加文件事件
        if (this.$access('/data/dynamic/add_folder')) {
          this.add_file = true;
        } else {
          this.$confirm('当前角色无创建文件夹权限，请联系管理员进行处理', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'error',
          })
        }
      },
      openEditKey(id, fid) {
        this.create_report_key = true;
        this.open_edit_group = true;
        this.edit_group_id = id;
        this.add_folder_id = fid;
      },
      closeEditKey() {
        this.open_edit_group = false;
        this.create_report_key = false; //跳到群组列表页面
        this.edit_group_id = ''; //如果是编辑的话提交成功把编辑id置空
        this.getDataCustom();
      },
      closeeditGgroup() {
        this.open_edit_group = false;
      },
      changeIDfid(id, fid) {
        console.log(1212)
        this.edit_group_id = id;
        this.add_folder_id = fid;
      },
      //获取用户列表
      getUserList() {
        let requestUrl = this.$store.state.api_url.admin.all_user;
        this.axios.post(requestUrl).then(response => {
          if (response.data.code == 200) {
            let dataList = [];
            dataList = response.data.data.hits;
            dataList = dataList.filter(item => item.user_id != this.$store.state.user.user_id)
            this.userList = dataList;
          } else {
            this.$error();
          }
        }).catch(error => {
          console.log(error)
        })
      },  
      changeRigthKey() {
        this.rigth_show_num++;
      },
      showCustomList(item) { //展示右侧数据
        this.rigth_show_id = item.id;
        this.right_show_folder_id = item.folder_id;
        this.right_show_key = true;
        this.openEditKey(item.id, item.folder_id);
        this.changeRigthKey();
        // console.log(this.$refs.showReport, "showReport");
      },
      changeReportData(id, flag) { //方法传递
        this.add_folder_id = id;
        this.create_report_key = flag;
        this.create_report_num++;
      },
      clearSearVal() { //清楚搜索框内的消息
        this.custom_left.searValue = '';
        this.$refs.left_search.focus();
        this.getDataCustom();
      },
      opensearKey() { //开启搜索功能
        this.custom_left.searValKey = !this.custom_left.searValKey;
        if (!this.$refs.left_search) {
          this.$nextTick(() => {
            this.$refs.left_search.$refs.input.focus();
          })
        }
      },
      handneedData(docList, customList) {
        docList.forEach((item, index) => {
          item.flag = false;
          item.select_active = false;
          item.customList = [];
          customList.forEach((innerItem, innerIndex) => {
            if (item.id == innerItem.folder_id) {
              item.customList.push(innerItem);
            }
          })
          if (item.children.length > 0) {
            this.handneedData(item.children, customList);
          }
        })
      },
      openClolapesItem(index, item) { //一级折叠操作
        this.$set(this.filter_custom_data[index], 'flag', !item.flag);
        this.collpase_all_key[item.id] = !this.collpase_all_key[item.id];
        this.collpaes_key++;
      },
      openSonClolapes(index, item) { //二级折叠操作
        this.$set(item, 'flag', !item.flag);
        this.collpase_all_key[item.id] = !this.collpase_all_key[item.id];
        this.collpaes_key_second++;
      },
      openLastClolapes(index, item) { //三级折叠操作
        console.log(item) ;
        this.$set(item, 'flag', !item.flag);
        this.collpase_all_key[item.id] = !item.flag;
        this.collpaes_key_third++;
      },
      deletedFile(id) { //确定删除文件夹子
        this.$confirm('删除后不可恢复，请谨慎处理', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          let url = this.$store.state.api_url.dynamicDroup.del_file;
          let data = {
            "id": id,
            "object": "role"
          }
          let param = this.$generateParams(data);
          this.axios.post(url, param).then((res) => {
            let data = res.data;
            if (data.code == 200) {
              this.$success("删除成功")
              this.getDataCustom();
            } else {
              this.$error(res.data.msg)
            }
          }).catch((errors) => {
            console.log(errors);
          })
        }).catch(() => {

        });
      },
      deletedCustomList(id) { //确定删除Customlist
        this.$confirm('删除后不可恢复，请谨慎处理', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          let url = this.$store.state.api_url.dynamicDroup.del_dynamic_group;
          let data = {
            "id": id,
            "object": "role"
          }
          let param = this.$generateParams(data);
          this.axios.post(url, param).then((res) => {
            let data = res.data;
            if (data.code == 200) {
              this.$success("删除成功")
              this.getDataCustom();
            } else {
              this.$error(res.data.msg)
            }
          }).catch((errors) => {
            console.log(errors);
          })
        }).catch(() => {

        });
      },
      reWirteFile(item) {
        this.select_file_id = item.id;
        this.select_file_name = item.name;
        this.refile_name = true;
      },
      handleCommandFile(command, item) { //文件各种操作

        if (command == 'rename') {
          this.file_newname_key++;
          this.reWirteFile(item);
        }
        if (command == 'addcustom') {
          if (!this.$access('/data/dynamic/add')) {
            this.$confirm('当前角色无创建动态群组权限，请联系管理员进行处理', '提示', {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'error',
            })
            return ;
          }
          this.add_folder_id = item.id;
          this.create_report_key = true;
          this.create_report_num++;
          this.open_edit_group = false;
          this.rigth_show_num++;
        }
        if (command == 'delfile') {
          this.deletedFile(item.id);
        }
        if (command == 'showShare') {
          this.showShare(item);
        }
      },
      /**
       * 展示分享的对话框
       */
      showShare: function(item) {
        this.share_folder_id = item.id;
        this.shared_users = [];
        this.dialogShareFlag = true;
        this.queryAccess();
      },
      /**
       * 关闭分享对话框
       */
      closeShareDialog: function() {
        this.$count('MODEL', 'AUTHORITY_GROUP', {
          'folder_id': this.share_folder_id,
          type: 0
        }); //打点统计
        this.dialogShareFlag = false;
      },
      /**
       * 保存文件夹权限
       */
      saveAccess: function() {
        let data = {
          id: this.share_folder_id,
          access_user: this.shared_users
        }
        let requestData = this.$generateParams(data);
        let requestUrl = this.$store.state.api_url.dynamicDroup.set_access_user;
        this.axios.post(requestUrl, requestData).then(response => {
          if (response.data.code == 200) {
            this.shared_users = [];
            this.share_folder_id = '',
              this.$success('操作成功');
            this.dialogShareFlag = false;
            return;
          } else {
            this.$error();
          }
        }).catch(error => {
          console.log(error)
        })
      },
      /**
       * 查询文件夹权限
       */
      queryAccess: function() {
        let data = {
          id: this.share_folder_id,
        }
        let requestData = this.$generateParams(data);
        let requestUrl = this.$store.state.api_url.dynamicDroup.get_access_user;
        this.axios.post(requestUrl, requestData).then(response => {
          if (response.data.code == 200) {
            this.shared_users = response.data.data.access_user;
          } else {
            this.$error();
          }
        }).catch(error => {
          console.log(error)
        })
      },
      handleCustomList(command, item) { //customlist 操作
        if (command == 'rename') {
          this.rename_custom_id = item.id;
          this.select_custom_name = item.name;
          this.file_newname_key++;
          this.rename_custom_key = true;
        }
        if (command == 'remove') {
          this.remove_custom_id = item.id;
          this.remove_custom = true;
        }
        if (command == 'del') {
          this.deletedCustomList(item.id);
        }
      },
      createCustomItem() { //创建custom群组
        if (this.custom_left.docment_data.length == 0) {
          this.$error("请先创建文件夹");
          return;
        }
        if (this.$access('/data/dynamic/add')) {
          this.creat_custom = true;
        } else {
          this.$confirm('当前角色无创建动态群组权限，请联系管理员进行处理', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'error',
          })
        }
      },
      searchNeedfile(val) { //搜索文件夹操作
        this.filter_custom_data = JSON.parse(JSON.stringify(this.custom_left.docment_data));
        if (!val) {
          return;
        }
        let flatArr = this.flatFile(this.filter_custom_data); //扁平话文件夹 并且将文件默认打开
        let filterFile = flatArr.filter((item, index) => {
          return item.name.indexOf(val) > -1
        })
        if (filterFile.length == 0) {
          this.filter_custom_data = [];
          return;
        }
        let treeArr = this.getNeedFile(flatArr, filterFile);
        treeArr = Array.from(new Set(treeArr))
        let resultTree = this.toTree(treeArr);
        this.filter_custom_data = resultTree;
      },
      searchNeedcustom(val) { //搜索
        this.filter_custom_data = JSON.parse(JSON.stringify(this.custom_left.docment_data));
        if (!val) {
          this.handneedData(this.filter_custom_data, this.custom_left.custom_list);
          return;
        }
        let filterCustomlist = this.custom_left.custom_list.filter((item, index) => {
          return item.name.indexOf(val) > -1
        })
        if (filterCustomlist.length == 0) {
          this.filter_custom_data = [];
          return;
        }
        this.handneedData(this.filter_custom_data, filterCustomlist);
        let flatArr = this.flatFile(this.filter_custom_data); //扁平话文件夹 并且将文件默认打开
        let havecusFile = this.getHaveCusFile(flatArr); //得到有customlist的文件夹
        let treeArr = this.getNeedFile(flatArr, havecusFile);
        let resultTree = this.toTree(treeArr);
        this.filter_custom_data = resultTree;
      },
      getHaveCusFile(flatArr) { //得到有customlist的文件夹
        let result = [];
        result = flatArr.filter((item, index) => {
          return item.customList.length > 0
        })
        return result;
      },
      flatFile(tree, flatArr = []) { //扁平话文件夹 并且将文件默认打开
        tree.forEach((item, index) => {
          if (item.children.length > 0) {
            this.flatFile(item.children, flatArr)
          }
          item.flag = true;
          item.children = [];
          flatArr.push(item);
        });
        return flatArr;
      },
      toTree(data) { //将文件夹数组转化为树形结构
        let result = []
        if (!Array.isArray(data)) {
          return result
        }
        // data.forEach(item => {
        //     delete item.children;
        // });
        let map = {};
        data.forEach(item => {
          map[item.id] = item;
        });
        data.forEach(item => {
          let parent = map[item.fid];
          if (parent) {
            (parent.children || (parent.children = [])).push(item);
          } else {
            result.push(item);
          }
        });
        return result;
      },
      getNeedFile(flatArr, havecusFile) { //获取需要的文件夹
        let result = [];
        havecusFile.forEach((item, index) => {
          result.push(item)
          if (item.fid && item.level == 3) { //三级文件夹时候的操作
            flatArr.forEach((innerItem, innerIndex) => {
              if (innerItem.id == item.fid) {
                result.push(innerItem);
                flatArr.forEach((a, aindex) => {
                  if (a.id == innerItem.fid) {
                    result.push(a);
                  }
                })
              }
            })
          }
          if (item.fid && item.level == 2) {
            flatArr.forEach((innerItem, innerIndex) => {
              if (innerItem.id == item.fid) {
                result.push(innerItem);
              }
            })
          }
        })
        return result;
      },
      setCollKey(tree, obj) {
        // tree.forEach((item, index) => {
        //     console.log(item.children.length, item);
        //     if(item.children.length > 0) {
        //         this.setCollKey(item.children, obj)
        //     }
        // });
      },
      flagcllpAllkey(tree) { //循环处理所有的key，确定是否展开
        tree.forEach((item, index) => {
          if (item.children.length > 0) {
            this.flagcllpAllkey(item.children)
          }
          item.flag = this.collpase_all_key[item.id] ? this.collpase_all_key[item.id] : false;
        });
      },
      getDataCustom() {
        let url = this.$store.state.api_url.dynamicDroup.dynamic_group_list;
        let data = {
          "page": 1,
          "page_size": 100000,
          is_all: this.$access('/data/dynamic/add'),
        }
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.custom_left.custom_list = data.data.hits;
            // this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            //     this.loadingInstance2.close();
            // });
            this.getData()
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            this.loadingInstance2.close();
          });
          console.log(errors);
        })
      },
      getData() {
        let url = this.$store.state.api_url.dynamicDroup.find_folder_list;
        let data = {
          is_all: this.$access('/data/dynamic/add_folder'),
        }
        let param = this.$generateParams(data);
        this.axios.post(url, param).then((res) => {
          let data = res.data;
          if (data.code == 200) {
            this.custom_left.docment_data = data.data;
            if(data.data.length>0){
              this.open_folder_id = data.data[0].id ;
            }
            this.filter_custom_data = JSON.parse(JSON.stringify(this.custom_left.docment_data));
            this.handneedData(this.filter_custom_data, this.custom_left.custom_list);
            this.flagcllpAllkey(this.filter_custom_data);
            if (this.custom_left.custom_list.length > 0) { //右侧是否展示配置判断
              this.rigth_show_id = this.custom_left.custom_list[0].id;
              this.right_show_folder_id = this.custom_left.custom_list[0].folder_id;
              this.right_show_key = true;
            }
          } else {
            this.$error(res.data.msg)
          }
        }).catch((errors) => {
          console.log(errors);
        })
      },
    },
    mounted() {
      // this.setCollKey(this.custom_left.docment_data, this.collpase_all_key);
      // this.flagcllpAllkey(this.filter_custom_data);
      this.getUserList();
      this.getDataCustom();
    },
    created() {
      
    },
    destroyed() {
      // this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
      //     this.loadingInstance2.close();
      // });
    },
    watch: {
      refile_name: {
        handler() {
          if (!this.refile_name) {
            this.getDataCustom();
          }
        }
      },
      add_file: {
        handler() {
          if (!this.add_file) {
            this.getDataCustom()
          }
        }
      },
      remove_custom: {
        handler() {
          if (!this.remove_custom) {
            this.getDataCustom();
          }
        }
      },
      create_report_key: {
        handler() {
          if (!this.create_report_key) {
            this.getDataCustom();
          }
        }
      },
      rename_custom_key: {
        handler() {
          if (!this.rename_custom_key) {
            this.getDataCustom();
          }
        }
      },
    }
  }
</script>
<style>
  .group-table-home {
    height: calc(100vh - 184px) !important;
  }

  .custom-table-home .wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
  }

  .custom-table-home .wrapper .left {
    width: 19%;
    height: 100%;
    border-radius: 4px;
    padding: 5px 14px;
    box-sizing: border-box;
    background: #F8F8F8;
  }

  .custom-table-home .wrapper .right {
    width: 80%;
    border-radius: 4px;
    padding: 5px 0px 5px 8px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-box-shadow: 1px 1px 6px #ccc;
    box-shadow: 1px 1px 6px #ccc;
    margin: 0 0px 0 24px;
    position: relative;
  }

  .custom-table-home .wrapper .left .custom-header {
    height: 55px;
    width: 100%;
    border-bottom: 1px solid #ccc;
    line-height: 66px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .custom-table-home .wrapper .group-right {
    overflow: auto;
  }

  .custom-table-home .wrapper .left .font-i-style {
    font-size: 20px;
    margin: 0 3px;
    vertical-align: middle;
    cursor: pointer;
  }

  .custom-table-home .wrapper .left .close-icon {
    position: absolute;
    right: 6px;
    top: 26px;
    font-size: 17px;
    z-index: 1000;
    cursor: pointer;
  }


  /* 文件和群组区域 */
  .custom-docment-wra {
    width: 100%;
    height: calc(100vh - 216px);
    max-height: calc(100vh - 216px);
    overflow-y: auto;
  }

  .custom-docment-wra .custom-collapes-item {
    width: 100%;
    line-height: 32px;
  }

  .custom-docment-wra .custom-collapes-item .open-rotate-90 {
    transform: rotate(90deg);
  }

  .custom-docment-wra .doc-top {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    height: 32px;
    line-height: 32px;
  }

  .custom-docment-wra .doc-top:hover {
    background-color: #ECEEFE;
  }

  .custom-docment-wra .active-collapes-bg {
    background-color: #ECEEFE;
  }

  .custom-docment-wra .doc-top:hover .opcity-none-i {
    opacity: 1;
  }

  .custom-docment-wra .doc-top i {
    font-size: 16px;
  }

  .custom-docment-wra .doc-top .collapes-name {
    margin-left: 10px;
    display: inline-block;
    width: 60%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .custom-docment-wra .doc-top .collapes-name:hover {}

  .custom-docment-wra .first-i-class {
    display: inline-block;
    cursor: pointer;
    display: inline-block;
    height: 32px;
    width: 16px;
    /* vertical-align: top; */
    cursor: pointer;
    line-height: -47px;
    line-height: 32px;
    vertical-align: top;
    z-index: 10000;
  }

  .custom-docment-wra .opcity-none-i {
    opacity: 0;
  }

  .custom-docment-wra .custom-list {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 32px;
    line-height: 32px;
    margin-left: 24px;
  }

  .custom-docment-wra .custom-list .hover-color:hover {
    color: #0E73FF;
  }

  .green-ground {
    background: #0E73FF !important;
  }

  .right-show-table {
    width: 100%;
    height: 100%;
  }
</style>
