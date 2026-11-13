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
  uid?: string;
}

export interface FinalDecision {
  text: string;
  responsible: string;
  date: string;
}

export type DecisionType = 'single' | 'multiple' | 'yes_no' | 'rating';
export type DecisionAudience = 'org' | 'private' | 'link';

export interface Vote {
  userId: string;
  optionIds: string[];
  ratingValue?: number;
  timestamp: string;
}

export interface Decision {
  id: string;
  orgId: string;
  title: string;
  description: string;
  type: DecisionType;
  options: DecisionOption[];
  category: string;
  deadline: string;
  audience: DecisionAudience;
  isAnonymous?: boolean;
  resultsVisibility?: 'always' | 'after_vote' | 'closed';
  creator: Creator;
  votedOptionIds?: string[];
  ratingValue?: number;
  participants: Participant[];
  comments: Comment[];
  createdAt: string;
  attachments?: string[];
  votes?: Vote[];
  finalDecision?: FinalDecision;
}

export interface TeamMember {
  id: string;
  uid: string;
  role: 'owner' | 'member';
  name: string;
  email: string;
  joinedAt: string;
  avatar: string;
  status?: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerUid: string;
  createdAt: string;
  inviteCode: string;
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
}
