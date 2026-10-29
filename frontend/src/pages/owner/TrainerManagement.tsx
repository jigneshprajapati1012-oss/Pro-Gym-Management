import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Modal } from '../../components/Modal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { UserCheck, Plus, Search, Users, Edit, Trash2, ShieldCheck, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import { Trainer, Member } from '../../types';

export const TrainerManagement: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [assignedMemberIds, setAssignedMemberIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'trainer123',
    phone: '',
    specialization: 'Bodybuilding & Fitness',
    experience_years: '3',
    joining_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    bio: '',
    photo_url: ''
  });

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainers', { params: { search } });
      setTrainers(res.data.trainers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const res = await api.get('/members');
      setAllMembers(res.data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrainers();
    fetchAllMembers();
  }, [search]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/trainers', formData);
      setIsAddOpen(false);
      resetForm();
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create trainer.');
    }
  };

  const handleEditOpen = (t: Trainer) => {
    setSelectedTrainer(t);
    setFormData({
      name: t.name,
      email: t.email,
      password: '',
      phone: t.phone || '',
      specialization: t.specialization,
      experience_years: String(t.experience_years),
      joining_date: t.joining_date || '',
      status: t.status,
      bio: t.bio || '',
      photo_url: t.photo_url || ''
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;
    try {
      await api.put(`/trainers/${selectedTrainer.id}`, formData);
      setIsEditOpen(false);
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update trainer.');
    }
  };

  const handleAssignOpen = async (t: Trainer) => {
    setSelectedTrainer(t);
    try {
      const res = await api.get(`/trainers/${t.id}`);
      const ids = (res.data.assignedMembers || []).map((m: Member) => m.id);
      setAssignedMemberIds(ids);
      setIsAssignOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSave = async () => {
    if (!selectedTrainer) return;
    try {
      await api.post(`/trainers/${selectedTrainer.id}/assign-members`, { memberIds: assignedMemberIds });
      setIsAssignOpen(false);
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign members.');
    }
  };

  const toggleMemberCheckbox = (id: number) => {
    setAssignedMemberIds(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTrainer) return;
    try {
      await api.delete(`/trainers/${selectedTrainer.id}`);
      setIsDeleteOpen(false);
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete trainer.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: 'trainer123',
      phone: '',
      specialization: 'Bodybuilding & Fitness',
      experience_years: '3',
      joining_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      bio: '',
      photo_url: ''
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="Trainer Management" subtitle="Manage trainer profiles, login accounts, and member assignments" />

        <main className="p-6 space-y-6">
          
          {/* Action Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search trainer by name, email, or specialty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => { resetForm(); setIsAddOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Trainer Staff
            </button>
          </div>

          {/* Trainers Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium animate-pulse">Loading trainers staff list...</div>
          ) : trainers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No trainers found in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainers.map(t => (
                <div
                  key={t.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={t.photo_url || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300'}
                        alt={t.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-500"
                      />
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">{t.name}</h3>
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{t.specialization}</span>
                        <span className="text-[11px] text-slate-400 block">{t.experience_years} Years Experience</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.phone || 'No phone'}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Assigned Members:</span>
                      <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">{t.assigned_members_count || 0}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleAssignOpen(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" /> Assign Members
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditOpen(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
                        title="Edit Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedTrainer(t); setIsDeleteOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        title="Delete Trainer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ADD TRAINER MODAL */}
          <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Trainer Account">
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Trainer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="suresh@SFW THE GYM.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Bodybuilding & HIIT"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
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
                  Create Trainer Staff
                </button>
              </div>
            </form>
          </Modal>

          {/* EDIT TRAINER MODAL */}
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Trainer: ${selectedTrainer?.name}`}>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Trainer Full Name</label>
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
                  <label className="block font-bold uppercase mb-1">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
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
                  Save Profile Changes
                </button>
              </div>
            </form>
          </Modal>

          {/* ASSIGN MEMBERS MODAL */}
          <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title={`Assign Members to ${selectedTrainer?.name}`} maxWidth="max-w-xl">
            <div className="space-y-4 text-xs">
              <p className="text-slate-500">Check members you want assigned to {selectedTrainer?.name}:</p>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl p-2">
                {allMembers.map(m => {
                  const isChecked = assignedMemberIds.includes(m.id);
                  return (
                    <label key={m.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded cursor-pointer">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{m.full_name}</span>
                        <span className="text-slate-400 text-[11px]">{m.phone} | {m.membership_type} Plan</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMemberCheckbox(m.id)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSave}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Save Member Assignments ({assignedMemberIds.length})
                </button>
              </div>
            </div>
          </Modal>

          <ConfirmationModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Trainer Staff Account"
            message={`Are you sure you want to remove trainer ${selectedTrainer?.name}? All member assignments will be unassigned.`}
          />

        </main>
      </div>
    </div>
  );
};

