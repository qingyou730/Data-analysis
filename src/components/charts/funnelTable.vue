<template>
  <div id="funnel_chart">
    <div class="funnel-wrapper" style="margin-left: 61px;">
      <div class="funnel-top">
        <div class="top-square">总转化率{{computeRate('all',all_data)}}</div>
        <div class="top-triangle"></div>
      </div>
      <template v-for="(step,k) in select_field">
        <div :key="'step'+k" class="funnel-middle">
          <span class="funnel-step">{{step}}</span>
          <span class="funnel-num">{{formatNumber(all_data[step])}}人</span>
        </div>
        <div :key="'rate'+k" v-if="k!=(select_field.length-1)" class="funnel-bottom">
          <span class="bottom-square">{{computeRate(k,all_data)}}</span>
          <span class="bottom-triangle"></span>
        </div>
      </template>
    </div>


    <p>&nbsp;</p>

    <table class="table bordered table-data" v-if="data.length>0" style="margin-left: 60px;">
      <thead>
        <tr>
          <th>&nbsp;</th>
          <th v-for="(v,k) in group_field" :key="'g'+ k" width="150px">
            {{v}}
          </th>
          <th class="text-center" width="150px">总体转换</th>
          <th class="text-center " v-for="(v,k) in select_field" :key="'s'+ k" width="150px">
            {{v}}
          </th>
        </tr>
      </thead>
      <tbody>
        
        <!-- 全部行 -->
        <tr>
          <td>
            <i :class="unfold ? 'el-icon-caret-right unfold color-primary' : 'el-icon-caret-bottom unfold color-primary' "
              @click="doFold" style="position:inherit;color:#000000;"></i>
          </td>
          <td v-for="(v,k) in group_field" :key="'gr'+ k">
            <p>{{all_data[v]}}</p>
          </td>
          <td class="text-center">
            <p>{{formatNumber(all_data[select_field[select_field.length-1]])}}</p>
            <p>{{computeRate('all',all_data)}}</p>
          </td>
          <td class="text-center pointer" v-for="(v,k) in select_field" :key="'sr'+ k" @click="initGroup(k,all_data)">
            <p>{{formatNumber(all_data[v])}}</p>
            <p v-if="k!=(select_field.length-1)">{{computeRate(k,all_data)}}</p>
            <p v-else>--</p>
          </td>
        </tr>
        <!-- 除去全部行 -->
        <tr v-if="unfold" v-for="(row,index) in data" :key="index">
          <td>&nbsp;</td>
          <td v-for="(v,k) in group_field" :key="'gr'+ k">
            <p>{{row[v]}}</p>
          </td>
          <td class="text-center">
            <p>{{formatNumber(row[select_field[select_field.length-1]])}}</p>
            <p>{{computeRate('all',row)}}</p>
          </td>
          <td class="text-center pointer" v-for="(v,k) in select_field" :key="'sr'+ k" @click="initGroup(k,row)">
            <p>{{formatNumber(row[v])}}</p>
            <p v-if="k!=(select_field.length-1)">{{computeRate(k,row)}}</p>
            <p v-else>--</p>
          </td>
        </tr>
      </tbody>
    </table>

    <!--保存群组弹框-->
    <el-dialog title="保存群组" :before-close="closeGroupDialog" :visible.sync="dialogVisible" width="30%">
      <el-form ref="form" :model="group" label-width="80px">
        <el-form-item label="群组名称">
          <el-input v-model="group.name" placeholder="请输入群组名称"></el-input>
        </el-form-item>
        <el-form-item label="群组备注">
          <el-input type="textarea" v-model="group.desc" placeholder="请输入50字以内的群组描述"></el-input>
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
    props: ['show_data', 'x', 'y', 'agg_type', "show_col", "wantUseclo", "group_field", "select_field","task_id"],
    data() {
      return {
        unfold:false ,
        dialogVisible: false, //是否显示群组对话框
        data: [],
        all_data: {}, //全部  的那行数据
        group: {
          "name": '',
          "desc": "",
          "part_id": '',
          "number":0 ,
        }
      }
    },
    created() {
      if (this.show_col == 'otherCol') {
        var cloData = [];
        this.show_data.forEach((key, index) => {
          cloData[index] = {};
          for (let item of this.wantUseclo) {
            for (let allkey in key) {
              if (allkey == item) {
                cloData[index][item] = key[allkey];
              }
            }
          }
        })
        this.data = cloData;
      } else {
        this.data = this.show_data;
      }
    },
    mounted() {
      this.all_data = this.data[this.data.length - 1];
      this.data.splice(this.data.length - 1,1);
      //Number(123456).toLocaleString()
    },
    methods: {
      doFold: function() {
        this.unfold = !this.unfold;
      },
      /**
       * @param {Object} index
       * @param {Object} row
       * 点击TD开始保存群组
       */
      initGroup: function(index, row) {
        
        this.group.name = '';
        this.group.desc = '';
        this.group.number = row[this.select_field[index]];
        this.dialogVisible = true;
        var part_id = '';
        var values = [];
        for (var g of this.group_field) {
          values.push(row[g]);
        }
        part_id = values.join('_');
        part_id += '_' + 'step'+(index + 1)+'_';
        this.group.part_id = part_id;
        console.log(this.group);
      },
      /**
       * @param {Object}关闭群组
       */
      closeGroupDialog: function(e) {
        this.$count('CHART', 'GROUP_CLICK', {
          task_id: this.task_id,
          'type': 0
        });
        this.dialogVisible = false;
      },
      /**
       * 格式化数据成 每三个加个逗号的
       * @param {Object} n
       */
      formatNumber: function(n) {
        var c = Number(n).toLocaleString();
        return c;
      },
      /**
       * @param {Object} step
       * @param {Object} row
       * 计算转化率
       */
      computeRate: function(index, row) {
        if (index == 'all') {
          var big = row[this.select_field[0]];
          var small = row[this.select_field[this.select_field.length - 1]];
          return (small / big * 100).toFixed(2) + '%';
        } else {
          var big = row[this.select_field[index]];
          var small = row[this.select_field[index + 1]];
          return (small / big * 100).toFixed(2) + '%';
        }
      },
      /**
       * 保存群组确定按钮
       */
      onSubmit: function() {
        if (this.group.name == '') {
          this.$error("请输入群组名称");
          return
        }
        let param = {
          desc: this.group.desc,
          part_id: this.group.part_id,
          task_id: this.task_id,
          name: this.group.name,
          group_num: this.group.number,
          object: this.$store.state.linkage.object
        }
        let data = this.$generateParams(param)
        this.$count('CHART', 'GROUP_CLICK', {
          task_id: this.task_id,
          'type': 1
        });
        this.axios.post(this.$store.state.api_url.funnel.create_group, data).then(rep => {
          if (rep.data.code == 200) {
            this.$success("群组保存成功")
          } else {
            this.$error("群组保存失败:" + rep.data.msg)
          }
        }).catch(error => {
          this.$error("群组保存失败")
        })
        this.dialogVisible = false
      },
    },

  }
