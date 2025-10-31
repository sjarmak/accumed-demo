import axios from 'axios';

export class AuthService {
  private readonly API_KEY: string;
  private readonly API_ENDPOINT: string;

  constructor() {
    this.API_KEY = process.env.AUTH_API_KEY || '';
    this.API_ENDPOINT = process.env.AUTH_API_ENDPOINT || 'https://api.external-auth.com/v1/verify';
    
    if (!this.API_KEY) {
      throw new Error('AUTH_API_KEY environment variable is required');
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(this.API_ENDPOINT, {
        token,
        apiKey: this.API_KEY,
      });
      return response.data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  async getServiceToken(): Promise<string> {
    const response = await axios.post(`${this.API_ENDPOINT}/token`, {
      apiKey: this.API_KEY,
    });
    return response.data.token;
  }
}
