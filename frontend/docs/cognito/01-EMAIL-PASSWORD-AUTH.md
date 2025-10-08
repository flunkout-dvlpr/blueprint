# Email/Password Authentication with AWS Cognito

> **Note:** This guide uses PowerShell commands. For bash/Linux commands, please refer to the original documentation.

Complete self-contained guide to deploy email/password authentication using AWS Cognito.

## Use Case

Traditional email and password authentication with email verification.

## What You'll Deploy

- ✅ Cognito User Pool configured for email login
- ✅ Email verification flow
- ✅ Password reset capability
- ✅ App client for web application

## Prerequisites

- AWS CLI installed and configured
- An AWS account with appropriate permissions
- Node.js project for frontend integration
- PowerShell 5.1 or later

---

## Step 1: Create User Pool

```powershell
set REGION=us-east-1
set POOL_NAME=email-password-pool

aws cognito-idp create-user-pool ^
--pool-name %POOL_NAME% ^
--region %REGION% ^
--policies "{\"PasswordPolicy\":{\"MinimumLength\":8,\"RequireUppercase\":true,\"RequireLowercase\":true,\"RequireNumbers\":true,\"RequireSymbols\":false}}" ^
--username-attributes email ^
--auto-verified-attributes email ^
--email-configuration "{\"EmailSendingAccount\":\"COGNITO_DEFAULT\"}" ^
--username-configuration "{\"CaseSensitive\":false}" ^
--schema "[{\"Name\":\"email\",\"AttributeDataType\":\"String\",\"Mutable\":true,\"Required\":true},{\"Name\":\"name\",\"AttributeDataType\":\"String\",\"Mutable\":true,\"Required\":true}]" ^
--query "UserPool.Id" ^
--output text

```

**Save the output (User Pool ID):**

```
us-east-1_XXXXXXXXX
```

---

## Step 2: Create App Client

```powershell
set USER_POOL_ID=us-east-1_XXXXXXXXX

aws cognito-idp create-user-pool-client ^
--user-pool-id %USER_POOL_ID% ^
--client-name email-password-client ^
--no-generate-secret ^
--explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH ^
--prevent-user-existence-errors ENABLED ^
--enable-token-revocation ^
--auth-session-validity 3 ^
--access-token-validity 60 ^
--id-token-validity 60 ^
--refresh-token-validity 30 ^
--token-validity-units "{\"AccessToken\":\"minutes\",\"IdToken\":\"minutes\",\"RefreshToken\":\"days\"}" ^
--query "UserPoolClient.ClientId" ^
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

# Email/Password Cognito Configuration
VITE_EMAIL_AUTH_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_EMAIL_AUTH_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
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

Create `src/config/cognito-email-auth.js`:

```javascript
import { Amplify } from "aws-amplify";

export const configureEmailAuth = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: import.meta.env.VITE_AWS_REGION,
        userPoolId: import.meta.env.VITE_EMAIL_AUTH_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_EMAIL_AUTH_CLIENT_ID,

        loginWith: {
          email: true,
        },

        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: false,
        },
      },
    },
  });
};
```

---

## Step 6: Implementation Code

### Sign Up

```javascript
import { signUp } from "aws-amplify/auth";

async function signup(email, password, name) {
  try {
    const { userId, nextStep } = await signUp({
      username: email,
      password,
      attributes: {
        email,
        name,
      },
    });

    console.log("User ID:", userId);
    console.log("Next step:", nextStep);

    return { success: true, userId };
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}
```

### Confirm Sign Up (Email Verification)

```javascript
import { confirmSignUp } from "aws-amplify/auth";

async function confirmEmail(email, code) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    console.log("Sign up confirmed:", isSignUpComplete);
    return { success: true };
  } catch (error) {
    console.error("Confirmation error:", error);
    throw error;
  }
}
```

### Sign In

```javascript
import { signIn } from "aws-amplify/auth";

async function login(email, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password,
    });

    console.log("Signed in:", isSignedIn);
    return { success: true, isSignedIn };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}
```

### Get Current User

```javascript
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";

async function getCurrentUserInfo() {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();

    return {
      userId: user.userId,
      username: user.username,
      email: attributes.email,
      name: attributes.name,
      emailVerified: attributes.email_verified === "true",
    };
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}
```

### Password Reset

```javascript
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";

async function requestPasswordReset(email) {
  try {
    const output = await resetPassword({ username: email });
    console.log(
      "Reset code sent to:",
      output.nextStep.codeDeliveryDetails.destination
    );
    return { success: true };
  } catch (error) {
    console.error("Reset request error:", error);
    throw error;
  }
}

async function confirmPasswordReset(email, code, newPassword) {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
    return { success: true };
  } catch (error) {
    console.error("Reset confirmation error:", error);
    throw error;
  }
}
```

### Sign Out

```javascript
import { signOut } from "aws-amplify/auth";

async function logout() {
  try {
    await signOut();
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}
```

---

## Step 7: Test the Setup

### Test Sign Up via CLI

```powershell
$USER_POOL_ID = "us-east-1_XXXXXXXXX"
$CLIENT_ID = "XXXXXXXXXXXXXXXXXXXXXXXXXX"

aws cognito-idp sign-up `
  --client-id $CLIENT_ID `
  --username user@example.com `
  --password "TestPass123" `
  --user-attributes Name=email,Value=user@example.com Name=name,Value="Test User"
```

### Verify Email

```powershell
aws cognito-idp confirm-sign-up `
  --client-id $CLIENT_ID `
  --username user@example.com `
  --confirmation-code "123456"
```

### Test Sign In

```powershell
aws cognito-idp initiate-auth `
  --auth-flow USER_PASSWORD_AUTH `
  --client-id $CLIENT_ID `
  --auth-parameters USERNAME=user@example.com,PASSWORD="TestPass123"
```

---

## Cleanup / Teardown

```powershell
# Delete App Client
aws cognito-idp delete-user-pool-client `
  --user-pool-id $USER_POOL_ID `
  --client-id $CLIENT_ID

# Delete User Pool
aws cognito-idp delete-user-pool `
  --user-pool-id $USER_POOL_ID
```

---

## Troubleshooting

### Email not receiving verification code

**Solution:** Check spam folder, or configure custom email with SES:

```powershell
aws cognito-idp update-user-pool `
  --user-pool-id $USER_POOL_ID `
  --email-configuration SourceArn=arn:aws:ses:REGION:ACCOUNT:identity/noreply@yourdomain.com,EmailSendingAccount=DEVELOPER
```

### Invalid password error

**Check password policy:**

```powershell
aws cognito-idp describe-user-pool `
  --user-pool-id $USER_POOL_ID `
  --query 'UserPool.Policies.PasswordPolicy'
```

### User not confirmed

**Admin confirm user (for testing):**

```powershell
aws cognito-idp admin-confirm-sign-up `
  --user-pool-id $USER_POOL_ID `
  --username user@example.com
```

---

## Cost Estimate

- **Monthly Active Users**: First 50,000 free, then $0.0055/MAU
- **Email delivery**: Included (via Cognito default)
- **Typical cost for 1,000 users/month**: Free

---

## Security Best Practices

1. Use SRP auth flow (ALLOW_USER_SRP_AUTH) in production
2. Enable advanced security features for compromised credential detection
3. Implement rate limiting on login attempts
4. Use HTTPS only
5. Store tokens securely (httpOnly cookies or secure storage)

---

## Resources

- [Cognito Sign Up API](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_SignUp.html)
- [Amplify Auth](https://docs.amplify.aws/lib/auth/getting-started/)
- [Password Policies](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-policies.html)
