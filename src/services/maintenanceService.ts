import api from '@/lib/api';
import { MaintenanceRequestDto, Page } from '@/types';

export const maintenanceService = {
  getAll: () => api.get<MaintenanceRequestDto[]>('/maintenance/all').then(r => r.data),
  getByProperty: (propertyId: number, page = 0, size = 10) =>
    api.get<Page<MaintenanceRequestDto>>(`/maintenance/property/${propertyId}`, { params: { page, size } }).then(r => r.data),
  getByTenant: (tenantId: number, page = 0, size = 10) =>
    api.get<Page<MaintenanceRequestDto>>(`/maintenance/tenant/${tenantId}`, { params: { page, size } }).then(r => r.data),
  create: (dto: MaintenanceRequestDto) => api.post<MaintenanceRequestDto>('/maintenance', dto).then(r => r.data),
  update: (id: number, dto: MaintenanceRequestDto) => api.put<MaintenanceRequestDto>(`/maintenance/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/maintenance/${id}`),
};
