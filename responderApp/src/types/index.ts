// User types
export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'responder';
  expertise?: string;
};

// Question types
export type QuestionStatus = 'pending' | 'inProgress' | 'answered';

export type Question = {
  _id: string;
  title: string;
  content: string;
  status: QuestionStatus;
  asker: {
    _id: string;
    name: string;
    isAnonymous: boolean;
  };
  responder?: {
    _id: string;
    name: string;
  };
  answer?: string;
  createdAt: string;
  updatedAt: string;
};

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  QuestionDetail: {id: string};
  Profile: undefined;
};

// API Response types
export type LoginResponse = {
  token: string;
  user: User;
};

export type APIError = {
  message: string;
  status: number;
};
