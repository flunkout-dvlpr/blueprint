# Passwordless OTP (SMS) Authentication with AWS Cognito

Complete self-contained guide to deploy passwordless SMS OTP authentication using AWS Cognito.

## Use Case
Authentication using only phone number with SMS-delivered one-time passwords (no password required).

## What You'll Deploy
- ✅ Cognito User Pool with Custom Auth Challenge
- ✅ Lambda functions for OTP generation and validation
- ✅ SNS integration for SMS delivery
- ✅ Passwordless authentication flow

## Prerequisites
- AWS CLI installed and configured
- An AWS account with appropriate permissions
- Phone number for testing (SMS charges apply)
- Basic understanding of Lambda functions

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
          "sts:ExternalId": "sms-otp-external-id"
        }
      }
    }
  ]
}
EOF

# Create IAM Role
aws iam create-role \
  --role-name CognitoSMSOTPRole \
  --assume-role-policy-document file://cognito-sms-trust-policy.json \
  --query 'Role.Arn' \
  --output text

# Attach SNS policy
aws iam attach-role-policy \
  --role-name CognitoSMSOTPRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

# Get Role ARN
aws iam get-role \
  --role-name CognitoSMSOTPRole \
  --query 'Role.Arn' \
  --output text
```

**Save the output (SNS Role ARN):**
```
arn:aws:iam::123456789012:role/CognitoSMSOTPRole
```

---

## Step 2: Create IAM Role for Lambda

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

# Create Lambda execution role
aws iam create-role \
  --role-name CognitoSMSOTPLambdaRole \
  --assume-role-policy-document file://lambda-trust-policy.json \
  --query 'Role.Arn' \
  --output text

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name CognitoSMSOTPLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Create SNS publish policy for Lambda
cat > lambda-sns-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Create and attach SNS policy
aws iam put-role-policy \
  --role-name CognitoSMSOTPLambdaRole \
  --policy-name SNSPublishPolicy \
  --policy-document file://lambda-sns-policy.json

# Get Lambda Role ARN
aws iam get-role \
  --role-name CognitoSMSOTPLambdaRole \
  --query 'Role.Arn' \
  --output text
```

**Save the output (Lambda Role ARN):**
```
arn:aws:iam::123456789012:role/CognitoSMSOTPLambdaRole
```

---

## Step 3: Create Lambda Functions

### DefineAuthChallenge Lambda

```bash
# Create function code
cat > define_auth_challenge.py <<'EOF'
import json

def lambda_handler(event, context):
    print('DefineAuthChallenge event:', json.dumps(event, indent=2))

    session = event.get('request', {}).get('session', [])

    if len(session) == 0:
        # First attempt - issue CUSTOM_CHALLENGE
        event['response']['issueTokens'] = False
        event['response']['failAuthentication'] = False
        event['response']['challengeName'] = 'CUSTOM_CHALLENGE'
    elif (len(session) == 1 and
          session[0].get('challengeName') == 'CUSTOM_CHALLENGE' and
          session[0].get('challengeResult') == True):
        # User provided correct answer - issue tokens
        event['response']['issueTokens'] = True
        event['response']['failAuthentication'] = False
    else:
        # User provided wrong answer - fail authentication
        event['response']['issueTokens'] = False
        event['response']['failAuthentication'] = True

    print('DefineAuthChallenge response:', json.dumps(event['response'], indent=2))
    return event
EOF

# Zip the function
zip define_auth_challenge.zip define_auth_challenge.py

# Create Lambda function
LAMBDA_ROLE_ARN="arn:aws:iam::123456789012:role/CognitoSMSOTPLambdaRole"  # From Step 2

aws lambda create-function \
  --function-name CognitoSMSOTPDefineAuthChallenge \
  --runtime python3.11 \
  --role $LAMBDA_ROLE_ARN \
  --handler define_auth_challenge.lambda_handler \
  --zip-file fileb://define_auth_challenge.zip \
  --timeout 10 \
  --query 'FunctionArn' \
  --output text
```

### CreateAuthChallenge Lambda

