<template>
  <q-card flat bordered class="auth-card">
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">
        Username & Password Authentication
      </div>
      <div class="text-caption text-center text-grey-7 q-mb-lg">
        Traditional username-based login with email verification
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
        <q-tab name="verify" label="Verify Email" />
        <q-tab name="reset" label="Reset Password" />
      </q-tabs>

      <q-separator class="q-my-md" />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Login Panel -->
        <q-tab-panel name="login">
          <q-form @submit="handleLogin">
            <q-input
              v-model="loginForm.username"
              label="Username"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Username is required']"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
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
              v-model="signupForm.username"
              label="Username"
              outlined
              dense
              class="q-mb-md"
              hint="3-128 characters, letters, numbers, and + = . @ - _ only"
              :rules="[
                val => !!val || 'Username is required',
                val => val.length >= 3 || 'Username must be at least 3 characters',
                val => val.length <= 128 || 'Username must be less than 128 characters',
                val => /^[a-zA-Z0-9+=.@\-_]+$/.test(val) || 'Only letters, numbers, and + = . @ - _ allowed'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>

            <q-input
              v-model="signupForm.email"
              label="Email"
              type="email"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Email is required']"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

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

        <!-- Verify Email Panel -->
        <q-tab-panel name="verify">
          <q-form @submit="handleVerifyEmail">
            <q-input
              v-model="verifyForm.username"
              label="Username"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Username is required']"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>

            <q-input
              v-model="verifyForm.code"
              label="Verification Code"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Code is required']"
            >
              <template v-slot:prepend>
                <q-icon name="pin" />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Verify Email"
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

        <!-- Reset Password Panel -->
        <q-tab-panel name="reset">
          <q-form @submit="resetStep === 1 ? handleRequestReset : handleConfirmReset">
            <q-input
              v-model="resetForm.username"
              label="Username"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Username is required']"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>

            <template v-if="resetStep === 2">
              <q-input
                v-model="resetForm.code"
                label="Reset Code"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Code is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="pin" />
                </template>
              </q-input>

              <q-input
                v-model="resetForm.newPassword"
                label="New Password"
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
            </template>

            <q-btn
              type="submit"
              :label="resetStep === 1 ? 'Request Reset Code' : 'Reset Password'"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>

    <!-- User Profile (when authenticated) -->
    <q-card-section v-if="user" class="q-pt-none">
      <q-separator class="q-mb-md" />
      <div class="text-subtitle2 q-mb-sm">Authenticated User</div>
      <div class="text-caption"><strong>Username:</strong> {{ user.username }}</div>
      <div class="text-caption"><strong>Email:</strong> {{ user.email }}</div>
      <div class="text-caption"><strong>Name:</strong> {{ user.name }}</div>
      <div class="text-caption">
        <strong>Verified:</strong>
        <q-chip
          :color="user.emailVerified ? 'green' : 'orange'"
          text-color="white"
          size="sm"
        >
          {{ user.emailVerified ? 'Yes' : 'No' }}
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
const resetStep = ref(1) // 1 = request code, 2 = confirm reset

// Forms
const loginForm = ref({
  username: '',
  password: ''
})

const signupForm = ref({
  username: '',
  email: '',
  password: '',
  name: ''
})

const verifyForm = ref({
  username: '',
  code: ''
})

const resetForm = ref({
  username: '',
  code: '',
  newPassword: ''
})

// Computed
const user = computed(() => authStore.user)

// Methods
async function handleLogin() {
  loading.value = true
  try {
    await authStore.loginWithUsername(loginForm.value.username, loginForm.value.password)
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
    await authStore.signupWithUsername(
      signupForm.value.username,
      signupForm.value.email,
      signupForm.value.password,
      signupForm.value.name
    )
    $q.notify({
      type: 'positive',
      message: 'Account created! Please check your email for verification code.',
      position: 'top'
    })
    // Switch to verify tab
    verifyForm.value.username = signupForm.value.username
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

async function handleVerifyEmail() {
  loading.value = true
  try {
    await authStore.verifyEmail(verifyForm.value.username, verifyForm.value.code)
    $q.notify({
      type: 'positive',
      message: 'Email verified! You can now login.',
      position: 'top'
    })
    activeTab.value = 'login'
    loginForm.value.username = verifyForm.value.username
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
    await authStore.resendCode(verifyForm.value.username)
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

async function handleRequestReset() {
  loading.value = true
  try {
    await authStore.requestPasswordReset(resetForm.value.username)
    $q.notify({
      type: 'positive',
      message: 'Reset code sent to your email!',
      position: 'top'
    })
    resetStep.value = 2
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to request reset',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleConfirmReset() {
  loading.value = true
  try {
    await authStore.confirmPasswordReset(
      resetForm.value.username,
      resetForm.value.code,
      resetForm.value.newPassword
    )
    $q.notify({
      type: 'positive',
      message: 'Password reset successful! You can now login.',
      position: 'top'
    })
    activeTab.value = 'login'
    loginForm.value.username = resetForm.value.username
    resetStep.value = 1
    resetForm.value = { username: '', code: '', newPassword: '' }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to reset password',
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
    loginForm.value = { username: '', password: '' }
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
