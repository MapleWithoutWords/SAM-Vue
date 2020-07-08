<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户数据</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="15">
        <el-col :span="4">
          <el-input
            v-model="queryInfo.name"
            placeholder="请输入用户名或账号"
          ></el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="loadData()" icon="el-icon-search"
            >搜索</el-button
          >
        </el-col>
        <el-col :span="2" :offset="16">
          <el-button
            type="primary"
            @click="createUser()"
            icon="el-icon-circle-plus-outline"
            >添加</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域-->
      <el-table :data="userData" :stripe="true">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="trueName" label="用户名"></el-table-column>
        <el-table-column prop="account" label="账号"></el-table-column>
        <el-table-column label="性别">
          <template slot-scope="scope">{{
            scope.row.gender == 0 ? '男' : '女'
          }}</template>
        </el-table-column>
        <el-table-column label="是否禁用">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              @change="handleDisable(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
            ></el-switch>
          </template>
        </el-table-column>
        <!--操作列-->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 分配机构 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配机构"
              placement="top"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-s-check"
                @click="
                  setOrgDialog.visible = true
                  setOrgDialog.empId = scope.row.employeeId
                  setOrgDialog.title = `分配机构-【${scope.row.trueName}】`
                "
                circle
              ></el-button>
            </el-tooltip>

            <!-- 分配岗位 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配岗位"
              placement="top"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-postcard"
                @click="
                  setJobDialog.visible = true
                  setJobDialog.empId = scope.row.employeeId
                  setJobDialog.title = `分配岗位-【${scope.row.trueName}】`
                "
                circle
              ></el-button>
            </el-tooltip>

            <!-- 模块授权操作 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="模块授权"
              placement="top"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-files"
                @click="
                  moduleAuthDialog.visible = true
                  moduleAuthDialog.userId = scope.row.id
                  moduleAuthDialog.title = `模块授权-【${scope.row.trueName}】`
                "
                circle
              ></el-button>
            </el-tooltip>

            <!-- 分配用户组操作 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配用户组"
              placement="top"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-s-custom"
                @click="
                  setUserGroupDialog.visible = true
                  setUserGroupDialog.userId = scope.row.id
                  setUserGroupDialog.title = `分配用户组-【${scope.row.trueName}】`
                "
                circle
              ></el-button>
            </el-tooltip>

            <!-- 分配角色操作 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-user"
                @click="
                  setUserRoleDialog.visible = true
                  setUserRoleDialog.userId = scope.row.id
                  setUserRoleDialog.title = `分配角色-【${scope.row.trueName}】`
                "
                circle
              ></el-button>
            </el-tooltip>

            <!-- 修改密码 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="修改密码"
              placement="top"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-s-goods"
                @click="
                  updatePwdDialog.visable = true
                  updatePwdDialog.data.id = scope.row.id
                  updatePwdDialog.data.account = scope.row.account
                  updatePwdDialog.title = `修改密码-【${scope.row.trueName}】`
                "
                circle
              ></el-button>
            </el-tooltip>

            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="editorUser(scope.$index, scope.row)"
              circle
            ></el-button>

            <el-button
              type="danger"
              size="mini"
              @click="delUser(scope.$index, scope.row)"
              icon="el-icon-delete"
              circle
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分页 -->
    <el-pagination
      @size-change="pageSizeChange"
      @current-change="pageCurrentChange"
      :current-page="queryInfo.current"
      :page-sizes="[1, 10, 20, 50, 100]"
      :page-size="queryInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="queryInfo.count"
    ></el-pagination>

    <!-- 新增编辑对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="createOrEdirotDialog.dialogTitle"
      :visible.sync="createOrEdirotDialog.visible"
    >
      <el-form
        ref="form"
        :model="createOrEdirotDialog.form"
        label-width="85px"
        label-position="right"
        :hide-required-asterisk="false"
        label-suffix="："
        :rules="validRules"
      >
        <el-form-item label="账号" :required="true" prop="account">
          <el-input v-model="createOrEdirotDialog.form.account"></el-input>
        </el-form-item>
        <el-form-item
          v-if="isAdd"
          label="密码"
          :required="true"
          prop="password"
        >
          <el-input
            v-model="createOrEdirotDialog.form.password"
            type="password"
            :show-password="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="名称" :required="true" prop="trueName">
          <el-input v-model="createOrEdirotDialog.form.trueName"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="createOrEdirotDialog.form.gender">
            <el-radio :label="0">男</el-radio>
            <el-radio :label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number
            v-model="createOrEdirotDialog.form.age"
            controls-position="right"
            :min="1"
            :max="300"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="生日">
          <el-col>
            <el-date-picker
              type="date"
              placeholder="选择日期"
              v-model="createOrEdirotDialog.form.birthday"
              style="width: 100%;"
            ></el-date-picker>
          </el-col>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="createOrEdirotDialog.form.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="createOrEdirotDialog.form.mobilePhoneNum"
          ></el-input>
        </el-form-item>
        <el-form-item label="工作号">
          <el-input v-model="createOrEdirotDialog.form.workPhoneNum"></el-input>
        </el-form-item>
        <el-form-item label="其它账号">
          <el-input
            v-model="createOrEdirotDialog.form.thirtPartyName"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">确认</el-button>
          <el-button @click="createOrEdirotDialog.visible = false"
            >取消</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="updatePwdDialog.title"
      :visible.sync="updatePwdDialog.visable"
      width="30%"
    >
      <el-form :model="updatePwdDialog.data" label-width="80px">
        <el-form-item label="新密码：" :required="true">
          <el-input
            v-model="updatePwdDialog.data.password"
            autocomplete="off"
            type="password"
            :show-password="true"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updatePwdDialog.visable = false">取 消</el-button>
        <el-button type="primary" @click="updatePassword">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配机构对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      top="5vh"
      :title="setOrgDialog.title"
      :visible.sync="setOrgDialog.visible"
      direction="ltr"
    >
      <sam-set-orgTree
        :empId="setOrgDialog.empId"
        :time="new Date().getTime()"
        @saveOrgs="setOrgDialog.visible = false"
        @cancel="setOrgDialog.visible = false"
      ></sam-set-orgTree>
    </el-dialog>

    <!-- 模块授权 -->
    <el-dialog
      :close-on-click-modal="false"
      top="5vh"
      :title="moduleAuthDialog.title"
      :visible.sync="moduleAuthDialog.visible"
      direction="ltr"
    >
      <sam-module-auth
        :userId="moduleAuthDialog.userId"
        :time="new Date().getTime()"
        @saveModuleAuth="moduleAuthDialog.visible = false"
        @cancel="moduleAuthDialog.visible = false"
      ></sam-module-auth>
    </el-dialog>

    <!-- 分配用户组 -->
    <el-dialog
      top="5vh"
      width="40%"
      :close-on-click-modal="false"
      :title="setUserGroupDialog.title"
      :visible.sync="setUserGroupDialog.visible"
      direction="ltr"
    >
      <sam-user-group
        :userId="setUserGroupDialog.userId"
        :time="new Date().getTime()"
        @ok="setUserGroupDialog.visible = false"
        @cancel="setUserGroupDialog.visible = false"
      ></sam-user-group>
    </el-dialog>

    <!-- 分配角色 -->
    <el-dialog
      top="5vh"
      width="40%"
      :close-on-click-modal="false"
      :title="setUserRoleDialog.title"
      :visible.sync="setUserRoleDialog.visible"
      direction="ltr"
    >
      <sam-user-role
        :userId="setUserRoleDialog.userId"
        :time="new Date().getTime()"
        @save="setUserRoleDialog.visible = false"
        @cancel="setUserRoleDialog.visible = false"
      ></sam-user-role>
    </el-dialog>

    <!-- 分配岗位 -->
    <el-dialog
      top="5vh"
      width="40%"
      :close-on-click-modal="false"
      :title="setJobDialog.title"
      :visible.sync="setJobDialog.visible"
      direction="ltr"
    >
      <sam-set-job
        :empId="setJobDialog.empId"
        :time="new Date().getTime()"
        @save="setJobDialog.visible = false"
        @cancel="setJobDialog.visible = false"
      ></sam-set-job>
    </el-dialog>
  </div>
