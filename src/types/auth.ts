export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

// Made with Bob
