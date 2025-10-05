import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    loading: false,
    error: null,
    // MFA state
    mfaRequired: false,
    mfaSession: null,
    // Passwordless OTP state
    otpSession: null,
    otpDeliveryMedium: null // 'EMAIL' or 'SMS'
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null,
    currentUser: (state) => state.user,
    userEmail: (state) => state.user?.email || null,
    userName: (state) => state.user?.name || null,
    userPhone: (state) => state.user?.phone_number || null,
    requiresMFA: (state) => state.mfaRequired,
    requiresOTP: (state) => state.otpSession !== null
  },

  actions: {
    // Mock signup - simulates AWS Cognito SignUp
    async signup(email, password, name) {
      this.loading = true
      this.error = null

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock validation
        if (!email || !password || password.length < 8) {
          throw new Error('Invalid input. Password must be at least 8 characters.')
        }

        // In real implementation, this would call:
        // AWS.CognitoIdentityServiceProvider.signUp()
        console.log('[Mock] Cognito SignUp:', { email, name })

        // Mock successful signup response
        const mockUser = {
          email,
          name,
          sub: 'mock-user-' + Date.now(), // Cognito user ID
          email_verified: false,
          created_at: new Date().toISOString()
        }

        // Store user but not authenticated until email verified
        this.user = mockUser
        this.isAuthenticated = false

        return {
          success: true,
          message: 'Signup successful! Please check your email for verification code.',
          userSub: mockUser.sub
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mock login - simulates AWS Cognito Authentication
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock validation
        if (!email || !password) {
          throw new Error('Email and password are required')
        }

        // Mock credentials check (in demo, any email/password works)
        // In real implementation, this would call:
        // AWS.CognitoIdentityServiceProvider.initiateAuth()
        console.log('[Mock] Cognito Login:', { email })

        // Mock successful authentication response
        const mockUser = {
          email,
          name: email.split('@')[0], // Extract name from email
          sub: 'mock-user-' + email,
          email_verified: true,
          phone_number_verified: false,
          created_at: new Date().toISOString()
        }

        const mockTokens = {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          idToken: 'mock-id-token-' + Date.now(),
          expiresIn: 3600 // 1 hour
        }

        // Update state
        this.user = mockUser
        this.isAuthenticated = true
        this.accessToken = mockTokens.accessToken
        this.refreshToken = mockTokens.refreshToken
        this.idToken = mockTokens.idToken

        // Store in localStorage for persistence
        localStorage.setItem('authUser', JSON.stringify(mockUser))
        localStorage.setItem('authTokens', JSON.stringify(mockTokens))

        return {
          success: true,
          message: 'Login successful!',
          user: mockUser
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mock logout
    async logout() {
      this.loading = true

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // In real implementation, this would call:
        // AWS.CognitoIdentityServiceProvider.globalSignOut()
        console.log('[Mock] Cognito Logout')

        // Clear state
        this.user = null
        this.isAuthenticated = false
        this.accessToken = null
        this.refreshToken = null
        this.idToken = null
        this.error = null

        // Clear localStorage
        localStorage.removeItem('authUser')
        localStorage.removeItem('authTokens')

        return { success: true, message: 'Logged out successfully' }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mock verify email with code
    async verifyEmail(email, code) {
      this.loading = true
      this.error = null

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock validation
        if (!code || code.length !== 6) {
          throw new Error('Invalid verification code. Must be 6 digits.')
        }

        // In real implementation, this would call:
        // AWS.CognitoIdentityServiceProvider.confirmSignUp()
        console.log('[Mock] Cognito Verify Email:', { email, code })

        // Update user email_verified status
        if (this.user) {
          this.user.email_verified = true
        }

        return {
          success: true,
          message: 'Email verified successfully! You can now log in.'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mock password reset request
    async requestPasswordReset(email) {
      this.loading = true
      this.error = null

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // In real implementation, this would call:
        // AWS.CognitoIdentityServiceProvider.forgotPassword()
        console.log('[Mock] Cognito Password Reset Request:', { email })

        return {
          success: true,
          message: 'Password reset code sent to your email.'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mock confirm password reset
    async confirmPasswordReset(email, code, newPassword) {
      this.loading = true
      this.error = null

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock validation
        if (!code || code.length !== 6) {
          throw new Error('Invalid verification code')
        }
        if (!newPassword || newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }

        // In real implementation, this would call:
        // AWS.CognitoIdentityServiceProvider.confirmForgotPassword()
        console.log('[Mock] Cognito Confirm Password Reset:', { email })

        return {
          success: true,
          message: 'Password reset successful! You can now log in.'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Restore session from localStorage
    restoreSession() {
      try {
        const storedUser = localStorage.getItem('authUser')
        const storedTokens = localStorage.getItem('authTokens')

        if (storedUser && storedTokens) {
          this.user = JSON.parse(storedUser)
          const tokens = JSON.parse(storedTokens)
          this.accessToken = tokens.accessToken
          this.refreshToken = tokens.refreshToken
          this.idToken = tokens.idToken
          this.isAuthenticated = true

          console.log('[Mock] Session restored from localStorage')
          return true
        }
        return false
      } catch (error) {
        console.error('Error restoring session:', error)
        return false
      }
    },

    // Clear error
    clearError() {
      this.error = null
    },

    // ========== PHONE/PASSWORD AUTHENTICATION ==========

    // Mock signup with phone number
    async signupWithPhone(phoneNumber, password, name) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!phoneNumber || !password || password.length < 8) {
          throw new Error('Invalid input. Password must be at least 8 characters.')
        }

        console.log('[Mock] Cognito SignUp with Phone:', { phoneNumber, name })

        const mockUser = {
          phone_number: phoneNumber,
          name,
          sub: 'mock-user-phone-' + Date.now(),
          phone_number_verified: false,
          created_at: new Date().toISOString()
        }

        this.user = mockUser
        this.isAuthenticated = false

        return {
          success: true,
          message: 'Signup successful! Please check your phone for verification code.',
          userSub: mockUser.sub
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mock verify phone number
    async verifyPhone(phoneNumber, code) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!code || code.length !== 6) {
          throw new Error('Invalid verification code. Must be 6 digits.')
        }

        console.log('[Mock] Cognito Verify Phone:', { phoneNumber, code })

        if (this.user) {
          this.user.phone_number_verified = true
        }

        return {
          success: true,
          message: 'Phone verified successfully! You can now log in.'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mock login with phone
    async loginWithPhone(phoneNumber, password) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!phoneNumber || !password) {
          throw new Error('Phone number and password are required')
        }

        console.log('[Mock] Cognito Login with Phone:', { phoneNumber })

        const mockUser = {
          phone_number: phoneNumber,
          name: phoneNumber.substring(0, 10),
          sub: 'mock-user-phone-' + phoneNumber,
          phone_number_verified: true,
          created_at: new Date().toISOString()
        }

        const mockTokens = {
          accessToken: 'mock-access-token-phone-' + Date.now(),
          refreshToken: 'mock-refresh-token-phone-' + Date.now(),
          idToken: 'mock-id-token-phone-' + Date.now(),
          expiresIn: 3600
        }

        this.user = mockUser
        this.isAuthenticated = true
        this.accessToken = mockTokens.accessToken
        this.refreshToken = mockTokens.refreshToken
        this.idToken = mockTokens.idToken

        localStorage.setItem('authUser', JSON.stringify(mockUser))
        localStorage.setItem('authTokens', JSON.stringify(mockTokens))

        return {
          success: true,
          message: 'Login successful!',
          user: mockUser
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== USERNAME/PASSWORD AUTHENTICATION ==========

    // Mock signup with username
    async signupWithUsername(username, email, password, name) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!username || !email || !password || password.length < 8) {
          throw new Error('All fields required. Password must be at least 8 characters.')
        }

        console.log('[Mock] Cognito SignUp with Username:', { username, email, name })

        const mockUser = {
          username,
          email,
          name,
          sub: 'mock-user-username-' + Date.now(),
          email_verified: false,
          created_at: new Date().toISOString()
        }

        this.user = mockUser
        this.isAuthenticated = false

        return {
          success: true,
          message: 'Signup successful! Please check your email for verification code.',
          userSub: mockUser.sub
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mock login with username
    async loginWithUsername(username, password) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!username || !password) {
          throw new Error('Username and password are required')
        }

        console.log('[Mock] Cognito Login with Username:', { username })

        const mockUser = {
          username,
          email: username + '@example.com',
          name: username,
          sub: 'mock-user-username-' + username,
          email_verified: true,
          created_at: new Date().toISOString()
        }

        const mockTokens = {
          accessToken: 'mock-access-token-username-' + Date.now(),
          refreshToken: 'mock-refresh-token-username-' + Date.now(),
          idToken: 'mock-id-token-username-' + Date.now(),
          expiresIn: 3600
        }

        this.user = mockUser
        this.isAuthenticated = true
        this.accessToken = mockTokens.accessToken
        this.refreshToken = mockTokens.refreshToken
        this.idToken = mockTokens.idToken

        localStorage.setItem('authUser', JSON.stringify(mockUser))
        localStorage.setItem('authTokens', JSON.stringify(mockTokens))

        return {
          success: true,
          message: 'Login successful!',
          user: mockUser
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== PASSWORDLESS OTP (EMAIL) ==========

    // Request OTP via email
    async requestOTPEmail(email) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!email) {
          throw new Error('Email is required')
        }

        console.log('[Mock] Cognito Request OTP Email:', { email })

        // Store session for OTP verification
        this.otpSession = 'mock-otp-session-email-' + Date.now()
        this.otpDeliveryMedium = 'EMAIL'

        return {
          success: true,
          message: 'OTP code sent to your email.',
          session: this.otpSession,
          deliveryMedium: 'EMAIL'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Verify OTP from email
    async verifyOTPEmail(email, code) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!code || code.length !== 6) {
          throw new Error('Invalid OTP code. Must be 6 digits.')
        }

        if (!this.otpSession) {
          throw new Error('No active OTP session. Please request a new code.')
        }

        console.log('[Mock] Cognito Verify OTP Email:', { email, code })

        const mockUser = {
          email,
          name: email.split('@')[0],
          sub: 'mock-user-otp-email-' + email,
          email_verified: true,
          auth_type: 'passwordless_email',
          created_at: new Date().toISOString()
        }

        const mockTokens = {
          accessToken: 'mock-access-token-otp-email-' + Date.now(),
          refreshToken: 'mock-refresh-token-otp-email-' + Date.now(),
          idToken: 'mock-id-token-otp-email-' + Date.now(),
          expiresIn: 3600
        }

        this.user = mockUser
        this.isAuthenticated = true
        this.accessToken = mockTokens.accessToken
        this.refreshToken = mockTokens.refreshToken
        this.idToken = mockTokens.idToken
        this.otpSession = null
        this.otpDeliveryMedium = null

        localStorage.setItem('authUser', JSON.stringify(mockUser))
        localStorage.setItem('authTokens', JSON.stringify(mockTokens))

        return {
          success: true,
          message: 'Login successful!',
          user: mockUser
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== PASSWORDLESS OTP (SMS) ==========

    // Request OTP via SMS
    async requestOTPSMS(phoneNumber) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!phoneNumber) {
          throw new Error('Phone number is required')
        }

        console.log('[Mock] Cognito Request OTP SMS:', { phoneNumber })

        this.otpSession = 'mock-otp-session-sms-' + Date.now()
        this.otpDeliveryMedium = 'SMS'

        return {
          success: true,
          message: 'OTP code sent to your phone.',
          session: this.otpSession,
          deliveryMedium: 'SMS'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Verify OTP from SMS
    async verifyOTPSMS(phoneNumber, code) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!code || code.length !== 6) {
          throw new Error('Invalid OTP code. Must be 6 digits.')
        }

        if (!this.otpSession) {
          throw new Error('No active OTP session. Please request a new code.')
        }

        console.log('[Mock] Cognito Verify OTP SMS:', { phoneNumber, code })

        const mockUser = {
          phone_number: phoneNumber,
          name: phoneNumber.substring(0, 10),
          sub: 'mock-user-otp-sms-' + phoneNumber,
          phone_number_verified: true,
          auth_type: 'passwordless_sms',
          created_at: new Date().toISOString()
        }

        const mockTokens = {
          accessToken: 'mock-access-token-otp-sms-' + Date.now(),
          refreshToken: 'mock-refresh-token-otp-sms-' + Date.now(),
          idToken: 'mock-id-token-otp-sms-' + Date.now(),
          expiresIn: 3600
        }

        this.user = mockUser
        this.isAuthenticated = true
        this.accessToken = mockTokens.accessToken
        this.refreshToken = mockTokens.refreshToken
        this.idToken = mockTokens.idToken
        this.otpSession = null
        this.otpDeliveryMedium = null

        localStorage.setItem('authUser', JSON.stringify(mockUser))
        localStorage.setItem('authTokens', JSON.stringify(mockTokens))

        return {
          success: true,
          message: 'Login successful!',
          user: mockUser
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== MFA (SMS) ==========

    // Enable MFA for user
    async enableMFA() {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!this.isAuthenticated) {
          throw new Error('Must be logged in to enable MFA')
        }

        console.log('[Mock] Cognito Enable MFA for user:', this.user?.sub)

        // Update user MFA preference
        if (this.user) {
          this.user.mfa_enabled = true
          this.user.mfa_type = 'SMS'
          localStorage.setItem('authUser', JSON.stringify(this.user))
        }

        return {
          success: true,
          message: 'SMS MFA enabled successfully!'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Disable MFA for user
    async disableMFA() {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!this.isAuthenticated) {
          throw new Error('Must be logged in to disable MFA')
        }

        console.log('[Mock] Cognito Disable MFA for user:', this.user?.sub)

        if (this.user) {
          this.user.mfa_enabled = false
          this.user.mfa_type = null
          localStorage.setItem('authUser', JSON.stringify(this.user))
        }

        return {
          success: true,
          message: 'MFA disabled successfully!'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Login with MFA (triggered during login if MFA enabled)
    async loginWithMFA(identifier, password, identifierType = 'email') {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!identifier || !password) {
          throw new Error('Identifier and password are required')
        }

        console.log('[Mock] Cognito Login (MFA Check):', { identifier, identifierType })

        // Simulate: User has MFA enabled, trigger MFA flow
        this.mfaRequired = true
        this.mfaSession = 'mock-mfa-session-' + Date.now()

        // Store temp user data (not authenticated yet)
        const tempUser = {
          [identifierType]: identifier,
          sub: 'mock-user-mfa-' + identifier,
          mfa_enabled: true,
          mfa_type: 'SMS'
        }

        return {
          success: false,
          mfaRequired: true,
          message: 'MFA code sent to your phone.',
          session: this.mfaSession,
          tempUser
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Verify MFA code
    async verifyMFACode(code, tempUser) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!code || code.length !== 6) {
          throw new Error('Invalid MFA code. Must be 6 digits.')
        }

        if (!this.mfaSession) {
          throw new Error('No active MFA session.')
        }

        console.log('[Mock] Cognito Verify MFA Code:', { code })

        const mockUser = {
          ...tempUser,
          name: tempUser.email?.split('@')[0] || tempUser.phone_number?.substring(0, 10) || tempUser.username,
          email_verified: !!tempUser.email,
          phone_number_verified: !!tempUser.phone_number,
          created_at: new Date().toISOString()
        }

        const mockTokens = {
          accessToken: 'mock-access-token-mfa-' + Date.now(),
          refreshToken: 'mock-refresh-token-mfa-' + Date.now(),
          idToken: 'mock-id-token-mfa-' + Date.now(),
          expiresIn: 3600
        }

        this.user = mockUser
        this.isAuthenticated = true
        this.accessToken = mockTokens.accessToken
        this.refreshToken = mockTokens.refreshToken
        this.idToken = mockTokens.idToken
        this.mfaRequired = false
        this.mfaSession = null

        localStorage.setItem('authUser', JSON.stringify(mockUser))
        localStorage.setItem('authTokens', JSON.stringify(mockTokens))

        return {
          success: true,
          message: 'MFA verification successful!',
          user: mockUser
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
