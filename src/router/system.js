import NullComponent from '@/components/public/null.vue'
import SystemMenuList from '@/components/views/system/menu/list'
import SystemMenuAdd from '@/components/views/system/menu/add'
import SystemMenuEdit from '@/components/views/system/menu/edit'
import SystemAdminList from '@/components/views/system/admin/list'
import SystemAdminAdd from '@/components/views/system/admin/add'
import SystemAdminEdit from '@/components/views/system/admin/edit'
import SystemRoleList from '@/components/views/system/role/list'
import SystemRoleAdd from '@/components/views/system/role/add'
import SystemRoleEdit from '@/components/views/system/role/edit'
import SystemRolePermission from '@/components/views/system/role/permission'
import SystemDepartmentList from '@/components/views/system/department/list'
import SystemDepartmentAdd from '@/components/views/system/department/add'
import SystemDepartmentEdit from '@/components/views/system/department/edit'

import SystemVersionList from '@/components/views/system/version/list'
import SystemVersionAdd from '@/components/views/system/version/add'


var system = [{
    path: '/system/menu/list',
    name: '菜单管理-列表',
    component: SystemMenuList
  },
  {
    path: '/system/menu/add',
    name: '菜单管理-新增',
    component: SystemMenuAdd
  },
  {
    path: '/system/menu/edit',
    name: '菜单管理-修改',
    component: SystemMenuEdit
  },
  {
    path: '/system/menu/delete',
    name: '菜单管理-删除',
    component: NullComponent
  },
  {
    path: '/system/admin/list',
    name: '用户管理-列表',
    component: SystemAdminList
  },
  {
    path: '/system/admin/add',
    name: '用户管理-新增',
    component: SystemAdminAdd
  },
  {
    path: '/system/admin/edit',
    name: '用户管理-修改',
    component: SystemAdminEdit
  },
  {
    path: '/system/admin/delete',
    name: '用户管理-删除',
    component: NullComponent
  },
  {
    path: '/system/admin/reset',
    name: '用户管理-删除',
    component: NullComponent
  },
  {
    path: '/system/role/list',
    name: '角色管理-列表',
    component: SystemRoleList
  },
  {
    path: '/system/role/add',
    name: '角色管理-新增',
    component: SystemRoleAdd
  },
  {
    path: '/system/role/edit',
    name: '角色管理-修改',
    component: SystemRoleEdit
  },
  {
    path: '/system/role/delete',
    name: '角色管理-删除',
    component: NullComponent
  },
  {
    path: '/system/role/permission',
    name: '角色管理-菜单授权',
    component: SystemRolePermission
  },

  {
    path: '/system/department/list',
    name: '部门管理-列表',
    component: SystemDepartmentList
  },
  {
    path: '/system/department/add',
    name: '部门管理-新增',
    component: SystemDepartmentAdd
  },
  {
    path: '/system/department/edit',
    name: '部门管理-修改',
    component: SystemDepartmentEdit
  },
  {
    path: '/system/department/delete',
    name: '部门管理-删除',
    component: NullComponent
  },
  {
    path: '/system/version/list',
    name: '版本管理-列表',
    component: SystemVersionList
  },
  {
    path: '/system/version/add',
    name: '版本管理-新增',
    component: SystemVersionAdd
  },
  {
    path: '/system/version/edit',
    name: '版本管理-修改',
    component: NullComponent
  },
  {
    path: '/system/version/delete',
    name: '版本管理-删除',
    component: NullComponent
  },

]
export default system
