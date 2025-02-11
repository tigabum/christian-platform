import api from "../api/axios";

export interface Responder {
  id: string;
  name: string;
  email: string;
  expertise: string;
  status: "active" | "inactive";
  questionsAnswered: number;
  lastActive: string;
}

interface CreateResponderData {
  name: string;
  email: string;
  password: string;
  expertise: string;
}

interface UpdateResponderData {
  name?: string;
  email?: string;
  password?: string;
  expertise?: string;
}

interface ResponderListResponse {
  count: number;
  responders: Responder[];
}

export const responderService = {
  // Get all responders with optional filters
  getResponders: async (search?: string, expertise?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (expertise) params.append("expertise", expertise);

    const response = await api.get<ResponderListResponse>(
      `/admin/responders?${params}`
    );
    return response.data;
  },

  // Get single responder details
  getResponder: async (id: string) => {
    const response = await api.get<Responder>(`/admin/responders/${id}`);
    return response.data;
  },

  // Create new responder
  createResponder: async (data: CreateResponderData) => {
    const response = await api.post<{ message: string; responder: Responder }>(
      "/admin/responders",
      data
    );
    return response.data;
  },

  // Update responder
  updateResponder: async (id: string, data: UpdateResponderData) => {
    const response = await api.put<{ message: string; responder: Responder }>(
      `/admin/responders/${id}`,
      data
    );
    return response.data;
  },
};
