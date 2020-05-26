<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <i
          :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
          @click="asideToggle"
        ></i>
        <img src="../assets/logo.png" alt="SAM管理系统" />
        <span>PMS管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
        >
          <el-menu-item index="welcome">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </el-menu-item>

          <el-submenu index="1-1">
            <template slot="title">
              <i class="el-icon-s-data"></i>
              <span>用户数据</span>
            </template>
            <el-menu-item index="userIndex">
              <i class="el-icon-user"></i>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/orgindex">
              <i class="el-icon-s-check"></i>
              <span>机构管理</span>
            </el-menu-item>
            <el-menu-item index="/jobtype">
              <i class="el-icon-s-check"></i>
              <span>岗位类别管理</span>
            </el-menu-item>
            <el-menu-item index="/job">
              <i class="el-icon-s-check"></i>
              <span>岗位管理</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="1-4">
            <template slot="title">
              <i class="el-icon-s-management"></i>
              <span>权限管理</span>
            </template>
            <el-menu-item index="/appIndex">
              <i class="el-icon-menu"></i>
              <span>应用系统</span>
            </el-menu-item>
            <el-menu-item index="/AppOperation">
              <i class="el-icon-menu"></i>
              <span>应用系统操作</span>
            </el-menu-item>
            <el-menu-item index="/appmodule">
              <i class="el-icon-menu"></i>
              <span>应用系统模块</span>
            </el-menu-item>
            <el-menu-item index="/roleIndex">
              <i class="el-icon-user"></i>
              <span>应用系统角色</span>
            </el-menu-item>
            <el-menu-item index="/UserGroupIndex">
              <i class="el-icon-menu"></i>
              <span>应用系统用户组</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="1-5">
            <template slot="title">
              <i class="el-icon-s-grid"></i>
              <span>API资源管理</span>
            </template>
            <el-menu-item index="/resourceTypeIndex">
              <i class="el-icon-menu"></i>
              <span>资源类别管理</span>
            </el-menu-item>
            <el-menu-item index="/resourceIndex">
              <i class="el-icon-menu"></i>
              <span>资源管理</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="1-6">
            <template slot="title">
              <i class="el-icon-setting"></i>
              <span>配置管理</span>
            </template>
            <el-menu-item index="/dicitem">
              <i class="el-icon-menu"></i>
              <span>字典配置</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false
    }
  },
  methods: {
    logout: function() {
      window.sessionStorage.clear()
      location.reload()
    },
    // 侧边栏折叠
    asideToggle() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  width: 100%;
  height: 100%;
}
.el-header {
  background-color: rgb(55, 61, 65);
  color: #fff !important;
  display: flex;
  justify-content: space-between;
  font-size: 22px;
  align-items: center;
  padding-left: 0;
  > div {
    display: flex;
    align-items: center;
    img {
      height: 50px;
    }
    span {
      margin-left: 15px;
    }
    i {
      width: 80px;
      font-size: 64px;
      cursor: pointer;
    }
  }
}

.el-main {
  background-color: rgb(234, 237, 241);
}

.el-aside {
  background-color: rgb(51, 55, 68);
}
</style>
