<template>
  <div class="calculator-page">
    <nav class="app-nav">
      <span class="nav-welcome">Welcome, <strong>{{ currentUser?.username || 'Guest' }}</strong>!</span>
      <div class="nav-actions">
        <button
          v-if="isAuthenticated"
          class="nav-cart-btn"
          type="button"
          @click="showCart = true"
          aria-label="View cart"
          title="View cart"
        >
          <i class="fas fa-shopping-cart"></i>
          <span>Cart</span>
          <span v-if="cart.length > 0" class="cart-badge">{{ cart.length }}</span>
        </button>
        <button v-if="isAuthenticated" class="nav-logout" type="button" @click="logout" aria-label="Logout" title="Logout">
          <i class="fas fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
        <button v-else class="nav-login" type="button" @click="goToLogin" aria-label="Login" title="Login">
          <i class="fas fa-sign-in-alt"></i>
          <span>Login / Sign Up</span>
        </button>
      </div>
    </nav>

    <div class="calculator-container">
      <!-- Main tabs: Calculator | Shop -->
      <div class="main-tabs" role="tablist">
        <button
          type="button"
          class="main-tab"
          :class="{ active: activeTab === 'calculator' }"
          role="tab"
          @click="activeTab = 'calculator'"
        >
          <i class="fas fa-calculator"></i> Calculator
        </button>
        <button
          type="button"
          class="main-tab"
          :class="{ active: activeTab === 'shop' }"
          role="tab"
          @click="activeTab = 'shop'"
        >
          <i class="fas fa-store"></i> Shop
        </button>
      </div>

      <div class="main-content">
        <div class="form-section">
        <!-- Calculator Tab: No making charge -->
        <div v-show="activeTab === 'calculator'" class="calculator-card">
          <div class="card-header">
            <div class="icon-header">
              <i class="fas fa-calculator"></i>
            </div>
            <h1>Gold Calculator</h1>
            <p class="subtitle">
              <i class="fas fa-gem"></i> Calculate gold value (no making charge)
            </p>
          </div>

          <form @submit.prevent="calculate">
            <div class="form-group">
              <label for="calc-grams">
                <i class="fas fa-weight"></i> Grams of Gold
              </label>
              <input
                id="calc-grams"
                v-model.number="calcGrams"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Enter grams"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-certificate"></i> Gold Purity
                <span v-if="calcPurity" class="label-amount">(Rate: ₱{{ goldRates[calcPurity]?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} per gram)</span>
              </label>
              <div class="tabs" role="tablist" aria-label="Gold purity">
                <button
                  v-for="purity in purityOrder"
                  :key="purity"
                  type="button"
                  class="tab"
                  :class="{ active: calcPurity === purity }"
                  role="tab"
                  @click="calcPurity = purity"
                >
                  <i class="fas fa-star"></i> {{ purity }}
                </button>
              </div>
            </div>

            <button type="submit" class="btn">
              <i class="fas fa-calculator"></i> Calculate
            </button>
          </form>
        </div>

        <!-- Shop Tab -->
        <div v-show="activeTab === 'shop'" class="shop-card">
          <div class="card-header">
            <div class="icon-header">
              <i class="fas fa-store"></i>
            </div>
            <h1>Gold Jewelry Shop</h1>
            <p class="subtitle">
              <i class="fas fa-gem"></i> Customize and purchase your jewelry
            </p>
          </div>

          <form @submit.prevent class="shop-form">
            <div class="form-group">
              <label>
                <i class="fas fa-ring"></i> Jewelry Type
              </label>
              <div class="tabs" role="tablist">
                <button
                  v-for="type in jewelryTypes"
                  :key="type"
                  type="button"
                  class="tab"
                  :class="{ active: shopItem.jewelryType === type }"
                  @click="shopItem.jewelryType = type"
                >
                  <i :class="getJewelryIcon(type)"></i> {{ type }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="shop-grams">
                <i class="fas fa-weight"></i> Grams of Gold
              </label>
              <input
                id="shop-grams"
                v-model.number="shopItem.grams"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter grams"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-certificate"></i> Gold Purity
                <span v-if="shopItem.purity" class="label-amount">(Rate: ₱{{ goldRates[shopItem.purity]?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} per gram)</span>
              </label>
              <div class="tabs" role="tablist">
                <button
                  v-for="purity in purityOrder"
                  :key="purity"
                  type="button"
                  class="tab"
                  :class="{ active: shopItem.purity === purity }"
                  @click="shopItem.purity = purity"
                >
                  <i class="fas fa-star"></i> {{ purity }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-palette"></i> Making Charge
                <span v-if="shopItem.makingCharge" class="label-amount">(₱{{ shopMakingCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }})</span>
              </label>
              <div class="tabs" role="tablist">
                <button
                  v-for="design in designCharges"
                  :key="design.name"
                  type="button"
                  class="tab"
                  :class="{ active: shopItem.makingCharge === design.name }"
                  @click="shopItem.makingCharge = design.name"
                >
                  <i :class="getDesignIcon(design.name)"></i> {{ design.name }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="special-instruction">
                <i class="fas fa-comment-dots"></i> Special Instructions <span class="optional">(optional)</span>
              </label>
              <textarea
                id="special-instruction"
                v-model="shopItem.specialInstruction"
                rows="3"
                placeholder="Any special requests or notes..."
              ></textarea>
            </div>

            <div class="shop-actions">
              <button type="button" class="btn btn-buy" @click="buyNow">
                <i class="fas fa-bolt"></i> Buy Now
              </button>
              <button type="button" class="btn btn-secondary btn-add-cart" @click="addToCart">
                <i class="fas fa-cart-plus"></i> Add to Cart
              </button>
            </div>
          </form>
        </div>
        </div>

        <!-- Result Card: Calculator result or Shop live result -->
        <div class="result-card">
          <div class="result-title">
            <i class="fas fa-coins"></i>
            {{ activeTab === 'calculator' ? 'Calculation Result' : 'Item Summary' }}
          </div>

          <template v-if="activeTab === 'calculator'">
            <div class="result-item">
              <span class="result-label"><i class="fas fa-weight"></i> Grams:</span>
              <span class="result-value">{{ calcGrams }}g</span>
            </div>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-certificate"></i> Gold Rate ({{ calcPurity }}):</span>
              <span class="result-value">₱{{ calcGoldRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-coins"></i> Gold Value:</span>
              <span class="result-value">₱{{ calcDisplayResult.goldValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-percent"></i> Tax (12%):</span>
              <span class="result-value">₱{{ calcDisplayResult.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="result-item total-item">
              <span class="result-label"><i class="fas fa-coins"></i> Total:</span>
              <span class="result-value">₱{{ calcDisplayResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="formula-section">
              <div class="formula-title"><i class="fas fa-calculator"></i> Formula:</div>
              <div class="formula-text">
                Grams × Gold Rate + 12% (Tax) = Total Gold Amount
              </div>
            </div>
          </template>

          <template v-else>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-ring"></i> Type:</span>
              <span class="result-value">{{ shopItem.jewelryType || '—' }}</span>
            </div>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-weight"></i> Grams:</span>
              <span class="result-value">{{ shopItem.grams || 0 }}g</span>
            </div>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-certificate"></i> Purity:</span>
              <span class="result-value">{{ shopItem.purity || '—' }}</span>
            </div>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-coins"></i> Gold Value:</span>
              <span class="result-value">₱{{ shopDisplayResult.goldValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-palette"></i> Making Charge:</span>
              <span class="result-value">₱{{ shopMakingCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="result-item">
              <span class="result-label"><i class="fas fa-percent"></i> Tax (12%):</span>
              <span class="result-value">₱{{ shopDisplayResult.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="result-item total-item">
              <span class="result-label"><i class="fas fa-coins"></i> Total:</span>
              <span class="result-value">₱{{ shopDisplayResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="formula-section">
              <div class="formula-title"><i class="fas fa-calculator"></i> Formula:</div>
              <div class="formula-text">
                Grams × Gold Rate + Making (Design) Charge + 12% (Tax) = Total Gold Amount
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Cart Modal -->
    <Teleport to="body">
      <div v-if="showCart" class="modal-overlay" @click.self="showCart = false">
        <div class="modal cart-modal">
          <div class="modal-header">
            <h2><i class="fas fa-shopping-cart"></i> Your Cart</h2>
            <button type="button" class="modal-close" @click="showCart = false" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="cart.length === 0" class="cart-empty">
              <i class="fas fa-cart-shopping"></i>
              <p>Your cart is empty</p>
              <button type="button" class="btn" @click="showCart = false; activeTab = 'shop'">
                Go to Shop
              </button>
            </div>
            <div v-else class="cart-items">
              <div v-for="(item, index) in cart" :key="index" class="cart-item">
                <div class="cart-item-info">
                  <strong>{{ item.jewelryType }} - {{ item.purity }}</strong>
                  <span>{{ item.grams }}g · {{ item.makingCharge }} · ₱{{ item.total.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                  <span v-if="item.specialInstruction" class="cart-item-note">{{ item.specialInstruction }}</span>
                </div>
                <button type="button" class="btn-remove" @click="removeFromCart(index)" aria-label="Remove">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-if="cart.length > 0" class="modal-footer">
            <div class="cart-total">
              <strong>Total: ₱{{ cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
            </div>
            <button type="button" class="btn" @click="checkout">
              <i class="fas fa-credit-card"></i> Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Thank You Modal -->
    <Teleport to="body">
      <div v-if="showThankYou" class="modal-overlay">
        <div class="modal thank-you-modal">
          <div class="thank-you-content">
            <div class="thank-you-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>Thank You for Your Purchase!</h2>
            <p>We appreciate your business.</p>
            <div class="purchased-items">
              <div v-for="(item, index) in purchasedItems" :key="index" class="purchased-item">
                <strong>{{ item.jewelryType }} - {{ item.purity }}</strong>
                <span>{{ item.grams }}g · Making charge: {{ item.makingCharge }}</span>
                <span v-if="item.specialInstruction">Note: {{ item.specialInstruction }}</span>
                <span class="purchased-total">₱{{ item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
              </div>
            </div>
            <div class="thank-you-total">
              <strong>Total Paid: ₱{{ purchasedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
            </div>
            <button type="button" class="btn" @click="showThankYou = false">
              <i class="fas fa-thumbs-up"></i> Done
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Login Prompt Modal -->
    <Teleport to="body">
      <div v-if="showLoginPrompt" class="modal-overlay" @click.self="showLoginPrompt = false">
        <div class="modal login-prompt-modal">
          <div class="modal-header">
            <h2><i class="fas fa-sign-in-alt"></i> Login Required</h2>
            <button type="button" class="modal-close" @click="showLoginPrompt = false" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>You need to be logged in to purchase items or add them to your cart.</p>
            <p>Please login or create an account to continue.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn" @click="goToLogin">
              <i class="fas fa-sign-in-alt"></i> Go to Login / Sign Up
            </button>
            <button type="button" class="btn btn-secondary" @click="showLoginPrompt = false">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Calculator',
  setup() {
    const router = useRouter()
    const activeTab = ref('calculator')
    const showCart = ref(false)
    const showThankYou = ref(false)
    const purchasedItems = ref([])

    // Calculator tab state (no making charge)
    const calcGrams = ref(0)
    const calcPurity = ref('')
    const calcResult = ref(null)

    // Shop tab state
    const shopItem = reactive({
      jewelryType: '',
      grams: 0,
      purity: '',
      makingCharge: '',
      specialInstruction: ''
    })

    const cart = ref([])
    const currentUser = ref(null)
    const showLoginPrompt = ref(false)

    const isAuthenticated = computed(() => {
      if (typeof window === 'undefined' || !window.localStorage) return false
      return localStorage.getItem('isAuthenticated') === 'true'
    })

    const loadUserData = () => {
      if (typeof window === 'undefined' || !window.localStorage) {
        currentUser.value = null
        return
      }
      const userData = localStorage.getItem('currentUser')
      if (userData) {
        try {
          currentUser.value = JSON.parse(userData)
        } catch (e) {
          console.error('Error parsing user data:', e)
          currentUser.value = null
        }
      } else {
        currentUser.value = null
      }
    }

    // Listen for storage changes (when user logs in from another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated' || e.key === 'currentUser') {
        loadUserData()
      }
    }

    onMounted(() => {
      window.addEventListener('storage', handleStorageChange)
      // Also check on mount in case user logged in and navigated back
      loadUserData()
    })

    onUnmounted(() => {
      window.removeEventListener('storage', handleStorageChange)
    })

    // Reload user data when login prompt closes (in case user logged in)
    watch(showLoginPrompt, (newVal) => {
      if (!newVal) {
        // Small delay to allow localStorage to update
        setTimeout(() => {
          loadUserData()
        }, 100)
      }
    })

    const goldRates = {
      '24k': 9942.97,
      '23k': 9528.68,
      '22k': 9114.39,
      '18k': 7457.23,
      '14k': 5800.06,
      '10k': 4142.90
    }

    const purityOrder = ['24k', '23k', '22k', '18k', '14k', '10k']
    const jewelryTypes = ['Necklace', 'Ring', 'Bracelet', 'Earrings', 'Pendant']

    const designCharges = [
      { name: 'Simple', price: 500 },
      { name: 'Standard', price: 1000 },
      { name: 'Premium', price: 2000 },
      { name: 'Luxury', price: 5000 },
      { name: 'Custom', price: 8000 }
    ]

    // Calculator tab: no making charge
    const calcGoldRate = computed(() => calcPurity.value ? goldRates[calcPurity.value] : 0)

    const calcDisplayResult = computed(() => {
      if (calcResult.value) return calcResult.value
      const goldValue = (calcGrams.value || 0) * calcGoldRate.value
      const tax = goldValue * 0.12
      const total = goldValue + tax
      return { goldValue, subtotal: goldValue, tax, total }
    })

    // Shop tab: live-updating result
    const shopGoldRate = computed(() => shopItem.purity ? goldRates[shopItem.purity] : 0)
    const shopMakingCharge = computed(() => {
      const d = designCharges.find(x => x.name === shopItem.makingCharge)
      return d ? d.price : 0
    })

    const shopDisplayResult = computed(() => {
      const goldValue = (shopItem.grams || 0) * shopGoldRate.value
      const subtotal = goldValue + shopMakingCharge.value
      const tax = subtotal * 0.12
      const total = subtotal + tax
      return { goldValue, subtotal, tax, total }
    })

    const getJewelryIcon = (type) => {
      const icons = { Necklace: 'fas fa-gem', Ring: 'fas fa-ring', Bracelet: 'fas fa-link', Earrings: 'fas fa-circle', Pendant: 'fas fa-medal' }
      return icons[type] || 'fas fa-gem'
    }

    watch([calcGrams, calcPurity], () => { calcResult.value = null })

    const getDesignIcon = (name) => {
      const icons = { Simple: 'fa-gem', Standard: 'fa-ring', Premium: 'fa-crown', Luxury: 'fa-medal', Custom: 'fa-magic' }
      return `fas ${icons[name] || 'fa-gem'}`
    }

    const calculate = () => {
      if (!calcGrams.value || !calcPurity.value) {
        alert('Please enter grams and select purity')
        return
      }
      const goldValue = calcGrams.value * calcGoldRate.value
      const tax = goldValue * 0.12
      const total = goldValue + tax
      calcResult.value = { goldValue, subtotal: goldValue, tax, total }
    }

    const buildCartItem = () => ({
      jewelryType: shopItem.jewelryType,
      grams: shopItem.grams,
      purity: shopItem.purity,
      makingCharge: shopItem.makingCharge,
      specialInstruction: shopItem.specialInstruction,
      total: shopDisplayResult.value.total
    })

    const validateShopItem = () => {
      if (!shopItem.jewelryType || !shopItem.grams || !shopItem.purity || !shopItem.makingCharge) {
        alert('Please fill in Jewelry Type, Grams, Purity, and Making Charge')
        return false
      }
      return true
    }

    const buyNow = () => {
      if (!isAuthenticated.value) {
        showLoginPrompt.value = true
        return
      }
      if (!validateShopItem()) return
      purchasedItems.value = [buildCartItem()]
      showThankYou.value = true
    }

    const addToCart = () => {
      if (!isAuthenticated.value) {
        showLoginPrompt.value = true
        return
      }
      if (!validateShopItem()) return
      cart.value.push(buildCartItem())
      alert('Item added to cart!')
    }

    const removeFromCart = (index) => {
      cart.value.splice(index, 1)
    }

    const cartTotal = computed(() => cart.value.reduce((sum, i) => sum + i.total, 0))

    const checkout = () => {
      if (cart.value.length === 0) return
      if (!isAuthenticated.value) {
        showCart.value = false
        showLoginPrompt.value = true
        return
      }
      purchasedItems.value = [...cart.value]
      cart.value = []
      showCart.value = false
      showThankYou.value = true
    }

    const purchasedTotal = computed(() => purchasedItems.value.reduce((sum, i) => sum + i.total, 0))

    const logout = () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('currentUser')
      }
      router.push('/login')
    }

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      activeTab,
      currentUser,
      isAuthenticated,
      calcGrams,
      calcPurity,
      calcGoldRate,
      calcDisplayResult,
      calcResult,
      calculate,
      goldRates,
      purityOrder,
      jewelryTypes,
      designCharges,
      shopItem,
      shopDisplayResult,
      shopMakingCharge,
      getJewelryIcon,
      getDesignIcon,
      buyNow,
      addToCart,
      cart,
      showCart,
      removeFromCart,
      cartTotal,
      checkout,
      showThankYou,
      purchasedItems,
      purchasedTotal,
      logout,
      goToLogin,
      showLoginPrompt
    }
  }
}
</script>

<style scoped>
.main-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.main-tab {
  padding: 12px 24px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-tab:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: rgba(212, 175, 55, 0.6);
}

.main-tab.active {
  background: linear-gradient(135deg, #f6d365 0%, #d4af37 55%, #c98b12 100%);
  border-color: rgba(212, 175, 55, 0.95);
  color: #0b1220;
}

.form-section {
  min-width: 0;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.45);
  color: white;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.nav-cart-btn:hover {
  background: rgba(212, 175, 55, 0.35);
  border-color: rgba(212, 175, 55, 0.6);
}

.cart-badge {
  background: #dc3545;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
}

.shop-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.6) inset;
  padding: 40px;
  width: 100%;
}

.shop-form .form-group {
  margin-bottom: 20px;
}

.calculator-card .label-amount,
.shop-form .label-amount {
  color: #b88900;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .calculator-card .form-group label,
  .shop-form .form-group label {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .calculator-card .label-amount,
  .shop-form .label-amount {
    display: block;
    margin-left: 0;
    margin-top: 6px;
    width: 100%;
  }
}

.optional {
  font-weight: 400;
  color: rgba(11, 18, 32, 0.6);
  font-size: 0.85rem;
}

textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(11, 18, 32, 0.15);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  background: rgba(255, 255, 255, 0.9);
}

textarea:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.9);
}

.shop-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.shop-actions .btn {
  flex: 1;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 18px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(11, 18, 32, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.35rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: rgba(11, 18, 32, 0.7);
  padding: 4px;
}

.modal-close:hover {
  color: #0b1220;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.cart-empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(11, 18, 32, 0.7);
}

.cart-empty i {
  font-size: 3rem;
  color: rgba(212, 175, 55, 0.6);
  margin-bottom: 16px;
}

.cart-empty p {
  margin-bottom: 20px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: rgba(11, 18, 32, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(11, 18, 32, 0.08);
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-item-note {
  font-size: 0.85rem;
  color: rgba(11, 18, 32, 0.65);
  font-style: italic;
}

.btn-remove {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: rgba(220, 53, 69, 0.25);
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(11, 18, 32, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-total {
  font-size: 1.2rem;
  color: #b88900;
}

.thank-you-modal .modal {
  max-width: 420px;
}

.thank-you-content {
  padding: 40px 30px;
  text-align: center;
}

.thank-you-icon {
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 20px;
}

.thank-you-content h2 {
  margin-bottom: 8px;
  font-size: 1.5rem;
}

.thank-you-content > p {
  color: rgba(11, 18, 32, 0.7);
  margin-bottom: 24px;
}

.purchased-items {
  text-align: left;
  background: rgba(11, 18, 32, 0.04);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.purchased-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(11, 18, 32, 0.08);
}

.purchased-item:last-child {
  border-bottom: none;
}

.purchased-total {
  color: #b88900;
  font-weight: 600;
  margin-top: 4px;
}

.thank-you-total {
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #b88900;
}

.nav-login {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.45);
  color: white;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Quicksand', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
}

.nav-login:hover {
  background: rgba(212, 175, 55, 0.35);
  border-color: rgba(212, 175, 55, 0.6);
  transform: translateY(-1px);
}

.login-prompt-modal .modal-body {
  text-align: center;
}

.login-prompt-modal .modal-body p {
  margin-bottom: 12px;
  color: rgba(11, 18, 32, 0.8);
  font-size: 1rem;
}

.login-prompt-modal .modal-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.formula-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(11, 18, 32, 0.12);
}

.formula-title {
  font-weight: 700;
  color: rgba(11, 18, 32, 0.9);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.formula-title i {
  color: rgba(212, 175, 55, 0.9);
}

.formula-text {
  font-size: 0.9rem;
  color: rgba(11, 18, 32, 0.75);
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  background: rgba(11, 18, 32, 0.04);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(11, 18, 32, 0.08);
}
</style>
