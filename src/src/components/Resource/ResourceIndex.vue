<template>
  <div>
    <!-- 导航头-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>基础数据</el-breadcrumb-item>
      <el-breadcrumb-item>应用系统管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!--主体-->
    <el-card>
      <!--搜索-->
      <el-row :gutter="15">
        <el-col :span="4">
          <el-input
            v-model="queryInfo.name"
            placeholder="请输入名称"
          ></el-input>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryInfo.resourceTypeId"
            clearable
            placeholder="请选择资源类型"
          >
            <el-option
              v-for="item in createOrEdirotDialog.resourceTypes"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
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
      <el-table :data="appData" :stripe="true" :border="true">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="resourceTypeName" label="类型"></el-table-column>
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

    <!-- 新增编辑对话框 -->
    <el-dialog
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
        <el-form-item label="资源名" :required="true" prop="name">
          <el-input v-model="createOrEdirotDialog.form.name"></el-input>
        </el-form-item>

        <el-form-item label="资源类型" :required="true">
          <el-select
            v-model="createOrEdirotDialog.form.resourceTypeId"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in createOrEdirotDialog.resourceTypes"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
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
        resourceTypeId: null,
        current: 1,
        pageSize: 10,
        count: 0
      },
      // 列表数据
      appData: [],
      createOrEdirotDialog: {
        dialogTitle: '应用系统操作',
        visible: false,
        isAdd: false,
        resourceTypes: [],
        // 表单对象
        form: {
          name: '',
          resourceTypeId: '',
          seqNo: 0,
          id: ''
        },
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
        url: '/api/pmsresource/getbyurl?' + query,
        method: 'get'
      })
      var data = this.$validResponse(res)
      if (data !== null) {
        this.appData = data.data
        this.queryInfo.current = res.page.current
        this.queryInfo.count = res.count
        this.queryInfo.pageSize = res.page.pageSize
      }
    },
    // 创建
    async createData() {
      console.log(this.resourceTypes)

      this.createOrEdirotDialog.dialogTitle = '新增应用系统'
      this.createOrEdirotDialog.isAdd = false
      this.createOrEdirotDialog.visible = true
      // var resData = await this.$sendAsync({
      //   url: '/api/com/getallresourcetype',
      //   method: 'get'
      // })
      // this.createOrEdirotDialog.resourceTypes = resData.data
      Object.assign(
        this.createOrEdirotDialog.form,
        this.$options.data().createOrEdirotDialog.form
      )
    },
    // 修改
    async editorData(index, data) {
      // var resData = await this.$sendAsync({
      //   url: '/api/com/getallresourcetype',
      //   method: 'get'
      // })
      // this.createOrEdirotDialog.resourceTypes = resData.data
      this.createOrEdirotDialog.dialogTitle = '编辑应用系统'
      this.createOrEdirotDialog.isAdd = true
      this.createOrEdirotDialog.visible = true
      Object.assign(this.createOrEdirotDialog.form, data)
    },
    onSubmit() {
      const that = this
      this.$refs.form.validate(async valid => {
        if (!valid) {
          console.log('error submit!!')
          return false
        }
        if (this.createOrEdirotDialog.isAdd === false) {
          var resData = await this.$sendAsync({
            url: '/api/pmsresource/addnew',
            method: 'put',
            data: that.createOrEdirotDialog.form
          })
          if (resData !== null) {
            that.appData.push(resData.data)
            that.createOrEdirotDialog.visible = false
          }
        } else {
          var editorResData = await this.$sendAsync({
            url: '/api/pmsresource/update',
            method: 'post',
            data: that.createOrEdirotDialog.form
          })
          if (editorResData !== null) {
            var editorIndex = that.appData.findIndex(
              e => e.id === editorResData.data.id
            )
            debugger
            if (editorIndex !== -1) {
              Object.assign(that.appData[editorIndex], editorResData.data)
            }
            that.createOrEdirotDialog.visible = false
          }
        }
      })
    },
    // 删除
    async delData(index, data) {
      var resData = await this.$delById(`/api/pmsresource/delete/${data.id}`)
      if (resData !== true) {
        return false
      }
      this.appData = this.appData.filter(e => e.id !== data.id)
      this.$message({ type: 'success', message: '删除成功!' })
    },
    async handleDisable(index, data) {
      var url = `/api/pmsresource/changestatus/${data.id}/${data.status}`
      this.$changeStatus(url)
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
    var resData = await this.$sendAsync({
      url: '/api/com/getallresourcetype',
      method: 'get'
    })
    this.createOrEdirotDialog.resourceTypes = resData.data
  },
  computed: {}
}
</script>

<style lang="less" scoped></style>
