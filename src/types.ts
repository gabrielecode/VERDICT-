export interface DecisionOption {
  id: string;
  text: string;
  votes: number;
}

export interface Creator {
  name: string;
  avatar: string;
  role: string;
}

export interface Participant {
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  role?: string;
  text: string;
  timestamp: string; // ISO date or descriptive string
}

export type DecisionType = 'single' | 'multiple' | 'yes_no' | 'rating';
export type DecisionAudience = 'public' | 'private' | 'restricted';

export interface Decision {
  id: string;
  title: string;
  description: string;
  type: DecisionType;
  options: DecisionOption[];
  category: string;
  deadline: string; // ISO date string
  audience: DecisionAudience;
  creator: Creator;
  votedOptionIds?: string[]; // IDs of options voted by user
  ratingValue?: number; // User's given rating (1-5) if type is 'rating'
  participants: Participant[];
  comments: Comment[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
}

