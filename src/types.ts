export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export type ToastType = Toast['type'];

export interface DecisionOption {
  id: string | number;
  text: string;
  votes: number;
}

export interface Creator {
  name: string;
  avatar: string;
  role: string;
  uid?: string;
}

export interface Participant {
  name: string;
  avatar: string;
}

export interface Comment {
  id: string | number;
  author: string;
  avatar: string;
  role?: string;
  text: string;
  timestamp: string;
}

export type DecisionType = 'single' | 'multiple' | 'yes_no' | 'rating';
export type DecisionAudience = 'public' | 'private' | 'restricted';

export interface Vote {
  userId: string;
  optionIds: string[];
  ratingValue?: number;
  timestamp: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  type: DecisionType;
  options: DecisionOption[];
  category: string;
  deadline: string;
  audience: DecisionAudience;
  creator: Creator;
  votedOptionIds?: string[];
  ratingValue?: number;
  participants: Participant[];
  comments: Comment[];
  createdAt: string;
  attachments?: string[];
  votes?: Vote[];
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
}

export interface TeamMember {
  id: string;
  name: string;
  surname: string;
  department: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  status: string;
}
