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

  async updateUserRole(userId: string, role: User['role']): Promise<User> {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async getAllEvents(): Promise<Event[]> {
    return this.request('/events');
  }

  async getAllDonations(): Promise<Donation[]> {
    return this.request('/donations/all');
  }
}

export const api = new ApiClient();
