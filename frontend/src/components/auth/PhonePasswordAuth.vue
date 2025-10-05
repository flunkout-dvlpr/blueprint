<template>
  <q-card flat bordered class="auth-card">
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">
        Phone & Password Authentication
      </div>
      <div class="text-caption text-center text-grey-7 q-mb-lg">
        Login with phone number and password, verified via SMS
      </div>

      <!-- Tabs for Login/Signup -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="login" label="Login" />
        <q-tab name="signup" label="Sign Up" />
        <q-tab name="verify" label="Verify Phone" />
      </q-tabs>

      <q-separator class="q-my-md" />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Login Panel -->
        <q-tab-panel name="login">
          <q-form @submit="handleLogin">
            <q-input
              v-model="loginForm.phoneNumber"
              label="Phone Number"
              type="tel"
              outlined
              dense
              class="q-mb-md"
              hint="E.164 format: +15551234567"
              :rules="[
                val => !!val || 'Phone number is required',
                val => /^\+[1-9]\d{1,14}$/.test(val) || 'Use E.164 format: +15551234567'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>

            <q-input
              v-model="loginForm.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Password is required']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Login"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </q-form>
        </q-tab-panel>

        <!-- Signup Panel -->
        <q-tab-panel name="signup">
          <q-form @submit="handleSignup">
            <q-input
              v-model="signupForm.name"
              label="Full Name"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Name is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="signupForm.phoneNumber"
              label="Phone Number"
              type="tel"
              outlined
              dense
              class="q-mb-md"
              hint="E.164 format: +15551234567"
              :rules="[
                val => !!val || 'Phone number is required',
                val => /^\+[1-9]\d{1,14}$/.test(val) || 'Use E.164 format: +15551234567'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>

            <q-input
              v-model="signupForm.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              class="q-mb-md"
              :rules="[
                val => !!val || 'Password is required',
                val => val.length >= 8 || 'Password must be at least 8 characters'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Sign Up"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </q-form>
        </q-tab-panel>

        <!-- Verify Phone Panel -->
        <q-tab-panel name="verify">
          <q-form @submit="handleVerifyPhone">
            <q-input
              v-model="verifyForm.phoneNumber"
              label="Phone Number"
              type="tel"
              outlined
              dense
              class="q-mb-md"
              hint="E.164 format: +15551234567"
              :rules="[
                val => !!val || 'Phone number is required',
                val => /^\+[1-9]\d{1,14}$/.test(val) || 'Use E.164 format: +15551234567'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>

            <q-input
              v-model="verifyForm.code"
              label="SMS Verification Code"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Code is required']"
            >
              <template v-slot:prepend>
                <q-icon name="sms" />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Verify Phone"
              color="primary"
              class="full-width q-mb-sm"
              :loading="loading"
            />

            <q-btn
              label="Resend Code"
              color="grey-7"
              flat
              class="full-width"
              @click="handleResendCode"
              :disable="loading"
            />
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>

    <!-- User Profile (when authenticated) -->
    <q-card-section v-if="user" class="q-pt-none">
      <q-separator class="q-mb-md" />
      <div class="text-subtitle2 q-mb-sm">Authenticated User</div>
      <div class="text-caption"><strong>Phone:</strong> {{ user.phoneNumber }}</div>
      <div class="text-caption"><strong>Name:</strong> {{ user.name }}</div>
      <div class="text-caption">
        <strong>Verified:</strong>
        <q-chip
          :color="user.phoneVerified ? 'green' : 'orange'"
          text-color="white"
          size="sm"
        >
          {{ user.phoneVerified ? 'Yes' : 'No' }}
        </q-chip>
      </div>
      <q-btn
        label="Logout"
        color="negative"
        class="full-width q-mt-md"
        @click="handleLogout"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'

const $q = useQuasar()
const authStore = useAuthStore()

// Component state
const activeTab = ref('login')
const showPassword = ref(false)
const loading = ref(false)

// Forms
const loginForm = ref({
  phoneNumber: '',
  password: ''
})

const signupForm = ref({
  phoneNumber: '',
  password: '',
  name: ''
})

const verifyForm = ref({
  phoneNumber: '',
  code: ''
})

// Computed
const user = computed(() => authStore.user)

// Methods
async function handleLogin() {
  loading.value = true
  try {
    await authStore.loginWithPhone(loginForm.value.phoneNumber, loginForm.value.password)
    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Login failed',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleSignup() {
  loading.value = true
  try {
    await authStore.signupWithPhone(
      signupForm.value.phoneNumber,
      signupForm.value.password,
      signupForm.value.name
    )
    $q.notify({
      type: 'positive',
      message: 'Account created! Please check your phone for verification code.',
      position: 'top'
    })
    // Switch to verify tab
    verifyForm.value.phoneNumber = signupForm.value.phoneNumber
    activeTab.value = 'verify'
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Signup failed',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleVerifyPhone() {
  loading.value = true
  try {
    await authStore.verifyPhone(verifyForm.value.phoneNumber, verifyForm.value.code)
    $q.notify({
      type: 'positive',
      message: 'Phone verified! You can now login.',
      position: 'top'
    })
    activeTab.value = 'login'
    loginForm.value.phoneNumber = verifyForm.value.phoneNumber
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Verification failed',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleResendCode() {
  loading.value = true
  try {
    await authStore.resendCode(verifyForm.value.phoneNumber)
    $q.notify({
      type: 'positive',
      message: 'Verification code resent!',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to resend code',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  try {
    await authStore.logout()
    $q.notify({
      type: 'info',
      message: 'Logged out successfully',
      position: 'top'
    })
    // Reset forms
    loginForm.value = { phoneNumber: '', password: '' }
    activeTab.value = 'login'
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Logout failed',
      position: 'top'
    })
  }
}
</script>

<style scoped>
.auth-card {
  max-width: 500px;
  margin: 0 auto;
}
</style>
