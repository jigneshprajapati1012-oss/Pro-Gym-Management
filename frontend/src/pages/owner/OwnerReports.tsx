import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import {
  Download,
  Printer,
  Users,
  DollarSign,
  CalendarCheck,
  UserCheck,
  Search,
  X
} from 'lucide-react';
import api from '../../services/api';

export const OwnerReports: React.FC = () => {
  const [reportType, setReportType] = useState<
    'members' | 'revenue' | 'attendance' | 'trainers'
  >('members');

  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    totalRecords: 0,
    attendanceRate: 0
  });

  const fetchReport = async () => {
    try {
      setLoading(true);

      const params: any = {
        type: reportType
      };

      if (reportType === 'attendance') {
        if (selectedDate) {
          params.date = selectedDate;
        } else {
          if (fromDate) {
            params.from = fromDate;
          }

          if (toDate) {
            params.to = toDate;
          }
        }
      }

      const res = await api.get('/reports/export', {
        params
      });

      setReportData(res.data.report || []);

      if (reportType === 'attendance') {
        setAttendanceSummary(
          res.data.summary || {
            present: 0,
            absent: 0,
            totalRecords: 0,
            attendanceRate: 0
          }
        );
      }

    } catch (err) {
      console.error('Error loading report:', err);
      setReportData([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === 'attendance') {
      setSelectedDate('');
      setFromDate('');
      setToDate('');

      setReportData([]);

      setAttendanceSummary({
        present: 0,
        absent: 0,
        totalRecords: 0,
        attendanceRate: 0
      });

      setLoading(false);
    } else {
      fetchReport();
    }
  }, [reportType]);


  const searchAttendance = () => {
    if (!selectedDate && !fromDate && !toDate) {
      setReportData([]);

      setAttendanceSummary({
        present: 0,
        absent: 0,
        totalRecords: 0,
        attendanceRate: 0
      });

      return;
    }

    fetchReport();
  };


const clearAttendanceFilters = () => {
  setSelectedDate('');
  setFromDate('');
  setToDate('');

  setReportData([]);

  setAttendanceSummary({
    present: 0,
    absent: 0,
    totalRecords: 0,
    attendanceRate: 0
  });
};


  const downloadCSV = () => {
    if (reportData.length === 0) return;

    const headers = Object.keys(reportData[0]).join(',');

    const rows = reportData.map(obj =>
      Object.values(obj)
        .map(val =>
          `"${String(val ?? '').replace(/"/g, '""')}"`
        )
        .join(',')
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement('a');

    link.setAttribute('href', encodedUri);

    link.setAttribute(
      'download',
      `SFW THE GYM_${reportType}_report_${new Date()
        .toISOString()
        .split('T')[0]}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };


  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <DashboardHeader
          title="Gym Performance Reports"
          subtitle="Generate, analyze, and export operational reports"
        />

        <main className="p-6 space-y-6">

          {/* Report Tabs */}

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">

            <div className="flex flex-wrap items-center gap-2">

              <button
                onClick={() => setReportType('members')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  reportType === 'members'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Member Report
              </button>


              <button
                onClick={() => setReportType('revenue')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  reportType === 'revenue'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Revenue Report
              </button>


              <button
                onClick={() => setReportType('attendance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  reportType === 'attendance'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                Attendance Report
              </button>


              <button
                onClick={() => setReportType('trainers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  reportType === 'trainers'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Trainer Report
              </button>

            </div>


            <div className="flex items-center gap-3">

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                Print View
              </button>


              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
              >
                <Download className="w-4 h-4" />
                Export CSV Data
              </button>

            </div>

          </div>


          {/* Attendance Filters */}

          {reportType === 'attendance' && (

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">

              <div className="flex items-center justify-between mb-4">

                <div>
                  <h3 className="font-bold text-base">
                    Attendance Search
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Search attendance for a specific date or date range.
                  </p>
                </div>

              </div>


              <div className="flex flex-wrap items-end gap-4">

                <div>
                  <label className="block text-xs font-bold mb-2">
                    Specific Date
                  </label>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => {
                      setSelectedDate(e.target.value);

                      if (e.target.value) {
                        setFromDate('');
                        setToDate('');
                      }
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>


                <div className="text-xs font-bold text-slate-400 pb-2">
                  OR
                </div>


                <div>
                  <label className="block text-xs font-bold mb-2">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    disabled={!!selectedDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm disabled:opacity-50"
                  />
                </div>


                <div>
                  <label className="block text-xs font-bold mb-2">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    disabled={!!selectedDate}
                    onChange={e => setToDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm disabled:opacity-50"
                  />
                </div>


                <button
                  onClick={searchAttendance}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>


                <button
                  onClick={clearAttendanceFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>

              </div>

            </div>

          )}


          {/* Attendance Summary */}

          {reportType === 'attendance' && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">

                <p className="text-xs font-bold uppercase text-slate-500">
                  Present
                </p>

                <p className="text-3xl font-bold mt-2">
                  {attendanceSummary.present}
                </p>

              </div>


              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">

                <p className="text-xs font-bold uppercase text-slate-500">
                  Absent
                </p>

                <p className="text-3xl font-bold mt-2">
                  {attendanceSummary.absent}
                </p>

              </div>


              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">

                <p className="text-xs font-bold uppercase text-slate-500">
                  Total Records
                </p>

                <p className="text-3xl font-bold mt-2">
                  {attendanceSummary.totalRecords}
                </p>

              </div>


              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">

                <p className="text-xs font-bold uppercase text-slate-500">
                  Attendance Rate
                </p>

                <p className="text-3xl font-bold mt-2">
                  {attendanceSummary.attendanceRate}%
                </p>

              </div>

            </div>

          )}


          {/* Report Table */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4">

            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">

              <h3 className="font-bold text-base uppercase text-slate-900 dark:text-white">
                {reportType.toUpperCase()} SYSTEM REPORT ({reportData.length} Records)
              </h3>

              <span className="text-xs text-slate-400">
                Generated: {new Date().toLocaleDateString()}
              </span>

            </div>


            {loading ? (

              <div className="py-12 text-center text-slate-500 font-medium animate-pulse">
                Generating report data...
              </div>

            ) : reportData.length === 0 ? (

              <div className="py-12 text-center text-slate-500 font-medium">
                No records found for this report type.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left text-xs">

                  <thead className="bg-slate-100 dark:bg-slate-800/60 font-bold uppercase text-slate-600 dark:text-slate-300">

                    <tr>

                      {Object.keys(reportData[0]).map(col => (
                        <th
                          key={col}
                          className="p-3 capitalize"
                        >
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                    {reportData.map((row, rIdx) => (

                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >

                        {Object.values(row).map(
                          (val: any, cIdx) => (

                            <td
                              key={cIdx}
                              className="p-3 font-medium text-slate-800 dark:text-slate-200"
                            >
                              {String(val ?? '-')}
                            </td>

                          )
                        )}

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
};