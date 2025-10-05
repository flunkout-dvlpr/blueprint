# Passwordless OTP (Email) Authentication with AWS Cognito

Complete self-contained guide to deploy passwordless email OTP authentication using AWS Cognito with Lambda triggers.

## Use Case
Passwordless authentication where users receive a one-time code via email to login (magic link alternative).

## What You'll Deploy
- ✅ Cognito User Pool with custom authentication
- ✅ Three Lambda functions for OTP flow
- ✅ Email delivery via SES or Cognito
- ✅ App client configured for custom auth

## Prerequisites
- AWS CLI installed and configured
- Python 3.11 or later (for Lambda functions)
- An AWS account with appropriate permissions
- Email address for testing

---

## Step 1: Create Lambda Execution Role

```bash
# Create trust policy for Lambda
cat > lambda-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create IAM Role
aws iam create-role \
  --role-name EmailOTPLambdaExecutionRole \
  --assume-role-policy-document file://lambda-trust-policy.json \
  --query 'Role.Arn' \
  --output text

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name EmailOTPLambdaExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Attach SES send email policy
aws iam attach-role-policy \
  --role-name EmailOTPLambdaExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

# Get Role ARN
aws iam get-role \
  --role-name EmailOTPLambdaExecutionRole \
  --query 'Role.Arn' \
  --output text
```

**Save the output (Lambda Role ARN):**
```
arn:aws:iam::123456789012:role/EmailOTPLambdaExecutionRole
```

---

## Step 2: Create Lambda Functions

### 2.1 Create DefineAuthChallenge Lambda

```bash
# Create function code
cat > define_auth_challenge.py <<'EOF'
import json

def lambda_handler(event, context):
    print('DefineAuthChallenge:', json.dumps(event, indent=2))

    session = event.get('request', {}).get('session', [])

    if len(session) == 0:
        # First attempt - send OTP
        event['response']['issueTokens'] = False
        event['response']['failAuthentication'] = False
        event['response']['challengeName'] = 'CUSTOM_CHALLENGE'
    elif (len(session) == 1 and
          session[0].get('challengeName') == 'CUSTOM_CHALLENGE' and
          session[0].get('challengeResult') == True):
        # Correct OTP provided
        event['response']['issueTokens'] = True
        event['response']['failAuthentication'] = False
    else:
        # Wrong OTP or too many attempts
        event['response']['issueTokens'] = False
        event['response']['failAuthentication'] = True

    return event
EOF

# Package function
zip define_auth_challenge.zip define_auth_challenge.py

# Create Lambda function
LAMBDA_ROLE_ARN="arn:aws:iam::123456789012:role/EmailOTPLambdaExecutionRole"
REGION="us-east-1"

aws lambda create-function \
  --function-name email-otp-define-auth-challenge \
  --runtime python3.11 \
  --role $LAMBDA_ROLE_ARN \
  --handler define_auth_challenge.lambda_handler \
  --zip-file fileb://define_auth_challenge.zip \
  --region $REGION \
  --query 'FunctionArn' \
  --output text
```

### 2.2 Create CreateAuthChallenge Lambda

```bash
# Create function code
cat > create_auth_challenge.py <<'EOF'
import json
import random
import os
import boto3

ses_client = boto3.client('ses')

def lambda_handler(event, context):
    print('CreateAuthChallenge:', json.dumps(event, indent=2))

    if event['request']['challengeName'] == 'CUSTOM_CHALLENGE':
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # Store OTP in private parameters (Cognito will pass this to verify function)
        event['response']['privateChallengeParameters'] = {'answer': otp}
        event['response']['publicChallengeParameters'] = {
            'email': event['request']['userAttributes']['email']
        }

        # Send OTP via email
        email = event['request']['userAttributes']['email']
        from_email = os.environ.get('FROM_EMAIL', 'noreply@example.com')

        try:
            ses_client.send_email(
                Source=from_email,
                Destination={'ToAddresses': [email]},
                Message={
                    'Subject': {'Data': 'Your Login Code'},
                    'Body': {
                        'Text': {
                            'Data': f'Your verification code is: {otp}\n\nThis code will expire in 3 minutes.'
                        },
                        'Html': {
                            'Data': f'''
                                <h2>Your Login Code</h2>
                                <p>Enter this code to complete your login:</p>
                                <h1 style="font-size: 32px; letter-spacing: 5px;">{otp}</h1>
                                <p>This code will expire in 3 minutes.</p>
                            '''
                        }
                    }
                }
            )
            print(f'OTP sent to: {email}')
        except Exception as error:
            print(f'Error sending email: {error}')
            # In production, you might want to handle this differently

    return event
EOF

# Package function
zip create_auth_challenge.zip create_auth_challenge.py

# Create Lambda function
aws lambda create-function \
  --function-name email-otp-create-auth-challenge \
  --runtime python3.11 \
  --role $LAMBDA_ROLE_ARN \
  --handler create_auth_challenge.lambda_handler \
  --zip-file fileb://create_auth_challenge.zip \
  --timeout 10 \
  --environment "Variables={FROM_EMAIL=noreply@yourdomain.com}" \
  --region $REGION \
  --query 'FunctionArn' \
  --output text
```

