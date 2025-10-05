<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h4 text-center q-mb-md">AWS Cognito Authentication</div>
      <div class="text-subtitle2 text-center text-grey-7 q-mb-xl">
        Explore different authentication methods powered by AWS Cognito
      </div>

      <!-- Auth Method Selector -->
      <div class="row justify-center q-mb-xl">
        <q-btn-toggle
          v-model="authMethod"
          spread
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="authMethodOptions"
          class="method-toggle"
        />
      </div>

      <!-- Component Loader -->
      <div class="row justify-center">
        <div class="col-12 col-md-8 col-lg-6">
          <component :is="currentAuthComponent" />
        </div>
      </div>

      <!-- Documentation Links -->
      <div class="row justify-center q-mt-xl">
        <div class="col-12 col-md-10">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="description" class="q-mr-sm" />
                Deployment Documentation
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Step-by-step guides to deploy each auth type independently using
                AWS CLI
              </div>

              <q-list separator>
                <q-item
                  clickable
                  v-ripple
                  :href="getDocLink('01-EMAIL-PASSWORD-AUTH.md')"
                  target="_blank"
                >
                  <q-item-section avatar>
                    <q-avatar color="pink" text-color="white" icon="email" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Email/Password Authentication</q-item-label>
                    <q-item-label caption
                      >Traditional email & password with
                      verification</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey" />
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  :href="getDocLink('02-PHONE-PASSWORD-AUTH.md')"
                  target="_blank"
                >
                  <q-item-section avatar>
                    <q-avatar color="teal" text-color="white" icon="phone" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Phone/Password Authentication</q-item-label>
                    <q-item-label caption
                      >Login with phone number and password via
                      SMS</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey" />
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  :href="getDocLink('03-USERNAME-PASSWORD-AUTH.md')"
                  target="_blank"
                >
                  <q-item-section avatar>
                    <q-avatar
                      color="deep-purple"
                      text-color="white"
                      icon="account_circle"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      >Username/Password Authentication</q-item-label
                    >
                    <q-item-label caption
                      >Classic username-based authentication</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey" />
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  :href="getDocLink('04-PASSWORDLESS-OTP-EMAIL.md')"
                  target="_blank"
                >
                  <q-item-section avatar>
                    <q-avatar color="blue" text-color="white" icon="vpn_key" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Passwordless Email OTP</q-item-label>
                    <q-item-label caption
                      >Login with email OTP using Lambda triggers</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey" />
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  :href="getDocLink('05-PASSWORDLESS-OTP-SMS.md')"
                  target="_blank"
                >
                  <q-item-section avatar>
                    <q-avatar color="orange" text-color="white" icon="sms" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Passwordless SMS OTP</q-item-label>
                    <q-item-label caption
                      >Login with SMS OTP using Lambda triggers</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey" />
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  :href="getDocLink('06-MFA-SMS-AUTH.md')"
                  target="_blank"
                >
                  <q-item-section avatar>
                    <q-avatar
                      color="green"
                      text-color="white"
                      icon="security"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      >Multi-Factor Authentication (SMS)</q-item-label
                    >
                    <q-item-label caption
                      >Enhanced security with SMS-based MFA</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Features Overview -->
      <div class="row justify-center q-mt-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-blue-9">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="stars" class="q-mr-sm" />
                Component Features
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <div class="text-subtitle2">
                    <q-icon
                      name="check_circle"
                      color="positive"
                      class="q-mr-xs"
                    />
                    Self-Contained
                  </div>
                  <div class="text-caption text-grey-7">
                    Each component is fully standalone with its own logic
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <div class="text-subtitle2">
                    <q-icon
                      name="check_circle"
                      color="positive"
                      class="q-mr-xs"
                    />
                    Copy & Paste Ready
                  </div>
                  <div class="text-caption text-grey-7">
                    Easily reuse in other projects with minimal changes
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <div class="text-subtitle2">
                    <q-icon
                      name="check_circle"
                      color="positive"
                      class="q-mr-xs"
                    />
                    Production Ready
                  </div>
                  <div class="text-caption text-grey-7">
                    Full error handling and user feedback
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <div class="text-subtitle2">
                    <q-icon
                      name="check_circle"
                      color="positive"
                      class="q-mr-xs"
                    />
                    AWS Amplify
                  </div>
                  <div class="text-caption text-grey-7">
                    Uses official AWS Amplify library
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <div class="text-subtitle2">
                    <q-icon
                      name="check_circle"
                      color="positive"
                      class="q-mr-xs"
                    />
                    Quasar UI
                  </div>
                  <div class="text-caption text-grey-7">
                    Beautiful components with Quasar framework
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <div class="text-subtitle2">
                    <q-icon
                      name="check_circle"
                      color="positive"
                      class="q-mr-xs"
                    />
                    TypeScript Support
                  </div>
                  <div class="text-caption text-grey-7">
                    Ready for TypeScript migration
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue";
import EmailPasswordAuth from "src/components/auth/EmailPasswordAuth.vue";
import PhonePasswordAuth from "src/components/auth/PhonePasswordAuth.vue";
import UsernamePasswordAuth from "src/components/auth/UsernamePasswordAuth.vue";
import EmailOTPAuth from "src/components/auth/EmailOTPAuth.vue";
import SMSOTPAuth from "src/components/auth/SMSOTPAuth.vue";
import MFASMSAuth from "src/components/auth/MFASMSAuth.vue";

// Auth method selection
const authMethod = ref("email-password");

const authMethodOptions = [
  {
    label: "Email/Password",
    value: "email-password",
    icon: "email",
  },
  {
    label: "Phone/Password",
    value: "phone-password",
    icon: "phone",
  },
  {
    label: "Username/Password",
    value: "username-password",
    icon: "account_circle",
  },
  {
    label: "Email OTP",
    value: "email-otp",
    icon: "vpn_key",
  },
  {
    label: "SMS OTP",
    value: "sms-otp",
    icon: "sms",
  },
  {
    label: "MFA (SMS)",
    value: "mfa-sms",
    icon: "security",
  },
];

// Component mapping
const authComponents = {
  "email-password": EmailPasswordAuth,
  "phone-password": PhonePasswordAuth,
  "username-password": UsernamePasswordAuth,
  "email-otp": EmailOTPAuth,
  "sms-otp": SMSOTPAuth,
  "mfa-sms": MFASMSAuth,
};

// Computed
const currentAuthComponent = computed(() => {
  return authComponents[authMethod.value] || EmailPasswordAuth;
});

// Helper function to get documentation link
function getDocLink(filename) {
  // In development, you might want to link to GitHub raw content or local docs server
  // For now, returning a placeholder - you can update this based on your deployment
  return `https://github.com/yourusername/blueprint/blob/main/frontend/docs/cognito/${filename}`;
}
</script>

<style scoped>
.method-toggle {
  max-width: 900px;
}

@media (max-width: 600px) {
  .method-toggle {
    flex-wrap: wrap;
  }
}
</style>
