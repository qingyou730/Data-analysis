<template>
  <div>
    <el-table v-if="data.length>0 && select.length>0" class="remain-table" :data="select" :cell-style="setCellColor"   @cell-mouse-leave="handleMouseLeave" @cell-mouse-enter='handleMouseEnter'
      @cell-click="handleMouseClick" header-aglin="center" align="center">
      <el-table-column v-for="(col,index) in Object.keys(select[0])" :key="index" :label="col" v-if="index == 0" header-align='center' align='center'>
        <template slot-scope="scope">
          <el-image style="width: 20px; vertical-align:text-top;" :src="extensionIcon"></el-image>
          <p style="display: inline;vertical-position: center;">{{ scope.row.初始日期 }}({{new Date(scope.row.初始日期).getDay() | getweek}})</p>
        </template>
      </el-table-column>
      <!-- <el-table-column v-for="(col,index) in Object.keys(select[0])" :key="index" :prop="col" :label="col" v-if="index ==1 || index == 2" :render-header="icons" header-align='center'
       align='center'>
        <template slot-scope="scope">
               <p>{{ scope.row[col] }}</p>
               <p>{{ scope.row[col] / scope.row.总数 * 100 | rounding }} %</p>
        </template>
      </el-table-column> -->
      <el-table-column v-for="(col,index) in Object.keys(select[0])" :key="index" :prop="col" :label="col" v-if="index ==1" :render-header="icons" header-align='center'
       align='center'>
        <template slot-scope="scope">
               <p>{{ scope.row[col] }}</p>
               <p>{{ scope.row[col] / scope.row.总数 * 100 | rounding }} %</p>
        </template>
      </el-table-column>
      <el-table-column v-for="(col,index) in Object.keys(select[0])" :key="index" :prop="col" :label="col" v-if="index > 1" :render-header="icons" header-align='center'
       align='center' :show-overflow-tooltip="true">

        <template slot-scope="scope">
          <el-tooltip class="item-ding" effect="dark"  placement="top">
            <div slot="content">"{{scope.row[col]}}" : 在{{ titDate }}进行【初始事件】的{{scope.row.总数}}人中,有{{scope.row[col]}}人在<br/>{{col}}进行了【回访事件】，占比{{ scope.row[col] / scope.row.总数 * 100 | rounding }}% 。 </div>
            <div>
               <p>{{ scope.row[col] }}</p>
               <p>{{ scope.row[col] / scope.row.总数 * 100 | rounding }} %</p>
            </div>
          </el-tooltip>
        </template>

      </el-table-column>
    </el-table>
    <el-dialog v-if="data.length>0 && select.length>0" :title="selectedDate + '分组详情'" :visible.sync="showDate" width="90%" class="page-dialog">
      <el-table :data="pageTable" class="remain-table" :cell-style="setCellColor"  @cell-mouse-leave="handleMouseLeave"
        @cell-click="handleMouseClick" header-aglin="center" align="center">
        <el-table-column v-for="(col,index) in Object.keys(group[0])" :key="col" :prop="col" :label="col" v-if="col != '初始日期'" header-align='center' align='center'>
        </el-table-column>

        <!-- index ==1 || index ==2 -->
        <el-table-column v-for="(col,index) in Object.keys(select[0])" :key="index" :prop="col" :label="col" v-if="index ==1" :render-header="icons" header-align='center'
        align='center'>
          <template slot-scope="scope">
                <p>{{ scope.row[col] }}</p>
                <p>{{ scope.row[col] / scope.row.总数 * 100 | rounding }} %</p>
          </template>
        </el-table-column>
        <el-table-column v-for="(col,index) in Object.keys(select[0])" :key="index" :prop="col" :label="col" v-if="index > 1" :render-header="icons" header-align='center'
          align='center' :show-overflow-tooltip="true">

            <template slot-scope="scope">
              <el-tooltip class="item-ding" effect="dark"  placement="top">
                <div slot="content">"{{scope.row[col]}}" : 在{{ titDate }}进行【初始事件】的{{scope.row.总数}}人中,有{{scope.row[col]}}人在<br/>{{col}}进行了【回访事件】，占比{{ scope.row[col] / scope.row.总数 * 100 | rounding }}% 。</div>
                <div>
                  <p>{{ scope.row[col] }}</p>
                  <p>{{ scope.row[col] / scope.row.总数 * 100 | rounding }} %</p>
                </div>
              </el-tooltip>
            </template>

        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
            :page-sizes="[6]"
            :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
            :total="all_page_data_count">
          </el-pagination>
      </span>
    </el-dialog>

    <el-dialog title="保存群组" :before-close="closeGroupDialog" :visible.sync="dialogVisible" width="30%">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="群组名称">
          <el-input v-model="form.name" placeholder="请输入群组名称"></el-input>
        </el-form-item>
        <el-form-item label="群组备注">
          <el-input type="textarea" v-model="form.desc" placeholder="请输入50字以内的群组描述"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即创建</el-button>
          <el-button @click="closeGroupDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    props: ['show_data', 'group_field', 'select_field', 'fields_mapping','task_id'],
    data() {
      return {
        data: [],
        group: [],
        select: [],
        dateTable: [],
        value: [],
        dialogVisible: false,
        currentPage: 1,
        pageSize: 6,
        extensionIcon: "/static/images/icon/extension.png",
        form: {
          name: '',
          group_num:0,
          desc: '',
          grout_id:''
        },
        totalData: [],
        showTotal: true,
        showDate: false,
        selectedDate: '',
        titleContent: '',
        titDate: '',
        pageTable: [],
        all_page_data_count:0 ,
      }
    },
    filters: {
     rounding (value) {
     return value.toFixed(2)
     },
     getweek(value) {
       let day = '';
       switch(value) {
         case 0:
            day = "日";
            break;
        case 1:
            day = "一";
            break;
        case 2:
            day = "二";
            break;
        case 3:
            day = "三";
            break;
        case 4:
            day = "四";
            break;
        case 5:
            day = "五";
            break;
        case 6:
            day = "六";
       }
       return day;
     }
    },
    mounted() {
      this.data = this.show_data;
      if(this.data.length <1){
        return ;
      }
      this.sortField() ;
      let date_array = JSON.parse(JSON.stringify(this.data))
      let filter_data = JSON.parse(JSON.stringify(this.data))
      for (var i = 0, len = date_array.length; i < len; i++) {
        for (var j = i + 1, len = date_array.length; j < len; j++) {
          if (date_array[i].初始日期 === date_array[j].初始日期) {
            date_array.splice(j, 1);
            j--; // 每删除一个数j的值就减1
            len--; // j值减小时len也要相应减1（减少循环次数，节省性能）
          }
        }
      }

      let sameDateArray = []
      for (let date of date_array) {
        let dateTotal = []
        for (let i = 0; i < filter_data.length; i++) {
          if (date.初始日期 == filter_data[i].初始日期) {
            dateTotal.push(filter_data[i])
            filter_data.splice(i, 1)
            i--
          }
        }
        sameDateArray.push(dateTotal)
      }

      for (let date of sameDateArray) {
        let total = date[0]
        for (let i = 1; i < date.length; i++) {
          for (let item in total) {
            if (this.select_field.indexOf(item) >= 0) {
              total[item] = total[item] + date[i][item]
            }
          }
        }
        this.totalData.push(total)
      }

      for (let obj of this.totalData) {
        let item = {}
        for (let field of this.group_field) {
          if (obj.hasOwnProperty(field)) {
            item[field] = obj[field]
          }
        }
        this.group.push(item)
      }

      var where = [];
      let data_array = []
      for (var v of this.group_field) {
        if (v != '初始日期') {
          where.push(' `' + v + '` =' + " '全部' ");
        }
      }
      if (where.length > 0) {
        where = where.join(' AND ');
      } else {
        where = '';
      }
      var param = this.$generateParams({
        task_id: this.task_id,
        order_fields: {
          初始日期:'true'
        },
        page: 1,
        page_size: 500,
        where: where,
      });
      this.axios.post(this.$store.state.api_url.task.find_data,param).then((res) => {
          var data = res.data;
          if (data.code == 200) {
            data = data.data.table.table;
            if (data.length > 0) {
              data_array = data;
            }
          } else {
            data_array = [];
          }
          for (let obj of data_array) {
            let item = {}
            item["初始日期"] = obj["初始日期"]
            for (let field of this.select_field) {
              if (obj.hasOwnProperty(field)) {
                item[field] = obj[field]
              }
            }
            this.select.push(item)
          }
          for (var i = 0; i < this.select.length; i++) {
            for (var j = i + 1; j < this.select.length; j++) {
              if (this.select[i]["初始日期"] == this.select[j]["初始日期"]) { //第一个等同于第二个，splice方法删除第二个
                this.select.splice(j, 1);
                j--;
              }
            }
          }
        }).catch((error) => {
          console.log(error);
          this.$error("加载数据失败");
        });
    },
    methods: {
      closeGroupDialog:function(e){
        this.$count('CHART','GROUP_CLICK',{task_id:this.task_id,'type':0});
        this.dialogVisible = false;
      },
      sortField:function(){
        this.select_field.sort(function(a,b){
          var patt =  /第\d+日/ ;;   /*定义验证表达式*/
          if(patt.test(a)){
             var day_a = parseInt(a.replace('第','').replace('日',''));
          }else{
            var day_a = 0;
          }
          if(patt.test(b)){
             var day_b = parseInt(b.replace('第','').replace('日',''));
          }else{
            var day_b = 0;
          }
          return day_a-day_b ;
        });
      },
      setCellColor: function(e) { //{row,column,rowIndex,columnIndex}
        if (e.column.label == "当日") {
          return {
            background: '#409eff!important',
          }
        }
      },
      handleMouseEnter: function(row, column, cell, event) {
        // if(column.label == '当日' || column.label == '初始日期' || column.label == '总数') {
        //   this.titleContent='';
        //   return;
        // }
        // console.log(row, column, cell, event);
        // console.log('在6-26进行登录的161人中，有26人在第1日进行了登录，占比16.15%');
        // let rate = (row[column.label]/row.总数)*100;
        // rate = rate.toFixed(2);
        // this.titleContent=`在${row.初始日期}进行登录的${row.总数}人中\n,有${row[column.label]}人在第1日进行了登录，占比${rate}%`
        // cell.style.cursor = 'pointer';
        // if (column.label == "当日" || column.label == "初始日期") {
        //   return;
        // }
        // cell.style.background = "#b9d8f8";
        let month = new Date(row.初始日期).getMonth() + 1;
        let day = new Date(row.初始日期).getDate();
        let resDate = month + '-' + day;
        this.titDate = resDate;
      },

      handleMouseLeave: function(row, column, cell, event) {
        if (column.label == "当日") {
          return;
        }
        cell.style.background = "#ffffff";
      },

      handleMouseClick: function(row, column, cell, event) {
        if (column.label != "初始日期" && this.select.find(v => {
            return v.hasOwnProperty(column.label)
          })) {
          let date = row.初始日期
          let day = this.exchangeDay(column.label)
          let isDate = false
          for(let items of this.group){
            for(let item in items){
              if(row.hasOwnProperty(item) && item != '初始日期'){
                isDate = true
              }
            }
          }
          let finalName = date
          if(isDate){
            for(let item in this.group[0]){
              if(item != '初始日期'){
                 finalName = finalName + '_' + row[item]
              }
            }
          }else{
            for(let item in this.group[0]){
              if(item != '初始日期'){
                 finalName += '_全部'
              }
            }
          }
          finalName = finalName +'_' + day
          this.form.grout_id = finalName;
          var  group_num =  row[column.label];
          this.form.group_num = group_num;
          this.form.name = '';
          this.form.desc = '';
          if(row[column.label]) {
            this.$count('CHART','GROUP_CLICK',{task_id:this.task_id,'type':2});//打点统计
            this.dialogVisible = true;
          }else{
            this.$error('群组数据为空，不支持保存');
          }
        } else if (column.label == "初始日期") {
          this.showTotal = false
          this.showDate = true
          this.currentPage = 1
          let date = row.初始日期
          this.dateTable = []
          this.selectedDate = date
          for (let item of this.data) {
            if (item.初始日期 == date) {
              this.dateTable.push(item);
            }
          }
          this.$count('CHART','EXPAND_DATA',{task_id:this.task_id});//打点统计
          this.handleCurrentChange(this.currentPage);
        }
      },

      onSubmit: function() {
        if(this.form.name == ''){
          this.$error("请完群组名称");
          this.dialogVisible = false
          return
        }
        let param = {
          desc: this.form.desc,
          part_id: this.form.grout_id,
          task_id: this.task_id,
          name: this.form.name,
          group_num: this.form.group_num,
          object: this.$store.state.linkage.object
        }
        let data = this.$generateParams(param)
        this.$count('CHART','GROUP_CLICK',{task_id:this.task_id,'type':1});
        this.axios.post(this.$store.state.api_url.keep.create_group,data).then(rep => {
          if(rep.data.code == 200){
            this.$success("留存群组保存成功")
          }else{
            this.$error("留存群组保存失败:" +rep.data.msg)
          }
        }).catch(error => {
            this.$error("留存群组保存失败")
          })
        this.dialogVisible = false
      },

      exchangeDay(day) {
        let enDay = ''
        for(let field in this.fields_mapping){
          if(this.fields_mapping[field] == day){
            enDay = field
          }
        }
       return enDay
      },

      handleSizeChange(val) {
        this.pageSize = val;
        this.handleCurrentChange(this.currentPage);
      },
      // 当前页
      handleCurrentChange(val) {
        this.currentPage = val;
        //排除所有分组字段数据是 全部的 数据
        let pageData =   JSON.parse(JSON.stringify(this.dateTable));
        for(var index in pageData){
          var row = pageData[index] ;
          var delete_flag = true ;
          for(var g of  this.group_field){
            if(g == '初始日期'){
              continue ;
            }
            if(row[g]!='全部'){
              delete_flag = false;
              break ;
            }
          }
          if(delete_flag){
            pageData.splice(index,1) ;
            break ;
          }
        }
        this.all_page_data_count = pageData.length ;
        //排序int字段
        let key = '';
        for( let name of Object.keys(this.group[0])){
          if(name != '初始日期') {
            key = name;
          }
        }
        pageData.sort(function(a, b) {
          let typeLength =  a[key].length;
          if(typeLength > 6) {
            return;
          }
          return a[key] - b[key];
        });
        let start = this.currentPage == 1 ? 0 : this.pageSize*(this.currentPage - 1);
        let end = start + this.pageSize;
        pageData = pageData.slice(start, end);
        this.pageTable = pageData;
      },

      closeDateTable() {
        this.showTotal = true
        this.showDate = false
      },
      //问号提示
      icons(h,{column}){
        if(column.label == '当日') {
          const inReviews = '【当日】留存指触发初始事件的【当日】，同时也触发了回访事件（不区分两者的先后顺序)';
            return h(
        　　　　    'div', [
                    h('span', column.label),
                    h('el-tooltip', {
                        props: {
                            placement: 'top'
                        }
                    }, [
                        h('div', {
                            slot: 'content',
                            style: {
                                'width':'250px',
                                whiteSpace: 'normal',
                                'margin-bottom': '10px'
                            }
                        }, inReviews),
                        h('i', {
                            class: 'el-icon-question icon-help',
                            style: 'font-size: 16px;margin-left: 8px'
                        })
                    ],)
                ]
        　　　　 )
        }else{
          return h(
        　　　　    'div', [
                    h('span', column.label),
                ]
        　　　　 )
        }

      },
      getOptionLabel(item){
        let str = ''
        for(let groupItem in this.group[0]){
          for(let label in item){
            if(label == '初始日期'){
              continue
            }
            if(label == groupItem){
              str =str + item[label] + ','
            }
          }
        }
        return str
      },
    }
  }
</script>

<style>
.remain-table tr:hover>td {
   background: #b9d8f8!important;
   cursor: pointer;
}
.remain-table thead {
  color: #505050 !important;
  font-weight: bold !important;
}
.page-dialog .el-dialog__footer{
    padding: 52px;
    padding-top: 10px;
    text-align: right;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
</style>
