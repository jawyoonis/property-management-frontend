import React, { useEffect, useState } from 'react';
import { BarChart3, Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { financialService } from '@/services/financialService';
import { propertyService } from '@/services/propertyService';
import { FinancialSummaryDto, PropertyDto } from '@/types';

export default function FinancialPage() {
  const [summaries, setSummaries] = useState<FinancialSummaryDto[]>([]);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialSummaryDto | null>(null);
  const [form, setForm] = useState({ totalRentCollected: 0, totalExpenses: 0 });
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [data, props] = await Promise.all([
        financialService.getAll(0, 50),
        propertyService.getAll(),
      ]);
      setSummaries(data.content);
      setProperties(props);
    } catch {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = summaries.reduce((sum, s) => sum + s.totalRentCollected, 0);
  const totalExpenses = summaries.reduce((sum, s) => sum + s.totalExpenses, 0);
  const totalProfit = summaries.reduce((sum, s) => sum + s.netProfit, 0);

  const openCreate = () => {
    setEditing(null);
    setForm({ totalRentCollected: 0, totalExpenses: 0 });
    setSelectedPropertyId('');
    setModalOpen(true);
  };

  const openEdit = (s: FinancialSummaryDto) => {
    setEditing(s);
    setForm({ totalRentCollected: s.totalRentCollected, totalExpenses: s.totalExpenses });
    setSelectedPropertyId(s.propertyDto?.propertyId?.toString() || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const netProfit = form.totalRentCollected - form.totalExpenses;
    const payload: FinancialSummaryDto = {
      ...form,
      netProfit,
      propertyDto: selectedPropertyId ? { propertyId: Number(selectedPropertyId) } as PropertyDto : undefined,
    };
    try {
      if (editing?.summaryId) {
        await financialService.update(editing.summaryId, payload);
        toast.success('Summary updated');
      } else {
        await financialService.create(payload);
        toast.success('Summary created');
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error('Failed to save summary');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this financial summary?')) return;
    try {
      await financialService.delete(id);
      toast.success('Summary deleted');
      load();
    } catch {
      toast.error('Failed to delete summary');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-pink-600" /> Financial Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">Portfolio financial overview</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Summary
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-xl"><DollarSign className="w-6 h-6 text-green-600" /></div>
            <span className="text-sm font-medium text-gray-500">Total Rent Collected</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" /> <span>All time revenue</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-xl"><TrendingDown className="w-6 h-6 text-red-600" /></div>
            <span className="text-sm font-medium text-gray-500">Total Expenses</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
            <TrendingDown className="w-4 h-4" /> <span>Operating costs</span>
          </div>
        </div>

        <div className={`rounded-2xl border p-6 ${totalProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <BarChart3 className={`w-6 h-6 ${totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`} />
            </div>
            <span className="text-sm font-medium text-gray-600">Net Profit</span>
          </div>
          <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
            <span>Across {summaries.length} properties</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Property Breakdown</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading financial data...</div>
        ) : summaries.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No financial summaries yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rent Collected</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expenses</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Profit</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaries.map(s => (
                <tr key={s.summaryId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-pink-500" />
                      <span className="font-medium text-gray-900">
                        {s.propertyDto?.name || `Property #${s.propertyDto?.propertyId || '—'}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-700">
                    ${s.totalRentCollected.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-600">
                    ${s.totalExpenses.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${s.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {s.netProfit >= 0 ? '+' : ''}${s.netProfit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => s.summaryId && handleDelete(s.summaryId)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-900">Totals</td>
                <td className="px-6 py-4 text-right font-bold text-green-700">${totalRevenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600">${totalExpenses.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  <span className={totalProfit >= 0 ? 'text-green-700' : 'text-red-600'}>
                    {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Financial Summary' : 'Add Financial Summary'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select required value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option value="">— Select Property —</option>
              {properties.map(p => <option key={p.propertyId} value={p.propertyId}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Rent Collected (USD)</label>
            <input required type="number" min="0" step="0.01" value={form.totalRentCollected}
              onChange={e => setForm(f => ({ ...f, totalRentCollected: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Expenses (USD)</label>
            <input required type="number" min="0" step="0.01" value={form.totalExpenses}
              onChange={e => setForm(f => ({ ...f, totalExpenses: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Net Profit (auto-calculated)</span>
              <span className={`text-lg font-bold ${form.totalRentCollected - form.totalExpenses >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                ${(form.totalRentCollected - form.totalExpenses).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
