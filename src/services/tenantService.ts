import api from '@/lib/api';
import { TenantDto, Page } from '@/types';

export const tenantService = {
  getAll: () => api.get<TenantDto[]>('/tenants/all').then(r => r.data),
  search: (name: string, page = 0, size = 10) =>
    api.get<Page<TenantDto>>('/tenants', { params: { name, page, size } }).then(r => r.data),
  create: (dto: TenantDto) => api.post<TenantDto>('/tenants', dto).then(r => r.data),
  update: (id: number, dto: TenantDto) => api.put<TenantDto>(`/tenants/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/tenants/${id}`),
};
