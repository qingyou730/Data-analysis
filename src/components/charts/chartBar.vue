<template>
  <div :ref="id" style="width: 100%;height: 600px;margin-left: 20px;">该数据无法展示为柱状图</div>
</template>

<script>
  export default {
    props: ['show_data', 'group_field', 'select_field'],
    data() {
      return {
        self_value: '',
        options: [],
        id: 'id' + Math.random(),
        url_list: {
          // data_list: '/mmp/group/group_list/', //属性列表接口
        }
      }
    },
    created() {

    },
    mounted() {
      var option = { //示例柱状图配置项
        legend: {
          left: "100"
        },
        grid: {
          x: '100',
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [120, 200, 150, 80, 70, 110, 130],
          type: 'bar',
          barMaxWidth: "30",
        }]
      };

      try {
        this.makeData(option);
      } catch (err) {
        console.log(err);
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
          console.log(this.show_data[0]);
          for (var key in this.show_data[0]) {
            x.push(key);
            value.push(this.show_data[0][key]);
          }
          option.xAxis.data = x;
          var series = [{
            // name: "数值",
            data: value,
            type: 'bar',
            barMaxWidth: "30",
          }];
          option.series = series;
          return;
        }

        if (this.group_field.length >= 1) { //有一个或者多个分组的情况
          var series_map = {};
          for (var field of this.select_field) {
            series_map[field] = {
              name: field,
              data: [],
              type: 'bar',
              barMaxWidth: "30",
            };
          }

          var xAxisData = [];
          for (var row of this.show_data) {
            var x_data = [];
            for (var group_one of this.group_field) {
              x_data.push(row[group_one]);
            }
            xAxisData.push(x_data.join('#'));

            var series = [];
            for (var field of this.select_field) {
              series_map[field].data.push(row[field]);
            }
          }

          var series = [];
          for (var field of this.select_field) {
            series.push(series_map[field]);
          }

          option.xAxis.data = xAxisData;
          option.series = series;
        }
        /***有多个分组 END **/
      }
    }
  }
</script>

<style>
</style>
