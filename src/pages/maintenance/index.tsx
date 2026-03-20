import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Edit2, Trash2, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { maintenanceService } from '@/services/maintenanceService';
import { propertyService } from '@/services/propertyService';
import { tenantService } from '@/services/tenantService';
import { MaintenanceRequestDto, PropertyDto, TenantDto, MaintenanceStatus } from '@/types';

const STATUS_CONFIG: Record<MaintenanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <AlertTriangle className="w-4 h-4" /> },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: <XCircle className="w-4 h-4" /> },
};

const statuses: MaintenanceStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequestDto[]>([]);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRequestDto | null>(null);
  const [description, setDescription] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MaintenanceStatus>('PENDING');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [reqs, props, tens] = await Promise.all([
        maintenanceService.getAll(),
        propertyService.getAll(),
        tenantService.getAll(),
      ]);
      setRequests(reqs);
      setProperties(props);
      setTenants(tens);
    } catch {
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = statusFilter === 'ALL' ? requests : requests.filter(r => r.status === statusFilter);

  const openCreate = () => {
    setEditing(null);
    setDescription('');
    setSelectedPropertyId('');
    setSelectedTenantId('');
    setSelectedStatus('PENDING');
    setModalOpen(true);
  };

  const openEdit = (r: MaintenanceRequestDto) => {
    setEditing(r);
    setDescription(r.description);
    setSelectedPropertyId(r.propertyDto?.propertyId?.toString() || '');
    setSelectedTenantId(r.tenantDto?.tenantId?.toString() || '');
    setSelectedStatus(r.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: MaintenanceRequestDto = {
      description,
      status: selectedStatus,
      requestedDate: editing?.requestedDate ?? new Date().toISOString().slice(0, 19),
      propertyDto: selectedPropertyId ? { propertyId: Number(selectedPropertyId) } as PropertyDto : undefined,
      tenantDto: selectedTenantId ? { tenantId: Number(selectedTenantId) } as TenantDto : undefined,
    };
    try {
      if (editing?.requestId) {
        await maintenanceService.update(editing.requestId, payload);
        toast.success('Request updated');
      } else {
        await maintenanceService.create(payload);
        toast.success('Request created');
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error('Failed to save request');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this maintenance request?')) return;
    try {
      await maintenanceService.delete(id);
      toast.success('Request deleted');
      load();
    } catch {
      toast.error('Failed to delete request');
    }
  };

  const counts = statuses.reduce((acc, s) => {
    acc[s] = requests.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<MaintenanceStatus, number>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-orange-600" /> Maintenance Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">{requests.length} total requests</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statuses.map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </div>
              <p className="text-2xl font-bold text-gray-900">{counts[s] || 0}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'ALL' ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          All
        </button>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === s ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No requests found</p>
          </div>
        ) : filtered.map(req => {
          const cfg = STATUS_CONFIG[req.status];
          return (
            <div key={req.requestId} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
              <div className="p-2 bg-orange-50 rounded-xl shrink-0">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{req.description}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                      {req.propertyDto && <span>Property: {req.propertyDto.name}</span>}
                      {req.tenantDto && <span>Tenant: {req.tenantDto.firstName} {req.tenantDto.lastName}</span>}
                      {req.requestedDate && <span>{new Date(req.requestedDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(req)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => req.requestId && handleDelete(req.requestId)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Update Request' : 'New Maintenance Request'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Describe the maintenance issue..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select required value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">— Select Property —</option>
              {properties.map(p => <option key={p.propertyId} value={p.propertyId}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
            <select required value={selectedTenantId} onChange={e => setSelectedTenantId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">— Select Tenant —</option>
              {tenants.map(t => <option key={t.tenantId} value={t.tenantId}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as MaintenanceStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
              {statuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
