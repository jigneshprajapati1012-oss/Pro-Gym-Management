import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Modal } from '../../components/Modal';
import { ReceiptModal } from '../../components/ReceiptModal';
import { DollarSign, Plus, Search, Filter, Printer, CreditCard, CheckCircle2, Clock, Trash2, Edit } from 'lucide-react';
import api from '../../services/api';
import { Payment, Member } from '../../types';

export const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, pendingAmount: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    member_id: '',
    amount: '1500',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    membership_plan: 'Monthly',
    status: 'Completed',
    notes: ''
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.payment_method = methodFilter;

      const res = await api.get('/payments', { params });
      setPayments(res.data.payments || []);
      setSummary(res.data.summary || { totalRevenue: 0, pendingAmount: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, [search, statusFilter, methodFilter]);

  const handleMemberSelect = (mId: string) => {
    const member = members.find(m => String(m.id) === mId);
    if (member) {
      let price = '1500';
      if (member.membership_type === 'Quarterly') price = '4000';
      if (member.membership_type === 'Half-Yearly') price = '7000';
      if (member.membership_type === 'Annual') price = '12000';

      setPaymentForm(prev => ({
        ...prev,
        member_id: mId,
        membership_plan: member.membership_type,
        amount: price
      }));
    } else {
      setPaymentForm(prev => ({ ...prev, member_id: mId }));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.member_id) {
      alert('Please select a member.');
      return;
    }

    try {
      const res = await api.post('/payments', paymentForm);
      setIsAddOpen(false);
      fetchPayments();
      // Ask to print receipt
      if (res.data.paymentId) {
        setSelectedPaymentId(res.data.paymentId);
        setIsReceiptOpen(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record payment.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this payment transaction record?')) return;
    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete payment.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="Financial & Payment Management" subtitle="Track member subscription fees, payment receipts, and revenue summary" />

        <main className="p-6 space-y-6">
          
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Collected Revenue</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{summary.totalRevenue.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">Completed</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Dues & Invoices</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-amber-500">
                  ₹{summary.pendingAmount.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">Pending</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Record New Income</span>
                <p className="text-xs text-slate-400">Collect fee or issue invoice</p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-xs shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Payment
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search payment by member name, phone, or transaction ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>

              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              >
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

          </div>

          {/* Payments Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading transaction records...</div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No payment transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Txn ID</th>
                      <th className="p-4">Member Name</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Amount (₹)</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Receipt / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-rose-600 dark:text-rose-400">{p.transaction_id}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{p.member_name}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{p.membership_plan}</td>
                        <td className="p-4 font-bold text-sm">₹{p.amount.toLocaleString()}</td>
                        <td className="p-4 text-slate-500">{p.payment_date}</td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{p.payment_method}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            p.status === 'Completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedPaymentId(p.id); setIsReceiptOpen(true); }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-xs font-semibold transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                              title="Delete Record"
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

          {/* ADD PAYMENT MODAL */}
          <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record New Payment Transaction">
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Select Member *</label>
                <select
                  required
                  value={paymentForm.member_id}
                  onChange={e => handleMemberSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.phone}) - {m.membership_type} Plan
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Payment Method *</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Status</label>
                  <select
                    value={paymentForm.status}
                    onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Record Payment & Issue Receipt
                </button>
              </div>
            </form>
          </Modal>

          {/* OFFICIAL RECEIPT PRINT MODAL */}
          <ReceiptModal
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
            paymentId={selectedPaymentId}
          />

        </main>
      </div>
    </div>
  );
};

