<template>
  <div class="login-wrap login14" id="home">
    <div class="login-container">
      <div class="login-containerL">
        <img class="loginLogo" src="@/assets/images/logo.png" alt="">
      </div>
      <div class="login-containerR">
        <div class="loginBody2">
          <div class="loginBody2Title"><span>用户注册</span></div>
          <div class="loginInput">
            <div class="icons">
              <div class="icon iconfont icon-yonghu"></div>
            </div>
            <input type="text" placeholder="用户名" v-model="user.username">
          </div>
          <div class="loginInput">
            <div class="icons iconfont icon-phone">
              <img src="@/assets/images/icon/电话.svg" alt="电话图标" class="icon">
            </div>
            <input type="text" placeholder="手机号" v-model="user.phone">
          </div>
          <div class="loginInput">
            <div class="icons">
              <div class="icon iconfont icon-mima1"></div>
            </div>
            <input type="password" placeholder="密码" v-model="user.password">
          </div>
          <div class="loginInput">
            <div class="icons">
              <div class="icon iconfont icon-mima"></div>
            </div>
            <input type="text" placeholder="确认密码">
          </div>
          <div class="info">
            <div class="toLogin" @click="toLogin">已有账号?点此登录</div>
          </div>
          <div class="loginBut" @click="login">
            注册
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
  name: 'Register',
  data(){
    return {
      user:{
        username:'',
        password:'',
        phone:''
      },
      responseResult:[],
    }
  },
  created(){
    this.isLoggedIn=inject('isLoggedIn');
  },
  methods:{
    async login(){
      console.log('Register with:', this.user.username,this.user.phone, this.user.password);
      try {
        const formData = new FormData();
        formData.append('username', this.user.username);
        formData.append('phone',this.user.phone);
        formData.append('password', this.user.password);

        const response = await fetch('http://localhost:8088/api/user/register', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Link success', data);
          if (data.code === 200) {
            this.isLoggedIn.value = true;
            ElMessage.success('注册成功!');
            await this.$router.push('/');
          } else {
            ElMessage.warning(data.msg||'注册失败');
          }
        } else {
          ElMessage.error('注册请求失败，请稍后重试')
          console.error('Link failed', data);
        }
      } catch (error) {
        ElMessage.error('发生错误，请稍后尝试');
        console.error('Error login', error);
      }
    },
    toLogin() {
      console.log('to login');
      this.$router.push('/login');
    }
  },
}
</script>

<style lang="scss">
@import url("@/assets/iconfont/iconfont.css");
@import '@/assets/styles/login_register.css';

.info{
  justify-items: center;
}

</style>
