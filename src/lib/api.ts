const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Profile
  async getProfile() {
    return this.request<{ profile: any }>('/api/profile');
  }

  async updateProfile(data: Record<string, any>) {
    return this.request<{ profile: any }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Consultations
  async getConsultations(params: { page?: number; limit?: number; search?: string; date?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.date) query.set('date', params.date);
    
    return this.request<{ consultations: any[]; total: number }>(`/api/consultations?${query}`);
  }

  async getRecentConsultations() {
    return this.request<{ consultations: any[] }>('/api/consultations/recent');
  }

  async createConsultation(data: Record<string, any>) {
    return this.request<{ consultation: any }>('/api/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Credits
  async getCredits() {
    return this.request<{ total: number; used: number; remaining: number }>('/api/credits');
  }

  async deductCredit() {
    return this.request<{ total: number; used: number; remaining: number }>('/api/credits/deduct', {
      method: 'POST',
    });
  }

  // Preferences
  async getPreferences() {
    return this.request<{ preferences: any }>('/api/preferences');
  }

  async updatePreferences(data: Record<string, any>) {
    return this.request<{ preferences: any }>('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin
  async getAdminUsers() {
    return this.request<{ users: any[]; stats: any }>('/api/admin/users');
  }

  async adminAddCredits(userId: string, credits: number) {
    return this.request<{ success: boolean }>('/api/admin/credits', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, credits }),
    });
  }

  async adminMakeAdmin(userId: string) {
    return this.request<{ success: boolean }>('/api/admin/make-admin', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async adminCreateUser(email: string, password: string, fullName: string) {
    return this.request<{ success: boolean; user: any }>('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
