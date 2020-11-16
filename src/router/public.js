import PublicUserLogin from '@/components/views/public/user/login.vue'
import PublicUserChangePassword from '@/components/views/public/user/changePassword.vue'
import PublicUserSelectGame from '@/components/views/public/user/selectGame.vue'
import about from '@/components/views/about/version.vue'
export default [{
    path: '/public/user/login',
    name: '登录页面',
    component: PublicUserLogin
  },
  {
    path: '/public/user/changePassword',
    name: '修改密码',
    component: PublicUserChangePassword
  },
  {
    path: '/public/user/selectGame',
    name: '选择游戏',
    component: PublicUserSelectGame
  },
  {
    path: '/about/version',
    name: '关于我们',
    component: about
  }
]
