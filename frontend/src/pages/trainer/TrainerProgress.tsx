import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Modal } from '../../components/Modal';
import { TrendingUp, Plus, Activity, Calendar, Trash2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { FitnessProgress, Member } from '../../types';

export const TrainerProgress: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMemberId = searchParams.get('member_id') || '';

  const [assignedMembers, setAssignedMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMemberId);
  const [progressList, setProgressList] = useState<FitnessProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    member_id: initialMemberId,
    record_date: new Date().toISOString().split('T')[0],
    weight_kg: '75',
    height_cm: '175',
    body_fat_pct: '',
    chest_in: '',
    waist_in: '',
    biceps_in: '',
    notes: ''
  });

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      const list: Member[] = res.data.members || [];
      setAssignedMembers(list);
      if (!selectedMemberId && list.length > 0) {
        setSelectedMemberId(String(list[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProgress = async () => {
    if (!selectedMemberId) return;
    try {
      setLoading(true);
      const res = await api.get('/progress', { params: { member_id: selectedMemberId } });
      setProgressList(res.data.progress || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [selectedMemberId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id) {
      alert('Please select a member.');
      return;
    }

    try {
      await api.post('/progress', formData);
      setIsAddOpen(false);
      fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add progress record.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this progress record?')) return;
    try {
      await api.delete(`/progress/${id}`);
      fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete record.');
    }
  };

  const selectedMemberName = assignedMembers.find(m => String(m.id) === selectedMemberId)?.full_name || 'Client';

  // Format chart data sorted chronologically
  const chartData = [...progressList].reverse().map(p => ({
    date: p.record_date,
    weight: p.weight_kg,
    bmi: p.bmi
  }));

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="Fitness Progress Monitoring" subtitle="Track member body weight, BMI trend, and body girth measurements" />

        <main className="p-6 space-y-6">
          
          {/* Top Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase text-slate-500">Select Client:</label>
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
              >
                {assignedMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, member_id: selectedMemberId }));
                setIsAddOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm shadow-md"
            >
              <Plus className="w-4 h-4" /> Record Body Metrics
            </button>
          </div>

          {/* Progress Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Weight & BMI Progression: {selectedMemberName}</h3>
                <p className="text-xs text-slate-500">Visual trend over recorded check-ins</p>
              </div>
            </div>

            <div className="h-64 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                  No progress logs recorded yet for this client.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#f43f5e" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                    <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="bmi" name="BMI" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Progress Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm">
              Historical Check-In Logs ({progressList.length})
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading progress logs...</div>
            ) : progressList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No records found. Click "Record Body Metrics" above to add.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Record Date</th>
                      <th className="p-3">Weight (kg)</th>
                      <th className="p-3">Height (cm)</th>
                      <th className="p-3">BMI Score</th>
                      <th className="p-3">Body Fat %</th>
                      <th className="p-3">Chest / Waist / Biceps</th>
                      <th className="p-3">Trainer Notes</th>
                      <th className="p-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {progressList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{p.record_date}</td>
                        <td className="p-3 font-bold text-rose-600 dark:text-rose-400">{p.weight_kg} kg</td>
                        <td className="p-3 text-slate-500">{p.height_cm} cm</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800">{p.bmi}</span>
                        </td>
                        <td className="p-3 text-slate-500">{p.body_fat_pct ? `${p.body_fat_pct}%` : '-'}</td>
                        <td className="p-3 text-slate-500">
                          {p.chest_in ? `${p.chest_in}"` : '-'}/
                          {p.waist_in ? `${p.waist_in}"` : '-'}/
                          {p.biceps_in ? `${p.biceps_in}"` : '-'}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">{p.notes || '-'}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ADD PROGRESS MODAL */}
          <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={`Log Body Metrics: ${selectedMemberName}`}>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight_kg}
                    onChange={e => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.height_cm}
                    onChange={e => setFormData({ ...formData, height_cm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.body_fat_pct}
                    onChange={e => setFormData({ ...formData, body_fat_pct: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Record Date</label>
                  <input
                    type="date"
                    value={formData.record_date}
                    onChange={e => setFormData({ ...formData, record_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Chest (in)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.chest_in}
                    onChange={e => setFormData({ ...formData, chest_in: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Waist (in)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.waist_in}
                    onChange={e => setFormData({ ...formData, waist_in: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Biceps (in)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.biceps_in}
                    onChange={e => setFormData({ ...formData, biceps_in: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Trainer Observations & Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Bench press strength increased, stamina improved..."
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
                  Save Progress Record
                </button>
              </div>
            </form>
          </Modal>

        </main>
      </div>
    </div>
  );
};

