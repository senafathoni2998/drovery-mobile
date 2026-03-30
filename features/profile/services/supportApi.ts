import { api } from '@/services/api/apiClient';
import type { ApiFaq } from '@/services/api/types';

export const supportApi = {
  getFAQ() {
    return api.get<ApiFaq[]>('/support/faq', { skipAuth: true });
  },

  createTicket(message: string) {
    return api.post<{ success: boolean; ticketId: string }>('/support/tickets', { message });
  },
};
