<template>
  <q-card flat bordered class="auth-card">
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">
        Passwordless SMS OTP
      </div>
      <div class="text-caption text-center text-grey-7 q-mb-lg">
        Login with just your phone number - no password required
      </div>

      <!-- Step indicator -->
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        animated
        flat
      >
        <!-- Step 1: Enter Phone Number -->
        <q-step
          :name="1"
          title="Enter Phone"
          icon="phone"
          :done="step > 1"
        >
          <q-form @submit="handleRequestOTP">
            <q-input
              v-model="phoneNumber"
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

            <q-btn
              type="submit"
              label="Send SMS Code"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </q-form>
        </q-step>

        <!-- Step 2: Enter OTP -->
        <q-step
          :name="2"
          title="Enter Code"
          icon="sms"
        >
          <div class="text-caption text-grey-7 q-mb-md text-center">
            We sent a verification code to <strong>{{ phoneNumber }}</strong>
          </div>

          <q-form @submit="handleVerifyOTP">
            <q-input
              v-model="otpCode"
              label="SMS Verification Code"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Code is required']"
              autofocus
            >
              <template v-slot:prepend>
                <q-icon name="pin" />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Verify & Login"
              color="primary"
              class="full-width q-mb-sm"
              :loading="loading"
            />

            <q-btn
              label="Resend Code"
              color="grey-7"
              flat
              class="full-width q-mb-sm"
              @click="handleRequestOTP"
              :disable="loading"
            />

            <q-btn
              label="Change Phone Number"
              color="grey-7"
              flat
              size="sm"
              class="full-width"
              @click="step = 1"
            />
          </q-form>
        </q-step>
      </q-stepper>
    </q-card-section>

    <!-- User Profile (when authenticated) -->
    <q-card-section v-if="user" class="q-pt-none">
      <q-separator class="q-mb-md" />
      <div class="text-subtitle2 q-mb-sm">Authenticated User</div>
      <div class="text-caption"><strong>Phone:</strong> {{ user.phoneNumber }}</div>
      <div class="text-caption"><strong>Name:</strong> {{ user.name || 'Not provided' }}</div>
      <q-btn
        label="Logout"
        color="negative"
        class="full-width q-mt-md"
        @click="handleLogout"
      />
    </q-card-section>

    <!-- Info Banner -->
    <q-card-section class="q-pt-none">
      <q-banner rounded class="bg-blue-1 text-blue-9">
        <template v-slot:avatar>
          <q-icon name="info" color="blue" />
        </template>
        <div class="text-caption">
          <strong>How it works:</strong> Enter your phone number and we'll send you a one-time code via SMS.
          No password needed! Quick and secure.
        </div>
      </q-banner>

      <q-banner rounded class="bg-orange-1 text-orange-9 q-mt-sm">
        <template v-slot:avatar>
          <q-icon name="warning" color="orange" />
        </template>
        <div class="text-caption">
          <strong>Note:</strong> SMS charges may apply. Standard carrier rates apply for receiving text messages.
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
const step = ref(1)
const loading = ref(false)
const phoneNumber = ref('')
const otpCode = ref('')

// Computed
const user = computed(() => authStore.user)

// Methods
async function handleRequestOTP() {
  loading.value = true
  try {
    await authStore.requestOTPSMS(phoneNumber.value)
    $q.notify({
      type: 'positive',
      message: 'Verification code sent via SMS!',
      position: 'top'
    })
    step.value = 2
    otpCode.value = '' // Clear previous code
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to send code',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleVerifyOTP() {
  loading.value = true
  try {
    await authStore.verifyOTPSMS(otpCode.value)
    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Invalid code. Please try again.',
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
    // Reset component
    step.value = 1
    phoneNumber.value = ''
    otpCode.value = ''
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
