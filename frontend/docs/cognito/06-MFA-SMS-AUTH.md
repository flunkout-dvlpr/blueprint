# Multi-Factor Authentication (MFA) with SMS

Complete self-contained guide to deploy MFA SMS authentication using AWS Cognito.

## Use Case
Add SMS-based multi-factor authentication to traditional email/password or username/password login for enhanced security.

## What You'll Deploy
- ✅ Cognito User Pool with MFA enabled
- ✅ SMS delivery via SNS
- ✅ Optional MFA (users can enable/disable)
- ✅ TOTP support (optional alternative to SMS)

## Prerequisites
- AWS CLI installed and configured
- An AWS account with appropriate permissions
- Phone number for testing (SMS charges apply)

---

## Step 1: Create IAM Role for SNS

```bash
# Create trust policy for Cognito
cat > cognito-mfa-sms-trust-policy.json <<EOF
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
          "sts:ExternalId": "mfa-sms-external-id"
        }
      }
    }
  ]
}
EOF

# Create IAM Role
aws iam create-role \
  --role-name CognitoMFASMSRole \
  --assume-role-policy-document file://cognito-mfa-sms-trust-policy.json \
  --query 'Role.Arn' \
  --output text

# Attach SNS policy
aws iam attach-role-policy \
  --role-name CognitoMFASMSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

# Get Role ARN
aws iam get-role \
  --role-name CognitoMFASMSRole \
  --query 'Role.Arn' \
  --output text
```

**Save the output (SNS Role ARN):**
```
arn:aws:iam::123456789012:role/CognitoMFASMSRole
```

---

## Step 2: Create User Pool with MFA

```bash
# Set variables
REGION="us-east-1"
POOL_NAME="mfa-sms-pool"
SNS_ROLE_ARN="arn:aws:iam::123456789012:role/CognitoMFASMSRole"  # From Step 1

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
  --username-attributes email \
  --auto-verified-attributes email \
  --mfa-configuration OPTIONAL \
  --sms-authentication-message "Your MFA code is {####}" \
  --sms-configuration "{
    \"SnsCallerArn\": \"$SNS_ROLE_ARN\",
    \"ExternalId\": \"mfa-sms-external-id\"
  }" \
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
      "Name": "phone_number",
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

**MFA Configuration Options:**
- `OPTIONAL` - Users can enable/disable MFA (recommended for this guide)
- `ON` - MFA required for all users
- `OFF` - MFA disabled

---

## Step 3: Create App Client

```bash
# Set variables
USER_POOL_ID="us-east-1_XXXXXXXXX"  # From Step 2

# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name mfa-sms-client \
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

# MFA SMS Cognito Configuration
VITE_MFA_SMS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_MFA_SMS_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
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

Create `src/config/cognito-mfa-sms.js`:

```javascript
import { Amplify } from 'aws-amplify'

export const configureMFASMS = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.VITE_AWS_REGION,
        userPoolId: import.meta.env.VITE_MFA_SMS_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_MFA_SMS_CLIENT_ID,

        loginWith: {
          email: true
        },

        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: false
        },

        mfa: {
          status: 'optional',
          smsEnabled: true,
          totpEnabled: true
        }
      }
    }
  })
}
```

---

## Step 7: Implementation Code

### Sign Up
```javascript
import { signUp } from 'aws-amplify/auth'

async function signup(email, password, name, phoneNumber = null) {
  try {
    const attributes = {
      email,
      name
    }

    // Phone number is optional but required for SMS MFA
    if (phoneNumber) {
      attributes.phone_number = phoneNumber // E.164 format: +15551234567
    }

    const { userId, nextStep } = await signUp({
      username: email,
      password,
      attributes
    })

    console.log('User ID:', userId)
    console.log('Next step:', nextStep)

    return { success: true, userId }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}
```

### Confirm Sign Up
```javascript
import { confirmSignUp } from 'aws-amplify/auth'

async function confirmEmail(email, code) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code
    })

    console.log('Sign up confirmed:', isSignUpComplete)
    return { success: true }
  } catch (error) {
    console.error('Confirmation error:', error)
    throw error
  }
}
```

### Sign In (Will Prompt for MFA if Enabled)
```javascript
import { signIn } from 'aws-amplify/auth'

async function login(email, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password
    })

    if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
      console.log('MFA required - SMS code sent')
      return {
        success: false,
        mfaRequired: true,
        nextStep: nextStep.signInStep
      }
    }

    if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
      console.log('MFA required - TOTP code needed')
      return {
        success: false,
        mfaRequired: true,
        nextStep: nextStep.signInStep
      }
    }

    console.log('Signed in:', isSignedIn)
    return { success: true, isSignedIn }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}
```

### Confirm MFA Code
```javascript
import { confirmSignIn } from 'aws-amplify/auth'

async function confirmMFACode(mfaCode) {
  try {
    const { isSignedIn } = await confirmSignIn({
      challengeResponse: mfaCode
    })

    console.log('MFA confirmed, signed in:', isSignedIn)
    return { success: true, isSignedIn }
  } catch (error) {
    console.error('MFA confirmation error:', error)
    throw error
  }
}
```

