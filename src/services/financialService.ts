import api from '@/lib/api';
import { FinancialSummaryDto, Page } from '@/types';

export const financialService = {
  getAll: (page = 0, size = 10) =>
    api.get<Page<FinancialSummaryDto>>('/financial', { params: { page, size } }).then(r => r.data),
  getById: (id: number) => api.get<FinancialSummaryDto>(`/financial/${id}`).then(r => r.data),
  create: (dto: FinancialSummaryDto) => api.post<FinancialSummaryDto>('/financial', dto).then(r => r.data),
  update: (id: number, dto: FinancialSummaryDto) => api.put<FinancialSummaryDto>(`/financial/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/financial/${id}`),
};
