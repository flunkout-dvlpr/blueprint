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

      <!-- Step 2: Create config folder and file -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="folder" color="orange" class="q-mr-sm" />
                Step 2: Create Config Folder & File
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Create the config directory and Amplify configuration file:
              </p>
              <q-card flat bordered class="bg-grey-10 q-mb-md">
                <q-card-section class="code-block">
                  <pre class="text-white">mkdir -p src/config
touch src/config/amplify-config.js</pre>
                </q-card-section>
                <q-card-actions>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="orange"
                    label="Copy"
                    @click="copyToClipboard('mkdir -p src/config\ntouch src/config/amplify-config.js')"
                  />
                </q-card-actions>
              </q-card>

              <p class="text-body2 text-grey-5 q-mb-md">
                Add the following content to <code class="text-orange">src/config/amplify-config.js</code>:
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

      <!-- Step 3: Create Boot File (Quasar-specific) -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="rocket_launch" color="orange" class="q-mr-sm" />
                Step 3: Create Quasar Boot File
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Quasar uses boot files to run code before the app starts. Create
                <code class="text-orange">src/boot/amplify.js</code>:
              </p>
              <q-card flat bordered class="bg-grey-10">
                <q-card-section class="code-block">
                  <pre class="text-white">{{ bootFileCode }}</pre>
                </q-card-section>
                <q-card-actions>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="orange"
                    label="Copy"
                    @click="copyToClipboard(bootFileCode)"
                  />
                </q-card-actions>
              </q-card>

              <q-banner rounded class="bg-blue-1 text-blue-9 q-mt-md">
                <template v-slot:avatar>
                  <q-icon name="info" color="blue" />
                </template>
                Boot files are Quasar's way of running initialization code. They execute before your app's
                root component is instantiated, making them perfect for configuring libraries like Amplify.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Step 4: Update quasar.config.js -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="settings" color="orange" class="q-mr-sm" />
                Step 4: Register Boot File in quasar.config.js
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Add the boot file to the <code class="text-orange">boot</code> array in
                <code class="text-orange">quasar.config.js</code>:
              </p>
              <q-card flat bordered class="bg-grey-10">
                <q-card-section class="code-block">
                  <pre class="text-white">{{ quasarConfigCode }}</pre>
                </q-card-section>
                <q-card-actions>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="orange"
                    label="Copy"
                    @click="copyToClipboard(quasarConfigCode)"
                  />
                </q-card-actions>
              </q-card>

              <q-banner rounded class="bg-orange-1 text-orange-9 q-mt-md">
                <template v-slot:avatar>
                  <q-icon name="warning" color="orange" />
                </template>
                <strong>Important:</strong> Boot files are executed in the order they appear in the array.
                Place <code>amplify</code> before other boot files that might need authentication.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Step 5: Environment Variables -->
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-10">
          <q-card flat bordered class="bg-grey-9">
            <q-card-section>
              <div class="text-h6 q-mb-md text-white">
                <q-icon name="vpn_key" color="orange" class="q-mr-sm" />
                Step 5: Configure Environment Variables
              </div>
              <p class="text-body2 text-grey-5 q-mb-md">
                Create a <code class="text-orange">.env</code> file in your frontend root directory:
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
                <div>
                  <div><strong>Security Note:</strong></div>
                  <ul class="q-mb-none">
                    <li>Never commit your <code>.env</code> file to version control</li>
                    <li>Add <code>.env</code> to your <code>.gitignore</code></li>
                    <li>Use <code>.env.example</code> (already created) as a template for team members</li>
                    <li>Quasar requires the <code>VITE_</code> prefix for environment variables</li>
                  </ul>
                </div>
              </q-banner>
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
                Step 6: Using Amplify Auth
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

const bootFileCode = `import { boot } from 'quasar/wrappers'
import { configureAmplify } from 'src/config/amplify-config'

/**
 * Boot file for AWS Amplify configuration
 * This initializes Amplify before the app starts
 */
export default boot(({ app }) => {
  // Configure Amplify with environment variables
  configureAmplify()

  console.log('🚀 Amplify boot file executed')
})`

const quasarConfigCode = `module.exports = configure(function (/* ctx */) {
  return {
    // ... other config

    // Boot files - executed before app starts
    boot: [
      'amplify',  // ← Add this line
      'axios'
    ],

    // ... rest of config
  }
})`

const envVarsCode = `# AWS Region where your Cognito User Pool is located
VITE_AWS_REGION=us-east-1

# Your Cognito User Pool ID (found in AWS Console)
# Format: us-east-1_XXXXXXXXX
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX

# Your Cognito User Pool Client ID (App Client ID)
# Format: 26-character alphanumeric string
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: Additional service configurations
# VITE_API_ENDPOINT=https://api.yourdomain.com
# VITE_S3_BUCKET=your-bucket-name`

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
