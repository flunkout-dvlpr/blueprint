import { Amplify } from 'aws-amplify'

/**
 * Configure AWS Amplify with environment variables
 * Make sure to set these in your .env file:
 * - VITE_AWS_REGION
 * - VITE_USER_POOL_ID
 * - VITE_USER_POOL_CLIENT_ID
 */
export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
        userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
        userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',

        // Optional: Configure password policy
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true
        },

        // Optional: Configure MFA
        mfa: {
          status: 'optional', // 'off' | 'optional' | 'on'
          smsEnabled: true,
          totpEnabled: true
        },

        // Optional: Account recovery
        accountRecovery: 'EMAIL_AND_PHONE_WITHOUT_MFA', // or 'NONE'

        // Optional: Sign up verification
        signUpVerificationMethod: 'code' // or 'link'
      }
    }
  })

  console.log('✅ AWS Amplify configured successfully')
}

/**
 * Get the current Amplify configuration
 * Useful for debugging
 */
export const getAmplifyConfig = () => {
  return Amplify.getConfig()
}
