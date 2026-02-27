import { ENV } from '../config/env';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

class AuthService {
  private tokens: AuthTokens | null = null;

  // Mock login for demo/development
  private async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email === ENV.MOCK_EMAIL && credentials.password === ENV.MOCK_PASSWORD) {
      const mockToken = `mock_token_${Date.now()}`;
      this.tokens = {
        accessToken: mockToken,
        refreshToken: `mock_refresh_${Date.now()}`,
      };

      return {
        success: true,
        token: mockToken,
        user: {
          id: 'mock-user-1',
          email: credentials.email,
          name: 'Demo User',
        },
      };
    }

    return {
      success: false,
      error: 'Invalid credentials. Use demo@drovery.com / demo123',
    };
  }

  // API login for production
  private async apiLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${ENV.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        this.tokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };

        return {
          success: true,
          token: data.accessToken,
          user: data.user,
        };
      }

      return {
        success: false,
        error: data.message || 'Login failed',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Mock signup for demo/development
  private async mockSignup(credentials: SignupCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic validation
    if (credentials.password !== credentials.confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }

    // Create mock user
    const mockToken = `mock_token_${Date.now()}`;
    this.tokens = {
      accessToken: mockToken,
      refreshToken: `mock_refresh_${Date.now()}`,
    };

    return {
      success: true,
      token: mockToken,
      user: {
        id: `mock-user-${Date.now()}`,
        email: credentials.email,
        name: credentials.name,
      },
    };
  }

  // API signup for production
  private async apiSignup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const { confirmPassword, ...signupData } = credentials;

      const response = await fetch(`${ENV.API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        this.tokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };

        return {
          success: true,
          token: data.accessToken,
          user: data.user,
        };
      }

      return {
        success: false,
        error: data.message || 'Signup failed',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    if (ENV.AUTH_MODE === 'mock') {
      return this.mockSignup(credentials);
    }
    return this.apiSignup(credentials);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (ENV.AUTH_MODE === 'mock') {
      return this.mockLogin(credentials);
    }
    return this.apiLogin(credentials);
  }

  logout(): void {
    this.tokens = null;
  }

  isAuthenticated(): boolean {
    return this.tokens !== null;
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }
}

export const authService = new AuthService();
