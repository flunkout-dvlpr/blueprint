# Username/Password Authentication with AWS Cognito

Complete self-contained guide to deploy classic username/password authentication using AWS Cognito.

## Use Case
Traditional username-based authentication with email verification.

## What You'll Deploy
- ✅ Cognito User Pool configured for username login
- ✅ Email verification flow
- ✅ Password reset capability
- ✅ App client for web application

## Prerequisites
- AWS CLI installed and configured
- An AWS account with appropriate permissions

---

## Step 1: Create User Pool

```bash
# Set variables
REGION="us-east-1"
POOL_NAME="username-password-pool"

# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name $POOL_NAME \
  --region $REGION \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }' \
  --username-attributes preferred_username \
  --auto-verified-attributes email \
  --email-configuration '{
    "EmailSendingAccount": "COGNITO_DEFAULT"
  }' \
  --username-configuration '{
    "CaseSensitive": false
  }' \
  --schema '[
    {
      "Name": "email",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": true
    },
    {
      "Name": "preferred_username",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": false
    },
    {
      "Name": "name",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": true
    }
  ]' \
  --query 'UserPool.Id' \
  --output text
```

**Save the output (User Pool ID):**
```
us-east-1_XXXXXXXXX
```

---

## Step 2: Create App Client

```bash
# Set variables
USER_POOL_ID="us-east-1_XXXXXXXXX"  # From Step 1

# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name username-password-client \
  --no-generate-secret \
  --explicit-auth-flows \
    ALLOW_USER_PASSWORD_AUTH \
    ALLOW_REFRESH_TOKEN_AUTH \
    ALLOW_USER_SRP_AUTH \
  --prevent-user-existence-errors ENABLED \
  --enable-token-revocation \
  --auth-session-validity 3 \
  --access-token-validity 60 \
  --id-token-validity 60 \
  --refresh-token-validity 30 \
  --token-validity-units '{
    "AccessToken": "minutes",
    "IdToken": "minutes",
    "RefreshToken": "days"
  }' \
  --query 'UserPoolClient.ClientId' \
  --output text
```

**Save the output (App Client ID):**
```
XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 3: Configure Environment Variables

Create `.env` file in your frontend project:

```bash
# AWS Region
VITE_AWS_REGION=us-east-1

# Username/Password Cognito Configuration
VITE_USERNAME_AUTH_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USERNAME_AUTH_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 4: Install Dependencies

```bash
npm install aws-amplify
# or
yarn add aws-amplify
```

---

## Step 5: Configure Amplify

Create `src/config/cognito-username-auth.js`:

```javascript
import { Amplify } from 'aws-amplify'

export const configureUsernameAuth = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.VITE_AWS_REGION,
        userPoolId: import.meta.env.VITE_USERNAME_AUTH_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_USERNAME_AUTH_CLIENT_ID,

        loginWith: {
          username: true
        },

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
```

---

## Step 6: Implementation Code

### Sign Up with Username
```javascript
import { signUp } from 'aws-amplify/auth'

async function signupWithUsername(username, email, password, name) {
  try {
    const { userId, nextStep } = await signUp({
      username,
      password,
      attributes: {
        email,
        preferred_username: username,
        name
      }
    })

    console.log('User ID:', userId)
    console.log('Next step:', nextStep) // Email verification required

    return { success: true, userId }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}
```

### Confirm Email
```javascript
import { confirmSignUp } from 'aws-amplify/auth'

async function confirmEmail(username, code) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username,
      confirmationCode: code
    })

    console.log('Email verified:', isSignUpComplete)
    return { success: true }
  } catch (error) {
    console.error('Confirmation error:', error)
    throw error
  }
}
```

### Sign In with Username
```javascript
import { signIn } from 'aws-amplify/auth'

async function loginWithUsername(username, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username,
      password
    })

    console.log('Signed in:', isSignedIn)
    return { success: true, isSignedIn }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}
```

### Get Current User
```javascript
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth'

async function getCurrentUserInfo() {
  try {
    const user = await getCurrentUser()
    const attributes = await fetchUserAttributes()

    return {
      userId: user.userId,
      username: user.username,
      preferredUsername: attributes.preferred_username,
      email: attributes.email,
      name: attributes.name,
      emailVerified: attributes.email_verified === 'true'
    }
  } catch (error) {
    console.error('Get user error:', error)
    throw error
  }
}
```

### Password Reset
```javascript
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth'

async function requestPasswordReset(username) {
  try {
    const output = await resetPassword({ username })
    console.log('Reset code sent to:', output.nextStep.codeDeliveryDetails.destination)
    return { success: true }
  } catch (error) {
    console.error('Reset request error:', error)
    throw error
  }
}

async function confirmPasswordReset(username, code, newPassword) {
  try {
    await confirmResetPassword({
      username,
      confirmationCode: code,
      newPassword
    })
    return { success: true }
  } catch (error) {
    console.error('Reset confirmation error:', error)
    throw error
  }
}
```