</script>

<style>
  #funnel_chart td {
    height: auto;
  }

  .funnel-wrapper {
    position: relative;
    width: 100%;
  }

  .funnel-wrapper {
    width: 568px;
    text-align: center;
  }

  .funnel-wrapper .funnel-top {
    position: relative;

  }

  .funnel-top,
  .funnel-bottom {
    margin-left: 213px;
  }

  .funnel-wrapper .funnel-top .top-square {
    width: 142px;
    height: 64px;
    border-radius: 12px 12px 2px 2px;
    background-color: #0E73FF;
    text-align: center;
    line-height: 88px;
    font-size: 16px;
    color: white;
  }

  .funnel-wrapper .funnel-top .top-triangle {
    width: 0px;
    height: 0;
    border-top: 40px solid #0E73FF;
    border-bottom: 13px solid transparent;
    border-left: 71px solid transparent;
    border-right: 71px solid transparent;
  }

  .funnel-wrapper .funnel-middle {
    width: 568px;
    height: 48px;
    background: #F6F6F6;
    border-radius: 6px;
    box-shadow: 1px -1px 4px #ccc;
    line-height: 48px;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
  }

  .funnel-wrapper .funnel-middle .funnel-step {
    padding: 0 12px;
    display: inline-block;
  }

  .funnel-wrapper .funnel-middle .funnel-num {
    padding: 0 12px;
    display: inline-block;
  }

  .funnel-wrapper .funnel-bottom .bottom-square {
    width: 73px;
    margin-left: 33px;
    height: 34px;
    background: #CBCBCB;
    display: block;
    text-align: center;
    line-height: 69px;
  }

  .funnel-bottom {
    margin-top: 13px;
  }

  .funnel-wrapper .funnel-bottom .bottom-triangle {
    display: block;
    border-top: 40px solid #CBCBCB;
    border-bottom: 13px solid transparent;
    border-left: 71px solid transparent;
    border-right: 71px solid transparent;
    width: 0;
    height: 0;
  }
</style>