### Enable SMS MFA for User
```javascript
import { updateMFAPreference, updateUserAttributes } from 'aws-amplify/auth'

async function enableSMSMFA(phoneNumber) {
  try {
    // First, add/update phone number attribute if not already set
    if (phoneNumber) {
      await updateUserAttributes({
        userAttributes: {
          phone_number: phoneNumber // E.164 format: +15551234567
        }
      })
    }

    // Enable SMS MFA
    await updateMFAPreference({
      sms: 'PREFERRED'
    })

    console.log('SMS MFA enabled')
    return { success: true }
  } catch (error) {
    console.error('Enable MFA error:', error)
    throw error
  }
}
```

### Disable MFA
```javascript
import { updateMFAPreference } from 'aws-amplify/auth'

async function disableMFA() {
  try {
    await updateMFAPreference({
      sms: 'DISABLED',
      totp: 'DISABLED'
    })

    console.log('MFA disabled')
    return { success: true }
  } catch (error) {
    console.error('Disable MFA error:', error)
    throw error
  }
}
```

### Get MFA Status
```javascript
import { fetchMFAPreference } from 'aws-amplify/auth'

async function getMFAStatus() {
  try {
    const mfaPreference = await fetchMFAPreference()

    return {
      enabled: mfaPreference.enabled || [],
      preferred: mfaPreference.preferred
    }
  } catch (error) {
    console.error('Get MFA status error:', error)
    throw error
  }
}
```

### Verify Phone Number for MFA
```javascript
import { verifyUserAttribute, confirmUserAttribute } from 'aws-amplify/auth'

// Step 1: Request verification code
async function requestPhoneVerification() {
  try {
    await verifyUserAttribute({
      userAttributeKey: 'phone_number'
    })

    console.log('Verification code sent to phone')
    return { success: true }
  } catch (error) {
    console.error('Request verification error:', error)
    throw error
  }
}

// Step 2: Confirm with code
async function confirmPhoneVerification(code) {
  try {
    await confirmUserAttribute({
      userAttributeKey: 'phone_number',
      confirmationCode: code
    })

    console.log('Phone number verified')
    return { success: true }
  } catch (error) {
    console.error('Confirm verification error:', error)
    throw error
  }
}
```

### Get Current User with MFA Info
```javascript
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth'

async function getCurrentUserInfo() {
  try {
    const user = await getCurrentUser()
    const attributes = await fetchUserAttributes()
    const mfaStatus = await getMFAStatus()

    return {
      userId: user.userId,
      username: user.username,
      email: attributes.email,
      name: attributes.name,
      phoneNumber: attributes.phone_number,
      emailVerified: attributes.email_verified === 'true',
      phoneVerified: attributes.phone_number_verified === 'true',
      mfaEnabled: mfaStatus.enabled,
      mfaPreferred: mfaStatus.preferred
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

# Sign up with email and phone
aws cognito-idp sign-up \
  --client-id $CLIENT_ID \
  --username user@example.com \
  --password "TestPass123" \
  --user-attributes \
    Name=email,Value=user@example.com \
    Name=name,Value="Test User" \
    Name=phone_number,Value="+15551234567"
```

### Verify Email
```bash
aws cognito-idp confirm-sign-up \
  --client-id $CLIENT_ID \
  --username user@example.com \
  --confirmation-code "123456"
```

### Enable SMS MFA for User
```bash
# First, get access token by signing in
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=user@example.com,PASSWORD="TestPass123"

# Save AccessToken from response, then:
ACCESS_TOKEN="ACCESS_TOKEN_HERE"

# Set MFA preference
aws cognito-idp set-user-mfa-preference \
  --access-token $ACCESS_TOKEN \
  --sms-mfa-settings Enabled=true,PreferredMfa=true
```

### Test Sign In with MFA
```bash
# Initiate auth
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=user@example.com,PASSWORD="TestPass123"
```

**Response will include:**
```json
{
  "ChallengeName": "SMS_MFA",
  "Session": "SESSION_STRING_HERE",
  "ChallengeParameters": {
    "CODE_DELIVERY_DELIVERY_MEDIUM": "SMS",
    "CODE_DELIVERY_DESTINATION": "+***1234567"
  }
}
```

### Respond to MFA Challenge
```bash
SESSION="SESSION_STRING_HERE"  # From previous command
MFA_CODE="123456"  # From SMS

aws cognito-idp respond-to-auth-challenge \
  --client-id $CLIENT_ID \
  --challenge-name SMS_MFA \
  --session "$SESSION" \
  --challenge-responses USERNAME=user@example.com,SMS_MFA_CODE="$MFA_CODE"
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

# Check current settings
aws sns get-sms-attributes
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
  --role-name CognitoMFASMSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

aws iam delete-role \
  --role-name CognitoMFASMSRole

# Clean up trust policy file
rm cognito-mfa-sms-trust-policy.json
```

---