### Resend Email Code
```javascript
import { resendSignUpCode } from 'aws-amplify/auth'

async function resendCode(username) {
  try {
    const output = await resendSignUpCode({ username })
    console.log('Code sent to:', output.destination)
    return { success: true }
  } catch (error) {
    console.error('Resend error:', error)
    throw error
  }
}
```

### Sign Out
```javascript
import { signOut } from 'aws-amplify/auth'

async function logout() {
  try {
    await signOut()
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}
```

---

## Step 7: Test the Setup

### Test Sign Up via CLI
```bash
USER_POOL_ID="us-east-1_XXXXXXXXX"
CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXX"

aws cognito-idp sign-up \
  --client-id $CLIENT_ID \
  --username "johndoe" \
  --password "TestPass123" \
  --user-attributes \
    Name=email,Value=john@example.com \
    Name=preferred_username,Value=johndoe \
    Name=name,Value="John Doe"
```

### Verify Email
```bash
aws cognito-idp confirm-sign-up \
  --client-id $CLIENT_ID \
  --username "johndoe" \
  --confirmation-code "123456"
```

### Test Sign In
```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=johndoe,PASSWORD="TestPass123"
```

---

## Username Validation Rules

### Allowed Characters
- Lowercase letters (a-z)
- Uppercase letters (A-Z)
- Numbers (0-9)
- Special characters: `+ = . @ - _`

### Constraints
- Case-insensitive by default (configured above)
- Minimum length: 1 character
- Maximum length: 128 characters
- Cannot be changed after creation (unless using preferred_username)

### Frontend Validation Example
```javascript
function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9+=.@\-_]+$/

  if (!username || username.length < 3) {
    return 'Username must be at least 3 characters'
  }

  if (username.length > 128) {
    return 'Username must be less than 128 characters'
  }

  if (!usernameRegex.test(username)) {
    return 'Username can only contain letters, numbers, and + = . @ - _'
  }

  return null // Valid
}
```

---

## Cleanup / Teardown

```bash
# Delete App Client
aws cognito-idp delete-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-id $CLIENT_ID

# Delete User Pool
aws cognito-idp delete-user-pool \
  --user-pool-id $USER_POOL_ID
```

---

## Troubleshooting

### Username already exists
**Check if user exists:**
```bash
aws cognito-idp admin-get-user \
  --user-pool-id $USER_POOL_ID \
  --username "johndoe"
```

**Delete user (for testing):**
```bash
aws cognito-idp admin-delete-user \
  --user-pool-id $USER_POOL_ID \
  --username "johndoe"
```

### Email not receiving verification code
**Admin confirm user (for testing):**
```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id $USER_POOL_ID \
  --username "johndoe"
```

### Invalid username format
**Check username attributes configuration:**
```bash
aws cognito-idp describe-user-pool \
  --user-pool-id $USER_POOL_ID \
  --query 'UserPool.UsernameAttributes'
```

### Case sensitivity issues
**Verify case-insensitive setting:**
```bash
aws cognito-idp describe-user-pool \
  --user-pool-id $USER_POOL_ID \
  --query 'UserPool.UsernameConfiguration'
```

---

## Cost Estimate

- **Monthly Active Users**: First 50,000 free, then $0.0055/MAU
- **Email delivery**: Included (via Cognito default)
- **Typical cost for 1,000 users/month**: Free

---

## Security Best Practices

1. **Username Policy**:
   - Enforce minimum 3-5 character usernames
   - Block common/reserved usernames (admin, root, etc.)
   - Validate on both frontend and backend

2. **Email Verification**:
   - Always require email verification
   - Use custom email templates for branding
   - Set up SES for production (better deliverability)

3. **Password Security**:
   - Use SRP auth flow (ALLOW_USER_SRP_AUTH)
   - Implement account lockout after failed attempts
   - Enable advanced security features

4. **Rate Limiting**:
   - Limit signup attempts from same IP
   - Implement CAPTCHA for public signup forms

---

## Differences from Email Login

| Feature | Username Auth | Email Auth |
|---------|--------------|------------|
| Login identifier | Username | Email |
| Verification | Email (separate) | Email (same) |
| User flexibility | Can't change username | Email is changeable |
| Privacy | More anonymous | Less anonymous |
| Memorability | User-chosen | Must remember email |

---

## Resources

- [Cognito Username Attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)
- [Username Configuration](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-username.html)
- [Best Practices](https://docs.aws.amazon.com/cognito/latest/developerguide/best-practices.html)
