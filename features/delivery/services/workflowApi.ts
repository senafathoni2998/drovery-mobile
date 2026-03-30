import { api } from '@/services/api/apiClient';
import type { ApiWorkflow, ApiWorkflowStepCompletion } from '@/services/api/types';

export const workflowApi = {
  getAll() {
    return api.get<ApiWorkflow[]>('/workflows');
  },

  getById(id: string) {
    return api.get<ApiWorkflow>(`/workflows/${id}`);
  },

  completeStep(deliveryId: string, workflowId: string, stepId: string) {
    return api.post<ApiWorkflowStepCompletion>(`/workflows/${deliveryId}/steps/complete`, {
      workflowId,
      stepId,
    });
  },

  getCompletedSteps(deliveryId: string, workflowId: string) {
    return api.get<ApiWorkflowStepCompletion[]>(`/workflows/${deliveryId}/steps/${workflowId}`);
  },

  generateQR(deliveryId: string) {
    return api.post<{ payload: string }>('/workflows/qr/generate', { deliveryId });
  },

  validateQR(payload: string) {
    return api.post<{ valid: boolean; deliveryId?: string }>('/workflows/qr/validate', { payload });
  },
};
