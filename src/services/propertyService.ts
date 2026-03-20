import api from '@/lib/api';
import { PropertyDto, Page } from '@/types';

export const propertyService = {
  getAll: () => api.get<PropertyDto[]>('/properties/all').then(r => r.data),
  search: (name: string, page = 0, size = 10) =>
    api.get<Page<PropertyDto>>('/properties', { params: { name, page, size } }).then(r => r.data),
  getByOwner: (ownerId: number, page = 0, size = 10) =>
    api.get<Page<PropertyDto>>(`/properties/owner/${ownerId}`, { params: { page, size } }).then(r => r.data),
  create: (dto: PropertyDto) => api.post<PropertyDto>('/properties', dto).then(r => r.data),
  update: (id: number, dto: PropertyDto) => api.put<PropertyDto>(`/properties/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/properties/${id}`),
};
