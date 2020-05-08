<template>
  <div class="resourceTree">
    <el-transfer
      v-model="setResource.resourceRightTree"
      :props="{
        key: 'value',
        label: 'desc'
      }"
      :data="setResource.resourceLeftTree"
      :filterable="true"
      :titles="['未分配', '已分配']"
      @change="setAppResource"
    >
    </el-transfer>
  </div>
</template>

<script>
export default {
  props: ['appId'],
  data() {
    return {
      setResource: {
        resourceLeftTree: [],
        resourceRightTree: []
      }
    }
  },
  methods: {
    async setAppResource(value, direction, movedKeys) {
      console.log(value)
      console.log(direction)
      console.log(movedKeys)

      var res = await this.$sendAsync({
        url: '/api/app/set_app_resources?appId=' + this.appId,
        method: 'put',
        data: this.setResource.resourceRightTree
      })
      if (res != null) {
        this.$message({ type: 'success', message: '操作成功' })
      } else {
        if (movedKeys) {
          this.setResource.resourceRightTree.filter(
            e => movedKeys.findIndexof(e) === -1
          )
        }
      }
    }
  },
  mounted: async function() {
    // debugger
    var res = await this.$sendAsync({
      url: 'api/app/get_res_by_appdid/' + this.appId,
      method: 'get'
    })
    this.setResource.resourceLeftTree = res.data.map(e => {
      return {
        desc: e.title,
        value: e.id
      }
    })
    this.setResource.resourceRightTree = res.data.map(e => {
      if (e.checked) {
        return e.id
      }
    })
  }
}
</script>

<style lang="less" scoped>
.el-transfer{
  width: 40vw;
  font-size: 1vw;
}
</style>
