<template>
  <q-card flat bordered class="auth-card">
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">
        Multi-Factor Authentication (SMS)
      </div>
      <div class="text-caption text-center text-grey-7 q-mb-lg">
        Enhanced security with SMS-based two-factor authentication
      </div>

      <!-- Not authenticated - Login -->
      <div v-if="!user">
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
        </q-tabs>

        <q-separator class="q-my-md" />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Login Panel -->
          <q-tab-panel name="login">
            <q-form @submit="handleLogin">
              <q-input
                v-model="loginForm.email"
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
                v-model="signupForm.phoneNumber"
                label="Phone Number (for MFA)"
                type="tel"
                outlined
                dense
                class="q-mb-md"
                hint="E.164 format: +15551234567"
                :rules="[
                  val => !!val || 'Phone number is required for MFA',
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
        </q-tab-panels>
      </div>

      <!-- MFA Code Entry (when MFA is required) -->
      <div v-if="mfaRequired && !user">
        <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-md">
          <template v-slot:avatar>
            <q-icon name="security" color="blue" />
          </template>
          <div class="text-caption">
            A verification code has been sent to your phone via SMS.
          </div>
        </q-banner>

        <q-form @submit="handleVerifyMFA">
          <q-input
            v-model="mfaCode"
            label="MFA Verification Code"
            outlined
            dense
            class="q-mb-md"
            :rules="[val => !!val || 'Code is required']"
            autofocus
          >
            <template v-slot:prepend>
              <q-icon name="sms" />
            </template>
          </q-input>

          <q-btn
            type="submit"
            label="Verify & Login"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </div>
    </q-card-section>

    <!-- User Profile & MFA Management (when authenticated) -->
    <q-card-section v-if="user" class="q-pt-none">
      <q-separator class="q-mb-md" />
      <div class="text-subtitle2 q-mb-sm">Authenticated User</div>
      <div class="text-caption"><strong>Email:</strong> {{ user.email }}</div>
      <div class="text-caption"><strong>Name:</strong> {{ user.name }}</div>
      <div class="text-caption">
        <strong>Phone:</strong> {{ user.phoneNumber || 'Not set' }}
      </div>
      <div class="text-caption">
        <strong>MFA Status:</strong>
        <q-chip
          :color="user.mfaEnabled ? 'green' : 'grey'"
          text-color="white"
          size="sm"
        >
          {{ user.mfaEnabled ? 'Enabled' : 'Disabled' }}
        </q-chip>
      </div>

      <q-separator class="q-my-md" />

      <!-- MFA Management -->
      <div v-if="!user.mfaEnabled" class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">Enable MFA</div>
        <div class="text-caption text-grey-7 q-mb-md">
          Add an extra layer of security to your account
        </div>

        <q-form @submit="handleEnableMFA">
          <q-input
            v-model="mfaPhoneNumber"
            label="Phone Number for MFA"
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

          <q-btn
            type="submit"
            label="Enable MFA"
            color="positive"
            icon="verified_user"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </div>

      <div v-else class="q-mb-md">
        <q-btn
          label="Disable MFA"
          color="warning"
          icon="cancel"
          class="full-width"
          @click="handleDisableMFA"
          :loading="loading"
        />
      </div>

      <q-btn
        label="Logout"
        color="negative"
        class="full-width"
        @click="handleLogout"
      />
    </q-card-section>

    <!-- Info Banner -->
    <q-card-section v-if="!user" class="q-pt-none">
      <q-banner rounded class="bg-green-1 text-green-9">
        <template v-slot:avatar>
          <q-icon name="security" color="green" />
        </template>
        <div class="text-caption">
          <strong>Why MFA?</strong> Multi-factor authentication adds an extra layer of security.
          Even if someone knows your password, they can't login without the SMS code sent to your phone.
        </div>
      </q-banner>
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
const mfaCode = ref('')
const mfaPhoneNumber = ref('')

// Forms
const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  email: '',
  password: '',
  name: '',
  phoneNumber: ''
})

// Computed
const user = computed(() => authStore.user)
const mfaRequired = computed(() => authStore.mfaRequired)

// Methods
async function handleLogin() {
  loading.value = true
  try {
    await authStore.loginWithMFA(loginForm.value.email, loginForm.value.password)

    if (!authStore.mfaRequired) {
      $q.notify({
        type: 'positive',
        message: 'Login successful!',
        position: 'top'
      })
    } else {
      $q.notify({
        type: 'info',
        message: 'MFA code sent to your phone',
        position: 'top'
      })
    }
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
    await authStore.signup(
      signupForm.value.email,
      signupForm.value.password,
      signupForm.value.name,
      signupForm.value.phoneNumber
    )
    $q.notify({
      type: 'positive',
      message: 'Account created! You can now login.',
      position: 'top'
    })
    activeTab.value = 'login'
    loginForm.value.email = signupForm.value.email
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

async function handleVerifyMFA() {
  loading.value = true
  try {
    await authStore.verifyMFACode(mfaCode.value)
    $q.notify({
      type: 'positive',
      message: 'MFA verified! Login successful.',
      position: 'top'
    })
    mfaCode.value = ''
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Invalid MFA code',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleEnableMFA() {
  loading.value = true
  try {
    await authStore.enableMFA(mfaPhoneNumber.value)
    $q.notify({
      type: 'positive',
      message: 'MFA enabled successfully!',
      position: 'top'
    })
    mfaPhoneNumber.value = ''
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to enable MFA',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleDisableMFA() {
  loading.value = true
  try {
    await authStore.disableMFA()
    $q.notify({
      type: 'warning',
      message: 'MFA disabled',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to disable MFA',
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
    loginForm.value = { email: '', password: '' }
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
