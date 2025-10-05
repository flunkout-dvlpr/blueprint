# Phone/Password Authentication with AWS Cognito

Complete self-contained guide to deploy phone number/password authentication using AWS Cognito.

## Use Case
Authentication using phone number and password with SMS verification.

## What You'll Deploy
- ✅ Cognito User Pool configured for phone login
- ✅ SMS verification flow
- ✅ SNS integration for SMS delivery
- ✅ App client for web application

## Prerequisites
- AWS CLI installed and configured
- An AWS account with appropriate permissions
- Phone number for testing (charges may apply for SMS)

---

## Step 1: Create IAM Role for SNS

```bash
# Create trust policy for Cognito
cat > cognito-sms-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cognito-idp.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "phone-auth-external-id"
        }
      }
    }
  ]
}
EOF

# Create IAM Role
aws iam create-role \
  --role-name CognitoPhoneSNSRole \
  --assume-role-policy-document file://cognito-sms-trust-policy.json \
  --query 'Role.Arn' \
  --output text

# Attach SNS policy
aws iam attach-role-policy \
  --role-name CognitoPhoneSNSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

# Get Role ARN
aws iam get-role \
  --role-name CognitoPhoneSNSRole \
  --query 'Role.Arn' \
  --output text
```

**Save the output (SNS Role ARN):**
```
arn:aws:iam::123456789012:role/CognitoPhoneSNSRole
```

---

## Step 2: Create User Pool

```bash
# Set variables
REGION="us-east-1"
POOL_NAME="phone-password-pool"
SNS_ROLE_ARN="arn:aws:iam::123456789012:role/CognitoPhoneSNSRole"  # From Step 1

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
  --username-attributes phone_number \
  --auto-verified-attributes phone_number \
  --sms-configuration '{
    "SnsCallerArn": "'$SNS_ROLE_ARN'",
    "ExternalId": "phone-auth-external-id"
  }' \
  --username-configuration '{
    "CaseSensitive": false
  }' \
  --sms-verification-message "Your verification code is {####}" \
  --schema '[
    {
      "Name": "phone_number",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": true
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

## Step 3: Create App Client

```bash
# Set variables
USER_POOL_ID="us-east-1_XXXXXXXXX"  # From Step 2

# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name phone-password-client \
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

## Step 4: Configure Environment Variables

Create `.env` file in your frontend project:

```bash
# AWS Region
VITE_AWS_REGION=us-east-1

# Phone/Password Cognito Configuration
VITE_PHONE_AUTH_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_PHONE_AUTH_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 5: Install Dependencies

```bash
npm install aws-amplify
# or
yarn add aws-amplify
```

---

## Step 6: Configure Amplify

Create `src/config/cognito-phone-auth.js`:

```javascript
import { Amplify } from 'aws-amplify'

