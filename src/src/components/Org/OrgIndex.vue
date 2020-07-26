<template>
  <div>
    <!-- 导航头-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>授权管理</el-breadcrumb-item>
      <el-breadcrumb-item>应用系统机构</el-breadcrumb-item>
    </el-breadcrumb>
    <!--主体-->
    <el-card>
      <!--搜索-->
      <el-row :gutter="15">
        <el-col :span="6">
          <tenant-select
            :tenantId="queryInfo.tenantId"
            @selChange="
              value => {
                queryInfo.tenantId = value
                loadData()
              }
            "
          ></tenant-select>
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
        <el-col v-show="queryInfo.parentId != ''" :span="2">
          <el-button type="primary" @click="backUp()" icon="el-icon-back"
            >返回顶级</el-button
          >
        </el-col>
        <el-col :span="2">
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
        <el-table-column prop="parentName" label="上级机构"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="childCount" label="子机构数"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <!--操作列-->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--查看子集-->
            <el-tooltip
              class="item"
              effect="dark"
              content="查看子机构"
              placement="top"
            >
            <el-button
              v-show="scope.row.childCount > 0"
              size="mini"
              icon="el-icon-aim"
              @click="showChild(scope.row)"
              circle
            ></el-button>
            </el-tooltip>

            <!--添加子集-->
            <el-tooltip
              class="item"
              effect="dark"
              content="添加子机构"
              placement="top"
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
        <el-form-item label="上级机构">
          <el-input
            v-model="createOrEdirotDialog.form.parentName"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="机构名" :required="true" prop="name">
          <el-input v-model="createOrEdirotDialog.form.name"></el-input>
        </el-form-item>

        <el-form-item label="机构类型" :required="true">
          <el-select
            v-model="createOrEdirotDialog.form.type"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in orgTypes"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="机构编码" :required="true" prop="code">
          <el-input v-model="createOrEdirotDialog.form.code"></el-input>
        </el-form-item>
        <el-form-item label="排序" :required="true" prop="seqNo">
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
// 租户
import TenantSelect from '../Com/TenantSelect'
export default {
  data() {
    return {
      // 查询对象
      queryInfo: {
        name: '',
        parentId: '',
        parentName: '',
        tenantId: '00000000-0000-0000-0000-000000000000',
        isContainChild: false,
        current: 1,
        pageSize: 10,
        count: 0
      },
      // 列表数据
      moduleData: [],
      // 所有应用系统
      orgTypes: [],
      // 编辑新增数据
      createOrEdirotDialog: {
        // 对话框标题
        dialogTitle: '机构操作',
        // 对话框显示隐藏
        visible: false,
        // 是否是新增
        isAdd: false,
        // 表单对象
        form: {
          parentId: '',
          parentName: '',
          name: '',
          description: 'none',
          id: '',
          seqNo: 0,
          type: '',
          code: 'none',
          tenantId: ''
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
        url: '/api/PmsOrganization/getbyurl?' + query,
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
      this.createOrEdirotDialog.dialogTitle = '新增机构'
      this.createOrEdirotDialog.isAdd = false
      this.createOrEdirotDialog.visible = true
      Object.assign(
        this.createOrEdirotDialog.form,
        this.$options.data().createOrEdirotDialog.form
      )
      this.createOrEdirotDialog.form.parentId = this.queryInfo.parentId
      this.createOrEdirotDialog.form.parentName = this.queryInfo.parentName
      this.createOrEdirotDialog.form.tenantId = this.queryInfo.tenantId
    },
    // 修改
    async editorData(index, data) {
      var editorData = await this.$sendAsync({
        url: '/api/PmsOrganization/getbyid/' + data.id,
        method: 'get'
      })
      if (editorData === null) {
        return false
      }
      this.createOrEdirotDialog.dialogTitle = '编辑机构'
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
            url: '/api/PmsOrganization/addnew',
            method: 'put',
            data: that.createOrEdirotDialog.form
          })
          if (resData !== null) {
            that.loadData()
            that.createOrEdirotDialog.visible = false
          }
        } else {
          var editorResData = await this.$sendAsync({
            url: '/api/PmsOrganization/update',
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
      var resData = await this.$delById(
        `/api/PmsOrganization/delete/${data.id}`
      )
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
    var orgTypeRes = await this.$sendAsync({
      url: '/api/com/getorgtype',
      method: 'get'
    })
    this.orgTypes = orgTypeRes.data
    this.loadData()
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    'tenant-select': TenantSelect
  }
}
</script>

<style lang="less" scoped></style>
