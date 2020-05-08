<template>
  <div class="resourceTree">
    <el-checkbox
      :indeterminate="setResource.isIndeterminate"
      v-model="setResource.checkAll"
      @change="handleCheckAllChange"
      >全选</el-checkbox
    >
    <div style="margin: 15px 0;"></div>
    <div class="chbox_operations">
      <el-checkbox-group
        v-model="setResource.resourceRightTree"
        @change="handleOperationChange"
      >
        <el-checkbox
          v-for="(item, index) in setResource.resourceLeftTree"
          :key="index"
          :label="item.id"
          >{{ item.title }}</el-checkbox
        >
      </el-checkbox-group>
    </div>

    <div class="footer">
      <el-button type="primary" @click="setAppResource">保存</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['appId', 'time'],
  data() {
    return {
      setResource: {
        resourceLeftTree: [],
        resourceRightTree: [],
        isIndeterminate: true,
        checkAll: false
      }
    }
  },
  methods: {
    async setAppResource() {
      console.log(this.setResource.resourceRightTree)

      var res = await this.$sendAsync({
        url: '/api/app/set_app_resources?appId=' + this.appId,
        method: 'put',
        data: this.setResource.resourceRightTree
      })
      if (res != null) {
        this.$emit('ok')
        this.$message({ type: 'success', message: '操作成功' })
      }
    },
    handleCheckAllChange(val) {
      this.setResource.resourceRightTree = val
        ? this.setResource.resourceLeftTree.map(e => e.id)
        : []
      this.setResource.isIndeterminate = false
    },
    handleOperationChange(value) {
      const checkedCount = value.length
      this.setResource.checkAll =
        checkedCount === this.setResource.resourceLeftTree.length
      this.setResource.isIndeterminate =
        checkedCount > 0 &&
        checkedCount < this.setResource.resourceLeftTree.length
    },
    async init() {
      var res = await this.$sendAsync({
        url: 'api/app/get_res_by_appdid/' + this.appId,
        method: 'get'
      })
      this.setResource.resourceLeftTree = res.data
      this.setResource.resourceRightTree = res.data.map(e => {
        if (e.checked) {
          return e.id
        }
      })
      // this.handleOperationChange(this.setResource.resourceRightTree)
    }
  },
  watch: {
    time(val) {
      this.init()
    }
  },
  mounted: async function() {
    // debugger
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
