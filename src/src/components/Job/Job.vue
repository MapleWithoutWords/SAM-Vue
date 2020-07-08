<template>
  <div>
    <!-- 导航头-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户数据</el-breadcrumb-item>
      <el-breadcrumb-item>岗位管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row>
      <el-col :span="4">
        <div class="orgTreeDiv">
          <span class="orgTreeTitle">部门</span>
          <el-tree
            :data="allOrgs"
            :props="defaultProps"
            @node-click="handleOrgNodeClick"
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
              <el-input
                v-model="queryInfo.name"
                placeholder="请输入名称"
              ></el-input>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="queryInfo.jobCategoryId"
                clearable
                placeholder="请选择岗位类型"
              >
                <el-option
                  v-for="item in createOrEdirotDialog.resourceTypes"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="2">
              <el-button
                type="primary"
                @click="loadData()"
                icon="el-icon-search"
                >搜索</el-button
              >
            </el-col>
            <el-col :span="2" :offset="11">
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
            <el-table-column prop="orgName" label="机构名"></el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column prop="levelName" label="等级"></el-table-column>
            <el-table-column
              prop="jobCategoryName"
              label="类型"
            ></el-table-column>
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
      </el-col>
    </el-row>
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
        label-width="150px"
        label-position="right"
        :hide-required-asterisk="false"
        label-suffix="："
        :rules="createOrEdirotDialog.validRules"
      >
        <el-form-item label="所属机构" :required="true">
          <el-input :readonly="true" v-model="queryInfo.orgName"></el-input>
        </el-form-item>
        <el-form-item label="岗位名" :required="true" prop="name">
          <el-input v-model="createOrEdirotDialog.form.name"></el-input>
        </el-form-item>

        <el-form-item label="岗位类型" :required="true" prop="jobCategoryId">
          <el-select
            v-model="createOrEdirotDialog.form.jobCategoryId"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in createOrEdirotDialog.resourceTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="岗位级别" :required="true" prop="level">
          <el-select
            v-model="createOrEdirotDialog.form.level"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in createOrEdirotDialog.jobLevels"
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
        jobCategoryId: null,
        current: 1,
        pageSize: 10,
        count: 0,
        orgId: '',
        orgName: ''
      },
      // 列表数据
      appData: [],
      createOrEdirotDialog: {
        dialogTitle: '应用系统操作',
        visible: false,
        isAdd: false,
        resourceTypes: [],
        jobLevels: [],
        // 表单对象
        form: {
          name: '',
          jobCategoryId: '',
          seqNo: 0,
          id: '',
          description: 'none',
          level: '',
          organizationId: ''
        },
        // 表单验证规则
        validRules: {}
      },
      allOrgs: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  methods: {
    // 加载数据
    async loadData() {
      var query = this.$getQuery(this.queryInfo)
      var res = await this.$http({
        url: '/api/pmsjob/getbyurl?' + query,
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
      this.createOrEdirotDialog.dialogTitle = '新增岗位'
      this.createOrEdirotDialog.isAdd = false
      this.createOrEdirotDialog.visible = true
      Object.assign(
        this.createOrEdirotDialog.form,
        this.$options.data().createOrEdirotDialog.form
      )
    },
    // 修改
    async editorData(index, data) {
      this.createOrEdirotDialog.dialogTitle = '编辑岗位'
      this.createOrEdirotDialog.isAdd = true
      this.createOrEdirotDialog.visible = true
      Object.assign(this.createOrEdirotDialog.form, data)
    },
    onSubmit() {
      const that = this
      this.createOrEdirotDialog.form.organizationId = this.queryInfo.orgId
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return false
        }
        if (this.createOrEdirotDialog.isAdd === false) {
          var resData = await this.$sendAsync({
            url: '/api/pmsjob/addnew',
            method: 'put',
            data: that.createOrEdirotDialog.form
          })
          if (resData !== null) {
            that.appData.push(resData.data)
            that.createOrEdirotDialog.visible = false
          }
        } else {
          var editorResData = await this.$sendAsync({
            url: '/api/pmsjob/update',
            method: 'post',
            data: that.createOrEdirotDialog.form
          })
          if (editorResData !== null) {
            var editorIndex = that.appData.findIndex(
              e => e.id === editorResData.data.id
            )
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
      var resData = await this.$delById(`/api/pmsjob/delete/${data.id}`)
      if (resData !== true) {
        return false
      }
      this.appData = this.appData.filter(e => e.id !== data.id)
      this.$message({ type: 'success', message: '删除成功!' })
    },
    async handleDisable(index, data) {
      var url = `/api/pmsjob/changestatus/${data.id}/${data.status}`
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
    },
    // 树组件单击事件
    handleOrgNodeClick(data, node) {
      console.log(data, node)
      if (data.children.length > 0) {
        node.expanded = true
      }
      this.queryInfo.orgId = data.id
      this.queryInfo.orgName = data.title
      this.createOrEdirotDialog.form.organizationId = data.id
      this.loadData()
      return false
    }
  },
  mounted: async function() {
    var resData = await this.$sendAsync({
      url: '/api/pmsjobtype/getall',
      method: 'get'
    })
    this.createOrEdirotDialog.resourceTypes = resData.data
    var jobLevelRes = await this.$sendAsync({
      url: '/api/com/getjoblevel',
      method: 'get'
    })
    this.createOrEdirotDialog.jobLevels = jobLevelRes.data
    var orgTreeRes = await this.$sendAsync({
      url: '/api/PmsOrganization/getorgtree',
      method: 'get'
    })
    this.allOrgs = orgTreeRes.data
    if (this.allOrgs.length < 1) {
      this.$router.push('/orgIndex')
      this.$message('请添加机构')
      return false
    }
    this.queryInfo.orgId = this.allOrgs[0].id
    this.queryInfo.orgName = this.allOrgs[0].title
    this.createOrEdirotDialog.form.organizationId = this.allOrgs[0].id
    this.loadData()
  },
  computed: {}
}
</script>

<style lang="less" scoped>
.orgTreeDiv {
  height: 74vh;
  border: 1px solid gainsboro;
  padding: 15px;
  margin-bottom: 15px;
  background-color: white;
}

.orgTreeTitle{
  color: darkgray;
}
</style>
