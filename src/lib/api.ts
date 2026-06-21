import type { AuthResponse, User, Donation, Event, Match, Conversation, Message, Organization } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async socialAuth(provider: string, data: {
    token?: string;
    email: string;
    name: string;
    avatar?: string;
    providerId: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(`/auth/social/${provider}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async magicLink(email: string): Promise<{ message: string; magicLink?: string }> {
    return this.request('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(`/auth/verify?token=${token}`);
    this.setToken(response.token);
    return response;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const headers: HeadersInit = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/upload/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }
    return response.json();
  }

  async createPaymentIntent(amount: number, type: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return this.request('/donations/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, type }),
    });
  }

  // User
  async getCurrentUser(): Promise<User> {
    return this.request('/users/me');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(): Promise<Pick<User, 'totalDonations' | 'volunteerHours' | 'eventsAttended' | 'engagementScore'>> {
    return this.request('/users/me/stats');
  }

  // Donations
  async getMyDonations(): Promise<Donation[]> {
    return this.request('/donations/my-donations');
  }

  async createDonation(data: {
    amount: number;
    type: string;
    description?: string;
  }): Promise<Donation> {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return this.request('/events');
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return this.request('/events/upcoming');
  }

  async joinEvent(eventId: string): Promise<{ message: string }> {
    return this.request(`/events/${eventId}/join`, {
      method: 'POST',
    });
  }

  // Matching
  async getPotentialMatches(): Promise<Match[]> {
    return this.request('/matching/potential');
  }

  async createMatch(userId: string, compatibilityScore: number): Promise<any> {
    return this.request(`/matching/${userId}/match`, {
      method: 'POST',
      body: JSON.stringify({ compatibilityScore }),
    });
  }

  // Chat
  async getConversations(): Promise<Conversation[]> {
    return this.request('/chat/conversations');
  }

  async getMessages(userId: string): Promise<Message[]> {
    return this.request(`/chat/messages/${userId}`);
  }

  async sendMessage(receiverId: string, content: string): Promise<Message> {
    return this.request('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
  }

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    return this.request('/organizations');
  }

  async getNearbyOrganizations(lat: number, lng: number, radius: number = 10): Promise<Organization[]> {
    return this.request(`/organizations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  // Admin APIs
  async getAllUsers(): Promise<User[]> {
    return this.request('/users/all');
  }

  async getAllEvents(): Promise<Event[]> {
    return this.request('/events');
  }

  async getAllDonations(): Promise<Donation[]> {
    return this.request('/donations/all');
  }

  // Admin Panel APIs
  async getAdminStats(): Promise<any> {
    return this.request('/admin/stats');
  }

  async getAdminUsers(params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    return this.request(`/admin/users?${query.toString()}`);
  }

  async getAdminUserDetail(userId: string): Promise<any> {
    return this.request(`/admin/users/${userId}`);
  }

  async updateUserRole(userId: string, role: string): Promise<any> {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return this.request(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  // Admin: Etkinlik CRUD
  async createEvent(data: {
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    location: string;
    maxParticipants?: number;
  }): Promise<Event> {
    return this.request('/admin/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(eventId: string, data: Partial<Event>): Promise<Event> {
    return this.request(`/admin/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(eventId: string): Promise<{ message: string }> {
    return this.request(`/admin/events/${eventId}`, { method: 'DELETE' });
  }

  // Admin: Kuruluş CRUD
  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    return this.request('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(orgId: string): Promise<{ message: string }> {
    return this.request(`/admin/organizations/${orgId}`, { method: 'DELETE' });
  }

  // Admin: Sistem
  async getSystemInfo(): Promise<any> {
    return this.request('/admin/system');
  }

  // Admin: AI Asistan
  async sendAiMessage(message: string, context?: any): Promise<{ response: string; source: string }> {
    return this.request('/admin/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async runDbQuery(query: string): Promise<{ result: any[]; rowCount: number }> {
    return this.request('/admin/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Admin: GitHub
  async getGithubStatus(): Promise<any> {
    return this.request('/admin/github/status');
  }

  async triggerDeploy(): Promise<{ message: string }> {
    return this.request('/admin/github/deploy', { method: 'POST' });
  }

  // Admin: Bağışlar (sayfalı)
  async getAdminDonations(params?: { page?: number; limit?: number }): Promise<{ donations: Donation[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return this.request(`/admin/donations?${query.toString()}`);
  }
}

export const api = new ApiClient();
