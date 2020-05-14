import Vue from 'vue'

Vue.prototype.$getQuery = function(jsonData) {
  // eslint-disable-next-line no-unused-vars
  var sb = ''
  for (const key in jsonData) {
    // eslint-disable-next-line no-prototype-builtins
    if (jsonData.hasOwnProperty(key)) {
      const element = jsonData[key]
      if (element) {
        sb += key + '=' + element + '&'
      }
    }
  }
  sb = sb.substr(0, sb.length - 1)
  return sb
}

Vue.prototype.$validResponse = function(res) {
  if (!res) {
    this.$message.error('网络错误')
    return null
  }
  if (res.code !== 0) {
    this.$message.error(res.msg)
    return null
  }
  return res
}
// 删除
Vue.prototype.$delById = async function(url) {
  var result = await this.$msgbox
    .confirm('此操作将永久删除该数据, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .catch(error => error)
  if (result !== 'confirm') {
    return false
  }
  var res = await this.$http({
    url: url,
    method: 'delete'
  })
  var resData = this.$validResponse(res)
  if (resData === null) {
    return false
  }
  return true
}
/// 改变状态
Vue.prototype.$changeStatus = async function(url) {
  var res = await this.$http({
    url: url,
    method: 'delete'
  })

  var resData = this.$validResponse(res)
  if (resData === null) {
    return false
  }
  this.$message({
    type: 'success',
    message: '操作成功'
  })
}
Vue.prototype.$sendAsync = async function(config) {
  var res = await this.$http(config)
  var resData = this.$validResponse(res)
  return resData
}
Vue.prototype.$getRSAPubKey = async function() {
  if (!this.$rsaPubKey) {
    var response = await this.$sendAsync({
      method: 'get',
      url: '/api/get_publickey'
    })
    this.$rsaPubKey = response.data
  }
  return this.$rsaPubKey
}