</template>

<script>
// 分配机构子组件
import setOrgCon from './SetOrg.vue'
// 模块授权子组件
import moduleAuth from './ModuleAuth.vue'
// 分配用户组
import setUserGroup from './SetUserGroup'
// 分配角色
import setUserRole from './SetUserRole'
// 分配岗位
import SetJob from './SetJob'

export default {
  data() {
    return {
      // 状态类型
      statusType: [
        { label: '正常', value: 0 },
        { label: '禁用', value: 1 }
      ],
      // 查询信息
      queryInfo: {
        // 当前选择状态
        name: null,
        current: 1,
        pageSize: 10,
        count: 0
      },
      // 用户列表数据
      userData: [],
      // 创建或者编辑对话框
      createOrEdirotDialog: {
        dialogTitle: '用户操作',
        visible: false,
        // 新增编辑表单内容
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
      },
      // 新增编辑表单验证规则
      validRules: {
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        trueName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
      },
      // 是否是添加
      isAdd: true,

      // 更新密码弹出框
      updatePwdDialog: {
        visable: false,
        data: {
          id: '',
          account: '',
          password: ''
        },
        title: ''
      },
      // 分配机构
      setOrgDialog: {
        title: '分配机构',
        visible: false,
        empId: '18063dc9-35e9-4f50-a4df-7ec24891b880'
      },
      // 分配岗位
      setJobDialog: {
        title: '分配岗位',
        visible: false,
        empId: '18063dc9-35e9-4f50-a4df-7ec24891b880'
      },
      // 模块授权
      moduleAuthDialog: {
        title: '模块授权',
        visible: false,
        userId: '18063dc9-35e9-4f50-a4df-7ec24891b880'
      },
      // 分配用户组
      setUserGroupDialog: {
        title: '分配用户组',
        visible: false,
        userId: '18063dc9-35e9-4f50-a4df-7ec24891b880'
      },
      // 分配角色
      setUserRoleDialog: {
        title: '分配角色',
        visible: false,
        userId: '18063dc9-35e9-4f50-a4df-7ec24891b880'
      }
    }
  },
  methods: {
    // 加载数据
    loadData: async function() {
      var query = this.$getQuery(this.queryInfo)
      console.debug('query', query)

      // eslint-disable-next-line no-unused-vars
      var res = await this.$http({
        url: '/api/PmsUser/getbyurl?' + query,
        method: 'get'
      })
      var data = this.$validResponse(res)
      if (data === null) {
        return false
      }
      this.queryInfo.current = res.page.current
      this.queryInfo.count = res.count
      this.queryInfo.pageSize = res.page.pageSize
      this.userData = res.data
    },
    // 编辑用户
    editorUser(index, data) {
      console.log(index, data)
      this.isAdd = false
      this.createOrEdirotDialog.visible = true
      this.createOrEdirotDialog.dialogTitle = '编辑用户'
      Object.assign(this.createOrEdirotDialog.form, data)
    },
    // 创建用户
    createUser() {
      this.isAdd = true
      this.createOrEdirotDialog.visible = true
      this.createOrEdirotDialog.dialogTitle = '添加用户'
      Object.assign(
        this.createOrEdirotDialog.form,
        this.$options.data().createOrEdirotDialog.form
      )
      console.log(this)
    },
    // 禁用用户
    async handleDisable(index, data) {
      var url = `/api/app/changestatus/${data.id}/${data.status}`
      this.$changeStatus(url)
    },
    // 删除用户
    async delUser(index, data) {
      var resData = await this.$delById(`/api/PmsUser/delete/${data.id}`)
      if (resData !== true) {
        return false
      }
      this.userData = this.userData.filter(e => e.id !== data.id)
      this.$message({ type: 'success', message: '删除成功!' })
    },
    // 新增编辑用户提交事件
    async onSubmit() {
      const that = this
      this.$refs.form.validate(async valid => {
        if (!valid) {
          console.log('error submit!!')
          return false
        }

        var res = null
        if (this.isAdd) {
          // 新增
          // 加密密码
          this.createOrEdirotDialog.form.password = this.$md5(
            this.createOrEdirotDialog.form.account +
              this.createOrEdirotDialog.form.password
          )
          res = await this.$http({
            url: '/api/PmsUser/addnew',
            method: 'put',
            data: that.createOrEdirotDialog.form
          })
        } else {
          // 编辑
          res = await this.$http({
            url: '/api/PmsUser/update',
            method: 'post',
            data: that.createOrEdirotDialog.form
          })
        }
        if (!res) {
          this.$message.error('网络错误')
          return false
        }
        if (res.code !== 0) {
          this.$message.error(res.msg)
          return false
        }
        // 判断对象是否存在
        var index = this.userData.findIndex(e => e.id === res.data.id)
        if (index === -1) {
          this.userData.push(res.data)
        } else {
          Object.assign(this.userData[index], res.data)
        }
        // 隐藏对话框
        this.createOrEdirotDialog.visible = false
        return false
      })
    },

    // 修改密码
    async updatePassword() {
      const that = this
      that.updatePwdDialog.data.password = this.$md5(
        that.updatePwdDialog.data.account + that.updatePwdDialog.data.password
      )
      var res = await this.$http({
        url:
          // eslint-disable-next-line no-template-curly-in-string
          '/api/PmsUser/update_pwd',
        method: 'post',
        data: that.updatePwdDialog.data
      })

      this.updatePwdDialog.data.password = ''
      if (res === null) {
        this.$message.error('网络错误')
        return false
      }
      if (res.code !== 0) {
        this.$message.error(res.msg)
        return false
      }
      this.updatePwdDialog.visable = false
      this.$message('更新成功！')
    },
    // 一页数据改变事件
    pageSizeChange(val) {
      this.queryInfo.pageSize = val
      this.loadData()
    },
    // 页码改变数据
    pageCurrentChange(val) {
      this.queryInfo.current = val
      this.loadData()
    }
  },
  mounted: async function() {
    this.loadData()
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    'sam-set-orgTree': setOrgCon,
    // eslint-disable-next-line vue/no-unused-components
    'sam-module-auth': moduleAuth,
    // eslint-disable-next-line vue/no-unused-components
    'sam-user-group': setUserGroup,
    // eslint-disable-next-line vue/no-unused-components
    'sam-user-role': setUserRole,
    // eslint-disable-next-line vue/no-unused-components
    'sam-set-job': SetJob
  }
}
</script>

<style lang="less" scoped></style>
