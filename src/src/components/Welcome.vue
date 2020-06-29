<template>
  <div class="container">
    <h1 style="text-align: center;">当前登录用户：{{form.trueName}}</h1>
    <el-form
      ref="form"
      :model="form"
      label-width="85px"
      label-position="right"
      :hide-required-asterisk="false"
      label-suffix="："
    >
      <el-form-item label="账号">
        <el-input :readonly="true" v-model="form.account"></el-input>
      </el-form-item>
      <el-form-item label="名称">
        <el-input :readonly="true" v-model="form.trueName"></el-input>
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group :readonly="true" v-model="form.gender">
          <el-radio :label="0">男</el-radio>
          <el-radio :label="1">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="年龄">
        <el-input-number
          :disabled="true"
          v-model="form.age"
          controls-position="right"
          :min="1"
          :max="300"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="生日">
        <el-col>
          <el-date-picker
            :readonly="true"
            type="date"
            placeholder="选择日期"
            v-model="form.birthday"
            style="width: 100%;"
          ></el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input :readonly="true" v-model="form.email"></el-input>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input :readonly="true" v-model="form.mobilePhoneNum"></el-input>
      </el-form-item>
      <el-form-item label="工作号">
        <el-input :readonly="true" v-model="form.workPhoneNum"></el-input>
      </el-form-item>
      <el-form-item label="其它账号">
        <el-input :readonly="true" v-model="form.thirtPartyName"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        account: '',
        password: '',
        trueName: '',
        gender: 0,
        age: 18,
        birthday: '',
        email: '',
        mobilePhoneNum: '',
        thirtPartyName: '',
        id: '',
        workPhoneNum: ''
      }
    }
  },
  methods: {
    async init() {
      var res = await this.$sendAsync({
        url: '/api/pmsuser/getloginuserinfo',
        method: 'get'
      })
      if (res == null) {
        this.$message('网络错误')
        return false
      }
      this.form = res.data
    }
  },
  async mounted() {
    this.init()
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 50%;
  margin-left: 50%;
  margin-top: 10vh;
  transform: translate(-50%, 0);
}
</style>
