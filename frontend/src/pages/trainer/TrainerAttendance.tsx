import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Modal } from '../../components/Modal';
import { CalendarCheck, Plus, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { Attendance, Member } from '../../types';

export const TrainerAttendance: React.FC = () => {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [assignedMembers, setAssignedMembers] = useState<Member[]>([]);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isMarkOpen, setIsMarkOpen] = useState<boolean>(false);
  const [markForm, setMarkForm] = useState({
    member_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: 'Present'
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance', { params: { date: dateFilter } });
      setAttendanceList(res.data.attendance || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedMembers = async () => {
    try {
      const res = await api.get('/members');
      setAssignedMembers(res.data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchAssignedMembers();
  }, [dateFilter]);

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markForm.member_id) {
      alert('Please select a member.');
      return;
    }

    try {
      await api.post('/attendance', markForm);
      setIsMarkOpen(false);
      fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark attendance.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="Trainer Client Attendance" subtitle="Track daily attendance for your assigned clients" />

        <main className="p-6 space-y-6">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Filter Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>

            <button
              onClick={() => setIsMarkOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm shadow-md"
            >
              <Plus className="w-4 h-4" /> Mark Client Check-In
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading attendance logs...</div>
            ) : attendanceList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No client attendance records for this date.</p>
                <button
                  onClick={() => setIsMarkOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Mark Check-In Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Member Name</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Check-In Time</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {attendanceList.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{a.member_name}</td>
                        <td className="p-4 text-slate-500">{a.date}</td>
                        <td className="p-4 font-mono font-semibold">{a.check_in_time}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* MARK MODAL */}
          <Modal isOpen={isMarkOpen} onClose={() => setIsMarkOpen(false)} title="Mark Client Attendance">
            <form onSubmit={handleMarkSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Select Client *</label>
                <select
                  required
                  value={markForm.member_id}
                  onChange={e => setMarkForm({ ...markForm, member_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  <option value="">-- Select Assigned Member --</option>
                  {assignedMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name} ({m.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={markForm.date}
                    onChange={e => setMarkForm({ ...markForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={markForm.check_in_time}
                    onChange={e => setMarkForm({ ...markForm, check_in_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMarkOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </Modal>

        </main>
      </div>
    </div>
  );
};

