<template>
  <div v-if="$adminId === thisUserId">
    <span style="font-size:0.7vw;">租户：</span>
    <el-select
      v-model="selTenantId"
      @change="selChange()"
      placeholder="请选择租户"
    >
      <el-option
        label=" "
        value="00000000-0000-0000-0000-000000000000"
      ></el-option>
      <el-option
        v-for="item in tenants"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  props: ['tenantId'],
  data() {
    return {
      selTenantId: '',
      tenants: [],
      thisUserId: ''
    }
  },
  methods: {
    selChange() {
      this.$emit('selChange', this.selTenantId)
    }
  },
  mounted: async function() {
    this.thisUserId = window.sessionStorage.getItem('userId')
    if (this.$adminId === this.thisUserId) {
      this.selTenantId = this.tenantId
      var tenantRes = await this.$sendAsync({
        url: '/api/pmstenant/getbyurl',
        method: 'get'
      })
      this.tenants = tenantRes.data
    }
  }
}
</script>

<style lang="less" scoped></style>
