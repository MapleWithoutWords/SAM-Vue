<template>
  <div>
    <!-- 导航头-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>API资源管理</el-breadcrumb-item>
      <el-breadcrumb-item>应用系统模块</el-breadcrumb-item>
    </el-breadcrumb>
    <!--主体-->
    <el-card>
      <!--搜索-->
      <el-row :gutter="15">
        <el-col :span="4">
          <el-select
            v-model="queryInfo.appId"
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
        <el-col :span="3">
          <el-checkbox
            label="是否包含子集"
            v-model="queryInfo.isContainChild"
          ></el-checkbox>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="loadData()" icon="el-icon-search"
            >搜索</el-button
          >
        </el-col>
        <el-col v-show="queryInfo.parentId != ''" :span="2" :offset="6">
          <el-button type="primary" @click="backUp()" icon="el-icon-back"
            >返回顶级</el-button
          >
        </el-col>
        <el-col :span="2" :offset="queryInfo.parentId == '' ? 9 : 1">
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
        <el-table-column prop="parentName" label="父级模块"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="url" label="Url"></el-table-column>
        <el-table-column prop="childCount" label="子模块数"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <!--操作列-->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--查看子集-->
            <el-button
              v-show="scope.row.childCount > 0"
              size="mini"
              icon="el-icon-aim"
              @click="showChild(scope.row)"
              circle
            ></el-button>

            <!--添加子集-->
            <el-tooltip
              class="item"
              effect="dark"
              content="添加子模块"
              placement="top"
              v-show="!scope.row.isEnd"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-circle-plus-outline"
                @click="addChild(scope.row)"
                circle
              >
              </el-button>
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
        <el-form-item label="上级模块">
          <el-input
            v-model="createOrEdirotDialog.form.parentName"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="模块名" :required="true" prop="name">
          <el-input v-model="createOrEdirotDialog.form.name"></el-input>
        </el-form-item>

        <el-form-item label="模块地址" :required="true" prop="url">
          <el-input v-model="createOrEdirotDialog.form.url"></el-input>
        </el-form-item>
        <el-form-item label="图标" :required="true" prop="icon">
          <el-input v-model="createOrEdirotDialog.form.icon"></el-input>
        </el-form-item>

        <el-form-item label="配置">
          <el-checkbox
            label="是否叶子节点"
            v-model="createOrEdirotDialog.form.isEnd"
          ></el-checkbox>
          <el-checkbox
            label="是否有效"
            v-model="createOrEdirotDialog.form.isActivity"
          ></el-checkbox>
          <el-checkbox
            label="是否新窗口打开"
            v-model="createOrEdirotDialog.form.isOpenNew"
          ></el-checkbox>
        </el-form-item>

        <el-form-item label="排序号" prop="seqNo">
          <el-input
            v-model="createOrEdirotDialog.form.seqNo"
            type="number"
          ></el-input>
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
        name: '',
        appId: '',
        appName: '',
        parentId: '',
        parentName: '',
        isContainChild: false,
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
        dialogTitle: '资源类型操作',
        // 对话框显示隐藏
        visible: false,
        // 是否是新增
        isAdd: false,
        isIndeterminate: true,
        checkAll: false,
        // 表单对象
        form: {
          parentId: '',
          appId: '',
          parentName: '',
          name: '',
          url: 'none',
          seqNo: '0',
          icon: 'none',
          isActivity: true,
          isEnd: false,
          isOpenNew: false,
          description: 'none',
          operationIds: [],
          id: ''
        },
        // 编辑时，模块拥有的操作
        editorOperations: [],
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
        url: '/api/PmsAppModule/getbyurl?' + query,
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
      this.createOrEdirotDialog.dialogTitle = '新增资源类型'
      this.createOrEdirotDialog.isAdd = false
      this.createOrEdirotDialog.visible = true
      Object.assign(
        this.createOrEdirotDialog.form,
        this.$options.data().createOrEdirotDialog.form
      )
      // this.$refs.form.resetFields()
      this.createOrEdirotDialog.form.appId = this.queryInfo.appId
      var appName = this.appList[
        this.appList.findIndex(e => e.value === this.queryInfo.appId)
      ]?.name
      this.createOrEdirotDialog.form.appName = appName
      this.createOrEdirotDialog.form.parentId = this.queryInfo.parentId
      this.createOrEdirotDialog.form.parentName = this.queryInfo.parentName
    },
    // 修改
    async editorData(index, data) {
      var editorData = await this.$sendAsync({
        url: '/api/PmsAppModule/getbyid/' + data.id,
        method: 'get'
      })
      if (editorData === null) {
        return false
      }
      this.createOrEdirotDialog.dialogTitle = '编辑模块'
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
            url: '/api/PmsAppModule/addnew',
            method: 'put',
            data: that.createOrEdirotDialog.form
          })
          if (resData !== null) {
            that.loadData()
            that.createOrEdirotDialog.visible = false
          }
        } else {
          var editorResData = await this.$sendAsync({
            url: '/api/PmsAppModule/update',
            method: 'post',
            data: that.createOrEdirotDialog.form
          })
          if (editorResData !== null) {
            var editorIndex = that.moduleData.findIndex(
              e => e.id === editorResData.data.id
            )
            if (editorIndex !== -1) {
              editorResData.data.parentName =
                that.moduleData[editorIndex].parentName
              Object.assign(that.moduleData[editorIndex], editorResData.data)
            }
            that.createOrEdirotDialog.visible = false
          }
        }
      })
    },
    // 删除
    async delData(index, data) {
      var resData = await this.$delById(`/api/PmsAppModule/delete/${data.id}`)
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
    },
    // 查看子集
    showChild(data) {
      this.queryInfo.parentId = data.id
      this.queryInfo.parentName = data.name
      this.loadData()
    },
    // 添加子集
    addChild(data) {
      this.createData()
      this.createOrEdirotDialog.form.parentId = data.id
      this.createOrEdirotDialog.form.parentName = data.name
    },
    // 回到上一级
    backUp() {
      this.queryInfo.parentId = ''
      this.queryInfo.parentName = ''
      this.loadData()
    }
  },
  mounted: async function() {
    var resData = await this.$sendAsync({
      url: '/api/com/getallapp',
      method: 'get'
    })
    this.appList = resData.data
    this.queryInfo.appId = resData.data.length > 0 ? resData.data[0].value : ''

    this.loadData()
  }
}
</script>

<style lang="less" scoped>
.chbox_operations {
  border: 1px solid lightgray;
  padding-left: 15px;
}
</style>
