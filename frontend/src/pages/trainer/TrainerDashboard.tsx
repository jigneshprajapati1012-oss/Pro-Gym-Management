import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Users, CalendarCheck, TrendingUp, AlertTriangle, ChevronRight, Activity, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Member } from '../../types';

export const TrainerDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [assignedMembers, setAssignedMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reportRes, membersRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/members')
      ]);

      setStats(reportRes.data);
      setAssignedMembers(membersRes.data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="TRAINER'S  WORKSTATION" />

        <main className="p-6 space-y-8">
          
          {loading || !stats ? (
            <div className="py-20 text-center text-slate-500 font-medium animate-pulse">Loading trainer workstation...</div>
          ) : (
            <>
              {/* Stat Cards Grid (Strictly NO revenue/payments!) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Members</span>
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold block">{stats.assignedMembersCount}</span>
                  <span className="text-xs text-slate-500">Clients under your guidance</span>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Client Attendance</span>
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 block">{stats.todayAttendanceCount}</span>
                  <span className="text-xs text-slate-500">Checked in today</span>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Expiries</span>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold text-amber-500 block">{stats.expiringMembersCount}</span>
                  <span className="text-xs text-slate-500">Expiring in &lt; 7 days</span>
                </div>

              </div>

              {/* Quick Actions Bar */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm">Quick Trainer Workstation Actions</h4>
                  <p className="text-xs text-slate-500">Record measurements or log daily check-ins for assigned clients</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/trainer/attendance"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
                  >
                    <CalendarCheck className="w-4 h-4" /> Mark Attendance
                  </Link>
                  <Link
                    to="/trainer/progress"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                  >
                    <TrendingUp className="w-4 h-4" /> Log Body Metrics
                  </Link>
                </div>
              </div>

              {/* Assigned Members Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Assigned Client Roster</h3>
                  <Link to="/trainer/members" className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1">
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {assignedMembers.length === 0 ? (
                  <p className="text-slate-500 text-xs py-6 text-center">No members currently assigned to you by gym owner.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase">
                        <tr>
                          <th className="p-3">Member Name</th>
                          <th className="p-3">Contact</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Expiry Date</th>
                          <th className="p-3 text-right">Log Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {assignedMembers.map(m => (
                          <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{m.full_name}</td>
                            <td className="p-3 text-slate-500">{m.phone}</td>
                            <td className="p-3 font-medium">{m.membership_type}</td>
                            <td className="p-3 text-slate-500">{m.expiry_date}</td>
                            <td className="p-3 text-right">
                              <Link
                                to={`/trainer/progress?member_id=${m.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100"
                              >
                                <Activity className="w-3.5 h-3.5" />
                                <span>Record Progress</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </>
          )}

        </main>
      </div>
    </div>
  );
};