### 2.3 Create VerifyAuthChallenge Lambda

```bash
# Create function code
cat > verify_auth_challenge.py <<'EOF'
import json

def lambda_handler(event, context):
    print('VerifyAuthChallenge:', json.dumps(event, indent=2))

    expected_answer = event['request']['privateChallengeParameters']['answer']
    user_answer = event['request']['challengeAnswer']

    # Compare OTP codes
    event['response']['answerCorrect'] = (expected_answer == user_answer)

    return event
EOF

# Package function
zip verify_auth_challenge.zip verify_auth_challenge.py

# Create Lambda function
aws lambda create-function \
  --function-name email-otp-verify-auth-challenge \
  --runtime python3.11 \
  --role $LAMBDA_ROLE_ARN \
  --handler verify_auth_challenge.lambda_handler \
  --zip-file fileb://verify_auth_challenge.zip \
  --region $REGION \
  --query 'FunctionArn' \
  --output text
```

**Save all three Function ARNs:**
```
arn:aws:lambda:us-east-1:123456789012:function:email-otp-define-auth-challenge
arn:aws:lambda:us-east-1:123456789012:function:email-otp-create-auth-challenge
arn:aws:lambda:us-east-1:123456789012:function:email-otp-verify-auth-challenge
```

---

## Step 3: Verify Email Address in SES (Required)

```bash
# Verify sender email address (required for SES in sandbox mode)
FROM_EMAIL="noreply@yourdomain.com"

aws ses verify-email-identity \
  --email-address $FROM_EMAIL \
  --region $REGION

# Check verification status
aws ses get-identity-verification-attributes \
  --identities $FROM_EMAIL \
  --region $REGION
```

**Note:** Check your email inbox and click the verification link sent by AWS SES.

**To use a different region or move out of sandbox:**
```bash
# Request production access (removes sending limits)
# This requires manual approval from AWS support
aws sesv2 put-account-details \
  --production-access-enabled \
  --mail-type TRANSACTIONAL \
  --website-url https://yourdomain.com \
  --use-case-description "Passwordless authentication for our application"
```

---

## Step 4: Create User Pool

```bash
# Set variables
POOL_NAME="email-otp-pool"
DEFINE_ARN="arn:aws:lambda:us-east-1:123456789012:function:email-otp-define-auth-challenge"
CREATE_ARN="arn:aws:lambda:us-east-1:123456789012:function:email-otp-create-auth-challenge"
VERIFY_ARN="arn:aws:lambda:us-east-1:123456789012:function:email-otp-verify-auth-challenge"

# Create User Pool with Lambda triggers
aws cognito-idp create-user-pool \
  --pool-name $POOL_NAME \
  --region $REGION \
  --auto-verified-attributes email \
  --email-configuration '{
    "EmailSendingAccount": "DEVELOPER",
    "SourceArn": "arn:aws:ses:'$REGION':123456789012:identity/noreply@yourdomain.com"
  }' \
  --lambda-config '{
    "DefineAuthChallenge": "'$DEFINE_ARN'",
    "CreateAuthChallenge": "'$CREATE_ARN'",
    "VerifyAuthChallengeResponse": "'$VERIFY_ARN'"
  }' \
  --schema '[
    {
      "Name": "email",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": true
    },
    {
      "Name": "name",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": false
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

## Step 5: Grant Cognito Permission to Invoke Lambdas

```bash
USER_POOL_ID="us-east-1_XXXXXXXXX"  # From Step 4
ACCOUNT_ID="123456789012"

