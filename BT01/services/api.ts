// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/auth';
// For Android Emulator, use: 'http://10.0.2.2:5000/api/auth'
// For physical device, use your computer's IP: 'http://YOUR_IP:5000/api/auth'

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  errors?: Array<{
    msg: string;
    param: string;
  }>;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // Detect platform and set appropriate base URL
    this.baseUrl = API_BASE_URL;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.',
      };
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.',
      };
    }
  }
}

export default new ApiService();
