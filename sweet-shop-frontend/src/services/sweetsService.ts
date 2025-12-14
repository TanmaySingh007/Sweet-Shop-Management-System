import api from './api';

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSweetDto {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface RestockDto {
  quantity: number;
}

export interface SearchParams {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const sweetsService = {
  getAll: async (): Promise<Sweet[]> => {
    const response = await api.get<Sweet[]>('/sweets');
    return response.data;
  },

  getById: async (id: string): Promise<Sweet> => {
    const response = await api.get<Sweet>(`/sweets/${id}`);
    return response.data;
  },

  search: async (params: SearchParams): Promise<Sweet[]> => {
    const response = await api.get<Sweet[]>('/sweets/search', { params });
    return response.data;
  },

  create: async (data: CreateSweetDto): Promise<Sweet> => {
    const response = await api.post<Sweet>('/sweets', data);
    return response.data;
  },

  purchase: async (id: string): Promise<Sweet> => {
    const response = await api.post<Sweet>(`/sweets/${id}/purchase`);
    return response.data;
  },

  restock: async (id: string, quantity: number): Promise<Sweet> => {
    const response = await api.post<Sweet>(`/sweets/${id}/restock`, { quantity });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/sweets/${id}`);
  },
};

