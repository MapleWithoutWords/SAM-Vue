<template>
  <div class="resourceTree">
    <div class="header">
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
    </div>

    <el-checkbox
      :indeterminate="setUserGroup.isIndeterminate"
      v-model="setUserGroup.checkAll"
      @change="handleCheckAllChange"
      >全选</el-checkbox
    >
    <div style="margin: 15px 0;"></div>
    <div class="chbox_operations">
      <el-checkbox-group
        v-model="setUserGroup.userGroupRightTree"
        @change="handleOperationChange"
      >
        <el-checkbox
          v-for="(item, index) in setUserGroup.userGroupLeftTree"
          :key="index"
          :label="item.id"
          >{{ item.title }}</el-checkbox
        >
      </el-checkbox-group>
    </div>

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
      setUserGroup: {
        userGroupLeftTree: [],
        userGroupRightTree: [],
        checkAll: false,
        isIndeterminate: true
      },
      queryInfo: {
        appId: '',
        oldAppId: ''
      },
      // 应用系统列表
      allApps: [],
      isEditor: false
    }
  },
  methods: {
    // 初始化
    async init() {
      var appRes = await this.$sendAsync({
        url: '/api/com/getallapp',
        method: 'get'
      })
      this.allApps = appRes.data
      this.queryInfo.appId = appRes.data.length > 0 ? appRes.data[0].value : ''
      this.queryInfo.oldAppId = this.queryInfo.appId
      this.loadUserGroup()
    },
    // 加载用户组数据
    async loadUserGroup() {
      console.log(this.setUserGroup.userGroupRightTree)
      console.log(this.setUserGroup.userGroupLeftTree)
      var res = await this.$sendAsync({
        url: `/api/PmsUser/get_user_groups/${this.queryInfo.appId}/${this.userId}`,
        method: 'get'
      })
      this.setUserGroup.userGroupLeftTree = res.data
      this.setUserGroup.userGroupRightTree = res.data.map(e => {
        if (e.checked) {
          return e.id
        }
      })
      const checkedCount = this.setUserGroup.userGroupRightTree.length
      this.setUserGroup.checkAll =
        checkedCount === this.setUserGroup.userGroupLeftTree.length
      this.setUserGroup.isIndeterminate =
        checkedCount > 0 &&
        checkedCount < this.setUserGroup.userGroupLeftTree.length
    },
    // 选择应用系统改变事件
    async appChange() {
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
      this.loadUserGroup()
    },
    // 保存操作
    async btnSave() {
      // if (this.isEditor) {
      //   var result = await this.$msgbox
      //     .confirm('您有未保存的操作, 是否继续?', '提示', {
      //       confirmButtonText: '确定',
      //       cancelButtonText: '取消',
      //       type: 'warning'
      //     })
      //     .catch(error => error)
      //   if (result !== 'confirm') {
      //     this.queryInfo.appId = this.queryInfo.oldAppId
      //     return false
      //   }
      // }
      this.setUserGroup.userGroupRightTree = Array.from(
        new Set(this.setUserGroup.userGroupRightTree)
      )
      this.isEditor = false
      var res = await this.$sendAsync({
        url: `/api/PmsUser/set_user_groups/${this.queryInfo.appId}/${this.userId}`,
        method: 'post',
        data: this.setUserGroup.userGroupRightTree
      })
      if (res != null) {
        this.$emit('ok')
        this.$message({ type: 'success', message: '操作成功' })
      }
    },
    handleCheckAllChange(val) {
      this.isEditor = true
      this.setUserGroup.userGroupRightTree = val
        ? this.setUserGroup.userGroupLeftTree.map(e => e.id)
        : []
      this.setUserGroup.isIndeterminate = false
    },
    handleOperationChange(value) {
      this.isEditor = true
      const checkedCount = value.length
      this.setUserGroup.checkAll =
        checkedCount === this.setUserGroup.userGroupLeftTree.length
      this.setUserGroup.isIndeterminate =
        checkedCount > 0 &&
        checkedCount < this.setUserGroup.userGroupLeftTree.length
    }
  },
  watch: {
    time(val) {
      this.init()
    }
  },
  mounted: function() {
    this.init()
  }
}
</script>

<style lang="less" scoped>
.resourceTree {
  padding: 15px 15px;
  font-size: 1vw !important;
}
.footer {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
.chbox_operations {
  border: 1px solid lightgray;
  padding: 15px 15px;
  height: 30vh;
}
</style>
