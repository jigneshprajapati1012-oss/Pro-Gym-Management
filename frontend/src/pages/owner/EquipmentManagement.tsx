import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Modal } from '../../components/Modal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Dumbbell, Plus, Search, Filter, Wrench, AlertTriangle, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Equipment } from '../../types';

export const EquipmentManagement: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [alerts, setAlerts] = useState({ needs_maintenance: 0, under_repair: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Strength',
    quantity: '1',
    purchase_date: new Date().toISOString().split('T')[0],
    condition: 'Good',
    maintenance_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Working',
    notes: ''
  });

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/equipment', { params });
      setEquipmentList(res.data.equipment || []);
      setAlerts(res.data.alerts || { needs_maintenance: 0, under_repair: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [search, categoryFilter, statusFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/equipment', formData);
      setIsAddOpen(false);
      resetForm();
      fetchEquipment();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add equipment.');
    }
  };

  const handleEditOpen = (eq: Equipment) => {
    setSelectedEq(eq);
    setFormData({
      name: eq.name,
      category: eq.category,
      quantity: String(eq.quantity),
      purchase_date: eq.purchase_date || '',
      condition: eq.condition,
      maintenance_date: eq.maintenance_date || '',
      status: eq.status,
      notes: eq.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEq) return;
    try {
      await api.put(`/equipment/${selectedEq.id}`, formData);
      setIsEditOpen(false);
      fetchEquipment();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update equipment.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEq) return;
    try {
      await api.delete(`/equipment/${selectedEq.id}`);
      setIsDeleteOpen(false);
      fetchEquipment();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete equipment.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Strength',
      quantity: '1',
      purchase_date: new Date().toISOString().split('T')[0],
      condition: 'Good',
      maintenance_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Working',
      notes: ''
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="Gym Equipment Management" subtitle="Inventory tracking, machine conditions, and maintenance schedule" />

        <main className="p-6 space-y-6">
          
          {/* Maintenance Alert Bar */}
          {(alerts.needs_maintenance > 0 || alerts.under_repair > 0) && (
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-sky-500 shrink-0" />
                <div>
                  <span className="font-bold text-sm">Equipment Maintenance Alert</span>
                  <p className="text-xs text-sky-700 dark:text-sky-400">
                    {alerts.needs_maintenance} item(s) require scheduled maintenance, and {alerts.under_repair} item(s) are currently under repair.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search equipment by name or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              >
                <option value="">All Categories</option>
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Free Weights">Free Weights</option>
                <option value="Accessories">Accessories</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="Working">Working</option>
                <option value="Needs Maintenance">Needs Maintenance</option>
                <option value="Under Repair">Under Repair</option>
              </select>

              <button
                onClick={() => { resetForm(); setIsAddOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Equipment
              </button>
            </div>

          </div>

          {/* Equipment Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading equipment inventory...</div>
            ) : equipmentList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No equipment items found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Equipment Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Condition</th>
                      <th className="p-4">Next Maintenance</th>
                      <th className="p-4">Operational Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {equipmentList.map(eq => (
                      <tr key={eq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          <span>{eq.name}</span>
                          {eq.notes && <span className="block text-[11px] text-slate-400 font-normal mt-0.5">{eq.notes}</span>}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{eq.category}</td>
                        <td className="p-4 font-bold text-sm">{eq.quantity}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md font-bold text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {eq.condition}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{eq.maintenance_date || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            eq.status === 'Working'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : eq.status === 'Needs Maintenance'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {eq.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditOpen(eq)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
                              title="Edit Equipment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedEq(eq); setIsDeleteOpen(true); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                              title="Delete Equipment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ADD / EDIT MODALS */}
          <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Gym Equipment Item">
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Commercial Treadmills (Pro-Form)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={e => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Working">Working</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Next Maintenance Date</label>
                  <input
                    type="date"
                    value={formData.maintenance_date}
                    onChange={e => setFormData({ ...formData, maintenance_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Maintenance Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Details on condition or repair work required..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </Modal>

          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Equipment: ${selectedEq?.name}`}>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Working">Working</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Maintenance Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Equipment Changes
                </button>
              </div>
            </form>
          </Modal>

          <ConfirmationModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Equipment Record"
            message={`Are you sure you want to remove ${selectedEq?.name} from inventory?`}
          />

        </main>
      </div>
    </div>
  );
};

