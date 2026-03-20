import React, { useEffect, useState } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { propertyService } from '@/services/propertyService';
import { ownerService } from '@/services/ownerService';
import { PropertyDto, OwnerDto, PropertyType, PropertyStatus } from '@/types';

const emptyProperty: PropertyDto = {
  name: '', address: '', type: 'APARTMENT', status: 'AVAILABLE',
};

const STATUS_COLORS: Record<PropertyStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  OCCUPIED: 'bg-blue-100 text-blue-700',
  UNDER_MAINTENANCE: 'bg-orange-100 text-orange-700',
};

const propertyTypes: PropertyType[] = ['APARTMENT', 'HOUSE', 'OFFICE', 'SHOP', 'WAREHOUSE'];
const propertyStatuses: PropertyStatus[] = ['AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE'];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [owners, setOwners] = useState<OwnerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PropertyDto | null>(null);
  const [form, setForm] = useState<PropertyDto>(emptyProperty);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [props, ownerList] = await Promise.all([propertyService.getAll(), ownerService.getAll()]);
      setProperties(props);
      setOwners(ownerList);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProperty);
    setSelectedOwnerId('');
    setModalOpen(true);
  };

  const openEdit = (p: PropertyDto) => {
    setEditing(p);
    setForm({ ...p, ownerDto: undefined });
    setSelectedOwnerId(p.ownerDto?.ownerId?.toString() || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: PropertyDto = {
      ...form,
      ownerDto: selectedOwnerId ? { ownerId: Number(selectedOwnerId) } as OwnerDto : undefined,
    };
    try {
      if (editing?.propertyId) {
        await propertyService.update(editing.propertyId, payload);
        toast.success('Property updated');
      } else {
        await propertyService.create(payload);
        toast.success('Property created');
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error('Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this property?')) return;
    try {
      await propertyService.delete(id);
      toast.success('Property deleted');
      load();
    } catch {
      toast.error('Failed to delete property');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-green-600" /> Properties
          </h1>
          <p className="text-gray-500 text-sm mt-1">{properties.length} total properties</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search properties..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-gray-400">Loading properties...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No properties found</p>
          </div>
        ) : filtered.map(p => (
          <div key={p.propertyId} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                {p.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{p.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
              <MapPin className="w-3.5 h-3.5" /> {p.address}
            </div>
            <div className="text-xs text-gray-400 mb-3">
              {p.type} {p.ownerDto && `· ${p.ownerDto.firstName} ${p.ownerDto.lastName}`}
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => openEdit(p)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => p.propertyId && handleDelete(p.propertyId)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Property' : 'Add New Property'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Hargeisa Central Apartments"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="e.g. 26 June District, Hargeisa"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PropertyType }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PropertyStatus }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                {propertyStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <select value={selectedOwnerId} onChange={e => setSelectedOwnerId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">— Select Owner —</option>
              {owners.map(o => (
                <option key={o.ownerId} value={o.ownerId}>{o.firstName} {o.lastName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
