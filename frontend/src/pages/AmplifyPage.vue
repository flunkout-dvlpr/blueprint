<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h4 text-center q-mb-md">
        <span class="text-orange">AWS Amplify</span>
        <span class="text-white"> Setup Guide</span>
      </div>
      <div class="text-subtitle2 text-center text-grey-5 q-mb-xl">
        Configure AWS Amplify for seamless AWS service integration
      </div>

      <!-- Introduction -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="info" color="orange" class="q-mr-sm" />
                What is AWS Amplify?
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                AWS Amplify is a complete solution that lets frontend web and mobile developers
                easily build, ship, and host full-stack applications on AWS. It provides a
                declarative and easy-to-use interface for integrating AWS services like Cognito,
                API Gateway, Lambda, S3, and more.
              </p>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-chip color="orange" text-color="white" icon="check">
                    Easy Authentication
                  </q-chip>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-chip color="orange" text-color="white" icon="check">
                    GraphQL & REST APIs
                  </q-chip>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-chip color="orange" text-color="white" icon="check">
                    File Storage
                  </q-chip>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Installation -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="download" color="orange" class="q-mr-sm" />
                Step 1: Installation
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Install the AWS Amplify library in your project:
              </p>
              <q-card flat bordered class="bg-grey-10">
                <q-card-section class="code-block">
                  <pre class="text-white">npm install aws-amplify</pre>
                </q-card-section>
                <q-card-actions>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="orange"
                    label="Copy"
                    @click="copyToClipboard('npm install aws-amplify')"
                  />
                </q-card-actions>
              </q-card>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Configuration File -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="settings" color="orange" class="q-mr-sm" />
                Step 2: Create Configuration File
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Create <code class="text-orange">src/config/amplify-config.js</code> to centralize your AWS configuration:
              </p>
              <q-card flat bordered class="bg-grey-10">
                <q-card-section class="code-block">
                  <pre class="text-white">{{ amplifyConfigCode }}</pre>
                </q-card-section>
                <q-card-actions>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="orange"
                    label="Copy"
                    @click="copyToClipboard(amplifyConfigCode)"
                  />
                </q-card-actions>
              </q-card>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Environment Variables -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="vpn_key" color="orange" class="q-mr-sm" />
                Step 3: Environment Variables
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Create a <code class="text-orange">.env</code> file in your project root with your AWS credentials:
              </p>
              <q-card flat bordered class="bg-grey-10">
                <q-card-section class="code-block">
                  <pre class="text-white">{{ envVarsCode }}</pre>
                </q-card-section>
                <q-card-actions>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="orange"
                    label="Copy"
                    @click="copyToClipboard(envVarsCode)"
                  />
                </q-card-actions>
              </q-card>

              <q-banner rounded class="bg-orange-1 text-orange-9 q-mt-md">
                <template v-slot:avatar>
                  <q-icon name="warning" color="orange" />
                </template>
                <strong>Important:</strong> Never commit your <code>.env</code> file to version control!
                Add it to your <code>.gitignore</code> file.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Initialize in App -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="code" color="orange" class="q-mr-sm" />
                Step 4: Initialize Amplify
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Update <code class="text-orange">src/main.js</code> to configure Amplify on app startup:
              </p>
              <q-card flat bordered class="bg-grey-10">
                <q-card-section class="code-block">
                  <pre class="text-white">{{ mainJsCode }}</pre>
                </q-card-section>
                <q-card-actions>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="orange"
                    label="Copy"
                    @click="copyToClipboard(mainJsCode)"
                  />
                </q-card-actions>
              </q-card>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Usage Example -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="play_arrow" color="orange" class="q-mr-sm" />
                Step 5: Using Amplify Auth
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Example of using Amplify Auth in your components:
              </p>
              <q-card flat bordered class="bg-grey-10">
                <q-card-section class="code-block">
                  <pre class="text-white">{{ usageExampleCode }}</pre>
                </q-card-section>
                <q-card-actions>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="orange"
                    label="Copy"
                    @click="copyToClipboard(usageExampleCode)"
                  />
                </q-card-actions>
              </q-card>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Getting AWS Credentials -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="account_balance" color="orange" class="q-mr-sm" />
                Getting AWS Credentials
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Follow these steps to get your AWS Cognito credentials:
              </p>

              <q-stepper v-model="step" vertical color="orange" animated flat dark>
                <q-step
                  :name="1"
                  title="Create AWS Account"
                  icon="person_add"
                  :done="step > 1"
                >
                  <div class="text-grey-5">
                    Sign up for an AWS account at <a href="https://aws.amazon.com" target="_blank" class="text-orange">aws.amazon.com</a>
                    if you don't have one already.
                  </div>
                  <q-stepper-navigation>
                    <q-btn @click="step = 2" color="orange" label="Next" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="2"
                  title="Create Cognito User Pool"
                  icon="group"
                  :done="step > 2"
                >
                  <div class="text-grey-5">
                    Navigate to AWS Cognito → User Pools → Create user pool. Follow the
                    setup wizard to configure your authentication requirements. See the
                    <router-link to="/cognito" class="text-orange">Cognito documentation</router-link>
                    for detailed deployment guides.
                  </div>
                  <q-stepper-navigation>
                    <q-btn @click="step = 3" color="orange" label="Next" />
                    <q-btn flat @click="step = 1" color="white" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="3"
                  title="Get User Pool Details"
                  icon="settings"
                  :done="step > 3"
                >
                  <div class="text-grey-5">
                    From your Cognito User Pool, copy:
                    <ul>
                      <li><strong>User Pool ID</strong> (e.g., us-east-1_XXXXXXXXX)</li>
                      <li><strong>App Client ID</strong> from the "App integration" tab</li>
                      <li><strong>Region</strong> where your pool is hosted</li>
                    </ul>
                  </div>
                  <q-stepper-navigation>
                    <q-btn @click="step = 4" color="orange" label="Next" />
                    <q-btn flat @click="step = 2" color="white" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="4"
                  title="Update Environment Variables"
                  icon="done"
                >
                  <div class="text-grey-5">
                    Add the credentials to your <code>.env</code> file and restart your dev server.
                    You're ready to use Amplify Auth!
                  </div>
                  <q-stepper-navigation>
                    <q-btn color="orange" label="Finish" @click="step = 1" />
                    <q-btn flat @click="step = 3" color="white" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Resources -->
      <div class="row justify-center">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="library_books" color="orange" class="q-mr-sm" />
                Additional Resources
              </div>
              <q-list separator dark>
                <q-item
                  clickable
                  v-ripple
                  href="https://docs.amplify.aws"
                  target="_blank"
                  class="hover-orange"
                >
                  <q-item-section avatar>
                    <q-icon name="description" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white">Official Amplify Documentation</q-item-label>
                    <q-item-label caption class="text-grey-5">Complete guide to AWS Amplify</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey-5" />
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  href="https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/"
                  target="_blank"
                  class="hover-orange"
                >
                  <q-item-section avatar>
                    <q-icon name="security" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white">Amplify Auth Guide</q-item-label>
                    <q-item-label caption class="text-grey-5">Authentication & authorization</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey-5" />
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  to="/cognito"
                  class="hover-orange"
                >
                  <q-item-section avatar>
                    <q-icon name="account_circle" color="pink" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white">Cognito Setup Guides</q-item-label>
                    <q-item-label caption class="text-grey-5">Deployment guides for all auth types</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="arrow_forward" color="grey-5" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const step = ref(1)