```bash
# Create function code
cat > create_auth_challenge.py <<'EOF'
import json
import random
import re
import boto3

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    print('CreateAuthChallenge event:', json.dumps(event, indent=2))

    session = event.get('request', {}).get('session', [])

    if not session or len(session) == 0:
        # Generate a new 6-digit code
        secret_login_code = str(random.randint(100000, 999999))

        # Send SMS via SNS
        try:
            phone_number = event['request']['userAttributes']['phone_number']
            message = f'Your verification code is: {secret_login_code}'

            sns_client.publish(
                PhoneNumber=phone_number,
                Message=message
            )
            print(f'SMS sent successfully to: {phone_number}')
        except Exception as error:
            print(f'Error sending SMS: {error}')
            raise error
    else:
        # Re-use code from previous challenge
        previous_challenge = session[-1]
        match = re.search(r'CODE-(\d+)', previous_challenge.get('challengeMetadata', ''))
        secret_login_code = match.group(1) if match else None

    # Store the code in challengeMetadata
    event['response']['publicChallengeParameters'] = {
        'phone': event['request']['userAttributes']['phone_number']
    }

    event['response']['privateChallengeParameters'] = {
        'answer': secret_login_code
    }

    event['response']['challengeMetadata'] = f'CODE-{secret_login_code}'

    print('CreateAuthChallenge response:', json.dumps(event['response'], indent=2))
    return event
EOF

# Zip the function
zip create_auth_challenge.zip create_auth_challenge.py

# Create Lambda function
aws lambda create-function \
  --function-name CognitoSMSOTPCreateAuthChallenge \
  --runtime python3.11 \
  --role $LAMBDA_ROLE_ARN \
  --handler create_auth_challenge.lambda_handler \
  --zip-file fileb://create_auth_challenge.zip \
  --timeout 10 \
  --query 'FunctionArn' \
  --output text
```

### VerifyAuthChallengeResponse Lambda

```bash
# Create function code
cat > verify_auth_challenge.py <<'EOF'
import json

def lambda_handler(event, context):
    print('VerifyAuthChallenge event:', json.dumps(event, indent=2))

    expected_answer = event['request']['privateChallengeParameters']['answer']
    user_answer = event['request']['challengeAnswer']

    event['response']['answerCorrect'] = (expected_answer == user_answer)

    print('VerifyAuthChallenge response:', json.dumps(event['response'], indent=2))
    return event
EOF

# Zip the function
zip verify_auth_challenge.zip verify_auth_challenge.py

# Create Lambda function
aws lambda create-function \
  --function-name CognitoSMSOTPVerifyAuthChallenge \
  --runtime python3.11 \
  --role $LAMBDA_ROLE_ARN \
  --handler verify_auth_challenge.lambda_handler \
  --zip-file fileb://verify_auth_challenge.zip \
  --timeout 10 \
  --query 'FunctionArn' \
  --output text
```

**Save all three Lambda ARNs:**
```
arn:aws:lambda:us-east-1:123456789012:function:CognitoSMSOTPDefineAuthChallenge
arn:aws:lambda:us-east-1:123456789012:function:CognitoSMSOTPCreateAuthChallenge
arn:aws:lambda:us-east-1:123456789012:function:CognitoSMSOTPVerifyAuthChallenge
```

---

## Step 4: Create User Pool

```bash
# Set variables
REGION="us-east-1"
POOL_NAME="sms-otp-pool"
SNS_ROLE_ARN="arn:aws:iam::123456789012:role/CognitoSMSOTPRole"  # From Step 1

# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name $POOL_NAME \
  --region $REGION \
  --username-attributes phone_number \
  --auto-verified-attributes phone_number \
  --sms-configuration "{
    \"SnsCallerArn\": \"$SNS_ROLE_ARN\",
    \"ExternalId\": \"sms-otp-external-id\"
  }" \
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

## Step 5: Add Lambda Triggers to User Pool

```bash
USER_POOL_ID="us-east-1_XXXXXXXXX"  # From Step 4

DEFINE_ARN="arn:aws:lambda:us-east-1:123456789012:function:CognitoSMSOTPDefineAuthChallenge"
CREATE_ARN="arn:aws:lambda:us-east-1:123456789012:function:CognitoSMSOTPCreateAuthChallenge"
VERIFY_ARN="arn:aws:lambda:us-east-1:123456789012:function:CognitoSMSOTPVerifyAuthChallenge"

# Update User Pool with Lambda triggers
aws cognito-idp update-user-pool \
  --user-pool-id $USER_POOL_ID \
  --lambda-config "{
    \"DefineAuthChallenge\": \"$DEFINE_ARN\",
    \"CreateAuthChallenge\": \"$CREATE_ARN\",
    \"VerifyAuthChallengeResponse\": \"$VERIFY_ARN\"
  }"
