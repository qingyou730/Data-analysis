<template>
  <div>
  <div  v-if="group_field.length==1" class="my-form-row">
    <span class="my-form-label">请选择指标 :</span>
    <div style="display: inline-block;">
      <el-select v-model="field" filterable @change="changeAgg($event)">
        <el-option v-for="item in select_field" :key="item" :label="item" :value="item"></el-option>
      </el-select>
    </div>
  </div>
  <div   :key="id" :ref="id" style="width: 600px;height: 600px;margin-left: 20px;">该数据无法展示为饼状图</div>
  </div>
</template>

<script>
  export default {
    props: ['show_data', 'group_field', 'select_field'],
    data() {
      return {
        self_value: '',
        options: [],
        field:'' ,
        id: 'id' + Math.random(),
        url_list: {
          // data_list: '/mmp/group/group_list/', //属性列表接口
        }
      }
    },
    created() {

    },
    mounted() {
      var option = {
        title: {
          text: this.task_id,
          subtext: '',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
        },
        series: [{
          name: '数值',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [{
              value: 335,
              name: '直接访问'
            },
            {
              value: 310,
              name: '邮件营销'
            },
            {
              value: 234,
              name: '联盟广告'
            },
            {
              value: 135,
              name: '视频广告'
            },
            {
              value: 1548,
              name: '搜索引擎'
            }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };

      try {
        this.makeData(option);
      } catch (err) {
        console.log(err)  ;
        return;
      }
      let echart = this.$echarts.init(this.$refs[this.id]);
      echart.setOption(option);
    },
    methods: {
      makeData: function(option) {
        if (this.group_field.length == 0) { //没有任何分组的情况
          if (this.show_data.length != 1) {
            throw new Error("数据有误 无法展示柱状图  无分组 并且数据不是一条");
          }
          let x = [];
          let value = [];
          for (var key in this.show_data[0]) {
            x.push(key);
            value.push({
              name: key,
              value: this.show_data[0][key]
            });
          }
          option.legend.data = x;
          option.series[0].data = value;
          return;
        }
        if (this.group_field.length == 1) { //只有一个分组的情况
          this.field = this.select_field[0]  ;
          var x= [] ;
          var data = [] ;
          for(var row of this.show_data){
            x.push(row[this.group_field[0]]) ;
            data.push({
              value: row[this.field]  ,
              name: row[this.group_field[0]] ,
            },);
          }
          option.legend.data = x;
          option.series[0].data = data;
          option.series[0].name=this.field ;
          return  ;
        }
        throw new Error("该数据无法展示位饼状图");
      },
      /**
       * 切换饼状图指标
       */
      changeAgg:function(val){
        this.id =   'id' + Math.random() ;
        setTimeout(()=>{
          var option = {
            title: {
              text: this.task_id,
              subtext: '',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
              orient: 'vertical',
              left: 'left',
              data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
            },
            series: [{
              name: '数值',
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: [{
                  value: 335,
                  name: '直接访问'
                },
                {
                  value: 310,
                  name: '邮件营销'
                },
                {
                  value: 234,
                  name: '联盟广告'
                },
                {
                  value: 135,
                  name: '视频广告'
                },
                {
                  value: 1548,
                  name: '搜索引擎'
                }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          };

          var x= [] ;
          var data = [] ;
          for(var row of this.show_data){
            x.push(row[this.group_field[0]]) ;
            data.push({
              value: row[this.field]  ,
              name: row[this.group_field[0]] ,
            },);
          }
          option.legend.data = x;
          option.series[0].data = data;
          option.series[0].name=this.field ;
          let echart = this.$echarts.init(this.$refs[this.id]);
          echart.setOption(option);
        }, 10);
      }
    }
  }
</script>

<style>
</style>
