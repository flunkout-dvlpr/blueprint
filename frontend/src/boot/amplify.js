import { boot } from 'quasar/wrappers'
import { configureAmplify } from 'src/config/amplify-config'

/**
 * Boot file for AWS Amplify configuration
 * This initializes Amplify before the app starts
 */
export default boot(({ app }) => {
  // Configure Amplify with environment variables
  configureAmplify()

  console.log('🚀 Amplify boot file executed')
})
