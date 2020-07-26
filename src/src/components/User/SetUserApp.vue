<template>
  <div class="resourceTree">
    <el-checkbox
      :indeterminate="setUserAppAuth.isIndeterminate"
      v-model="setUserAppAuth.checkAll"
      @change="handleCheckAllChange"
      >全选</el-checkbox
    >
    <div style="margin: 15px 0;"></div>
    <div class="chbox_operations">
      <el-checkbox-group
        v-model="setUserAppAuth.userAppAuthRightTree"
        @change="handleOperationChange"
      >
        <el-checkbox
          v-for="(item, index) in setUserAppAuth.userAppAuthLeftTree"
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
  props: ['userId', 'time', 'tenantId'],
  data() {
    return {
      setUserAppAuth: {
        userAppAuthLeftTree: [],
        userAppAuthRightTree: [],
        checkAll: false,
        isIndeterminate: true
      }
    }
  },
  methods: {
    // 加载分级授权
    async init() {
      var res = await this.$sendAsync({
        url: `/api/PmsUser/get_user_app_auth/${this.userId}`,
        method: 'get'
      })
      this.setUserAppAuth.userAppAuthLeftTree = res.data
      this.setUserAppAuth.userAppAuthRightTree = res.data.map(e => {
        if (e.checked) {
          return e.id
        }
      })
      const checkedCount = this.setUserAppAuth.userAppAuthRightTree.length
      this.setUserAppAuth.checkAll =
        checkedCount === this.setUserAppAuth.userAppAuthLeftTree.length
      this.setUserAppAuth.isIndeterminate =
        checkedCount > 0 &&
        checkedCount < this.setUserAppAuth.userAppAuthLeftTree.length
    },
    // 保存操作
    async btnSave() {
      this.setUserAppAuth.userAppAuthRightTree = Array.from(
        new Set(this.setUserAppAuth.userAppAuthRightTree)
      )
      var res = await this.$sendAsync({
        url: `/api/PmsUser/set_user_app_auth/${this.userId}/${this.tenantId}`,
        method: 'post',
        data: this.setUserAppAuth.userAppAuthRightTree
      })
      if (res != null) {
        this.$emit('ok')
        this.$message({ type: 'success', message: '操作成功' })
      }
    },
    handleCheckAllChange(val) {
      this.setUserAppAuth.userAppAuthRightTree = val
        ? this.setUserAppAuth.userAppAuthLeftTree.map(e => e.id)
        : []
      this.setUserAppAuth.isIndeterminate = false
    },
    handleOperationChange(value) {
      const checkedCount = value.length
      this.setUserAppAuth.checkAll =
        checkedCount === this.setUserAppAuth.userAppAuthLeftTree.length
      this.setUserAppAuth.isIndeterminate =
        checkedCount > 0 &&
        checkedCount < this.setUserAppAuth.userAppAuthLeftTree.length
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
