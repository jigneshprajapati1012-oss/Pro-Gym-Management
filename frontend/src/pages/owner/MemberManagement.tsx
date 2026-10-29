import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Modal } from '../../components/Modal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Search, Filter, Plus, Edit, Trash2, Eye, UserCheck, Calendar, Phone, Mail, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';
import { Member, Trainer } from '../../types';

export const MemberManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [trainerFilter, setTrainerFilter] = useState<string>('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberDetails, setMemberDetails] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    photo_url: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    membership_type: 'Monthly',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_status: 'Paid',
    assigned_trainer_id: '',
    notes: '',
    initial_payment_amount: '1500',
    payment_method: 'Cash'
  });

const fetchMembers = async () => {
  try {
    setLoading(true);

    const params: any = {};

    if (search) {
      params.search = search;
    }

    if (statusFilter) {
      params.status = statusFilter;
    }

    if (planFilter) {
      params.membership_type = planFilter;
    }

    if (trainerFilter) {
      params.trainer_id = trainerFilter;
    }

    console.log('Loading members with filters:', params);

    const response = await api.get('/members', { params });

    console.log('Members API response:', response.data);
    console.log('Members received:', response.data.members);

    setMembers(response.data.members || []);
  } catch (error: any) {
    console.error('Failed to load members:', error);
    console.error(
      'Server response:',
      error.response?.data
    );
  } finally {
    setLoading(false);
  }
};

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/trainers');
      setTrainers(res.data.trainers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTrainers();
  }, [search, statusFilter, planFilter, trainerFilter]);

  const handlePlanChange = (plan: string) => {
    const start = new Date(formData.start_date || Date.now());
    let days = 30;
    let price = '1500';

    if (plan === 'Quarterly') { days = 90; price = '4000'; }
    else if (plan === 'Half-Yearly') { days = 180; price = '7000'; }
    else if (plan === 'Annual') { days = 365; price = '12000'; }

    const expiry = new Date(start.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      membership_type: plan,
      expiry_date: expiry,
      initial_payment_amount: price
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/members', formData);
      setIsAddOpen(false);
      resetForm();
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add member.');
    }
  };

  const handleEditOpen = (m: Member) => {
    setSelectedMember(m);
    setFormData({
      full_name: m.full_name,
      photo_url: m.photo_url || '',
      dob: m.dob || '',
      gender: m.gender || 'Male',
      phone: m.phone,
      email: m.email || '',
      address: m.address || '',
      emergency_contact: m.emergency_contact || '',
      membership_type: m.membership_type,
      start_date: m.start_date,
      expiry_date: m.expiry_date,
      payment_status: m.payment_status,
      assigned_trainer_id: m.assigned_trainer_id ? String(m.assigned_trainer_id) : '',
      notes: m.notes || '',
      initial_payment_amount: '',
      payment_method: 'Cash'
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      await api.put(`/members/${selectedMember.id}`, formData);
      setIsEditOpen(false);
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update member.');
    }
  };

  const handleViewDetails = async (m: Member) => {
    try {
      const res = await api.get(`/members/${m.id}`);
      setMemberDetails(res.data);
      setIsViewOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;
    try {
      await api.delete(`/members/${selectedMember.id}`);
      setIsDeleteOpen(false);
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete member.');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      photo_url: '',
      dob: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      emergency_contact: '',
      membership_type: 'Monthly',
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_status: 'Paid',
      assigned_trainer_id: '',
      notes: '',
      initial_payment_amount: '1500',
      payment_method: 'Cash'
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="Member Management" subtitle="Register, update, assign trainers, and track member status" />

        <main className="p-6 space-y-6">
          
          {/* Action & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search member by name, phone, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-rose-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              >
                <option value="">All Membership Plans</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Annual">Annual</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              >
                <option value="">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select
                value={trainerFilter}
                onChange={e => setTrainerFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              >
                <option value="">All Assigned Trainers</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <button
                onClick={() => { resetForm(); setIsAddOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Member
              </button>
            </div>

          </div>

          {/* Members Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading members database...</div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No members found.</p>
                <p className="text-xs">Adjust your search query or add a new gym member.</p>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Register First Member
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Member Info</th>
                      <th className="p-4">Membership Plan</th>
                      <th className="p-4">Start / Expiry</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4">Assigned Trainer</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map(m => {
                      const isExpiringSoon = new Date(m.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                      const isExpired = new Date(m.expiry_date) < new Date();

                      return (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={m.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={m.full_name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                              <div>
                               <span className="font-bold text-sm text-slate-900 dark:text-white block">
  {m.full_name}
</span>

<span className="text-rose-600 dark:text-rose-400 font-extrabold">
  {m.member_code}
</span>

<span className="text-slate-500 block">
  {m.phone} | {m.email || 'No email'}
</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{m.membership_type}</span>
                            <span className="text-[11px] text-slate-500">Reg: {m.registration_date}</span>
                          </td>

                          <td className="p-4">
                            <span className="block font-medium">{m.start_date} to {m.expiry_date}</span>
                            {isExpired ? (
                              <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-500">Expired</span>
                            ) : isExpiringSoon ? (
                              <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-500">Expires in &lt; 7 days</span>
                            ) : (
                              <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-500">Active</span>
                            )}
                          </td>

                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              m.payment_status === 'Paid'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}>
                              {m.payment_status}
                            </span>
                          </td>

                          <td className="p-4">
                            {m.trainer_name ? (
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{m.trainer_name}</span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleViewDetails(m)}
                                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="View Member Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditOpen(m)}
                                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit Member"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setSelectedMember(m); setIsDeleteOpen(true); }}
                                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Delete Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ADD MEMBER MODAL */}
          <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Gym Member">
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. Vikram Deshmukh"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    placeholder="+91 98000 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    placeholder="member@gmail.com"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Membership Plan *</label>
                  <select
                    value={formData.membership_type}
                    onChange={e => handlePlanChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Monthly">Monthly (₹1,500)</option>
                    <option value="Quarterly">Quarterly (₹4,000)</option>
                    <option value="Half-Yearly">Half-Yearly (₹7,000)</option>
                    <option value="Annual">Annual (₹12,000)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Assigned Trainer</label>
                  <select
                    value={formData.assigned_trainer_id}
                    onChange={e => setFormData({ ...formData, assigned_trainer_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="">None (Unassigned)</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold block text-slate-900 dark:text-white">Initial Payment Collection</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.initial_payment_amount}
                      onChange={e => setFormData({ ...formData, initial_payment_amount: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Payment Method</label>
                    <select
                      value={formData.payment_method}
                      onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Status</label>
                    <select
                      value={formData.payment_status}
                      onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
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
                  Create Member Record
                </button>
              </div>
            </form>
          </Modal>

          {/* EDIT MEMBER MODAL */}
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Member: ${selectedMember?.full_name}`}>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Membership Plan</label>
                  <select
                    value={formData.membership_type}
                    onChange={e => setFormData({ ...formData, membership_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Payment Status</label>
                  <select
                    value={formData.payment_status}
                    onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Assigned Trainer</label>
                  <select
                    value={formData.assigned_trainer_id}
                    onChange={e => setFormData({ ...formData, assigned_trainer_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="">None (Unassigned)</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
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
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>

          {/* VIEW MEMBER DETAILS MODAL */}
          <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Member Master File" maxWidth="max-w-2xl">
            {memberDetails && (
              <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <img
                    src={memberDetails.member.photo_url}
                    alt={memberDetails.member.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-rose-500"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{memberDetails.member.full_name}</h3>
                    <p className="text-xs text-slate-500">{memberDetails.member.phone} | {memberDetails.member.email || 'No Email'}</p>
                    <span className="inline-block mt-1 font-semibold text-rose-500">
                      {memberDetails.member.membership_type} Plan ({memberDetails.member.start_date} to {memberDetails.member.expiry_date})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong className="block text-slate-900 dark:text-white mb-1">Emergency Contact:</strong>
                    <span>{memberDetails.member.emergency_contact || 'N/A'}</span>
                  </div>
                  <div>
                    <strong className="block text-slate-900 dark:text-white mb-1">Assigned Trainer:</strong>
                    <span>{memberDetails.member.trainer_name || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Attendance Log */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Recent Attendance Logs</h4>
                  {memberDetails.attendance.length === 0 ? (
                    <p className="text-slate-400 italic">No attendance records logged.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
                      {memberDetails.attendance.map((a: any) => (
                        <div key={a.id} className="p-2.5 flex items-center justify-between">
                          <span>{a.date} at {a.check_in_time}</span>
                          <span className="font-bold text-emerald-500">{a.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </Modal>

          {/* DELETE CONFIRMATION MODAL */}
          <ConfirmationModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Gym Member"
            message={`Are you sure you want to permanently delete member ${selectedMember?.full_name}? All payment and attendance logs for this member will also be removed.`}
          />

        </main>
      </div>
    </div>
  );
};

