<template>
  <el-dialog title="菜单权限" :visible.sync="visible" :before-close="closeDialog" width="600px">
    <el-tree ref="tree" :data="menu_list" show-checkbox node-key="menuId" :props="defaultProps">
    </el-tree>

    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </div>
  </el-dialog>
</template>




<script>
  export default {
    props: ['value', 'role_id', 'param', 'model_name'],
    data() {
      return {
        old: ['5ef98d5914287f135e529998', '5ef98d4114287f135e529996'],
        menu_list: [],
        visible: true,
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        role: {},
      }
    },
    created() {
      console.log(this.role_id)
      // this.visible = true  ;
    },
    mounted() {
      //获取全部菜单列表
      let requestUrl = this.$store.state.api_url.menu.list;
      this.axios.post(requestUrl).then((response) => {
        let data = response.data
        if (data.code != 200) {
          console.log("接口有错返回")
          console.log(response)
        }
        this.menu_list = data.data;
        //获取当前角色信息
        let url = this.$store.state.api_url.role.detail;
        var param = {
          "role_id": this.role_id,
        };
        this.axios.post(url, param).then((response) => {
          let data = response.data
          if (data.code != 200) {
            console.log("接口有错返回")
            console.log(response)
          }
          this.old = data.data.menu_ids;
          this.role = data.data;
          this.setOldValue();
        }).catch((error) => {
          console.log(error);
          this.$error('接口请求失败');
        });
      }).catch((error) => {
        console.log(error);
        this.$error('接口请求失败');
      });
    },

    methods: {
      setOldValue: function() {
        this.$nextTick(function() {
          for (var v of this.old) {
            var node = this.$refs.tree.getNode(v);
            if (node.isLeaf) {
              this.$refs.tree.setChecked(node, true);
            }
          }
        });
      },
      /**
       * 关闭弹窗
       */
      closeDialog: function() {
        this.visible = false;
        this.$emit('input', false);
      },
      save: function() {
        var menu_ids = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys());
        var update = {
          role_id: this.role_id,
          menu_ids: menu_ids,
        }
        var url =  this.$store.state.api_url.role.update;
        this.axios.post(url, update).then((response) => {
          let data = response.data
          if (data.code != 200) {
            this.$error('接口请求失败');
            console.log(response)
          } else {
            this.$success('操作成功');
            this.closeDialog();
          }
        }).catch((error) => {
          console.log(error);
          this.$error('接口请求失败');
        });
      }
    },
    computed: {},
    watch: {},
  }
</script>

<style>
</style>
