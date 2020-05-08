<template>
  <div class="custom-tree-container">
    应用系统：
    <el-select
      v-model="queryInfo.appId"
      @change="appChange"
      placeholder="请选择应用系统"
    >
      <el-option
        v-for="item in allApps"
        :key="item.value"
        :label="item.name"
        :value="item.value"
      >
      </el-option>
    </el-select>

    <el-input placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>

    <el-tree
      class="filter-tree"
      :data="allRoles"
      node-key="id"
      :props="defaultProps"
      :default-expand-all="true"
      :filter-node-method="filterNode"
      ref="tree"
      :show-checkbox="true"
      :default-checked-keys="defaultSelKey"
      :expand-on-click-node="false"
      :check-strictly="true"
      :check-on-click-node="true"
      @check="moduleCheck"
    >
    </el-tree>

    <div class="footer">
      <el-button type="primary" @click="btnSave">保存</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['userId', 'time'],
  data() {
    return {
      filterText: '',
      queryInfo: {
        appId: '',
        oldAppId: ''
      },
      // 应用系统
      allApps: [],
      // 角色树
      allRoles: [],
      // 字段映射
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      // 默认选中模块
      defaultSelKey: [],
      // 是否修改过
      isEditor: false
    }
  },
  methods: {
    async init() {
      var appRes = await this.$sendAsync({
        url: '/api/com/getallapp',
        method: 'get'
      })
      this.allApps = appRes.data
      this.queryInfo.appId = appRes.data.length > 0 ? appRes.data[0].value : ''
      this.queryInfo.oldAppId = this.queryInfo.appId
      this.loadData()
    },
    // 加载模块树事件
    async loadData() {
      var roleRes = await this.$sendAsync({
        url: `/api/PmsUser/get_roles/${this.queryInfo.appId}/${this.userId}`,
        method: 'get'
      })
      this.allRoles = roleRes.data.tree
      this.defaultSelKey = roleRes.data.haveRoleIds
      console.log(this.defaultSelKey)
    },
    // 搜索
    filterNode(value, data) {
      // debugger
      if (!value) return true
      return data.title.indexOf(value) !== -1
    },
    // 树节点复选框状态改变事件
    async moduleCheck(thisNode, checkStatus) {
      console.log(checkStatus)

      this.isEditor = true
    },
    async btnSave() {
      console.log(this.$refs.tree.getCheckedKeys())
      var res = await this.$sendAsync({
        url: `/api/PmsUser/set_roles/${this.queryInfo.appId}/${this.userId}`,
        method: 'post',
        data: this.$refs.tree.getCheckedKeys()
      })
      if (!res) {
        return false
      }
      this.isEditor = false
      this.$emit('save')
      this.$message({
        type: 'success',
        message: '操作成功'
      })
    },
    async appChange(val, oldVal) {
      if (this.isEditor) {
        var result = await this.$msgbox
          .confirm('您有未保存的操作, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          .catch(error => error)
        if (result !== 'confirm') {
          this.queryInfo.appId = this.queryInfo.oldAppId
          return false
        }
      }
      this.queryInfo.oldAppId = this.queryInfo.appId
      this.isEditor = false
      this.loadData()
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    time(val) {
      this.init()
    }
  },
  mounted() {
    this.init()
  }
}
</script>

<style lang="less" scoped>
.el-tree {
  margin-top: 15px;
  border: 1px solid lightgray;
  padding: 15px 15px;
  height: 35vh;
  overflow: auto;
}
.el-button {
  margin-top: 15px;
}
.footer {
  display: flex;
  justify-content: flex-end;
}
.custom-tree-container {
  margin-left: 15px;
  margin-right: 15px;
}
.el-input {
  margin-top: 15px;
}
</style>
