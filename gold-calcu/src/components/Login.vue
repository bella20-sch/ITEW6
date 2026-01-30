<template>
  <div class="auth-container">
    <div class="card">
      <div class="icon-header">
        <i :class="isLogin ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'"></i>
      </div>
      <h1>{{ isLogin ? 'Login' : 'Register' }}</h1>
      <p class="subtitle">{{ isLogin ? 'Welcome back!' : 'Create your account to get started' }}</p>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">
            <i class="fas fa-user"></i> Username
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="Enter your username"
          />
        </div>
        
        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i> Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i> Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            minlength="6"
          />
        </div>
        
        <div v-if="error" class="error">
          <i class="fas fa-exclamation-circle"></i> {{ error }}
        </div>
        
        <button type="submit" class="btn">
          <i :class="isLogin ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'"></i>
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
      </form>
      
      <div class="link-text">
        {{ isLogin ? "Don't have an account? " : "Already have an account? " }}
        <a href="#" @click.prevent="toggleMode">
          {{ isLogin ? 'Register' : 'Login' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const isLogin = ref(true)
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const error = ref('')
    
    const toggleMode = () => {
      isLogin.value = !isLogin.value
      error.value = ''
      username.value = ''
      email.value = ''
      password.value = ''
    }
    
    const handleSubmit = () => {
      error.value = ''
      
      // Simple validation
      if (!username.value || !email.value || !password.value) {
        error.value = 'Please fill in all fields'
        return
      }
      
      if (password.value.length < 6) {
        error.value = 'Password must be at least 6 characters'
        return
      }
      
      // Store user data in localStorage (simple auth)
      if (!isLogin.value) {
        // Registration
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const userExists = users.find(u => u.email === email.value || u.username === username.value)
        
        if (userExists) {
          error.value = 'User already exists'
          return
        }
        
        users.push({
          username: username.value,
          email: email.value,
          password: password.value
        })
        localStorage.setItem('users', JSON.stringify(users))
      } else {
        // Login
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const user = users.find(u => 
          (u.email === email.value || u.username === email.value) && 
          u.password === password.value
        )
        
        if (!user) {
          error.value = 'Invalid credentials'
          return
        }
      }
      
      // Set authentication
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('currentUser', JSON.stringify({
        username: username.value,
        email: email.value
      }))
      
      // Redirect to calculator
      router.push('/calculator')
    }
    
    return {
      isLogin,
      username,
      email,
      password,
      error,
      toggleMode,
      handleSubmit
    }
  }
}
</script>
