# AWS Cognito Setup Guide

This document outlines the steps needed to integrate real AWS Cognito authentication into the Blueprint application.

## Current Implementation

The application currently uses **mock authentication** with:
- Local Pinia store for state management (`src/stores/auth-store.js`)
- Mock API calls with simulated delays
- LocalStorage for session persistence
- Full UI flows for signup, login, verify, and password reset

## AWS Cognito Integration Steps

### 1. Create a Cognito User Pool

**Via AWS Console:**
1. Navigate to AWS Cognito in the AWS Console
2. Click "Create user pool"
3. Configure sign-in options:
   - Email address
   - Username (optional)
4. Configure security requirements:
   - Password policy (minimum 8 characters recommended)
   - MFA settings (optional or required)
5. Configure sign-up experience:
   - Enable self-registration
   - Required attributes: email, name
   - Email verification required
6. Configure message delivery:
   - Email provider (SES or Cognito default)
   - SMS settings for MFA (if enabled)
7. Create the user pool and note the **User Pool ID**

**Via AWS CLI:**
```bash
aws cognito-idp create-user-pool \
  --pool-name blueprint-user-pool \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true}" \
  --auto-verified-attributes email \
  --schema Name=email,Required=true Name=name,Required=true
```

### 2. Create an App Client

**Via AWS Console:**
1. In your User Pool, go to "App integration" tab
2. Click "Create app client"
3. Configure:
   - App client name: `blueprint-web-client`
   - Authentication flows: `ALLOW_USER_PASSWORD_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
   - Don't generate client secret (for public web apps)
4. Note the **App Client ID**

**Via AWS CLI:**
```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --client-name blueprint-web-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH
```

### 3. Install AWS SDK

Choose one of these options:

**Option A: AWS Amplify (Recommended for web apps)**
```bash
cd frontend
npm install aws-amplify
```

**Option B: AWS SDK for JavaScript v3**
```bash
cd frontend
npm install @aws-sdk/client-cognito-identity-provider
```

### 4. Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# AWS Cognito Configuration
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Identity Pool for AWS credentials
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 5. Update Cognito Configuration

Create `frontend/src/config/aws-config.js`:

**Using AWS Amplify:**
```javascript
import { Amplify } from 'aws-amplify'

Amplify.configure({
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
})
```

**Using AWS SDK:**
```javascript
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

export const cognitoClient = new CognitoIdentityProviderClient({
  region: import.meta.env.VITE_AWS_REGION
})

export const cognitoConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID
}
```

### 6. Update Auth Store

Replace mock methods in `src/stores/auth-store.js` with real AWS calls:

**Using AWS Amplify:**
```javascript
import { signUp, signIn, confirmSignUp, resetPassword, confirmResetPassword, signOut } from 'aws-amplify/auth'

// Replace signup action
async signup(email, password, name) {
  this.loading = true
  this.error = null
  try {
    const { userId } = await signUp({
      username: email,
      password,
      attributes: {
        email,
        name
      }
    })

    this.user = { email, name, sub: userId, email_verified: false }
    return { success: true, message: 'Signup successful! Check your email.', userSub: userId }
  } catch (error) {
    this.error = error.message
    throw error
  } finally {
    this.loading = false
  }
}

// Replace login action
async login(email, password) {
  this.loading = true
  this.error = null
  try {
    const { isSignedIn, nextStep } = await signIn({ username: email, password })

    if (isSignedIn) {
      const user = await getCurrentUser()
      const session = await fetchAuthSession()

      this.user = {
        email: user.signInDetails?.loginId,
        name: user.attributes?.name,
        sub: user.userId,
        email_verified: user.attributes?.email_verified === 'true'
      }
      this.isAuthenticated = true
      this.accessToken = session.tokens?.accessToken.toString()
      this.idToken = session.tokens?.idToken.toString()

      return { success: true, message: 'Login successful!', user: this.user }
    }
  } catch (error) {
    this.error = error.message
    throw error
  } finally {
    this.loading = false
  }
}

// Replace other methods similarly...
```

**Using AWS SDK:**
```javascript
import {
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GlobalSignOutCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { cognitoClient, cognitoConfig } from 'src/config/aws-config'

// Example: Replace signup action
async signup(email, password, name) {
  this.loading = true
  this.error = null
  try {
    const command = new SignUpCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name }
      ]
    })

    const response = await cognitoClient.send(command)

    this.user = { email, name, sub: response.UserSub, email_verified: false }
    return { success: true, message: 'Signup successful! Check your email.', userSub: response.UserSub }
  } catch (error) {
    this.error = error.message
    throw error
  } finally {
    this.loading = false
  }
}
```

### 7. Initialize Amplify (if using)

Update `frontend/src/main.js` or create a boot file:

```javascript
import { Amplify } from 'aws-amplify'
import awsConfig from './config/aws-config'

// Configure Amplify
Amplify.configure(awsConfig)
```

### 8. Testing

1. **Sign Up:**
   - Create a new account
   - Check email for verification code
   - Verify email with code

2. **Sign In:**
   - Login with verified credentials
   - Inspect JWT tokens in browser dev tools

3. **Password Reset:**
   - Request password reset
   - Check email for reset code
   - Complete password reset flow

### 9. Security Considerations

- **Never commit** `.env` files with real credentials to version control
- Add `.env` to `.gitignore`
- Use environment-specific configurations (dev, staging, prod)
- Implement proper CORS settings in Cognito
- Consider enabling MFA for production
- Set up CloudWatch logging for authentication events
- Implement token refresh logic before expiration (typically 1 hour)

### 10. Additional Features

**To implement MFA:**
- Update User Pool MFA settings
- Use `setUpTOTP` and `verifyTOTPToken` from Amplify
- Or `AssociateSoftwareTokenCommand` from AWS SDK

**To use hosted UI:**
- Configure Cognito Hosted UI in User Pool
- Set up callback URLs
- Use OAuth 2.0 flow instead of custom forms

## Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS Amplify Auth Documentation](https://docs.amplify.aws/javascript/build-a-backend/auth/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/)
- [Cognito User Pool Best Practices](https://docs.aws.amazon.com/cognito/latest/developerguide/best-practices.html)

## Migration Checklist

- [ ] Create AWS Cognito User Pool
- [ ] Create App Client
- [ ] Install AWS Amplify or AWS SDK
- [ ] Configure environment variables
- [ ] Update auth store with real AWS calls
- [ ] Initialize AWS configuration
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test email verification
- [ ] Test password reset
- [ ] Implement token refresh logic
- [ ] Add error handling for AWS-specific errors
- [ ] Set up CloudWatch monitoring
- [ ] Configure production security settings
