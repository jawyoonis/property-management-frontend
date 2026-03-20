import api from '@/lib/api';
import { OwnerDto, Page } from '@/types';

export const ownerService = {
  getAll: () => api.get<OwnerDto[]>('/owners/all').then(r => r.data),
  search: (name: string, page = 0, size = 10) =>
    api.get<Page<OwnerDto>>('/owners', { params: { name, page, size } }).then(r => r.data),
  getById: (id: number) => api.get<OwnerDto>(`/owners/${id}`).then(r => r.data),
  create: (dto: OwnerDto) => api.post<OwnerDto>('/owners', dto).then(r => r.data),
  update: (id: number, dto: OwnerDto) => api.put<OwnerDto>(`/owners/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/owners/${id}`),
};
