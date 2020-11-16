<template>
    <div class="hello">
    <h1>{{ msg }}</h1>
    <h1>{{ name }}</h1>
    <div v-html="message"></div>
    <p>{{message}}</p>
    <p @click="count">{{conunter}}</p>

    <p v-show="show">是否展示</p>
    <p v-for="(user,key) in user_list"> {{key}} 姓名:{{user.name}}   用户ID:{{user.user_id}}</p>
    <p v-for="(value,key,index) in object"> {{key}} {{index}} {{value}}</p>
    <p v-for="n in 10">{{n}}</p>
</div>
</template>
<script>
export default {
  name: 'hello',
  data () {
    return {
        conunter:1,
        msg: '欢迎来到菜鸟教程！',
        name:"lc" ,
        show:false,
        message:'<font color="red">sdasd</font>',
        user_list:[{name:"李冲1",user_id:"1"},{name:"李冲2",user_id:"2"},{name:"李冲3",user_id:"3"},{name:"李冲4",user_id:"4"},{name:"李冲5",user_id:"5"},{name:"李冲",user_id:"1"}],
        object: {
            name: '菜鸟教程',
            url: 'http://www.runoob.com',
            slogan: '学的不仅是技术，更是梦想！'
        }
    }
  },
    methods:{
        count:function(e){
            this.conunter++;
            console.log(this.conunter);
        }
    }
}
</script>