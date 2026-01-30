<template>
  <div class="calculator-page">
    <nav class="app-nav">
      <span class="nav-welcome">Welcome, <strong>{{ currentUser?.username || 'User' }}</strong>!</span>
      <button class="nav-logout" type="button" @click="logout" aria-label="Logout" title="Logout">
        <i class="fas fa-right-from-bracket"></i>
        <span>Logout</span>
      </button>
    </nav>

    <div class="calculator-container">
      <div class="main-content">
        <div class="calculator-card">
          <div class="card-header">
            <div class="icon-header">
            <i class="fas fa-calculator"></i>
          </div>
          <h1>Gold Calculator</h1>
          <p class="subtitle">
            <i class="fas fa-gem"></i> Calculate the total cost of your gold jewelry
          </p>
        </div>
        
        <form @submit.prevent="calculate">
      <div class="form-group">
        <label for="grams">
          <i class="fas fa-weight"></i> Grams of Gold
        </label>
        <input
          id="grams"
          v-model.number="grams"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Enter grams"
        />
      </div>
      
      <div class="form-group">
        <label>
          <i class="fas fa-certificate"></i> Gold Rate (Purity)
        </label>
        <div class="tabs" role="tablist" aria-label="Gold purity">
          <button
            v-for="purity in purityOrder"
            :key="purity"
            type="button"
            class="tab"
            :class="{ active: selectedPurity === purity }"
            role="tab"
            :aria-selected="selectedPurity === purity"
            @click="selectPurity(purity)"
          >
            <i class="fas fa-star"></i> {{ purity }}
          </button>
        </div>
        <div class="hint" v-if="selectedPurity">
          <i class="fas fa-info-circle"></i> Rate: <strong>₱{{ goldRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong> per gram
        </div>
        <div class="hint" v-else>
          <i class="fas fa-hand-pointer"></i> Choose a purity to see the rate per gram.
        </div>
      </div>
      
      <div class="form-group">
        <label>
          <i class="fas fa-palette"></i> Design Charge
        </label>
        <div class="tabs" role="tablist" aria-label="Design charge">
          <button
            v-for="design in designCharges"
            :key="design.name"
            type="button"
            class="tab"
            :class="{ active: selectedDesign === design.name }"
            role="tab"
            :aria-selected="selectedDesign === design.name"
            @click="selectDesign(design.name)"
          >
            <i :class="getDesignIcon(design.name)"></i> {{ design.name }}
          </button>
        </div>
        <div class="hint" v-if="selectedDesign">
          <i class="fas fa-tag"></i> Design charge: <strong>₱{{ designCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
        </div>
        <div class="hint" v-else>
          Choose a design to see the making charge.
        </div>
      </div>
      
          <button type="submit" class="btn">
            <i class="fas fa-calculator"></i> Calculate
          </button>
        </form>
      </div>
      
      <div class="result-card">
        <div class="result-title">
          <i class="fas fa-coins"></i> Calculation Result
        </div>
        <div class="result-item">
          <span class="result-label">
            <i class="fas fa-weight"></i> Grams:
          </span>
          <span class="result-value">{{ grams }}g</span>
        </div>
        <div class="result-item">
          <span class="result-label">
            <i class="fas fa-certificate"></i> Gold Rate ({{ selectedPurity }}):
          </span>
          <span class="result-value">₱{{ goldRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">
            <i class="fas fa-coins"></i> Gold Value:
          </span>
          <span class="result-value">₱{{ displayResult.goldValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">
            <i class="fas fa-palette"></i> Design Charge:
          </span>
          <span class="result-value">₱{{ designCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">
            <i class="fas fa-receipt"></i> Subtotal:
          </span>
          <span class="result-value">₱{{ displayResult.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">
            <i class="fas fa-percent"></i> Tax (12%):
          </span>
          <span class="result-value">₱{{ displayResult.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="result-item total-item">
          <span class="result-label">
            <i class="fas fa-coins"></i> Total Gold Amount:
          </span>
          <span class="result-value">₱{{ displayResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Calculator',
  setup() {
    const router = useRouter()
    const grams = ref(0)
    const selectedPurity = ref('')
    const selectedDesign = ref('')
    const result = ref(null)
    const currentUser = ref(null)
    
    // Get current user from localStorage
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        currentUser.value = JSON.parse(userData)
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
    
    const goldRates = {
      '24k': 9942.97,
      '23k': 9528.68,
      '22k': 9114.39,
      '18k': 7457.23,
      '14k': 5800.06,
      '10k': 4142.90
    }

    const purityOrder = ['24k', '23k', '22k', '18k', '14k', '10k']
    
    const designCharges = [
      { name: 'Simple', price: 500 },
      { name: 'Standard', price: 1000 },
      { name: 'Premium', price: 2000 },
      { name: 'Luxury', price: 5000 },
      { name: 'Custom', price: 8000 }
    ]
    
    const goldRate = computed(() => {
      return selectedPurity.value ? goldRates[selectedPurity.value] : 0
    })
    
    const designCharge = computed(() => {
      const design = designCharges.find(d => d.name === selectedDesign.value)
      return design ? design.price : 0
    })

    const selectPurity = (purity) => {
      selectedPurity.value = purity
      // if the user changes inputs, clear old result to avoid confusion
      result.value = null
    }

    const selectDesign = (designName) => {
      selectedDesign.value = designName
      // if the user changes inputs, clear old result to avoid confusion
      result.value = null
    }

    const displayResult = computed(() => {
      return (
        result.value ?? {
          goldValue: 0,
          subtotal: 0,
          tax: 0,
          total: 0
        }
      )
    })
    
    const getDesignIcon = (designName) => {
      const icons = {
        'Simple': 'fa-gem',
        'Standard': 'fa-ring',
        'Premium': 'fa-crown',
        'Luxury': 'fa-medal',
        'Custom': 'fa-magic'
      }
      return `fas ${icons[designName] || 'fa-gem'}`
    }
    
    const calculate = () => {
      if (!grams.value || !selectedPurity.value || !selectedDesign.value) {
        alert('Please fill in all fields')
        return
      }
      
      // Calculate: grams × gold rate + making charge + 12% tax
      const goldValue = grams.value * goldRate.value
      const subtotal = goldValue + designCharge.value
      const tax = subtotal * 0.12
      const total = subtotal + tax
      
      result.value = {
        goldValue,
        subtotal,
        tax,
        total
      }
    }
    
    const logout = () => {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('currentUser')
      router.push('/login')
    }
    
    return {
      grams,
      selectedPurity,
      selectedDesign,
      goldRates,
      purityOrder,
      designCharges,
      goldRate,
      designCharge,
      result,
      displayResult,
      currentUser,
      selectPurity,
      selectDesign,
      getDesignIcon,
      calculate,
      logout
    }
  }
}
</script>
