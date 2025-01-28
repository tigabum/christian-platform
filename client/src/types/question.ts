export interface Question {
  _id: string;
  title: string;
  content: string;
  asker: {
    _id: string;
    name: string;
  };
  responder?: {
    _id: string;
    name: string;
  };
  status: 'pending' | 'assigned' | 'answered' | 'closed';
  isPublic: boolean;
  isAnonymous: boolean;
  answer?: {
    content: string;
    createdAt: string;
  };
  createdAt: string;
  assignedAt?: string;
  answeredAt?: string;
}