```

---

## Step 6: Grant Cognito Permission to Invoke Lambdas

```bash
# Grant permission for DefineAuthChallenge
aws lambda add-permission \
  --function-name CognitoSMSOTPDefineAuthChallenge \
  --statement-id CognitoSMSOTPInvoke1 \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:$REGION:123456789012:userpool/$USER_POOL_ID

# Grant permission for CreateAuthChallenge
aws lambda add-permission \
  --function-name CognitoSMSOTPCreateAuthChallenge \
  --statement-id CognitoSMSOTPInvoke2 \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:$REGION:123456789012:userpool/$USER_POOL_ID

# Grant permission for VerifyAuthChallengeResponse
aws lambda add-permission \
  --function-name CognitoSMSOTPVerifyAuthChallenge \
  --statement-id CognitoSMSOTPInvoke3 \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:$REGION:123456789012:userpool/$USER_POOL_ID
```

---

## Step 7: Create App Client

```bash
# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name sms-otp-client \
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

## Step 8: Configure Environment Variables

Create `.env` file in your frontend project:

```bash
# AWS Region
VITE_AWS_REGION=us-east-1

# SMS OTP Cognito Configuration
VITE_SMS_OTP_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_SMS_OTP_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 9: Install Dependencies

```bash
npm install aws-amplify
# or
yarn add aws-amplify
```

---

## Step 10: Configure Amplify

Create `src/config/cognito-sms-otp.js`:

```javascript
import { Amplify } from 'aws-amplify'

export const configureSMSOTP = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.VITE_AWS_REGION,
        userPoolId: import.meta.env.VITE_SMS_OTP_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_SMS_OTP_CLIENT_ID,

        loginWith: {
          phone: true
        }
      }
    }
  })
}
```

---

## Step 11: Implementation Code

### Sign Up (No Password)
```javascript
import { signUp } from 'aws-amplify/auth'

