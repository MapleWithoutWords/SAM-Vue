<template>
  <div>
    <!-- 导航头-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>应用系统用户组</el-breadcrumb-item>
    </el-breadcrumb>
    <!--主体-->
    <el-card>
      <!--搜索-->
      <el-row :gutter="15">
        <el-col :span="4">
          <el-select
            v-model="queryInfo.applicationId"
            @change="loadData()"
            placeholder="请选择应用系统"
          >
            <el-option
              v-for="item in appList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input
            v-model="queryInfo.name"
            placeholder="请输入名称"
          ></el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="loadData()" icon="el-icon-search"
            >搜索</el-button
          >
        </el-col>
        <el-col :span="2" :offset="12">
          <el-button
            type="primary"
            @click="createData()"
            icon="el-icon-circle-plus-outline"
            >添加</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域-->
      <el-table :data="moduleData" :stripe="true" :border="true">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <!--操作列-->
        <el-table-column label="操作">
          <template slot-scope="scope">
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
                  UserGroupModuleDialog.visible = true
                  UserGroupModuleDialog.authGroupId = scope.row.id
                  UserGroupModuleDialog.title = `模块授权-【${queryInfo.appName}】-【${scope.row.name}】`
                "
                circle
              ></el-button>
            </el-tooltip>

            <!--编辑-->
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="editorData(scope.$index, scope.row)"
              circle
            ></el-button>
            <!--删除-->
            <el-button
              type="danger"
              size="mini"
              @click="delData(scope.$index, scope.row)"
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
        label-width="130px"
        label-position="right"
        :hide-required-asterisk="false"
        label-suffix="："
        :rules="createOrEdirotDialog.validRules"
      >
        <el-form-item label="名称" :required="true" prop="name">
          <el-input v-model="createOrEdirotDialog.form.name"></el-input>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="createOrEdirotDialog.form.description"
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

    <!-- 模块授权 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="UserGroupModuleDialog.dialogTitle"
      :visible.sync="UserGroupModuleDialog.visible"
    >
      <sam-user-group-auth
        :authGroupId="UserGroupModuleDialog.authGroupId"
        :appId="queryInfo.applicationId"
        :time="new Date().getTime()"
        @saveAuth="UserGroupModuleDialog.visible = false"
        @cancel="UserGroupModuleDialog.visible = false"
      ></sam-user-group-auth>
    </el-dialog>
  </div>
</template>

<script>
import userGroupAuth from './UserGroupAuth.vue'
export default {
  data() {
    return {
      // 查询对象
      queryInfo: {
        name: '',
        applicationId: '',
        appName: '',
        current: 1,
        pageSize: 10,
        count: 0
      },
      // 列表数据
      moduleData: [],
      // 所有应用系统
      appList: [],
      // 编辑新增数据
      createOrEdirotDialog: {
        // 对话框标题
        dialogTitle: '用户组操作',
        // 对话框显示隐藏
        visible: false,
        // 是否是新增
        isAdd: false,
        // 表单对象
        form: {
          applicationId: '',
          name: '',
          description: 'none',
          id: ''
        },
        // 表单验证规则
        validRules: {}
      },
      // 角色模块授权
      UserGroupModuleDialog: {
        visible: false,
        title: '用户组模块授权',
        authGroupId: ''
      }
    }
  },
  methods: {
    // 加载数据
    async loadData() {
      var query = this.$getQuery(this.queryInfo)
      var res = await this.$http({
        url: '/api/PmsUserGroup/getbyurl?' + query,
        method: 'get'
      })
      var data = this.$validResponse(res)
      if (data !== null) {
        this.moduleData = data.data
        this.queryInfo.current = res.page?.current
        this.queryInfo.count = res.count
        this.queryInfo.pageSize = res.page?.pageSize
      }
    },
    // 创建
    createData() {
      this.createOrEdirotDialog.dialogTitle = '新增用户组'
      this.createOrEdirotDialog.isAdd = false
      this.createOrEdirotDialog.visible = true
      Object.assign(
        this.createOrEdirotDialog.form,
        this.$options.data().createOrEdirotDialog.form
      )
      // this.$refs.form.resetFields()
      this.createOrEdirotDialog.form.applicationId = this.queryInfo.applicationId
      var appName = this.appList[
        this.appList.findIndex(e => e.value === this.queryInfo.applicationId)
      ]?.name
      this.createOrEdirotDialog.form.appName = appName
    },
    // 修改
    async editorData(index, data) {
      var editorData = await this.$sendAsync({
        url: '/api/PmsUserGroup/getbyid/' + data.id,
        method: 'get'
      })
      if (editorData === null) {
        return false
      }
      this.createOrEdirotDialog.dialogTitle = '编辑用户组'
      this.createOrEdirotDialog.isAdd = true
      this.createOrEdirotDialog.visible = true
      Object.assign(this.createOrEdirotDialog.form, editorData.data)
    },
    onSubmit() {
      const that = this
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return false
        }
        if (this.createOrEdirotDialog.isAdd === false) {
          var resData = await this.$sendAsync({
            url: '/api/PmsUserGroup/addnew',
            method: 'put',
            data: that.createOrEdirotDialog.form
          })
          if (resData !== null) {
            that.loadData()
            that.createOrEdirotDialog.visible = false
          }
        } else {
          var editorResData = await this.$sendAsync({
            url: '/api/PmsUserGroup/update',
            method: 'post',
            data: that.createOrEdirotDialog.form
          })
          if (editorResData !== null) {
            var editorIndex = that.moduleData.findIndex(
              e => e.id === editorResData.data.id
            )
            if (editorIndex !== -1) {
              Object.assign(that.moduleData[editorIndex], editorResData.data)
            }
            that.createOrEdirotDialog.visible = false
          }
        }
      })
    },
    // 删除
    async delData(index, data) {
      var resData = await this.$delById(`/api/PmsUserGroup/delete/${data.id}`)
      if (resData !== true) {
        return false
      }
      this.moduleData = this.moduleData.filter(e => e.id !== data.id)
      this.$message({ type: 'success', message: '删除成功!' })
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
    var resData = await this.$sendAsync({
      url: '/api/com/getallapp',
      method: 'get'
    })
    this.appList = resData.data
    this.queryInfo.applicationId =
      resData.data.length > 0 ? resData.data[0].value : ''

    this.loadData()
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    'sam-user-group-auth': userGroupAuth
  }
}
</script>

<style lang="less" scoped></style>
