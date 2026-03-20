import api from '@/lib/api';
import { LeaseDto, Page } from '@/types';

export const leaseService = {
  getAll: () => api.get<LeaseDto[]>('/leases/all').then(r => r.data),
  getByProperty: (propertyId: number, page = 0, size = 10) =>
    api.get<Page<LeaseDto>>(`/leases/${propertyId}`, { params: { page, size } }).then(r => r.data),
  getActive: (startDate: string, endDate: string, page = 0, size = 10) =>
    api.get<Page<LeaseDto>>('/leases/active', { params: { start_date: startDate, end_date: endDate, page, size } }).then(r => r.data),
  getEndingBefore: (endDate: string, page = 0, size = 10) =>
    api.get<Page<LeaseDto>>('/leases/ending-before', { params: { end_date: endDate, page, size } }).then(r => r.data),
  getByRentRange: (rentMin: number, rentMax: number, page = 0, size = 10) =>
    api.get<Page<LeaseDto>>('/leases/rent-range', { params: { rentMin, rentMax, page, size } }).then(r => r.data),
  create: (dto: LeaseDto) => api.post<LeaseDto>('/leases', dto).then(r => r.data),
  delete: (id: number) => api.delete(`/leases/${id}`),
};
