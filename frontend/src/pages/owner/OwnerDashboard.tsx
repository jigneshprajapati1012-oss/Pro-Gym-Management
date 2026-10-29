import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import {
  Users,
  UserCheck,
  CalendarCheck,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Mail
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newQueries, setNewQueries] = useState<number>(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const res = await api.get('/reports/dashboard');
      setData(res.data);

    } catch (err) {
      console.error('Error loading owner dashboard:', err);

    } finally {
      setLoading(false);
    }
  };

  const fetchNewQueries = async () => {
    try {
      const queriesRes = await api.get('/queries');

      const queries = Array.isArray(queriesRes.data)
        ? queriesRes.data
        : queriesRes.data.queries || [];

      const pendingCount = queries.filter(
        (query: any) =>
          query.status === 'New' ||
          query.status === 'Read'
      ).length;

      setNewQueries(pendingCount);

    } catch (err) {
      console.error('Error loading customer inquiries:', err);
      setNewQueries(0);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchNewQueries();
  }, []);

  const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <DashboardHeader title="OWNER'S   MASTER    DASHBOARD" />

        <main className="p-6 space-y-8">

          {loading || !data ? (
            <div className="py-20 text-center text-slate-500 font-medium animate-pulse">
              Loading dashboard statistics...
            </div>
          ) : (
            <>

              {/* Expiry Alert Banner */}

              {data.stats.expiringCount > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />

                    <div>

                      <span className="font-bold text-sm">
                        Membership Expiry Alert
                      </span>

                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        {data.stats.expiringCount} member subscriptions expire within the next 7 days.
                      </p>

                    </div>

                  </div>

                  <Link
                    to="/admin/members?status=Pending"
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                  >
                    View Members
                  </Link>

                </div>
              )}

              {/* Stat Cards */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Total Members */}

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total Members
                    </span>

                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                      <Users className="w-5 h-5" />
                    </div>

                  </div>

                  <div className="flex items-baseline justify-between">

                    <span className="text-3xl font-extrabold">
                      {data.stats.totalMembers}
                    </span>

                    <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Live
                    </span>

                  </div>

                </div>

                {/* Active Members */}

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Active Members
                    </span>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <UserCheck className="w-5 h-5" />
                    </div>

                  </div>

                  <div className="flex items-baseline justify-between">

                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {data.stats.activeMembers}
                    </span>

                    <span className="text-xs text-slate-500">
                      {data.stats.expiredMembers} Expired
                    </span>

                  </div>

                </div>

                {/* Today's Attendance */}

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Today's Attendance
                    </span>

                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                      <CalendarCheck className="w-5 h-5" />
                    </div>

                  </div>

                  <div className="flex items-baseline justify-between">

                    <span className="text-3xl font-extrabold">
                      {data.stats.todayAttendance}
                    </span>

                    <span className="text-xs font-semibold text-sky-500">
                      Present Today
                    </span>

                  </div>

                </div>

                {/* Monthly Revenue */}

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Monthly Revenue
                    </span>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <DollarSign className="w-5 h-5" />
                    </div>

                  </div>

                  <div className="flex items-baseline justify-between">

                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{data.stats.monthlyRevenue.toLocaleString()}
                    </span>

                    <span className="text-xs text-amber-500 font-bold">
                      ₹{data.stats.pendingPayments} Pending
                    </span>

                  </div>

                </div>

              </div>

              {/* Charts */}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Revenue */}

                <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

                  <div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Monthly Revenue Breakdown
                    </h3>

                    <p className="text-xs text-slate-500">
                      Historical earnings across recent months
                    </p>

                  </div>

                  <div className="h-64 w-full">

                    <ResponsiveContainer width="100%" height="100%">

                      <BarChart data={data.charts.revenue}>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          opacity={0.1}
                        />

                        <XAxis
                          dataKey="month"
                          stroke="#94a3b8"
                          fontSize={11}
                        />

                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />

                        <Bar
                          dataKey="revenue"
                          fill="#f43f5e"
                          radius={[6, 6, 0, 0]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>

                {/* Membership Distribution */}

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

                  <div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Membership Distribution
                    </h3>

                    <p className="text-xs text-slate-500">
                      Breakdown of member plans
                    </p>

                  </div>

                  <div className="h-64 w-full flex items-center justify-center">

                    <ResponsiveContainer width="100%" height="100%">

                      <PieChart>

                        <Pie
                          data={data.charts.membershipDistribution}
                          dataKey="count"
                          nameKey="membership_type"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }: any) =>
                            `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                          }
                        >

                          {data.charts.membershipDistribution.map(
                            (entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}

                        </Pie>

                        <Tooltip />

                      </PieChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              </div>

              {/* Quick Actions and Customer Inquiries */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Quick Actions */}

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">

                  <div className="mb-4">

                    <h4 className="font-bold text-sm">
                      Quick Dashboard Management Actions
                    </h4>

                    <p className="text-xs text-slate-500">
                      Perform routine daily gym operations instantly
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-3">

                    <Link
                      to="/admin/members"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Member
                    </Link>

                    <Link
                      to="/admin/attendance"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      Mark Attendance
                    </Link>

                    <Link
                      to="/admin/payments"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      <DollarSign className="w-4 h-4" />
                      Record Payment
                    </Link>

                  </div>

                </div>

                {/* Customer Inquiries */}

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">

                  <div className="flex items-center justify-between mb-4">

                    <div className="flex items-center gap-3">

                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <Mail className="w-5 h-5" />
                      </div>

                      <div>

                        <h4 className="font-bold text-sm">
                          Customer Inquiries
                        </h4>

                        <p className="text-xs text-slate-500">
                          Questions submitted from the website
                        </p>

                      </div>

                    </div>

                    {newQueries > 0 && (
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                        {newQueries} New
                      </span>
                    )}

                  </div>

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-2xl font-extrabold">
                        {newQueries}
                      </p>

                      <p className="text-xs text-slate-500">
                        New inquiries waiting for review
                      </p>

                    </div>

                    <Link
                      to="/admin/queries"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                    >
                      View Inquiries
                    </Link>

                  </div>

                </div>

              </div>

            </>
          )}

        </main>

      </div>

    </div>
  );
};

export default OwnerDashboard;