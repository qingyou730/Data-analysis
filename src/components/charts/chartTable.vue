<template>
  <div>
      <table class="table table-bordered table-data" v-if="data.length>0"  style="margin-left: 60px;">
      <thead>
        <tr>
          <th v-for="(v,k) in data[0]" :key="k" width="180px">
            {{k}}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row,index) in data" :key="index">
          <td v-for="(col,colIndex) in row" :key="colIndex">{{col}}</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<script>
  export default {
    props: ['show_data','x','y','agg_type', "show_col","wantUseclo"],
    data() {
      return {
        data: [],
      }
    },
    created() {
      if(this.show_col == 'otherCol') {
          var cloData = [];
          this.show_data.forEach((key, index)=>{
            cloData[index]={};
            for(let item of this.wantUseclo) {
              for(let allkey in key) {
                if(allkey == item) {
                  cloData[index][item]=key[allkey];
                }
              }
            }
          })
          this.data = cloData;
      }else{
         this.data = this.show_data;
      }
    },
    mounted() {
      if(this.agg_type == 'EVENT_DIMENSION' && this.data.length > 0){ //事件维度 title排序
        var field_list = [] ;
        for(var field in  this.data[0]){
          field_list.push(field) ;
        }
        field_list.sort(function(n1,n2){
          var number1  = parseInt(n1.replace('attr','')) ;
          if(isNaN(number1)){
            number1 = -1 ;
          }
          var number2  = parseInt(n2.replace('attr','')) ;
          if(isNaN(number2)){
            number2= -1 ;
          }
          return number1 - number2 ;
        });
        var data = [];
        for(var v of this.data){
          var row = {};
          for(var field of field_list){
            row[field] = v[field] ;
          }
          data.push(row) ;
        }
        if(this.show_col == 'otherCol') {
          var cloData = [];
          this.data.forEach((key, index)=>{
            cloData[index]={};
            for(let item of this.wantUseclo) {
              for(let allkey in key) {
                if(allkey == item) {
                  cloData[index][item]=key[allkey];
                }
              }
            }
          })
          this.data = cloData;
        }else{
          this.data = data;
        }
      };
    },
    methods: {},
    
  }
</script>

<style>
</style>
