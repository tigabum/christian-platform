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
  status: 'pending' | 'accepted' | 'answered' | 'forwarded';
  isPublic: boolean;
  isAnonymous: boolean;
  answer?: {
    content: string;
    createdAt: Date;
  };
  createdAt: Date;
}
