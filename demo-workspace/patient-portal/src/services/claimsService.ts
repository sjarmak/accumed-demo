import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.VITE_API_KEY;

interface Claim {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied' | 'processing';
  description: string;
  diagnosis: string;
  procedureCodes: string[];
}

interface ClaimSubmission {
  patientId: string;
  providerId: string;
  amount: number;
  description: string;
  diagnosis: string;
  procedureCodes: string[];
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

export const claimsService = {
  async getClaimsByPatient(patientId: string): Promise<Claim[]> {
    const response = await apiClient.get<Claim[]>(`/claims/patient/${patientId}`);
    return response.data;
  },

  async getClaimById(claimId: string): Promise<Claim> {
    const response = await apiClient.get<Claim>(`/claims/${claimId}`);
    return response.data;
  },

  async submitClaim(claim: ClaimSubmission): Promise<Claim> {
    const response = await apiClient.post<Claim>('/claims', claim);
    return response.data;
  },

  async updateClaimStatus(claimId: string, status: Claim['status']): Promise<Claim> {
    const response = await apiClient.patch<Claim>(`/claims/${claimId}/status`, { status });
    return response.data;
  },

  async deleteClaim(claimId: string): Promise<void> {
    await apiClient.delete(`/claims/${claimId}`);
  },
};

export type { Claim, ClaimSubmission };