# Grant permissions for each Lambda
for FUNCTION_NAME in email-otp-define-auth-challenge email-otp-create-auth-challenge email-otp-verify-auth-challenge; do
  aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id cognito-trigger-permission \
    --action lambda:InvokeFunction \
    --principal cognito-idp.amazonaws.com \
    --source-arn arn:aws:cognito-idp:${REGION}:${ACCOUNT_ID}:userpool/${USER_POOL_ID} \
    --region $REGION
done
```

---

## Step 6: Create App Client

```bash
# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name email-otp-client \
  --no-generate-secret \
  --explicit-auth-flows \
    ALLOW_CUSTOM_AUTH \
    ALLOW_REFRESH_TOKEN_AUTH \
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

## Step 7: Configure Environment Variables

Create `.env` file in your frontend project:

```bash
# AWS Region
VITE_AWS_REGION=us-east-1

# Email OTP Cognito Configuration
VITE_EMAIL_OTP_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_EMAIL_OTP_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 8: Install Dependencies

```bash
npm install aws-amplify
# or
yarn add aws-amplify
```

---

## Step 9: Configure Amplify

Create `src/config/cognito-email-otp.js`:

```javascript
import { Amplify } from 'aws-amplify'

export const configureEmailOTP = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.VITE_AWS_REGION,
        userPoolId: import.meta.env.VITE_EMAIL_OTP_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_EMAIL_OTP_CLIENT_ID,

        loginWith: {
          email: true
        }
      }
    }
  })
}
```

---

## Step 10: Implementation Code

### Request OTP (Initiate Custom Auth)
```javascript
import { signIn } from 'aws-amplify/auth'

async function requestOTPEmail(email) {
  try {
    const result = await signIn({
      username: email,
      options: {
        authFlowType: 'CUSTOM_WITHOUT_SRP'
      }
    })

    console.log('OTP sent, challenge:', result.challengeName)
    return {
      success: true,
      message: 'OTP sent to your email',
      session: result.challengeName
    }
  } catch (error) {
    // User doesn't exist, need to sign up first
    if (error.name === 'UserNotFoundException') {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Please sign up first'
      }
    }
    console.error('Request OTP error:', error)
    throw error
  }
}
```

### Verify OTP and Complete Login
```javascript
import { confirmSignIn } from 'aws-amplify/auth'

async function verifyOTPEmail(code) {
  try {
    const result = await confirmSignIn({
      challengeResponse: code
    })

    console.log('Signed in:', result.isSignedIn)
    return {
      success: true,
      isSignedIn: result.isSignedIn,
      message: 'Login successful!'
    }
  } catch (error) {
    console.error('Verify OTP error:', error)
    throw error
  }
}
```

### Sign Up User (First Time)
```javascript
import { signUp } from 'aws-amplify/auth'