## Troubleshooting

### SMS not sending for MFA
**Check SNS role permissions:**
```bash
aws iam get-role --role-name CognitoMFASMSRole
aws iam list-attached-role-policies --role-name CognitoMFASMSRole
```

**Check MFA configuration:**
```bash
aws cognito-idp describe-user-pool \
  --user-pool-id $USER_POOL_ID \
  --query 'UserPool.MfaConfiguration'
```

### Phone number not verified
**Admin verify phone (for testing):**
```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id $USER_POOL_ID \
  --username user@example.com \
  --user-attributes Name=phone_number_verified,Value=true
```

### MFA not prompting
**Check user's MFA preference:**
```bash
# Sign in first to get access token
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=user@example.com,PASSWORD="TestPass123"

ACCESS_TOKEN="ACCESS_TOKEN_HERE"

# Get MFA settings
aws cognito-idp get-user \
  --access-token $ACCESS_TOKEN \
  --query 'UserMFASettingList'
```

### Invalid phone format
**Phone must be E.164 format:**
- ✅ Correct: `+15551234567`
- ❌ Wrong: `5551234567`, `(555) 123-4567`

---

## Cost Estimate

- **Monthly Active Users**: First 50,000 free, then $0.0055/MAU
- **SMS delivery (US)**: ~$0.00645 per message
- **Typical cost for 1,000 users/month**: ~$6.45 (1 MFA SMS per login)
- **With 2 logins/user/day**: ~$387/month (60,000 SMS)

**Cost Optimization:**
- Use TOTP (authenticator app) instead of SMS when possible (free)
- Implement "Remember this device" to reduce MFA frequency
- Set up SMS spending limits

---

## MFA Configuration Options

### User Pool MFA Settings

| Setting | Description | Use Case |
|---------|-------------|----------|
| `OFF` | MFA disabled | Low-security applications |
| `OPTIONAL` | Users can enable/disable MFA | Recommended for most apps |
| `ON` | MFA required for all users | High-security applications |

### MFA Methods

| Method | Cost | Security | User Experience |
|--------|------|----------|-----------------|
| SMS | $0.00645/message | Medium | Easy, familiar |
| TOTP (Authenticator) | Free | High | Requires app setup |
| Both enabled | Variable | Highest | Maximum flexibility |

---

## Enable TOTP (Authenticator App) MFA

### Setup TOTP for User
```javascript
import { setUpTOTP, verifyTOTPSetup } from 'aws-amplify/auth'

// Step 1: Generate TOTP secret
async function setupTOTP() {
  try {
    const totpSetupDetails = await setUpTOTP()

    // Display QR code to user
    const qrCodeUrl = totpSetupDetails.getSetupUri('MyApp')

    return {
      success: true,
      secretCode: totpSetupDetails.sharedSecret,
      qrCodeUrl
    }
  } catch (error) {
    console.error('TOTP setup error:', error)
    throw error
  }
}

// Step 2: Verify TOTP code from authenticator app
async function verifyTOTP(totpCode) {
  try {
    await verifyTOTPSetup({ code: totpCode })

    // Enable TOTP as preferred MFA
    await updateMFAPreference({
      totp: 'PREFERRED'
    })

    console.log('TOTP MFA enabled')
    return { success: true }
  } catch (error) {
    console.error('TOTP verification error:', error)
    throw error
  }
}
```

---

## Security Best Practices

1. **Phone Verification**: Always verify phone numbers before enabling SMS MFA
2. **Backup Codes**: Provide users with backup codes in case they lose phone access
3. **Rate Limiting**: Limit MFA verification attempts to prevent brute force
4. **Remember Device**: Implement trusted device management to reduce MFA friction
5. **SNS Spending Limits**: Set CloudWatch alarms for unusual SMS volume
6. **TOTP Preferred**: Encourage users to use authenticator apps over SMS
7. **Audit Logs**: Monitor MFA enable/disable events with CloudTrail

---

## Advanced: Remember Device

```javascript
import { rememberDevice, forgetDevice, fetchDevices } from 'aws-amplify/auth'

// Remember current device
async function rememberCurrentDevice() {
  try {
    await rememberDevice()
    console.log('Device remembered')
    return { success: true }
  } catch (error) {
    console.error('Remember device error:', error)
    throw error
  }
}

// Forget a device
async function forgetCurrentDevice() {
  try {
    await forgetDevice()
    console.log('Device forgotten')
    return { success: true }
  } catch (error) {
    console.error('Forget device error:', error)
    throw error
  }
}

// List remembered devices
async function getDevices() {
  try {
    const devices = await fetchDevices()
    return { success: true, devices }
  } catch (error) {
    console.error('Get devices error:', error)
    throw error
  }
}
```

---

## Resources

- [Cognito MFA Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html)
- [SMS MFA Best Practices](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa-sms-text-message.html)
- [TOTP MFA Setup](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa-totp.html)
- [SNS SMS Pricing](https://aws.amazon.com/sns/sms-pricing/)
- [Device Tracking](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-device-tracking.html)
