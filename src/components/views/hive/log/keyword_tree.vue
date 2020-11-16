<template>
  <table  v-show="children.length>0" :class="['table_list_'+countRow(children),'table-2',(children.length==1 && parent.level==0 )?'one-leaf':'',parent.level==0 ?'level-1' :'']">
    <tr v-for="(node,index) in children" :key="node.id">
      <td :style="'padding-top:'+((countRow(children)*46 - 30)/2)+'px;'" v-if="index==0" v-show="children.length>1" :class="['branch','row_'+countRow(children), (children.length==1 && parent.level==0 )?'one-leaf':'',parent.level==0 ?'level-1' :'']" :rowspan="children.length">
        <span @click="change_logic_op(parent)" style="cursor: pointer;">{{parent.logic_op =='AND' ? '并且' : '或者'}}</span>
      </td>
      <td :class="['leaf',children.length==1?'one-leaf':'']">
        <el-select @change="changeGroupType(node)" v-model="node.group_type" style="width: 100px;">
          <el-option label="逻辑组" value="logic_group" v-if="parent.level==0"></el-option>
          <el-option label="关键词" value="attr"></el-option>
        </el-select>

        <!--如果是关键词 START -->
        <span v-if="node.group_type=='attr'" >
          <el-input style="width: 200px;" v-model="node.value"></el-input>
        </span>
        <!--如果是关键词 END -->

        <span >
          <!--节点删除按钮-->
          <el-button @click="remove_node(children,index)" v-if="children.length>1" type="primary" icon="el-icon-minus" circle size="mini"></el-button>
          <el-dropdown placement="bottom">
            <el-button  type="primary" icon="el-icon-plus"
             circle size="mini"  style="margin-left: 10px;"></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="add_keyword(parent,'attr')">关键词</el-dropdown-item>
              <el-dropdown-item @click.native="add_keyword(parent,'logic_group')" v-if="parent.level==0">逻辑组</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>

        <!--递归渲染逻辑组下的节点-->
        <keyword-tree  :parent="node" v-if="node.group_type=='logic_group'"
          :children="node.children" :logic_op="node.logic_op" :children_num="node.children.length" :add_keyword="add_keyword" >
        </keyword-tree>

      </td>
    </tr>
  </table>
</template>

<script>
  export default {
    name: 'keywordTree',
    props:['add_keyword','children','logic_op','children_num','parent','url_list'] ,
    data() {
      return {

      }
    },
    methods: {
      /**
       * 计算总行数 计算且或连线的总行数
       */
      countRow(list){
        var number = 0 ;
        for(var i in list){
          var v = list[i] ;
          if(v.group_type == 'attr'){
            number += 1 ;
          }else{
            if(i == (list.length - 1)){
              number += 1 ;
            }else{
              number += 1 ;
              number += this.counChildren(v.children);
            }
          }
        }
        return number ;
      },
      counChildren(list){
        var number = 0 ;
        for(var v of list){
          if(v.group_type == 'attr'){
            number += 1;
          }else{
            number += 1;
            number += this.counChildren(v.children);
          }
        }
        return number ;
      },

      /**
       * 修改是否是逻辑组
       */
      changeGroupType:function(node){
        if(node.group_type == 'logic_group'){
          node.children = [] ;
          this.add_keyword(node,'attr')
          this.add_keyword(node,'attr')
        }
      },
      update_parent() { //更新父组件
        return
      },
      remove_node(parent, index) { //删除树节点
        parent.splice(index, 1);
      },
      change_logic_op(node) { //更换节点的  AND OR
        node.logic_op = node.logic_op == 'AND' ? 'OR' : 'AND';
      },
      change_value(value, node, ) {

      },
    }
  }
</script>
