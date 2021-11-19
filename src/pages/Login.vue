<template>
  <q-page class="flex bg-image flex-center">
    <q-card v-bind:style="$q.screen.lt.sm?{'width': '80%'}:{'width':'30%'}">
      <q-card-section>
        <q-avatar size="103px" class="absolute-center shadow-10">
          <img src="profile.svg">
        </q-avatar>
      </q-card-section>
      <q-card-section>
        <div class="text-center q-pt-lg">
          <div class="col text-h6 ellipsis">
            Log in
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-form  ref="loginForm"
          class="q-gutter-md"
        >
          <q-input
            filled
            v-model.trim="loginForm.username"
            label="Username"
            lazy-rules
          />

          <q-input
            type="password"
            filled
            v-model.trim="loginForm.password"
            label="Password"
            lazy-rules

          />
          <co-input
            v-model.trim="loginForm.code"
            placeholder="验证码"
          >
            <template v-slot:after>
              <img :src="codeUrl" @click="getCode" style="width:94px; min-width:80px" alt="验证码"/>
            </template>
          </co-input>
          <div>
            <q-btn :dense="false"  label="Login" type="button" color="primary"
                   @click.native.prevent="handleLogin" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapActions } from 'vuex'
import { random } from '@/utils/index'
import { encrypt } from '@/utils/rsaEncrypt'
import { getCodeImg } from '@/api/login'
import Setting from '@/default-setting'
import Cookies from 'js-cookie'

export default {
  components: {
  },
  name: 'UserLogin',
  data () {
    return {
      imgsrc: '',
      loading: false,
      redirect: undefined,
      codeUrl: '',
      cookiePass: '',
      loginForm: {
        username: 'admin',
        password: '123456',
        rememberMe: false,
        code: '',
        uuid: ''
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created () {
    this.imgsrc = 'img/nature-' + (random() % 8) + '.jpg'
    // token 过期提示
    this.point()
    // 获取验证码
    this.getCode()
    // 获取用户名密码等Cookie
    this.getCookie()
    // token 过期提示
  },
  methods: {
    ...mapActions('settings', [
      'changeSetting'
    ]),
    ...mapActions('user', [
      'Login'
    ]),
    getCode() {
      getCodeImg().then(res => {
        this.codeUrl = res.img
        this.loginForm.uuid = res.uuid
      })
    },
    getCookie() {
      const username = Cookies.get('username')
      let password = Cookies.get('password')
      const rememberMe = Cookies.get('rememberMe')
      // 保存cookie里面的加密后的密码
      this.cookiePass = password === undefined ? '' : password
      password = password === undefined ? this.loginForm.password : password
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password,
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
        code: ''
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate().then(valid => {
        const user = {
          username: this.loginForm.username,
          password: this.loginForm.password,
          rememberMe: this.loginForm.rememberMe,
          code: this.loginForm.code,
          uuid: this.loginForm.uuid
        }
        if (user.password !== this.cookiePass) {
          user.password = encrypt(user.password)
        }
        if (valid) {
          this.loading = true
          if (user.rememberMe) {
            Cookies.set('username', user.username, { expires: Setting.passCookieExpires })
            Cookies.set('password', user.password, { expires: Setting.passCookieExpires })
            Cookies.set('rememberMe', user.rememberMe, { expires: Setting.passCookieExpires })
          } else {
            Cookies.remove('username')
            Cookies.remove('password')
            Cookies.remove('rememberMe')
          }
          this.Login(user).then(() => {
            this.loading = false
            this.$router.push({ path: this.redirect || '/' })
          }).catch(() => {
            this.loading = false
            this.getCode()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    point() {
      const point = Cookies.get('point') !== undefined
      if (point) {
        this.$q.notify({
          type: 'warning',
          message: '当前登录状态已过期，请重新登录！',
          timeout: 5000,
          position: 'top'
        })
        Cookies.remove('point')
      }
    }
  }
}
</script>

<style lang="sass" scoped>
  .bg-image
    background-image: linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%)
</style>
