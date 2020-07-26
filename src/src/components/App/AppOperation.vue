<template>
  <div>
    <!-- 导航头-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>API资源管理</el-breadcrumb-item>
      <el-breadcrumb-item>应用系统操作</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row>
      <el-col :span="4">
        <div class="moduleTreeDiv">
          <span class="moduleTreeTitle">模块</span>
          <el-tree
            ref="moduleTree"
            :data="allModules"
            :props="defaultProps"
            @node-click="handleModuleNodeClick"
            default-expand-all
            check-strictly
          ></el-tree>
        </div>
      </el-col>
      <el-col :span="19" style="margin-left:15px">
        <!--主体-->
        <el-card>
          <!--搜索-->
          <el-row :gutter="15">
            <el-col :span="4">
              <el-select
                v-model="queryInfo.applicationId"
                @change="loadModuleData()"
                placeholder="请选择应用系统"
              >
                <el-option
                  v-for="item in appList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
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
              <el-button
                type="primary"
                @click="loadData()"
                icon="el-icon-search"
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
          <el-table :data="operaData" :stripe="true" :border="true">
            <el-table-column type="selection"></el-table-column>
            <el-table-column prop="appName" label="应用系统"></el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column prop="url" label="地址"></el-table-column>
            <el-table-column prop="icon" label="图标"></el-table-column>
            <el-table-column
              prop="operationSourceName"
              label="操作类型"
            ></el-table-column>
            <el-table-column prop="seqNo" label="排序"></el-table-column>
            <!--操作列-->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editorData(scope.$index, scope.row)"
                  circle
                ></el-button>
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
      </el-col>
    </el-row>

    <!-- 新增编辑对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="createOrEdirotDialog.dialogTitle"
      :visible.sync="createOrEdirotDialog.visible"
    >
      <el-form
        ref="form"
        :model="createOrEdirotDialog.form"
        label-width="150px"
        label-position="right"
        :hide-required-asterisk="false"
        label-suffix="："
        :rules="createOrEdirotDialog.validRules"
      >
        <el-form-item label="应用系统">
          <el-input
            v-model="createOrEdirotDialog.form.appName"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="模块名">
          <el-input
            v-model="createOrEdirotDialog.moduleName"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="操作名" :required="true" prop="name">
          <el-input v-model="createOrEdirotDialog.form.name"></el-input>
        </el-form-item>
        <el-form-item label="地址" :required="true" prop="url">
          <el-input
            v-model="createOrEdirotDialog.form.url"
            placeholder="接口地址"
          ></el-input>
        </el-form-item>
        <el-form-item label="操作类型" :required="true">
          <el-select
            v-model="createOrEdirotDialog.form.optionSource"
            placeholder="请选择操作类型"
          >
            <el-option
              v-for="item in createOrEdirotDialog.operationSources"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作图标" prop="icon">
          <el-input v-model="createOrEdirotDialog.form.icon"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="seqNo">
          <el-input v-model="createOrEdirotDialog.form.seqNo"></el-input>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询对象
      queryInfo: {
        name: null,
        current: 1,
        applicationId: '',
        moduleId: '',
        appName: '',
        pageSize: 10,
        count: 0
      },
      // 列表数据
      operaData: [],
      // 所有应用系统
      appList: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      // 模块树
      allModules: [],
      createOrEdirotDialog: {
        dialogTitle: '资源类型操作',
        visible: false,
        isAdd: false,
        // 表单对象
        form: {
          name: '',
          description: 'none',
          optionSource: '',
          applicationId: '',
          moduleId: '',
          icon: 'none',
          url: '',
          appName: '',
          seqNo: 0,
          id: ''
        },
        // 操作类型
        operationSources: [],
        // 表单验证规则
        validRules: {}
      }
    }
  },
  methods: {
    // 加载数据
    async loadData() {
      var query = this.$getQuery(this.queryInfo)
      var res = await this.$http({
        url: '/api/PmsAppOperation/getbyurl?' + query,
        method: 'get'
      })
      var data = this.$validResponse(res)
      if (data !== null) {
        this.operaData = data.data
        this.queryInfo.current = res.page?.current
        this.queryInfo.count = res.count
        this.queryInfo.pageSize = res.page?.pageSize
      }
    },
    // 创建
    createData() {
      if (!this.createOrEdirotDialog.form.moduleId) {
        this.$message('请选择模块')
        return false
      }
      this.createOrEdirotDialog.dialogTitle = '新增应用系统操作'
      this.createOrEdirotDialog.isAdd = false
      this.createOrEdirotDialog.visible = true
      Object.assign(
        this.createOrEdirotDialog.form,
        this.$options.data().createOrEdirotDialog.form
      )
      this.createOrEdirotDialog.form.applicationId = this.queryInfo.applicationId
      this.createOrEdirotDialog.form.moduleId = this.queryInfo.moduleId
      var appName = this.appList[
        this.appList.findIndex(e => e.value === this.queryInfo.applicationId)
      ]?.name

      this.createOrEdirotDialog.form.appName = appName
    },
    // 修改
    editorData(index, data) {
      this.createOrEdirotDialog.dialogTitle = '编辑应用系统操作'
      this.createOrEdirotDialog.isAdd = true
      this.createOrEdirotDialog.visible = true
      Object.assign(this.createOrEdirotDialog.form, data)
    },
    onSubmit() {
      const that = this
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return false
        }
        if (this.createOrEdirotDialog.isAdd === false) {
          var resData = await this.$sendAsync({
            url: '/api/PmsAppOperation/addnew',
            method: 'put',
            data: that.createOrEdirotDialog.form
          })
          if (resData !== null) {
            that.operaData.push(resData.data)
            that.createOrEdirotDialog.visible = false
          }
        } else {
          var editorResData = await this.$sendAsync({
            url: '/api/PmsAppOperation/update',
            method: 'post',
            data: that.createOrEdirotDialog.form
          })
          if (editorResData !== null) {
            var editorIndex = that.operaData.findIndex(
              e => e.id === editorResData.data.id
            )
            if (editorIndex !== -1) {
              Object.assign(that.operaData[editorIndex], editorResData.data)
            }
            that.createOrEdirotDialog.visible = false
          }
        }
      })
    },
    // 删除
    async delData(index, data) {
      var resData = await this.$delById(
        `/api/PmsAppOperation/delete/${data.id}`
      )
      if (resData !== true) {
        return false
      }
      this.operaData = this.operaData.filter(e => e.id !== data.id)
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
    },
    // 树组件单击事件
    handleModuleNodeClick(data, node) {
      console.log(data, node)
      if (data.children.length > 0) {
        node.expanded = true
      }
      this.queryInfo.moduleId = data.id
      this.createOrEdirotDialog.moduleName = data.title
      this.createOrEdirotDialog.form.moduleId = data.id
      this.loadData()
      return false
    },
    async loadModuleData() {
      var moduleTreeRes = await this.$sendAsync({
        url: `/api/PmsAppModule/get_module_tree/${this.queryInfo.applicationId}`,
        method: 'get'
      })
      this.allModules = moduleTreeRes.data
      if (!this.allModules || this.allModules.length < 1) {
        this.createOrEdirotDialog.form.moduleId = ''
        this.createOrEdirotDialog.moduleName = ''
        // this.$router.push('/appmodule')
        return false
      }
      console.log(this.allModules[0])
      this.queryInfo.moduleId = moduleTreeRes.data[0].id
      this.createOrEdirotDialog.moduleName = moduleTreeRes.data[0].title
      this.createOrEdirotDialog.form.moduleId = moduleTreeRes.data[0].id
      this.loadData()
    }
  },
  mounted: async function() {
    var resData = await this.$sendAsync({
      url: '/api/app/getbyurl?pageSize=999',
      method: 'get'
    })
    this.appList = resData.data
    this.queryInfo.applicationId =
      resData.data.length > 0 ? resData.data[0].value : ''

    // 获取操作类型
    var allOpearSources = await this.$sendAsync({
      url: '/api/com/get_app_operation_type',
      method: 'get'
    })
    this.createOrEdirotDialog.operationSources = allOpearSources.data

    this.loadModuleData()
    this.loadData()
  }
}
</script>

<style lang="less" scoped>
.moduleTreeDiv {
  height: 74vh;
  border: 1px solid gainsboro;
  padding: 15px;
  margin-bottom: 15px;
  background-color: white;
}

.moduleTreeTitle {
  color: darkgray;
}
</style>