export const configurePhoneAuth = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.VITE_AWS_REGION,
        userPoolId: import.meta.env.VITE_PHONE_AUTH_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_PHONE_AUTH_CLIENT_ID,

        loginWith: {
          phone: true
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

## Step 7: Implementation Code

### Sign Up with Phone
```javascript
import { signUp } from 'aws-amplify/auth'

async function signupWithPhone(phoneNumber, password, name) {
  try {
    // Phone must be in E.164 format: +15551234567
    const { userId, nextStep } = await signUp({
      username: phoneNumber,
      password,
      attributes: {
        phone_number: phoneNumber,
        name
      }
    })

    console.log('User ID:', userId)
    console.log('Next step:', nextStep) // SMS verification required

    return { success: true, userId }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}
```

### Confirm Phone Number (SMS Verification)
```javascript
import { confirmSignUp } from 'aws-amplify/auth'

async function confirmPhone(phoneNumber, code) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: phoneNumber,
      confirmationCode: code
    })

    console.log('Phone verified:', isSignUpComplete)
    return { success: true }
  } catch (error) {
    console.error('Confirmation error:', error)
    throw error
  }
}
```

### Sign In with Phone
```javascript
import { signIn } from 'aws-amplify/auth'

async function loginWithPhone(phoneNumber, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: phoneNumber,
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

### Resend SMS Code
```javascript
import { resendSignUpCode } from 'aws-amplify/auth'

async function resendCode(phoneNumber) {
  try {
    const output = await resendSignUpCode({
      username: phoneNumber
    })

    console.log('Code sent to:', output.destination)
    return { success: true }
  } catch (error) {
    console.error('Resend error:', error)
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
      phoneNumber: attributes.phone_number,
      name: attributes.name,
      phoneVerified: attributes.phone_number_verified === 'true'
    }
  } catch (error) {
    console.error('Get user error:', error)
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

## Step 8: Test the Setup

### Test Sign Up via CLI
```bash
USER_POOL_ID="us-east-1_XXXXXXXXX"
CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXX"

# Sign up (phone must be E.164 format)
aws cognito-idp sign-up \
  --client-id $CLIENT_ID \
  --username "+15551234567" \
  --password "TestPass123" \
  --user-attributes Name=phone_number,Value="+15551234567" Name=name,Value="Test User"
```

### Verify Phone Number
```bash
# Use code received via SMS
aws cognito-idp confirm-sign-up \
  --client-id $CLIENT_ID \
  --username "+15551234567" \
  --confirmation-code "123456"
```

### Test Sign In
```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME="+15551234567",PASSWORD="TestPass123"
```

---

## Step 9: Configure SNS Spending Limits (Optional)

```bash
# Set monthly SMS spending limit
aws sns set-sms-attributes \
  --attributes MonthlySpendLimit=10.00

# Set default SMS type (Transactional for higher reliability)
aws sns set-sms-attributes \
  --attributes DefaultSMSType=Transactional
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

# Detach policy and delete IAM role
aws iam detach-role-policy \
  --role-name CognitoPhoneSNSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

aws iam delete-role \
  --role-name CognitoPhoneSNSRole

# Clean up trust policy file
rm cognito-sms-trust-policy.json
```

---

## Troubleshooting

### SMS not sending
**Check SNS role permissions:**
```bash
aws iam get-role --role-name CognitoPhoneSNSRole
aws iam list-attached-role-policies --role-name CognitoPhoneSNSRole
```

**Check SMS configuration:**
```bash
aws cognito-idp describe-user-pool \
  --user-pool-id $USER_POOL_ID \
  --query 'UserPool.SmsConfiguration'
```

### Invalid phone format error
**Phone must be E.164 format:**
- ✅ Correct: `+15551234567`
- ❌ Wrong: `5551234567`, `(555) 123-4567`

### SNS spending limit reached
**Check SMS attributes:**
```bash
aws sns get-sms-attributes
```

### Phone already exists
**Admin delete user (for testing):**
```bash
aws cognito-idp admin-delete-user \
  --user-pool-id $USER_POOL_ID \
  --username "+15551234567"
```

---

## Cost Estimate

- **Monthly Active Users**: First 50,000 free, then $0.0055/MAU
- **SMS delivery (US)**: ~$0.00645 per message
- **Typical cost for 1,000 users/month**: ~$6.45 (signup + occasional SMS)

---

## Phone Number Format Reference

| Country | Format | Example |
|---------|--------|---------|
| USA | +1XXXXXXXXXX | +15551234567 |
| UK | +44XXXXXXXXXX | +447911123456 |
| India | +91XXXXXXXXXX | +919876543210 |
| Brazil | +55XXXXXXXXXXX | +5511987654321 |

---

## Security Best Practices

1. Validate phone numbers on frontend before submission
2. Implement rate limiting for SMS sends (prevent abuse)
3. Use SRP auth flow in production
4. Set SNS spending limits
5. Monitor SMS costs with CloudWatch alarms
6. Consider using a dedicated SMS provider for high volume

---

## Resources

- [Cognito SMS Configuration](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-sms-settings.html)
- [SNS SMS Best Practices](https://docs.aws.amazon.com/sns/latest/dg/sms_best-practices.html)
- [Phone Number Formats](https://en.wikipedia.org/wiki/E.164)
- [SNS Pricing](https://aws.amazon.com/sns/sms-pricing/)
