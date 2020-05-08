<template>
  <div class="custom-tree-container">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>

    <el-tree
      class="filter-tree"
      :data="allOrgTrees"
      node-key="id"
      :props="defaultProps"
      :default-expand-all="true"
      :filter-node-method="filterNode"
      :check-on-click-node="true"
      ref="tree"
      :show-checkbox="true"
      :check-strictly="true"
      :default-checked-keys="defaultSelKey"
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
  props: ['empId', 'time'],
  data() {
    return {
      filterText: '',
      // 机构树
      allOrgTrees: [],
      // 字段映射
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      // 默认选中的key
      defaultSelKey: []
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
  methods: {
    async init() {
      // 加载机构树
      var userOrgMapRes = await this.$sendAsync({
        url: '/api/PmsUser/get_org_tree/' + this.empId,
        method: 'get'
      })
      if (!userOrgMapRes) {
        return false
      }
      this.allOrgTrees = userOrgMapRes.data.orgTree
      this.defaultSelKey = userOrgMapRes.data.haveOrgIds
    },
    // 搜索
    filterNode(value, data) {
      if (!value) return true
      return data.title.indexOf(value) !== -1
    },
    // 保存
    async btnSave() {
      var orgIds = this.$refs.tree.getCheckedKeys()
      var res = await this.$sendAsync({
        url: '/api/PmsUser/set_orgs/' + this.empId,
        method: 'post',
        data: orgIds
      })
      if (!res) {
        return false
      }
      this.isEditor = false
      this.$emit('saveOrgs')
      this.$message({
        type: 'success',
        message: '操作成功'
      })
    }
  },
  async mounted() {
    this.init()
  }
}
</script>

<style lang="less" scoped>
.el-tree {
  margin-top: 15px;
  border: 1px solid lightgray;
  padding: 15px 15px;
  height: 60vh;
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
</style>