async function signupWithSMSOTP(phoneNumber, name = '') {
  try {
    // Phone must be in E.164 format: +15551234567
    // Note: No password required for passwordless auth
    const { userId, nextStep } = await signUp({
      username: phoneNumber,
      password: Math.random().toString(36).slice(-16), // Random temp password (required by API but not used)
      attributes: {
        phone_number: phoneNumber,
        ...(name && { name })
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

### Confirm Phone Number
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

### Request OTP (Passwordless Login)
```javascript
import { signIn } from 'aws-amplify/auth'

async function requestSMSOTP(phoneNumber) {
  try {
    const output = await signIn({
      username: phoneNumber,
      options: {
        authFlowType: 'CUSTOM_WITHOUT_SRP'
      }
    })

    console.log('OTP sent via SMS')
    console.log('Next step:', output.nextStep)

    return {
      success: true,
      challengeName: output.nextStep.signInStep
    }
  } catch (error) {
    console.error('OTP request error:', error)
    throw error
  }
}
```

### Verify OTP and Sign In
```javascript
import { confirmSignIn } from 'aws-amplify/auth'

async function verifySMSOTP(otpCode) {
  try {
    const output = await confirmSignIn({
      challengeResponse: otpCode
    })

    console.log('Signed in:', output.isSignedIn)
    return {
      success: true,
      isSignedIn: output.isSignedIn
    }
  } catch (error) {
    console.error('OTP verification error:', error)
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

## Step 12: Test the Setup

### Test Sign Up via CLI
```bash
USER_POOL_ID="us-east-1_XXXXXXXXX"
CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXX"

# Sign up (phone must be E.164 format)
aws cognito-idp sign-up \
  --client-id $CLIENT_ID \
  --username "+15551234567" \
  --password "TempPassword123!" \
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

### Test Passwordless Login (Request OTP)
```bash
aws cognito-idp initiate-auth \
  --auth-flow CUSTOM_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME="+15551234567"
```

**Save the Session from response:**
```json
{
  "ChallengeName": "CUSTOM_CHALLENGE",
  "Session": "SESSION_STRING_HERE",
  "ChallengeParameters": {
    "phone": "+15551234567"
  }
}
```

### Verify OTP Code
```bash
SESSION="SESSION_STRING_HERE"  # From previous command
OTP_CODE="123456"  # From SMS

aws cognito-idp respond-to-auth-challenge \
  --client-id $CLIENT_ID \
  --challenge-name CUSTOM_CHALLENGE \
  --session "$SESSION" \
  --challenge-responses USERNAME="+15551234567",ANSWER="$OTP_CODE"
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
aws lambda delete-function --function-name CognitoSMSOTPDefineAuthChallenge
aws lambda delete-function --function-name CognitoSMSOTPCreateAuthChallenge
aws lambda delete-function --function-name CognitoSMSOTPVerifyAuthChallenge

# Delete Lambda role policies
aws iam delete-role-policy \
  --role-name CognitoSMSOTPLambdaRole \
  --policy-name SNSPublishPolicy

# Detach policies from Lambda role
aws iam detach-role-policy \
  --role-name CognitoSMSOTPLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Delete Lambda role
aws iam delete-role \
  --role-name CognitoSMSOTPLambdaRole

# Detach SNS policy and delete SNS role
aws iam detach-role-policy \
  --role-name CognitoSMSOTPRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

aws iam delete-role \
  --role-name CognitoSMSOTPRole

# Clean up files
rm cognito-sms-trust-policy.json
rm lambda-trust-policy.json
rm lambda-sns-policy.json
rm define_auth_challenge.py define_auth_challenge.zip
rm create_auth_challenge.py create_auth_challenge.zip
rm verify_auth_challenge.py verify_auth_challenge.zip
```

---

## Troubleshooting

### SMS not sending
**Check SNS role and Lambda permissions:**
```bash
aws iam get-role --role-name CognitoSMSOTPRole
aws iam list-attached-role-policies --role-name CognitoSMSOTPLambdaRole
```

**Check Lambda logs:**
```bash
aws logs tail /aws/lambda/CognitoSMSOTPCreateAuthChallenge --follow
```

### Invalid phone format error
**Phone must be E.164 format:**
- ✅ Correct: `+15551234567`
- ❌ Wrong: `5551234567`, `(555) 123-4567`

### Lambda trigger not firing
**Verify trigger configuration:**
```bash
aws cognito-idp describe-user-pool \
  --user-pool-id $USER_POOL_ID \
  --query 'UserPool.LambdaConfig'
```

**Check Lambda permissions:**
```bash
aws lambda get-policy --function-name CognitoSMSOTPDefineAuthChallenge
```

### OTP code not working
**Check Lambda logs for code generation:**
```bash
aws logs tail /aws/lambda/CognitoSMSOTPCreateAuthChallenge --follow
aws logs tail /aws/lambda/CognitoSMSOTPVerifyAuthChallenge --follow
```

---

## Cost Estimate

- **Monthly Active Users**: First 50,000 free, then $0.0055/MAU
- **SMS delivery (US)**: ~$0.00645 per message
- **Lambda invocations**: First 1M free, then $0.20 per 1M requests
- **Lambda duration**: First 400,000 GB-seconds free
- **Typical cost for 1,000 users/month**: ~$13 (signup SMS + 2 login OTPs/user)

---

## Security Best Practices

1. **Rate Limiting**: Implement rate limiting to prevent SMS abuse
2. **Code Expiration**: OTP codes should expire after 5 minutes (modify Lambda)
3. **Attempt Limiting**: Limit verification attempts to 3-5 per session
4. **SNS Spending Limits**: Set monthly SMS spending caps
5. **Monitoring**: Set up CloudWatch alarms for unusual SMS volume
6. **Phone Validation**: Validate phone numbers on frontend before submission

---

## Enhancement: Add Code Expiration

Update `create_auth_challenge.py` to include timestamp:

```python
# In create_auth_challenge.py, modify the challengeMetadata:
import time

timestamp = int(time.time() * 1000)
event['response']['challengeMetadata'] = f'CODE-{secret_login_code}-TIME-{timestamp}'
```

Update `verify_auth_challenge.py` to check expiration:

```python
# In verify_auth_challenge.py:
import time
import re

metadata = event['request']['challengeMetadata']
match = re.search(r'TIME-(\d+)', metadata)
timestamp = int(match.group(1)) if match else 0
current_time = int(time.time() * 1000)
five_minutes = 5 * 60 * 1000

if current_time - timestamp > five_minutes:
    event['response']['answerCorrect'] = False
else:
    expected_answer = event['request']['privateChallengeParameters']['answer']
    user_answer = event['request']['challengeAnswer']
    event['response']['answerCorrect'] = (expected_answer == user_answer)
```

---

## Resources

- [Cognito Custom Authentication](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html)
- [Lambda Triggers for Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)
- [SNS SMS Best Practices](https://docs.aws.amazon.com/sns/latest/dg/sms_best-practices.html)
- [Phone Number Formats](https://en.wikipedia.org/wiki/E.164)