async function signupForOTP(email, name) {
  try {
    const { userId } = await signUp({
      username: email,
      password: Math.random().toString(36).slice(-12), // Random password (not used)
      attributes: {
        email,
        name: name || email.split('@')[0]
      },
      autoSignIn: {
        enabled: true
      }
    })

    console.log('User created:', userId)
    return { success: true, userId }
  } catch (error) {
    console.error('Signup error:', error)
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
      email: attributes.email,
      name: attributes.name
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

### Complete Flow Example
```javascript
// Step 1: User enters email
async function handleEmailSubmit(email) {
  try {
    const result = await requestOTPEmail(email)

    if (result.error === 'USER_NOT_FOUND') {
      // Auto-signup for new users
      await signupForOTP(email)
      // Then request OTP again
      await requestOTPEmail(email)
    }

    // Show OTP input form
    return { success: true }
  } catch (error) {
    console.error('Error:', error)
  }
}

// Step 2: User enters OTP code
async function handleOTPSubmit(code) {
  try {
    const result = await verifyOTPEmail(code)

    if (result.isSignedIn) {
      // Redirect to dashboard
      const user = await getCurrentUserInfo()
      console.log('Logged in as:', user.email)
    }
  } catch (error) {
    console.error('Invalid OTP:', error)
  }
}
```

---

## Step 11: Test the Setup

### Test Lambda Functions
```bash
# Test DefineAuthChallenge
aws lambda invoke \
  --function-name email-otp-define-auth-challenge \
  --payload '{"request":{"session":[]},"response":{}}' \
  --region $REGION \
  response.json

cat response.json
```

### Create Test User
```bash
USER_POOL_ID="us-east-1_XXXXXXXXX"

aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "test@example.com" \
  --user-attributes Name=email,Value=test@example.com Name=name,Value="Test User" \
  --message-action SUPPRESS
```

### Test Custom Auth via CLI
```bash
CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXX"

# Initiate auth (triggers OTP email)
aws cognito-idp initiate-auth \
  --auth-flow CUSTOM_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=test@example.com \
  --region $REGION
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

# Delete Lambda functions
for FUNCTION_NAME in email-otp-define-auth-challenge email-otp-create-auth-challenge email-otp-verify-auth-challenge; do
  aws lambda delete-function \
    --function-name $FUNCTION_NAME \
    --region $REGION
done

# Detach policies and delete IAM role
aws iam detach-role-policy \
  --role-name EmailOTPLambdaExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam detach-role-policy \
  --role-name EmailOTPLambdaExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

aws iam delete-role \
  --role-name EmailOTPLambdaExecutionRole

# Clean up local files
rm -f define_auth_challenge.py define_auth_challenge.zip
rm -f create_auth_challenge.py create_auth_challenge.zip
rm -f verify_auth_challenge.py verify_auth_challenge.zip
rm -f lambda-trust-policy.json
rm -f response.json
```

---

## Troubleshooting

### OTP email not received
**Check Lambda logs:**
```bash
aws logs tail /aws/lambda/email-otp-create-auth-challenge --follow
```

**Verify SES email:**
```bash
aws ses get-identity-verification-attributes \
  --identities noreply@yourdomain.com
```

### Lambda permission error
**Verify permission exists:**
```bash
aws lambda get-policy \
  --function-name email-otp-create-auth-challenge \
  --region $REGION
```

### Invalid OTP code
**Check Lambda logs:**
```bash
aws logs tail /aws/lambda/email-otp-verify-auth-challenge --follow
```

### User not found
**List users:**
```bash
aws cognito-idp list-users \
  --user-pool-id $USER_POOL_ID \
  --limit 10
```

---

## Cost Estimate

- **Monthly Active Users**: First 50,000 free, then $0.0055/MAU
- **Lambda invocations**: First 1M free, then $0.20 per 1M requests
- **SES emails (sandbox)**: First 62,000/month free
- **SES emails (production)**: $0.10 per 1,000 emails
- **Typical cost for 1,000 users/month**: ~$0.10 (mostly SES)

---

## Security Enhancements

### Add OTP Expiration (3 minutes)
```python
# In create_auth_challenge.py
import time

# Add expiration timestamp
event['response']['privateChallengeParameters'] = {
    'answer': otp,
    'expiresAt': str(int(time.time() * 1000) + (3 * 60 * 1000))  # 3 minutes
}

# In verify_auth_challenge.py
import time

expires_at = int(event['request']['privateChallengeParameters']['expiresAt'])
current_time = int(time.time() * 1000)

if current_time > expires_at:
    event['response']['answerCorrect'] = False
    return event
```

### Rate Limiting
```python
# Add to create_auth_challenge.py
# Track attempts in DynamoDB to prevent abuse
# (Requires adding DynamoDB permissions to Lambda role)
```

### Custom Email Templates
Update the HTML in `create_auth_challenge.py` with your branding.

---

## Production Checklist

- [ ] Move SES out of sandbox mode
- [ ] Use custom domain for email sender
- [ ] Implement OTP expiration
- [ ] Add rate limiting
- [ ] Set up CloudWatch alarms
- [ ] Enable Lambda X-Ray tracing
- [ ] Implement DynamoDB for OTP tracking
- [ ] Add retry logic for SES failures
- [ ] Custom error messages
- [ ] Email template branding

---

## Resources

- [Cognito Custom Auth Flow](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html)
- [SES Email Sending](https://docs.aws.amazon.com/ses/latest/dg/send-email.html)
- [Lambda with Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)
