import React, { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, CalendarDays, DollarSign, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { leaseService } from '@/services/leaseService';
import { propertyService } from '@/services/propertyService';
import { tenantService } from '@/services/tenantService';
import { LeaseDto, PropertyDto, TenantDto } from '@/types';

const emptyLease: LeaseDto = {
  startDate: '', endDate: '', rent: 0, securityDeposit: 0,
};

export default function LeasesPage() {
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<LeaseDto>(emptyLease);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring'>('all');

  const load = async () => {
    try {
      setLoading(true);
      const [leasesData, propsData, tenantsData] = await Promise.all([
        leaseService.getAll(),
        propertyService.getAll(),
        tenantService.getAll(),
      ]);
      setLeases(leasesData);
      setProperties(propsData);
      setTenants(tenantsData);
    } catch {
      toast.error('Failed to load leases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const filtered = leases.filter(l => {
    if (filter === 'active') return new Date(l.endDate) >= today;
    if (filter === 'expiring') {
      const end = new Date(l.endDate);
      return end >= today && end <= thirtyDaysFromNow;
    }
    return true;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !selectedTenantId) {
      toast.error('Please select a property and tenant');
      return;
    }
    setSaving(true);
    const payload: LeaseDto = {
      ...form,
      propertyDto: { propertyId: Number(selectedPropertyId) } as PropertyDto,
      tenantDto: { tenantId: Number(selectedTenantId) } as TenantDto,
    };
    try {
      await leaseService.create(payload);
      toast.success('Lease created');
      setModalOpen(false);
      load();
    } catch {
      toast.error('Failed to create lease');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lease?')) return;
    try {
      await leaseService.delete(id);
      toast.success('Lease deleted');
      load();
    } catch {
      toast.error('Failed to delete lease');
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    return end >= today && end <= thirtyDaysFromNow;
  };

  const isExpired = (endDate: string) => new Date(endDate) < today;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-purple-600" /> Lease Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">{leases.length} total leases</p>
        </div>
        <button onClick={() => { setForm(emptyLease); setSelectedPropertyId(''); setSelectedTenantId(''); setModalOpen(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Lease
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'expiring'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f === 'expiring' ? 'Expiring Soon' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading leases...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No leases found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rent</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(lease => {
                const expired = isExpired(lease.endDate);
                const expiring = !expired && isExpiringSoon(lease.endDate);
                return (
                  <tr key={lease.leaseId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-gray-900">
                          {lease.propertyDto?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        {lease.tenantDto ? `${lease.tenantDto.firstName} ${lease.tenantDto.lastName}` : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {lease.startDate} → {lease.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        {Number(lease.rent).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {expired ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>
                      ) : expiring ? (
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Expiring Soon</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => lease.leaseId && handleDelete(lease.leaseId)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Lease" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select required value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">— Select Property —</option>
              {properties.map(p => <option key={p.propertyId} value={p.propertyId}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
            <select required value={selectedTenantId} onChange={e => setSelectedTenantId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">— Select Tenant —</option>
              {tenants.map(t => <option key={t.tenantId} value={t.tenantId}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input required type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input required type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (USD)</label>
              <input required type="number" min="0" step="0.01" value={form.rent}
                onChange={e => setForm(f => ({ ...f, rent: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (USD)</label>
              <input required type="number" min="0" step="0.01" value={form.securityDeposit}
                onChange={e => setForm(f => ({ ...f, securityDeposit: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Lease'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
