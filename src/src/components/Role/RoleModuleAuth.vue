<template>
  <div class="custom-tree-container">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>

    <el-tree
      class="filter-tree"
      :data="allModules"
      node-key="id"
      :props="defaultProps"
      :default-expand-all="true"
      :filter-node-method="filterNode"
      ref="tree"
      :show-checkbox="true"
      :default-checked-keys="defaultSelKey"
      :expand-on-click-node="false"
      @node-click="moduleClick"
      @check="moduleCheck"
    >
    </el-tree>

    <div class="module_operation">
      操作：
      <el-checkbox
        :indeterminate="operationForm.isIndeterminate"
        v-model="operationForm.checkAll"
        @change="operationCheckAllChange"
        >全选</el-checkbox
      >
      <div style="margin: 10px 0;"></div>
      <div class="chbox_operations">
        <el-checkbox-group
          v-model="operationForm.operationValues"
          @change="operationCheckChange"
        >
          <el-checkbox
            v-for="(item, index) in moduleUserOperations"
            :key="index"
            :label="item.value"
            >{{ item.name }}</el-checkbox
          >
        </el-checkbox-group>
      </div>
    </div>

    <div class="footer">
      <el-button type="primary" @click="btnSave">保存</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['authGroupId', 'time', 'appId', 'tenantId'],
  data() {
    return {
      filterText: '',
      queryInfo: {
        currentSelModuleId: ''
      },
      // 应用系统
      allApps: [],
      // 模块树
      allModules: [],
      // 字段映射
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      // 默认选中模块
      defaultSelKey: [],
      // 模块操作
      moduleUserOperations: [],
      // 操作选择框
      operationForm: {
        // 选中的操作
        operationValues: [0],
        isIndeterminate: true,
        checkAll: false
      },
      // 用户拥有该模块的权限
      userModuleAuth: [],

      // 是否修改过
      isEditor: false
    }
  },
  methods: {
    async init() {
      this.loadData()
    },
    // 加载模块树事件
    async loadData() {
      Object.assign(this.operationForm, this.$options.data().operationForm)
      Object.assign(this.userModuleAuth, this.$options.data().userModuleAuth)
      Object.assign(this.allModules, this.$options.data().allModules)
      Object.assign(this.defaultSelKey, this.$options.data().defaultSelKey)
      this.moduleUserOperations = []
      var moduleRes = await this.$sendAsync({
        url: `/api/PmsUser/get_module_auth/${this.appId}/${this.authGroupId}`,
        method: 'get'
      })
      this.allModules = moduleRes.data

      var authRes = await this.$sendAsync({
        url: `/api/PmsAuthorizationFeature/get_auth_by_auth_group_id/${this.appId}/${this.authGroupId}`,
        method: 'get'
      })
      this.userModuleAuth = authRes.data
      this.defaultSelKey = authRes.data.map(e => e.moduleId)
      console.log(this.defaultSelKey)
    },
    // 加载模块操作
    async loadOperations(moduleId, actionValue) {
      var operaRes = await this.$sendAsync({
        url: `/api/PmsAppModule/get_operations/${this.appId}/${moduleId}/${actionValue}`,
        method: 'get'
      })
      this.moduleUserOperations = operaRes.data.operations
      this.operationForm.operationValues = operaRes.data.operationValues
    },
    /// 计算用户模块授权
    cacleUserAuth(val) {
      // debugger
      this.isEditor = true
      var moduleId = this.queryInfo.currentSelModuleId
      var valueCount = 0
      if (!val) {
        this.userModuleAuth = this.userModuleAuth.filter(
          e => e.moduleId !== moduleId
        )
        return false
      }
      for (let index = 0; index < val.length; index++) {
        const element = val[index]
        valueCount += element
      }
      var index = this.userModuleAuth.findIndex(e => e.moduleId === moduleId)
      var data = { moduleId: moduleId, actionValue: valueCount, grantType: 0 }
      if (index === -1) {
        this.userModuleAuth.push(data)
      } else {
        this.userModuleAuth[index] = data
      }
    },
    // 搜索
    filterNode(value, data) {
      // debugger
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 树节点单击事件
    moduleClick(thisNode, moduleNode, node) {
      console.log(thisNode)
      console.log(moduleNode)
      console.log(node)
      this.queryInfo.currentSelModuleId = thisNode.id
      // 查看用户是否有该模块的授权信息
      var index = this.userModuleAuth.findIndex(e => e.moduleId === thisNode.id)
      if (index !== -1) {
        // 加载模块操作
        this.loadOperations(thisNode.id, this.userModuleAuth[index].actionValue)
      } else {
        this.loadOperations(thisNode.id, thisNode.actionValue)
      }
    },
    // 树节点复选框状态改变事件
    async moduleCheck(thisNode, checkStatus) {
      this.isEditor = true
      // 当前点击节点id
      this.queryInfo.currentSelModuleId = thisNode.id
      var index = this.userModuleAuth.findIndex(e => e.moduleId === thisNode.id)
      if (index !== -1) {
        this.loadOperations(thisNode.id, this.userModuleAuth[index].actionValue)
      } else {
        this.loadOperations(thisNode.id, thisNode.actionValue)
      }
      // 当选中节点没有当前节点时
      if (checkStatus.checkedKeys.findIndex(e => e === thisNode.id) === -1) {
        // this.moduleUserOperations = []
        this.operationForm.operationValues = [0]
        this.operationForm.checkAll = false
      }
      this.userModuleAuth = this.userModuleAuth.filter(
        e => checkStatus.checkedKeys.findIndex(x => x === e.moduleId) > -1
      )
      console.log(checkStatus.halfCheckedKeys)
      // 添加半选节点
      for (let index = 0; index < checkStatus.halfCheckedKeys.length; index++) {
        const element = checkStatus.halfCheckedKeys[index]
        if (this.userModuleAuth.findIndex(e => e.moduleId === element) === -1) {
          this.userModuleAuth.push({
            moduleId: element,
            actionValue: 0,
            grantType: 1
          })
        }
      }
      // 选中父节点，默认子节点也选中
      for (let index = 0; index < checkStatus.checkedKeys.length; index++) {
        const element = checkStatus.checkedKeys[index]
        if (this.userModuleAuth.findIndex(e => e.moduleId === element) === -1) {
          this.userModuleAuth.push({
            moduleId: element,
            actionValue: 0,
            grantType: 0
          })
        }
      }
    },
    async btnSave() {
      var data = {
        authGroupId: this.authGroupId,
        appId: this.appId,
        appFeatureIds: this.userModuleAuth.map(e => e.moduleId),
        authValues: this.userModuleAuth.map(e => e.actionValue),
        grantTypes: this.userModuleAuth.map(e => e.grantType),
        tenantId: this.tenantId
      }
      console.log(data)
      var res = await this.$sendAsync({
        url: '/api/PmsAuthorizationFeature/authrole',
        method: 'post',
        data: data
      })
      if (!res) {
        return false
      }
      this.$emit('saveAuth')
      this.$message({
        type: 'success',
        message: '操作成功'
      })
    },
    // 操作选中所有改变事件
    operationCheckAllChange(val) {
      console.log(val)
      if (val) {
        this.cacleUserAuth(this.moduleUserOperations.map(e => e.value))
      }
      this.operationForm.operationValues = val
        ? this.moduleUserOperations.map(e => e.value)
        : []
      this.operationForm.isIndeterminate = false
    },
    // 单个操作选择改变事件
    operationCheckChange(value) {
      console.log(value)

      this.cacleUserAuth(value)
      const checkedCount = value.length
      this.operationForm.checkAll =
        checkedCount === this.moduleUserOperations.length
      this.operationForm.isIndeterminate =
        checkedCount > 0 && checkedCount < this.moduleUserOperations.length
      if (checkedCount > 0) {
        this.$refs.tree.setChecked(this.queryInfo.currentSelModuleId, true)
      }
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

.module_operation {
  margin-top: 15px;
  .chbox_operations {
    border: 1px solid lightgray;
    padding: 15px 15px;
    height: 10vh;
    overflow: auto;
  }
}
</style>
