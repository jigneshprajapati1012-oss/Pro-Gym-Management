import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Modal } from '../../components/Modal';
import { Search, Eye, Activity, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { Member } from '../../types';

export const TrainerMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [memberDetails, setMemberDetails] = useState<any>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/members', { params: { search } });
      setMembers(res.data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const handleViewDetails = async (m: Member) => {
    try {
      const res = await api.get(`/members/${m.id}`);
      setMemberDetails(res.data);
      setIsViewOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="My Assigned Members" subtitle="Client roster, fitness observations, and individual health history" />

        <main className="p-6 space-y-6">
          
          {/* Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search assigned member by name, phone, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{members.length}</strong> Assigned Client(s)
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading assigned members...</div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No members currently assigned to you.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Member Name</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Membership Plan</th>
                      <th className="p-4">Expiry Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">View History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={m.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={m.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{m.full_name}</span>
                          </div>
                        </td>

                        <td className="p-4 text-slate-500">{m.phone}</td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{m.membership_type}</td>
                        <td className="p-4 text-slate-500">{m.expiry_date}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            m.payment_status === 'Paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {m.payment_status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleViewDetails(m)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* VIEW DETAILS MODAL */}
          <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Client Health & Attendance File" maxWidth="max-w-2xl">
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
                    <p className="text-xs text-slate-500 mt-1">Emergency Contact: {memberDetails.member.emergency_contact || 'N/A'}</p>
                  </div>
                </div>

                {/* Fitness Observations / Progress History */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Fitness Progress Observations</h4>
                  {memberDetails.progress.length === 0 ? (
                    <p className="text-slate-400 italic">No fitness measurements logged yet for this member.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden p-3 bg-slate-50 dark:bg-slate-950">
                      {memberDetails.progress.map((p: any) => (
                        <div key={p.id} className="py-2 space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>Date: {p.record_date}</span>
                            <span className="text-rose-500">BMI: {p.bmi} (Wt: {p.weight_kg}kg, Ht: {p.height_cm}cm)</span>
                          </div>
                          {p.notes && <p className="text-slate-500">{p.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attendance Log */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Recent Attendance Logs</h4>
                  {memberDetails.attendance.length === 0 ? (
                    <p className="text-slate-400 italic">No attendance records logged.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden p-3">
                      {memberDetails.attendance.map((a: any) => (
                        <div key={a.id} className="py-1.5 flex justify-between">
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

        </main>
      </div>
    </div>
  );
};

