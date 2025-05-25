<template>
  <div class="login-wrap login14" id="home">
    <div class="login-container">
      <div class="login-containerL">
        <img class="loginLogo" src="@/assets/images/logo.png" alt="">
      </div>
      <div class="login-containerR">
        <div class="loginBody2">
          <div class="loginBody2Title"><span>用户登录</span></div>
          <div class="loginInput">
            <div class="icons">
              <div class="icon iconfont icon-yonghu"></div>
            </div>
            <input type="text" placeholder="用户名" v-model="user.username">
          </div>
          <div class="loginInput">
            <div class="icons">
              <div class="icon iconfont icon-mima1"></div>
            </div>
            <input type="password" placeholder="密码" v-model="user.password">
          </div>
          <div class="info">
            <rememberPwd ref="rememberPassword" v-model:password="user.username" v-model:username="user.password"></rememberPwd>
            <div class="forget">忘记密码？</div>
          </div>
          <div class="loginBut" @click="login">
            登录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import rememberPwd from "@/components/rememberPwd.vue";
import { ElMessage } from "element-plus";
import { useRouter} from "vue-router";
import { inject } from 'vue';
import router from "@/router/index.js";

export default {
  name: 'Login',
  data(){
    return {
      user:{
        username:'',
        password:'',
      },
      responseResult:[],
    }
  },
  created(){
    this.isLoggedIn=inject('isLoggedIn');
  },
  methods:{
    async login(){
      console.log('Login with:', this.user.username, this.user.password);
      try {
        const formData = new FormData();
        formData.append('username', this.user.username);
        formData.append('password', this.user.password);

        const response = await fetch('http://localhost:8088/api/user/login', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Link success', data);
          if (data.code === 200) {
            // 登录成功
            ElMessage.success('登录成功！');
            //this.isLoggedIn.value = true;

            const userData=data.data;
            const token = data.data.token;
            console.log(data.data);
            console.log(data.data.token);
            // 将用户信息和 token 保存到 Vuex
            this.$store.dispatch('loginUser', {
              user: userData,
              token: token
            });

            // 将用户信息和 token 保存到 localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);

            await this.$router.push('/');
          } else {
            ElMessage.warning(data.msg||'登录失败');
            //alert(data.msg);
          }
        } else {
          ElMessage.error('登录请求失败，请稍后重试');
          console.error('Link failed', data);
        }
      } catch (error) {
        ElMessage.error('发生错误，请稍后尝试');
        console.error('Error login', error);
      }
    }
  },
   components: { rememberPwd },
}
</script>

<style lang="scss">
@import url("@/assets/iconfont/iconfont.css");
@import "@/assets/styles/login_register.css";
</style>