// Code examples
const amplifyConfigCode = `import { Amplify } from 'aws-amplify'

export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.VITE_AWS_REGION,
        userPoolId: import.meta.env.VITE_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,

        // Optional: Configure sign-in options
        loginWith: {
          email: true,
          phone: false,
          username: false
        },

        // Optional: Password requirements
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: false
        }
      }
    }
  })
}

export default configureAmplify`

const envVarsCode = `# AWS Region
VITE_AWS_REGION=us-east-1

# Cognito User Pool Configuration
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: Additional service configurations
# VITE_API_ENDPOINT=https://api.yourdomain.com
# VITE_S3_BUCKET=your-bucket-name`

const mainJsCode = `import { createApp } from 'vue'
import { Quasar } from 'quasar'
import router from './router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import Amplify configuration
import { configureAmplify } from './config/amplify-config'

// Configure Amplify before creating the app
configureAmplify()

const app = createApp(App)

app.use(Quasar, {
  /* Quasar config */
})
app.use(createPinia())
app.use(router)

app.mount('#app')`

const usageExampleCode = `import { signUp, signIn, signOut, getCurrentUser } from 'aws-amplify/auth'

// Sign up a new user
async function handleSignUp(email, password, name) {
  try {
    const { userId } = await signUp({
      username: email,
      password,
      attributes: {
        email,
        name
      }
    })
    console.log('User created:', userId)
  } catch (error) {
    console.error('Sign up error:', error)
  }
}

// Sign in
async function handleSignIn(email, password) {
  try {
    const { isSignedIn } = await signIn({
      username: email,
      password
    })
    console.log('Signed in:', isSignedIn)
  } catch (error) {
    console.error('Sign in error:', error)
  }
}

// Get current authenticated user
async function getCurrentUserInfo() {
  try {
    const user = await getCurrentUser()
    console.log('Current user:', user)
    return user
  } catch (error) {
    console.error('Not authenticated')
  }
}

// Sign out
async function handleSignOut() {
  try {
    await signOut()
    console.log('Signed out')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}`

// Copy to clipboard helper
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Copied to clipboard!',
      position: 'top',
      timeout: 1500
    })
  })
}
</script>

<style scoped>
.code-block {
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

code {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.hover-orange:hover {
  background-color: rgba(255, 152, 0, 0.1);
}
</style>
