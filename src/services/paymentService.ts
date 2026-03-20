import api from '@/lib/api';
import { PaymentDto, Page } from '@/types';

export const paymentService = {
  getAll: () => api.get<PaymentDto[]>('/payments/all').then(r => r.data),
  getByLease: (leaseId: number, page = 0, size = 10) =>
    api.get<Page<PaymentDto>>(`/payments/lease/${leaseId}`, { params: { page, size } }).then(r => r.data),
  create: (dto: PaymentDto) => api.post<PaymentDto>('/payments', dto).then(r => r.data),
  update: (id: number, dto: PaymentDto) => api.put<PaymentDto>(`/payments/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/payments/${id}`),
};
