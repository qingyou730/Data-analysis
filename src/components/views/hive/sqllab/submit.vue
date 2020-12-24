<template>
  <div class="route-sql-content">
    <div class="sql-wrapper">
      <!-- left-start -->
      <div class="boxleft sql-clearfix fiexd-left" v-if="sql_left_key" ref="boxLeft">
        <div style="width:90%; min-height:100%;margin:-1px auto;overflow: auto;background:#272E36;position:relative">
          <!-- 摺叠面板 -->
          <el-collapse v-model="left_activeNames" @change="storageCollapse">
            <!-- 保存列表 -->
            <el-collapse-item name="1">
              <template slot="title">
                <i class="fa fa-file-text-o" aria-hidden="true" style="font-size:16px;margin-left:6px"></i><span style="margin-left:12px">保存列表</span>
              </template>
              <el-row>
                <person-collapse :key="leftRenderKey" :addHiveTabs="addHiveTabs" v-model="hiveValue" :rerenderperData="rerenderperData"></person-collapse>
              </el-row>
            </el-collapse-item>
            <el-collapse-item title="临时表" name="2" style="margin-bottom: 50px;">
              <template slot="title">
                <i class="fa fa-clock-o" aria-hidden="true" style="font-size:16px;margin-left:6px"></i><span style="margin-left:12px">临时表</span>
              </template>
              <el-row>
                <hive-controller :key="leftRenderKey + 'hive'" :addHiveTabs="addHiveTabs" v-model="hiveValue"
                  :rerenderhiveData="rerenderhiveData"></hive-controller>
              </el-row>
            </el-collapse-item>
          </el-collapse>

          <!-- footer -->
          <div class="boxleft-footer">
            <span style="color:transparent">列表权限</span>
            <i class="el-icon-d-arrow-left" @click="changeLeftKey"></i>
          </div>
        </div>
        <div style="text-align:center;position:absolute;right:0;top:50%;transform: rotate(90deg) translateX(-15px);">
          <i class="fa fa-bars" aria-hidden="true" style="color:#ccc;transform: scalex(2.5);z-index: 100;cursor: pointer;"
            ref="moveBoxleft"></i>
        </div>
      </div>
      <div v-if="!sql_left_key">
        <div class="left-no-content" v-if="!sql_left_key">
          <i class="el-icon-d-arrow-right" @click="changeLeftKey"></i>
        </div>
      </div>
      <!-- left end -->

      <div :class="['boxcenter', {'center-margin-right': sql_rigth_key},{'center-margin-left': sql_left_key}]" ref="boxcenter">
        <!--新的 START -->
        <div>
          <el-row style="border-bottom: 1px solid #CCCCCC;">
            <div style="border-bottom: none;" :class="['tab-inline-block', { 'active-tab-self': tab.is_activity}]"
              v-for="(tab,index) in tab_list" :key="index" @dblclick="changeTabName(tab)">
              <span class="tab-hover-color" @click="switchTab(index)">{{tab.title ? tab.title : '未命名查询'+(index+1)}}</span>
              <i class="el-icon-error deleted-tabs" @click="removeTab(index)"></i>
            </div>
            <span class="wrapper-add-tab">
              <i class="el-icon-plus add-tab" @click="addTab('','','','')"></i>
            </span>
          </el-row>

          <!-- SQL编辑器 start -->
          <el-row style="position: relative;">
            <el-col :span="24">
              <sql-editor v-model="activity_tab.sql" :editableTabs="editableTabs" :sqleditorHeight="sqleditorHeight"
                :key="focusNum" ref="midHeight"></sql-editor>
              <el-row style="padding-left:46px;background-color: #E8E8E8;height: 50px;line-height: 50px;">
                <el-button type="primary" style="width:70px;height: 26px" size="mini" @click="runQuery()" v-if="!activity_result.running"
                  class="el-icon-video-play"> 运行</el-button>
                <el-button type="info" style="width:70px;height: 26px" size="mini" @click="stopSetinterval()" v-if="activity_result.running"
                  class="el-icon-video-pause"> 停止</el-button>
                <el-tooltip effect="dark" content="保存" placement="bottom">
                  <i class="fa fa-floppy-o" aria-hidden="true" @click="saveQuery()" style="cursor:pointer;color: #0e73ff;font-size: 18px;margin:0 6px 0 12px"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="格式化sql" placement="bottom">
                  <i class="fa fa-align-justify" aria-hidden="true" @click="format(activity_tab, 0)" style="cursor:pointer;color: #0e73ff;font-size:18px;margin:0 6px"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="无需运行，数据结构将直接发送至邮箱" placement="bottom">
                  <i class="fa fa-download" aria-hidden="true" @click="submitDwonload()" style="cursor:pointer;color: #0e73ff;font-size:18px;margin:0 6px"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="创建物化表" placement="bottom">
                  <i class="el-icon-folder-add" @click="creatItemTab()" style="cursor:pointer;color: #0e73ff;font-size:20px;margin:0 6px"></i>
                </el-tooltip>
                <el-input placeholder="请输入内容" class="limit-input" v-model="activity_tab.limit" style="cursor:pointer;width:180px;height:32px"
                  @input="changeLimit($event)">
                  <template slot="prepend">limit</template>
                </el-input>
                <!-- <span style="color:red;">sql语句请不要输入limit限制条件</span> -->
              </el-row>
              <!-- <i :class="drawer? 'el-icon-arrow-right'+' '+'position-rigth-middle':'el-icon-arrow-left'+' '+'position-rigth-middle'"
                  @click="changePosition" style="cursor:pointer"></i> -->
            </el-col>
          </el-row>
          <!-- SQL编辑器 END  -->

        </div>
        <!--新的 END -->


        <!--结果 历史记录 start-->
        <!--加载数据和历史数据-->
        <div style="position: relative;" v-if="!activity_result.running&&activity_result.sql_status=='SUCCESS'&&activity_result.data.length>0&&tabName=='first'">
          <i class="fa fa-download" aria-hidden="true" @click="fileDwonload()" style="z-index: 99;cursor:pointer;color:#0e73ff;font-size:18px;margin:0 6px;position: absolute;top:29px;right:16px;"
            title="下载数据结果">
          </i>
        </div>
        <div style="text-align:center;cursor: pointer;z-index: 100;" ref="moveDiv">
          <i class="fa fa-bars" aria-hidden="true" style="color:#ccc;transform: scalex(2.5);"></i>
        </div>
        <el-tabs type="border-card" v-model="activeName" @tab-click="addNumber">

          <el-tab-pane label="运行结果" name="first">

            <!-- 查询中 -->
            <div v-if="activity_result.running">
              <p style="color:#ccc;" v-if="ACCEPTED_SQl && RUNNING_SQL==false">待调度...</p>
              <p style="color:#939496;" v-if="RUNNING_SQL">待调度, 已完成</p>
              <p style="color:#939496;" v-if="RUNNING_SQL">调度中</p>
              <div class="tab-pane-center">
                <i class="el-icon-loading"></i>
                <span v-if="1">加载中</span>
              </div>
            </div>

            <template v-if="!activity_result.running">
              <!-- 还没有结果的时候 -->
              <div style="color: #ccc; heigth: 50px; font-size: 16px" class="row-bg" v-if="!activity_result.sql_status">
                运行一个查询，以在此显示结果
              </div>
              <!--查询成功 start-->
              <div v-if="activity_result.sql_status=='SUCCESS'" :class="[{'sql-table-maxwidth': sql_left_key && sql_rigth_key}, {'full-sql-sreen': !sql_left_key && !sql_rigth_key}, {'half-sql-sreen': sql_left_key || sql_rigth_key}]">
                <!--<i class="fa fa-download" aria-hidden="true" @click="fileDwonload()" 
                    style="cursor:pointer;color: #0e73ff;font-size:18px;margin:0 6px;position: absolute;top: 5px;right: 0px;" title="全量下载">
                  </i>-->
                <!-- <el-table
                    v-if="activity_result.data.length>0"
                    :data="activity_result.data"
                    height="250"
                    border
                    style="width: 100%">
                    <el-table-column
                      v-for="(one, index) in activity_result.header" :key="index"
                      :prop="JSON.stringify(index)"
                      :label="one"
                      width="180">
                    </el-table-column>
                  </el-table> -->
                <table class="table table-bordered" v-if="activity_result.data.length>0" ref="downFile">
                  <thead ref="top_thead">
                    <tr>
                      <th v-for="(one, index) in activity_result.header" :key="index">{{one}}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(row, index) in  activity_result.data">
                      <tr :key="index">
                        <td v-for="(col, col_index)  in row" :key="col_index" style="cursor: pointer;" @click="transJson(col)">{{col}}</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
                <div v-else style="margin:20px auto 0; font-size:18px;color:#ccc; width:100%;text-align: center;">没有数据</div>
              </div>
              <!--查询成功 end -->

              <!--查询失败 -->
              <div v-if="activity_result.sql_status=='FAILED'" style="margin:20px auto 0; font-size:16px;color:red; width:100%;text-align:left;">
                {{activity_result.error}}
              </div>
            </template>
          </el-tab-pane>



          <el-tab-pane label="查询记录" name="second">
            <el-row style="margin-top: 10px">
              <el-select v-model="search_type" @change="searchType($event)">
                <el-option label="所有人" value="all"></el-option>
                <el-option label="部门" value="department"></el-option>
                <el-option label="仅自己" value="self"></el-option>
              </el-select>
            </el-row>
            <div style="width:100%;overflow-x:scroll">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>任务ID</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>创建人</th>
                    <th>执行花费时间</th>
                    <th style="width: 30%">sql</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item1, index) in tableData">

                    <tr :key="index">
                      <td>{{ item1.id}}</td>
                      <td>
                        <font :color="status_list[item1.status].color">{{status_list[item1.status].title}}</font>
                      </td>
                      <td>{{ $tools.formatTime(item1.submit_time) }}</td>
                      <td>{{ $store.state.user_list.hasOwnProperty(item1.create_role) ? $store.state.user_list[item1.create_role] : item1.create_role}}</td>
                      <td>{{ item1.run_time > 60 ? Math.floor(item1.run_time/60)+'分'+(item1.run_time%60)+'秒' : item1.run_time+'秒'}}</td>
                      <td style="cursor: pointer;" @click="formatSql(item1.sql)">
                        <pre style="white-space: nowrap;text-overflow: ellipsis;font-family: inherit;font-size:14px;overflow: hidden;width:40%;color:#0e73ff">
                                      {{item1.sql.slice(0,50)}}</pre>
                      </td>
                      <!-- 操作按钮 -->
                      <td style="padding: 6px 0;">
                        <el-row>
                          <!-- 查看成员 -->
                          <el-button v-if="$access('/hive/sqllab/submit')" type="text" size="mini" @click="linkToEdit(item1)"
                            :displayName="item1.id" id="searchMember" style="padding-left: 12px; box-sizing: border-box; outline: none">查看</el-button>
                          <el-button v-if="$access('/hive/sqllab/submit')&&item1.status=='ACCEPTED'||item1.status == 'RUNNING'"
                            type="text" size="mini" @click="stopSetinterval(item1.id)" :displayName="item1.id" id="searchMember"
                            style="padding-left: 12px; box-sizing: border-box; outline: none">取消任务</el-button>
                        </el-row>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
              :page-sizes="[10, 20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
              :total="total"></el-pagination>
          </el-tab-pane>
          <el-tab-pane label="下载记录" name="third">
            <hive-downLoad :key='hiveDownKey' :addHiveTabs="addHiveTabs" v-model="hiveValue" :reqDownkey="reqDownkey"></hive-downLoad>
          </el-tab-pane>
          <el-tab-pane label="物化表记录" name="four">
            <hive-mlist :key="objHiveKey" :rerenderhiveData="rerenderhiveData"></hive-mlist>
          </el-tab-pane>
        </el-tabs>
        <!--结果 历史记录 END-->

      </div>
      <div class="boxright fiexd-rigth-big" v-if="sql_rigth_key" ref="boxright">
        <div style="width:90%;backgroundColor:#272E36;height:100%;padding:12px 0 0 12px;box-sizing:border-box;margin:0 auto">
          <div style="margin-top:6px; border-bottom:1px solid transparent;background: #363D45;padding: 6px 2px;box-sizing:border-box;line-height:14px;line-height: 21px;">
            tips :
          </div>
          <div style="margin-top:6px; border-bottom:1px solid transparent;background: #363D45;box-sizing:border-box;line-height:14px;line-height: 21px;">
            1. 保存查询，只保存sql脚本，并不保 存运行结果。
          </div>
          <div style="margin-top:6px; border-bottom:1px solid transparent;background: #363D45;box-sizing:border-box;line-height:14px;line-height: 21px;">
            2. sql编辑区域下方的“下载”，是全量下载，在编辑完成代码之后即可操作，不必单击“运行”；数据表格右上方的“下载”，非全量下载，需在单击“运行”之后，才可操作。
          </div>
        </div>
        <div class="rigth-no-content" v-if="sql_rigth_key">
          <i class="el-icon-d-arrow-right" @click="changeRigthKey"></i>
        </div>
      </div>
      <div class="small-boxright fiexd-rigth" v-if="!sql_rigth_key" ref="boxrightSmall">
        <div class="rigth-no" v-if="!sql_rigth_key">
          <i class="el-icon-d-arrow-left" @click="changeRigthKey"></i>
        </div>
      </div>
    </div>









    <!-- 提交下载任务弹窗 -->
    <submit-download v-if="show_download" v-model="show_download" :sql="activity_tab.sql" :reqDownkey=reqDownkey
      :hiveDownKey="hiveDownKey" :addHiveDownKey="addHiveDownKey"></submit-download>



    <!--sql格式显示-->
    <format-sql :sql="sql" v-if="sqlDialog" v-model="sqlDialog"></format-sql>
    <!-- 保存sql弹窗-->
    <el-dialog title="保存查询" :visible.sync="storageDialog" width="30%">
      <span style="display: block">
        标签：
        <el-input type="text" style="margin-top: 5px" v-model="saveName"></el-input>
        <div style="height: 20px"></div>描述：
        <el-input type="textarea" :rows="2" placeholder="请输入内容" style="margin-top: 5px" v-model="saveDesc"></el-input>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="storageDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitSaveParam">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 建立物化表 -->
    <el-dialog title="建立物化表" :visible.sync="objFormDialog" width="30%">
      <el-form ref="data" label-width="100px" class="demo-dynamic" label-position="rigth">
        <!-- <el-form-item label="表名:">
          <el-input v-model="objFormName" style="width: 60%"></el-input>
        </el-form-item> -->
        <el-form-item label="描述信息:">
          <el-input v-model="objFormDesc" style="width: 60%"></el-input>
        </el-form-item>
        <el-form-item label="有效时长:">
          <el-select v-model="effective_days">
            <el-option v-for="item in timeArr" :value="item.value" :label="item.label" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="height:50px;"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="objFormDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitObjForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 重新名称tabName -->
    <el-dialog title="tab标签重新命名" :visible.sync="reTabNameDia" width="30%">
      <el-input v-model="tabRenameInput" placeholder="请输入新名字"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reTabNameDia = false">取 消</el-button>
        <el-button type="primary" @click="submitReName">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="提示" width="50%" :visible.sync="strJon_flag">
      <div class="str-to-json">
        <pre v-html="strJson"></pre>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="strJon_flag=false">取 消</el-button>
        <!-- <el-button type="primary" @click="centerDialogVisible = false"
          >确 定</el-button
        > -->
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import sqlEditor from "@/components/base/sqlEditor.vue";
  import submitDownload from "./submitDownload";
  import statusTable from "./statusTable.vue";
  import formatSql from "./formatSql.vue";
  import personCollapse from "./personCollapse.vue";
  import hiveController from "./hiveController.vue";
  import hiveMlist from "./hiveMlist.vue";
  import hiveDownLoad from "./downLoad.vue";





  import sqlFormatter from "sql-formatter";
  import FileSaver from "file-saver";


  export default {
    components: {
      sqlEditor,
      submitDownload,
      formatSql,
      statusTable,
      personCollapse,
      hiveController,
      hiveMlist,
      hiveDownLoad,
    },
    data() {
      return {
        tab_list: [ //选项卡列表
          // {
          //   title:'这个是我的名字112',
          //   sql:'',
          //   is_activity:false ,
          //   type:'sql',
          //   id:'',
          // },
        ],
        activity_tab: { //当前焦点的选项卡
        },
        activity_index: 0, //当前激活的tab 索引
        activity_result: { // 激活的tab页面 查询结果
          running: false, //是否在运行中
          //状态
          header: [],
          data: [],
          error: '',
          timer: null,
          sql_status: '',
        },
        activeName: 'first', //  结果 和 查询记录选项卡焦点项目
        reTabNameDia: false,
        tabRenameInput: '',
        sql_left_key: true, //sql左边区域控制开关
        sql_rigth_key: true, //sql右边区域控制开关
        left_activeNames: [], //折叠激活数组
        rerenderperData: 1, //保存成功重新渲染person組件
        rerenderhiveData: 1, //保存成功重新渲染hive組件
        tabName: 'first', //页面下载判断条件
        sqleditorHeight: 293, //sql editor 默认高度
        reqDownkey: 1,



        ACCEPTED_SQl: false,
        RUNNING_SQL: false,
        leftRenderKey: 1,
        hiveDownKey: 1,
        objHiveKey: 1,
        addHiveTabs: {},
        hiveValue: false,

        strJon_flag: false,
        strJson: '',
        objFormDialog: false,
        objFormName: "",
        objFormSql: "",
        objFormDesc: "",
        effective_days: 5,
        show_download: false,
        timeArr: [{
            label: "5天",
            value: 5
          },
          {
            label: "10天",
            value: 10
          },
          {
            label: "15天",
            value: 15
          },
          {
            label: "30天",
            value: 30
          },
        ],
        number: 1,
        sql: "",
        currentPage: 1,
        pageSize: 10,
        tableData: [],
        total: 0,
        delId: "",
        filter_type: "user",
        filter_value: "",
        search_type: "self",
        //Tabs start
        editableTabs: [{
          title: "未命名查询 ",
          name: "1",
          sql: "",
          sql_status: "",
          statusTable: [],
          sql_timer: 1,
          limitNum: 1000,
          disabled: false,
          activeName: "first",
        }, ],
        editableTabsValue: "1",
        tabIndex: 1,
        focusNum: 1,
        sqlDialog: false,
        storageDialog: false,
        saveDesc: "",
        saveName: "",
        saveSql: "",
        drawer: false,
        transTable: "",
        status_list: {
          SUCCESS: {
            title: "成功",
            color: "#3e8fff"
          },
          FAILED: {
            title: "失败",
            color: "red"
          },
          ACCEPTED: {
            title: "等待调度",
            color: "#A6A9AD"
          },
          RUNNING: {
            title: "正在运行",
            color: "#A6A9AD"
          },
          CANCELED: {
            title: "已取消",
            color: "red"
          },
          CANCEL: {
            title: "已取消",
            color: "red"
          }
        },
      };
    },
    methods: {
      fixTopTable() { //当查询结果太多时候 固定表头在最顶部
        window.onscroll = ()=> {
          // if(this.$refs.top_thead) {
          //   let container = this.$refs.top_thead;
          //   let style = container.getBoundingClientRect();
          //   let offsetH = container.offsetHeight;
            // if(style.top<62) {
            //   container.style.position = 'fixed';
            //   container.style.top = 62+'px';
            //   container.style.left = style.left+'px';
            //   console.log(style, offsetH);
            // }else{
            //   container.style.position = '';
            //   container.style.top ='';
            //   container.style.left = '';
            // }
          // }
        }
      },
      syntaxHighlight(json) {
        json = json
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return json.replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
          function(match) {
            var cls = "number";
            var color = "#805ac8";
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = "key";
                color = "#db5461";
              } else {
                cls = "string";
              }
            } else if (/true|false/.test(match)) {
              cls = "boolean";
            } else if (/null/.test(match)) {
              cls = "null";
            }
            return (
              '<span class="' +
              cls +
              '" style="color:' +
              color +
              '">' +
              match +
              "</span>"
            );
          }
        );
      },
      isJsonString(str) {
        try {
          if (typeof JSON.parse(str) == "object") {
            return true;
          }
        } catch (e) {}
        return false;
      },
      transJson(str) { //转化显示str为JSON
        let flag = this.isJsonString(str);
        if (flag) {
          this.strJson = str;
          this.strJson = JSON.parse(this.strJson);
          const str1 = JSON.stringify(
            this.strJson,
            undefined,
            4
          );
          this.strJson = str1;
          this.strJson = this.syntaxHighlight(str1);
          this.strJon_flag = true;
        }
      },
      //下载文件
      fileDwonload() {
        var html = "<html><head><meta charset='utf-8' /></head><body>" + this.$refs.downFile.outerHTML +
          "</body></html>";
        // 实例化一个Blob对象，其构造函数的第一个参数是包含文件内容的数组，第二个参数是包含文件类型属性的对象
        var blob = new Blob([html], {
          type: "application/vnd.ms-excel"
        });
        var a = document.createElement('a');

        // 利用URL.createObjectURL()方法为a元素生成blob URL
        a.href = URL.createObjectURL(blob);
        // 设置文件名
        a.download = "交互查询.xls";
        a.click();
      },
      //重新命名tab名称
      changeTabName() {
        this.reTabNameDia = true;
      },
      submitReName() {
        if (this.tabRenameInput.length < 1) {
          this.$error('tab名称不能为空，请输入名称');
          return;
        }
        this.activity_tab.title = this.tabRenameInput;
        this.reTabNameDia = false;
        this.tabRenameInput = '';
      },
      //建立物化表
      submitObjForm() {
        // if (!this.objFormName) {
        //   this.$error("请输入物化表名称");
        //   return;
        // }
        let requestUrl = this.$store.state.api_url.heightAnalysis.createObjForm;
        let data = {
          sql: this.objFormSql,
          // table_name: this.objFormName,
          desc: this.objFormDesc,
          // effective_days: this.effective_days,
          effective_days: this.effective_days,

        };
        let requestData = this.$generateParams(data);
        this.axios
          .post(requestUrl, requestData)
          .then((rep) => {
            if (rep.data.code == 200) {
              this.objFormName = "";
              this.objFormDesc = "";
              this.objFormDialog = false;
              // this.leftRenderKey++;
              this.rerenderhiveData++;
              this.$success("创建成功");
            } else {
              this.$error(rep.data.msg);
              this.objFormDialog = false;
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },
      creatItemTab(item) {
        if (this.activity_tab.sql == "") {
          this.$error("请先输入Sql");
          return;
        }
        this.objFormDialog = true;
        this.objFormSql = this.activity_tab.sql;
      },
      //重新渲染操作
      addNumber(val) {
        if (val.name == 'first') {
          this.tabName = 'first';
        } else if (val.name == 'second') {
          this.tabName = 'second';
          this.getData();
        } else if (val.name == "third") {
          this.tabName = 'third';
          this.hiveDownKey++
        } else {
          this.tabName = 'forth';
          this.objHiveKey++;
        }
      },
      addHiveDownKey() {
        this.addHiveTabs++;
        this.reqDownkey++;
      },
      //停止计时器
      stopSetinterval(id) {
        this.$confirm('此操作将取消查询，是否继续?', '确认信息', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ACCEPTED_SQl = false;
          this.RUNNING_SQL = false;
          clearInterval(this.activity_result.timer);
          let requestUrl = this.$store.state.api_url.heightAnalysis.stop_sql_task;
          let data = {
            sql_id: id ? id : this.activity_tab.task_id,
          };
          let requestData = this.$generateParams(data);
          this.axios
            .post(requestUrl, requestData)
            .then((rep) => {
              if (rep.data.code == 200) {
                this.activity_result.running = false;
                this.activity_result.sql_status = "";
                this.getData();
              } else {
                this.activity_result.running = false;
                this.activity_result.sql_status = 'FAILED'
                this.activity_result.error = rep.data.msg;
                this.activity_result.header = [];
                this.activity_result.data = [];
                this.getData();
                return;
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }).catch(() => {         
        });
      },

      //左侧栏事件
      changeLeftKey() {
        if (this.sql_left_key) {
          this.$refs.boxcenter.style.marginLeft = 24 + 'px';
        } else {
          this.$refs.boxcenter.style.marginLeft = 345 + 'px';
        }
        this.sql_left_key = !this.sql_left_key;
      },
      changeRigthKey() {
        this.sql_rigth_key = !this.sql_rigth_key;
      },
      storageCollapse(val) {
        if (val.includes('2')) {
          // this.leftRenderKey++;
          this.rerenderhiveData++;
        }
      },

      //下载记录
      downLoadLink() {
        window.open("/hive/sqllab/sqllabdownLoad");
      },
      objLinkTo() {
        window.open("/hive/mlist/list");
      },
      //设置localtion editTable事件
      localFun() {
        localStorage.setItem(
          `${this.$store.state.user.user_id}editableTabs`,
          JSON.stringify(this.editableTabs)
        );
      },
      //折叠事件
      collapesChange(val) {},
      /**
       * 运行查询
       */
      runQuery() {
        this.activeName = 'first';
        this.tabName = "first";
        var sql = this.activity_tab.sql;
        this.activity_tab.type = 'sql';
        if (!sql) {
          this.$error("SQL语句不允许为空");
          return;
        }
        let targetSql = "";
        let middle = "";
        if (sql.indexOf("limit") > 0 || sql.indexOf("LIMIT") > 0) {
          middle = sql;
          var arr = middle.split("");
          middle = arr.reverse().join("");
          middle = middle.toLowerCase();
          var index = middle.indexOf("timil");
          if (index < 10) {
            //若果limit写在末尾
            var length = middle.length;
            index = length - index - 5;
            targetSql = sql.substr(0, index);
            if (this.activity_tab.limit) {
              targetSql = `${targetSql} limit ${this.activity_tab.limit}`;
            } else {
              targetSql = `${targetSql} limit 1000`;
            }
          } else {
            //如果limit写在子查询内
            if (this.activity_tab.limit) {
              targetSql = `${sql} limit ${this.activity_tab.limit}`;
            } else {
              targetSql = `${sql} limit 1000`;
            }
          }
        } else {
          // sql = sql+' '+ 'limit'+' '+ 1000;
          if (this.activity_tab.limit) {
            targetSql = `${sql} limit ${this.activity_tab.limit}`;
          } else {
            targetSql = `${sql} limit 1000`;
          }
        }
        this.activity_result.running = true;
        this.activity_result.data = [];
        let requestUrl = this.$store.state.api_url.heightAnalysis.runSqlSearch;
        let data = {
          sql: targetSql,
        };
        let requestData = this.$generateParams(data);
        this.axios
          .post(requestUrl, requestData)
          .then((rep) => {
            if (rep.data.code == 200) {
              this.activity_tab.task_id = rep.data.data.task_id;
              this.statusFun();
            } else {
              this.activity_result.running = false;
              this.activity_result.sql_status = 'FAILED'
              this.activity_result.error = rep.data.msg;
              this.activity_result.header = [];
              this.activity_result.data = [];
              return;
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },
      /**
       * 查询状态
       */
      queryStatus: function() {
        var url = this.$store.state.api_url.sql.sql_status;
        let dataStatus = {
          sql_id: this.activity_tab.task_id,
        };
        let stausData = this.$generateParams(dataStatus);
        this.axios
          .post(url, stausData)
          .then((rep) => {
            if (rep.data.code == 200) {
              if (rep.data.data.sql_status == "ACCEPTED") {
                this.ACCEPTED_SQl = true;
                this.getData();
              }
              if (rep.data.data.sql_status == "RUNNING") {
                this.RUNNING_SQL = true;
                this.getData();
              }

              if (
                rep.data.data.sql_status == "SUCCESS" ||
                rep.data.data.sql_status == "FAILED" ||
                rep.data.data.sql_status == "CANCELED"
              ) {
                //关闭定时器
                this.ACCEPTED_SQl = false;
                this.RUNNING_SQL = false;
                clearInterval(this.activity_result.timer);
                this.activity_result.timer = null;
                this.queryResult();
                this.getData();
              }
            } else {
              this.activity_result.running = false;
              clearInterval(this.activity_result.timer);
              this.getData();
              this.$error(rep.data.msg);
            }
          })
          .catch((error) => {
            this.activity_result.running = false;
            clearInterval(this.activity_result.timer);
            console.log(error);
          });
      },
      /**
       * 查询结果
       */
      queryResult() {
        console.log(111);
        var resUrl = this.$store.state.api_url.sql.sql_result;
        let resData = {
          sql_id: this.activity_tab.task_id,
        };
        let resParam = this.$generateParams(resData);
        this.axios
          .post(resUrl, resParam)
          .then((rep) => {
            if (rep.data.code == 200) {
              var data = rep.data.data;
              if (data.sql_result[0].state.toUpperCase() == 'FAILED') {
                this.activity_result.sql_status = 'FAILED'
                this.activity_result.error = rep.data.data.sql_result[1].value;
                this.activity_result.header = [];
                this.activity_result.data = [];
                this.getData();
              }
              if (data.sql_result[0].state.toUpperCase() == 'SUCCESS') {
                this.activity_result.sql_status = 'SUCCESS';
                this.activity_result.error = '';
                this.activity_result.header = rep.data.data.sql_result[1].header;
                this.activity_result.data = rep.data.data.sql_result[1].result;
                this.getData();
              }
              this.activity_result.running = false;
            } else {
              this.activity_result.running = false;
              this.$error(rep.data.msg);
              this.activity_result.sql_status = 'FAILED'
              this.activity_result.error = rep.data.msg;
              this.activity_result.header = [];
              this.activity_result.data = [];
              this.getData();
            }
          })
          .catch((error) => {
            this.activity_result.running = false;
            this.$error("返回格式错误");
            this.activity_result.sql_status = 'FAILED'
            this.activity_result.error = '查询失败';
            this.activity_result.header = [];
            this.activity_result.data = [];
          });
      },

      /**
       * 查询当前激活的tab页面的结果
       */
      statusFun() {
        if (this.activity_tab.type != 'sql' && this.activity_tab.type != 'query') {
          return;
        }
        this.activity_result.data = [];
        if (!this.activity_tab.task_id) {
          this.activity_result.running = false;
          clearInterval(this.activity_result.timer);
          this.activity_result.data = [];
          return;
        }
        if (this.activity_result.timer) {
          clearInterval(this.activity_result.timer);
          this.activity_result.timer = null;
        }
        this.queryStatus();
        this.activity_result.running = true;
        this.activity_result.timer = setInterval(() => {
          this.queryStatus();
        }, 4000);


      },
      /**
       * 保存查询
       */
      saveQuery(val, sql) {
        this.saveName = this.activity_tab.title ? this.activity_tab.title : '未命名查询' + (this.activity_index + 1);
        this.storageDialog = true;
        this.saveSql = this.activity_tab.sql;
      },
      submitSaveParam() {
        if (!this.saveSql) {
          this.$error("请输入保存sql");
          return;
        }
        if (!this.saveName) {
          this.$error("请输入保存名称");
          return;
        }
        // if (!this.saveDesc) {
        //   this.$error("请输入保存描述");
        //   return;
        // }
        this.storageDialog = false;
        let requestUrl = "/mmp/sql/save_sql_task";
        let data = {
          sql: this.saveSql,
          task_name: this.saveName,
          desc: this.saveDesc,
        };
        let requestData = this.$generateParams(data);
        this.axios
          .post(requestUrl, requestData)
          .then((rep) => {
            if (rep.data.code == 200) {
              this.$success("保存成功");
              // this.leftRenderKey++;
              this.rerenderperData++;
            } else {
              this.$error(rep.data.msg);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },
      // 已保存查询
      lookQuery() {
        // this.$router.push('/hive/sqllab/storageList');
        window.open("/hive/sqllab/storageList");
      },
      submitDwonload() {
        this.activity_tab.sql = this.activity_tab.sql.replace(";", "").trim();
        if (!this.activity_tab.sql) {
          this.$error("sql不能为空请检查");
          return;
        }
        this.show_download = true;
        this.focusNum++;
      },
      format: function(item, index) {
        item.sql = sqlFormatter.format(item.sql);
        this.number++;
        this.focusNum++;
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
      // 当前页
      handleCurrentChange(val) {
        this.currentPage = val;
        this.getData();
      },
      //下载数量限制
      changeLimit(val) {
        if (val == "") {

        } else {
          if (!Number(val)) {
            this.$error("请输入数字");
            this.activity_tab.limit = 1000;
            return;
          }
          if (val > 1000) {
            this.$error(
              "立即查询最大只显示1000行，如果要更多信息请点击右侧【数据下载】"
            );
            this.activity_tab.limit = 1000;
            return;
          }
        }
      },
      changeString(val, item) {
        if (val == "") {
          item.limitNum = 1000;
        }
      },
      //获取数据
      getData() {
        this.loading = true;
        let requestUrl = "/mmp/sql/get_sql_list";
        let data = {
          page_size: this.pageSize,
          page: this.currentPage,
          object: "role",
          filter_type: this.filter_type,
          filter_value: this.filter_value,
        };
        let requestData = this.$generateParams(data);
        this.axios
          .post(requestUrl, requestData)
          .then((rep) => {
            this.loading = false;
            if (rep.data.code == 200) {
              this.tableData = rep.data.data.hits;
              this.total = rep.data.data.total_hits;
              this.totalPage = rep.data.data.total_page;
            } else {
              this.$error(rep.data.msg);
            }
          })
          .catch((error) => {
            this.loading = false;
            console.log(error);
          });
      },
      //查询筛选
      searchType(type) {
        if (type == "all") {
          this.filter_value = "all";
        }
        if (type == "self") {
          this.filter_type = "user";
          this.filter_value = this.$store.state.user.user_id;
        }
        if (type == "department") {
          this.filter_type = "group";
          this.filter_value = this.$store.state.user.group;
        }
        this.getData();
      },
      //查看成员方法
      goMember(table_name) {
        this.$router.push({
          path: "/hive/mlist/pick",
          query: {
            table_name: table_name,
          },
        });
      },
      //删除事件
      lookId(table_name) {
        this.delId = table_name;
        this.$confirm("此操作将永久删除该数据,不可恢复, 是否继续?", "提示", {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "danger",
          })
          .then(() => {
            this.delById();
          })
          .catch(() => {
            console.log("删除取消");
          });
      },
      delById() {
        var param = this.$generateParams({
          table_name: this.delId,
        });
        this.axios
          .post("/manager/hive/delete", param)
          .then((response) => {
            let data = response.data;
            if (data.code != 200) {
              console.log("接口有错返回");
            }
            if (data.code == 200) {
              this.$success("删除成功");
              this.getData();
              return;
            }
          })
          .catch((error) => {
            this.$error("接口请求失败");
          });
      },
      /**
       * @param {Object} title 选项卡名称
       * @param {Object} sql   选项卡sql
       * @param {Object} type  选项卡类型  query-查询记录  download-下载  save-已保存查询   sql-普通标签
       * @param {Object} id    任务ID
       */
      addTab: function(title, sql, type, id) {
        if (this.tab_list.length >= 8) {
          this.$error('您开的sql选项卡太多建议关闭几个！');
        }
        if (!title) {
          title = '';
        }
        if (!sql) {
          sql = '';
        }
        if (!type) {
          type = 'sql';
        }
        if (!id) {
          var task_id = '';
          id = this.$store.state.id_count++;
        } else {
          var task_id = id;
        }
        if (sql) {
          sql = sqlFormatter.format(sql);
        }
        var new_tab = {
          task_id: task_id,
          title: title,
          sql: sql,
          type: type,
          id: id,
          is_activity: false,
          limit: 1000,
        };
        for (var i in this.tab_list) {
          var v = this.tab_list[i];
          if (v.type == type && v.id == id) {
            this.tab_list[i] = new_tab;
            this.switchTab(i, type);
            return;
            break;
          }
        }
        this.tab_list.push(new_tab);
        // if(type == 'save' || type == 'download') {

        // }else{

        // }
        this.switchTab(this.tab_list.length - 1, type);
      },

      /**
       * 删除选项卡
       * @param {Object} index 要删除的索引
       */
      removeTab(index) {
        if (this.tab_list.length <= 1) {
          return;
        }
        this.tab_list.splice(index, 1);
        if (index == this.activity_index) {
          if (this.tab_list[index]) {
            this.switchTab(index)
          } else {
            this.switchTab(index - 1);
          }
        } else {
          this.updateActivityIndex();
        }
      },
      /**
       * 更新激活的tab索引
       */
      updateActivityIndex: function() {
        for (var i in this.tab_list) {
          if (this.tab_list[i].is_activity) {
            this.activity_index = i;
            break;
          }
        }
      },
      /**
       * 切换选项卡
       * @param {Object} index
       *
       */
      switchTab: function(index, type) {
        if (!index) {
          index = 0;
        }
        this.activity_tab = this.tab_list[index];
        this.activity_index = index;
        this.focusNum++;
        for (var i in this.tab_list) {
          if (i == index) {
            this.tab_list[i].is_activity = true;
          } else {
            this.tab_list[i].is_activity = false;
          }
        }
        this.activeName = 'first';
        if (type == "save" || type == "download") {
          return;
        } else {
          this.statusFun();
        }
      },
      //查看sql
      formatSql(sql) {
        this.sql = sql;
        this.sqlDialog = true;
      },
      changeDialog() {
        this.sqlDialog = false;
      },
      //跳转到sql编辑器中
      linkToEdit(item1) {
        this.tabName = 'first';
        this.addTab('', item1.sql, 'query', item1.id);
      },
      //查询页跳转进来操作
      linkFromStoreSave() {
        if (this.$route.query.linkSql) {
          var id = this.$route.query.id;
          var sql = this.$route.query.linkSql;
          var name = this.$route.query.name;
          var type = this.$route.query.type;
          this.addTab(name, sql, type, id);
        }
      },
      //折叠事件
      changePosition() {
        this.drawer = !this.drawer;
      },
      /**
       * 获取上回关闭页面之前存储的选项卡
       */
      getLastTabList: function() {
        var key = this.$store.state.user.user_id + '_sql_tab_list';
        var c = localStorage.getItem(key);
        if (!c || c == 'undefined' || c == 'null') {
          this.addTab('', '', '', '');
          return;
        }
        var tab_list = JSON.parse(c);
        this.tab_list = tab_list;
        var focus = false;
        for (var i in tab_list) {
          if (tab_list[i].is_activity) {
            this.switchTab(i);
            focus = true;
            break;
          }
        }
        if (!focus) {
          this.switchTab(0);
        }
      },
      fixedPosition() { //模仿左右侧固定定位
        // window.onscroll = ()=> {
        //   var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        //   if(this.$refs.boxLeft) {
        //     this.$refs.boxLeft.style.marginTop = scrollTop +'px';
        //     // this.$refs.boxLeft.style.transtion = 'all 200ms';
        //   }
        //   if(this.$refs.boxright) {
        //     this.$refs.boxright.style.marginTop = scrollTop +'px';
        //     // this.$refs.boxright.style.transtion = 'all 200ms';

        //   } 
        //   if(this.$refs.boxLeftSmall) {
        //     this.$refs.boxLeftSmall.style.marginTop = scrollTop + 'px';
        //     // this.$refs.boxLeftSmall.style.transtion = 'all 200ms';

        //   }
        //   if(this.$refs.boxrightSmall) {
        //     this.$refs.boxrightSmall.style.marginTop = scrollTop + 'px';
        //     // this.$refs.boxrightSmall.style.transtion = 'all 200ms';
        //   }

        // }
      },
    },
    created() {
      this.fixTopTable();
    },
    mounted() {


      // 已经存储的tab标签
      this.getLastTabList();

      //跳转过来的sql处理
      this.linkFromStoreSave();

      this.filter_type = "user";
      this.filter_value = this.$store.state.user.user_id;

      this.getData();
      this.fixedPosition();
      // path: "/hive/sqllab/submit"

      /* 
        拖拽编辑器事件
      */
      var oDragIcon = this.$refs.moveDiv;
      // 定义4个变量
      oDragIcon.onmousedown = (ev) => {
        var disY = 0; //鼠标按下时光标的Y值
        // this.disH = 300; // 拖拽前的高
        // 给div加点击事件
        var ev = ev || window.event;
        disY = ev.clientY; // 获取鼠标按下时光标Y的值
        var disH = this.$refs.midHeight.$el.offsetHeight; // 获取拖拽前div的高
        document.onmousemove = (ev) => {
          var ev = ev || window.event;
          //拖拽时为了对宽和高 限制一下范围，定义两个变量
          this.sqleditorHeight = ev.clientY - disY + disH;
          if (this.sqleditorHeight < 293) {
            this.sqleditorHeight = 293;
          }
          if (this.sqleditorHeight > 445) {
            this.sqleditorHeight = 445;
          }
        }
        document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
        }
      }


      /**
       boxLeft 设置伸缩事件 
      **/

    },
    updated() {
      this.$nextTick(() => {
        var oDragIcon = this.$refs.moveBoxleft;
        if (oDragIcon) {
          oDragIcon.onmousedown = (ev) => {

            var disX = 0; //鼠标按下时光标的X值
            var ev = ev || window.event;
            disX = ev.clientX; // 获取鼠标按下时光标Y的值
            var tardisX = this.$refs.boxLeft.offsetWidth; // 获取拖拽前div的寬
            document.onmousemove = (ev) => {
              var ev = ev || window.event;
              //拖拽时为了对宽和高 限制一下范围，定义两个变量
              var lastWidth = ev.clientX - disX + tardisX;
              if (lastWidth < 350) {
                lastWidth = 350;
              }
              if (lastWidth > 600) {
                lastWidth = 600;
              }
              this.$refs.boxLeft.style.width = lastWidth + 'px';
              this.$refs.boxcenter.style.marginLeft = lastWidth + 'px';

            }
            document.onmouseup = () => {
              document.onmousemove = null;
              document.onmouseup = null;
            }
          }
        }
      })
    },
    watch: {
      tab_list: { //sql数据保存   选项卡列表数据发生变化的时候存储到本地存储
        handler() {
          var key = this.$store.state.user.user_id + '_sql_tab_list';
          localStorage.setItem(key, JSON.stringify(this.tab_list));
        },
        deep: true,
      },
      hiveValue: {
        handler() {
          if (this.hiveValue) {
            this.addTab(this.addHiveTabs.sql.task_name, this.addHiveTabs.sql.sql, "save", this.addHiveTabs.sql.id);
            this.hiveValue = false;
          }
        }
      }
    },
    destroyed() {
      window.removeEventListener('scroll', this.fixedPosition);
    }
  };
</script>
<style>
  .timing-border {
    border-bottom: 1px solid #b3b3b3;
    padding-bottom: 5px;
  }

  .position-rigth-middle {
    display: inline-block;
    font-size: 46px;
    position: absolute;
    top: 50%;
    transform: translateY(-30px);
    right: 0;
    color: rgb(221, 217, 217);
    z-index: 10;
  }

  .display-drawer-block {
    display: block;
    margin: 5px 0px 5px 12px;
  }

  .tab-pane-center {
    width: 80px;
    margin: auto;
    line-height: 150px;
  }

  .tab-pane-center i {
    font-size: 24px;
  }

  .sqltab .el-tabs__nav-wrap {
    border-bottom: 1px solid #e4e7ed;
  }

  .sqltab>.el-tabs__header {
    width: fit-content;
    border: none;
  }

  .sqltab.el-tabs__header .is-top {
    width: fit-content;
    border: none;
  }


  /* 新的 */

  .tab-inline-block {
    display: inline-block;
    border: 1px solid #d3dce6;
    padding-left: 5px;
    padding: 0 8px;
    border-radius: 4px 4px 0 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 40px;
    min-width: 40px;
    line-height: 40px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .tab-inline-block:hover {
    color: #0e73ff;
  }

  .tab-hover-color {
    display: inline-block;
    padding: 0 6px;
  }

  .tab-hover-color:hover {
    color: #0e73ff;
  }

  .deleted-tabs {
    margin-right: 5px;
    color: #d3dce6;
  }

  .deleted-tabs:hover {
    color: #0e73ff;
  }

  .wrapper-add-tab {
    height: 40px;
    width: 40px;
    line-height: 40px;
    text-align: center;
    display: inline-block;
    color: #d3dce6;
  }

  .boxcenter .wrapper-add-tab .add-tab {
    vertical-align: middle;

    border: 1px solid #d3dce6;
    width: 18px;
    line-height: 18px !important;
    margin: 12px 0 9px 6px;
    border-radius: 3px;
    text-align: center;
    font-size: 12px;
    color: #d3dce6;
    cursor: pointer;
    -webkit-transition: all .15s;
    transition: all .15s;
  }

  .add-tab:hover {
    color: #0e73ff;
  }

  .active-tab-self {
    color: #0e73ff;
  }

  .sql-wrapper {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    position: relative;
    width: 100%;
    min-height: 92vh;
  }

  .boxright {
    flex: 0 0 330px;
    position: relative;
    background-color: #1C232B;
    color: #A3ACBB;
    max-height: calc(100vh - 66px);
  }

  .no-contnet-left-footer {
    max-height: calc(100vh - 66px);
    position: relative;
  }

  .boxleft {
    flex: 0 0 auto;
    min-width: 345px;
    position: relative;
    color: #A3ACBB;
    background-color: #1C232B;
    max-height: calc(100vh - 66px);
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .boxcenter {
    flex: 1;
    box-shadow: 1px 1px 6px #ccc;
    border-radius: 6px;
    min-height: calc(100vh - 66px);
    box-sizing: border-box;
    margin-left: 24px;
    margin-right: 24px;
    max-width: calc(100vw - 48px);
    overflow-x: scroll;
  }

  .center-margin-left {
    margin-left: 345px;
  }

  .center-margin-right {
    margin-right: 333px !important;
  }

  .sql-wrapper .boxleft-footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 32px;
    line-height: 32px;
    display: flex;
    justify-content: space-between;
    align-content: center;
    background-color: #272E36;
    border-top: 2px solid #303740;
  }

  .sql-wrapper .boxleft-footer i {
    font-size: 24px;
    line-height: 30px;
    padding-right: 3px;
    z-index: 5;
  }

  .sql-wrapper .left-no-content {
    position: fixed;
    bottom: 0;
    left: 2px;
  }

  .sql-wrapper .left-no-content i {
    font-size: 24px;
    z-index: 10000;
  }

  .rigth-no-content {
    display: block;
    width: 90%;
    position: absolute;
    bottom: 0;
    left: 16px;
    font-size: 24px;
    line-height: 36px;
    border-top: 2px solid #303740;
  }

  .small-boxright .rigth-no {}

  .small-boxright .rigth-no i {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 1000000;
    font-size: 24px;
  }

  /**
折叠样式修改
**/
  .boxleft .el-collapse-item .is-active {
    color: #fff;
  }

  .boxleft .el-collapse-item .el-collapse-item__header {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 36px;
    line-height: 36px;
    background-color: #363d45;
    color: #A3ACBB;
    cursor: pointer;
    border-bottom: 1px solid #ebeef5;
    font-size: 13px;
    font-weight: 500;
    -webkit-transition: border-bottom-color .3s;
    transition: border-bottom-color .3s;
    outline: none;
    margin: 6px 0;
    border-bottom: none;
  }

  .boxleft .el-collapse-item .el-collapse-item__header:hover {
    color: #fff;
  }

  .boxleft .el-collapse {
    border-bottom: none;
  }

  .boxleft .el-collapse .el-collapse-item .el-collapse-item__wrap {
    background-color: #272E36 !important;
    color: #A3ACBB !important;
    border-bottom: none;
  }

  .boxleft .el-collapse .el-collapse-item .el-collapse-item__wrap:hover {
    color: #fff;
  }

  .boxleft .el-collapse .el-collapse-item .el-collapse-item__content {
    margin-left: 28px;
    color: #A3ACBB !important;
    font-size: 13px;
    line-height: 1.7692307692;
    padding-bottom: 1px;
  }

  .boxleft .el-collapse .el-collapse-item .el-collapse-item__content:hover {
    color: #fff;
  }

  .limit-input .el-input__inner {
    height: 32px
  }

  .limit-input .el-input-group__prepend {
    background: #E8E8E8;
  }

  .route-sql-content {
    width: 100%;
    min-height: 100%;
  }

  .boxcenter .el-tabs__header .el-tabs__nav-wrap {
    background-color: #E8E8E8;
  }

  .sql-clearfix:after {
    /*伪元素是行内元素 正常浏览器清除浮动方法*/
    content: "";
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
  }

  .boxcenter .el-tabs {
    min-height: calc(100vh - 470px);
  }

  .boxcenter .sql-table-maxwidth {
    max-width: calc(100vw - 730px);
    overflow-x: scroll;
  }

  .full-sql-sreen {
    max-width: calc(100vw - 90px);
    overflow-x: scroll;
  }

  .half-sql-sreen {
    max-width: calc(100vw - 412px);
    overflow-x: scroll;
  }

  .str-to-json {
    width: 90%;
    height: 60vh;
  }

  .str-to-json pre {
    outline: 1px solid #ccc;
    padding: 5px;
    margin: 5px;
    font-weight: bold;
    font-size: 16px;
    overflow: auto;
    width: 100%;
    height: 100%;
  }

  .str-to-json pre .key {
    color: #33adff;
  }

  .str-to-json .string {
    color: #eece18;
  }

  .fiexd-left {
    position: fixed;
    z-index: 100;
    height: calc(100vh - 66px);
    top: 63px;
    left: 3px;
  }

  .fiexd-rigth-big {
    width: 330px;
    position: fixed;
    z-index: 100;
    height: calc(100vh - 66px);
    top: 63px;
    right: 3px;
  }
</style>
