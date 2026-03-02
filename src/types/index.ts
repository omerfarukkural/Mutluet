export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'USER' | 'VOLUNTEER' | 'ADMIN' | 'ORGANIZATION';
  bio?: string;
  location?: string;
  phone?: string;
  interests?: string[];
  totalDonations: number;
  volunteerHours: number;
  eventsAttended: number;
  engagementScore: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Donation {
  id: string;
  amount: number;
  type: 'EGITIM' | 'GIDA' | 'BARINMA' | 'HUKUKI' | 'SAGLIK' | 'DIGER';
  description?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'EGITIM' | 'SOSYAL' | 'BARINMA' | 'GIDA' | 'HUKUKI' | 'SAGLIK';
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
  currentParticipants: number;
}

export interface Match {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  volunteerHours: number;
  eventsAttended: number;
  compatibilityScore: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Conversation {
  partner: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  phone?: string;
  website?: string;
}
