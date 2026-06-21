import { workflowApi } from '@/features/delivery/services/workflowApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('workflowApi.getAll', () => {
  it('calls api.get with /workflows', () => {
    mockGet.mockResolvedValue([]);
    workflowApi.getAll();
    expect(mockGet).toHaveBeenCalledWith('/workflows');
  });
});

describe('workflowApi.getById', () => {
  it('calls api.get with /workflows/:id', () => {
    mockGet.mockResolvedValue({});
    workflowApi.getById('wf-1');
    expect(mockGet).toHaveBeenCalledWith('/workflows/wf-1');
  });
});

describe('workflowApi.completeStep', () => {
  it('calls api.post with correct path and body', () => {
    mockPost.mockResolvedValue({});
    workflowApi.completeStep('del-1', 'wf-1', 'step-1');
    expect(mockPost).toHaveBeenCalledWith(
      '/workflows/del-1/steps/complete',
      { workflowId: 'wf-1', stepId: 'step-1' },
    );
  });
});

describe('workflowApi.getCompletedSteps', () => {
  it('calls api.get with /workflows/:deliveryId/steps/:workflowId', () => {
    mockGet.mockResolvedValue([]);
    workflowApi.getCompletedSteps('del-1', 'wf-1');
    expect(mockGet).toHaveBeenCalledWith('/workflows/del-1/steps/wf-1');
  });
});

describe('workflowApi.generateQR', () => {
  it('calls api.post with /workflows/qr/generate and deliveryId', () => {
    mockPost.mockResolvedValue({ payload: 'qr-data' });
    workflowApi.generateQR('del-1');
    expect(mockPost).toHaveBeenCalledWith('/workflows/qr/generate', { deliveryId: 'del-1' });
  });
});

describe('workflowApi.validateQR', () => {
  it('calls api.post with /workflows/qr/validate and payload', () => {
    mockPost.mockResolvedValue({ valid: true });
    workflowApi.validateQR('qr-data');
    expect(mockPost).toHaveBeenCalledWith('/workflows/qr/validate', { payload: 'qr-data' });
  });
});
