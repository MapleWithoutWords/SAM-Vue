<template>
  <div>
    welcome
  </div>
</template>

<script>
export default {
  async mounted() {
    console.log(this.$md5('123456789'))
  }
}
</script>

<style lang="less" scoped></style>
