export interface Responder {
  id: string;
  email: string;
  name: string;
  expertise: string;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}
