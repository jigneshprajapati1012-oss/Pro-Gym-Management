import React, { useEffect, useState } from 'react';

import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Modal } from '../../components/Modal';

import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2
} from 'lucide-react';

import api from '../../services/api';

import {
  Attendance,
  Member
} from '../../types';


export const AttendanceManagement: React.FC = () => {
  const [attendanceList, setAttendanceList] =
    useState<Attendance[]>([]);

  const [members, setMembers] =
    useState<Member[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [dateFilter, setDateFilter] =
    useState<string>(
      new Date().toISOString().split('T')[0]
    );

  const [search, setSearch] =
    useState<string>('');

  const [statusFilter, setStatusFilter] =
    useState<string>('');

  const [isMarkOpen, setIsMarkOpen] =
    useState<boolean>(false);

  const [memberCode, setMemberCode] =
    useState<string>('');

  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null);

  const [showMemberNotFound, setShowMemberNotFound] =
    useState<boolean>(false);

  const [markForm, setMarkForm] = useState({
    member_id: '',
    member_code: '',
    date: new Date().toISOString().split('T')[0],
    check_in_time: new Date().toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ),
    status: 'Present'
  });


  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const params: any = {};

      if (dateFilter) {
        params.date = dateFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const res = await api.get(
        '/attendance',
        { params }
      );

      let list: Attendance[] =
        res.data.attendance || [];

      if (search) {
        const text =
          search.toLowerCase();

        list = list.filter(a =>
          a.member_name
            .toLowerCase()
            .includes(text) ||
          a.member_code
            ?.toLowerCase()
            .includes(text)
        );
      }

      setAttendanceList(list);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const fetchMembers = async () => {
    try {
      const res =
        await api.get('/members');

      setMembers(
        res.data.members || []
      );

    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchAttendance();
    fetchMembers();
  }, [
    dateFilter,
    statusFilter,
    search
  ]);


  const findMemberByCode = (
    code: string
  ) => {
    const cleanCode =
      code.trim().toUpperCase();

    setMemberCode(cleanCode);

    setShowMemberNotFound(false);

    if (!cleanCode) {
      setSelectedMember(null);

      setMarkForm(prev => ({
        ...prev,
        member_id: '',
        member_code: ''
      }));

      return;
    }

    const foundMember =
      members.find(
        member =>
          member.member_code
            ?.toUpperCase() === cleanCode
      );

    if (foundMember) {
      setSelectedMember(foundMember);

      setMarkForm(prev => ({
        ...prev,
        member_id:
          String(foundMember.id),

        member_code:
          foundMember.member_code || cleanCode
      }));

      setShowMemberNotFound(false);

      return;
    }

    setSelectedMember(null);

    setMarkForm(prev => ({
      ...prev,
      member_id: '',
      member_code: ''
    }));

    /*
     * Only show "not found" after the
     * Member ID looks complete.
     *
     * Examples:
     * M
     * M1
     * M10
     *
     * will not show an error.
     *
     * M102
     * M999
     *
     * will be checked.
     */
    if (/^M\d{3,}$/.test(cleanCode)) {
      setShowMemberNotFound(true);
    }
  };


  const openAttendanceModal = () => {
    setMemberCode('');

    setSelectedMember(null);

    setShowMemberNotFound(false);

    setMarkForm({
      member_id: '',
      member_code: '',
      date:
        dateFilter ||
        new Date()
          .toISOString()
          .split('T')[0],

      check_in_time:
        new Date().toLocaleTimeString(
          'en-US',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        ),

      status: 'Present'
    });

    setIsMarkOpen(true);
  };


  const closeAttendanceModal = () => {
    setIsMarkOpen(false);

    setMemberCode('');

    setSelectedMember(null);

    setShowMemberNotFound(false);
  };


  const handleMarkSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!markForm.member_code) {
      alert(
        'Please enter a valid Member ID such as M101.'
      );

      return;
    }

    if (!selectedMember) {
      alert(
        'Member not found. Please check the Member ID.'
      );

      return;
    }

    try {
      await api.post(
        '/attendance',
        {
          ...markForm,
          member_code:
            markForm.member_code
        }
      );

      alert(
        `Attendance marked for ${selectedMember.member_code} - ${selectedMember.full_name}.`
      );

      setIsMarkOpen(false);

      setMemberCode('');

      setSelectedMember(null);

      setShowMemberNotFound(false);

      fetchAttendance();

    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        'Failed to mark attendance.'
      );
    }
  };


  const handleDelete = async (
    id: number
  ) => {
    if (
      !window.confirm(
        'Delete this attendance record?'
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/attendance/${id}`
      );

      fetchAttendance();

    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        'Failed to delete record.'
      );
    }
  };


  const presentCount =
    attendanceList.filter(
      a => a.status === 'Present'
    ).length;


  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <DashboardHeader
          title="Attendance Management"
          subtitle="Daily member check-in records and historical log tracking"
        />

        <main className="p-6 space-y-6">

          {/* Controls */}

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">

            <div className="flex flex-wrap items-center gap-3 flex-1">

              <div>

                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                  Filter Date
                </label>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={e =>
                    setDateFilter(
                      e.target.value
                    )
                  }
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />

              </div>


              <div className="flex-1 min-w-[200px]">

                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                  Search Attendance
                </label>

                <div className="relative">

                  <input
                    type="text"
                    placeholder="Search by name or Member ID..."
                    value={search}
                    onChange={e =>
                      setSearch(
                        e.target.value
                      )
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none"
                  />

                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                </div>

              </div>


              <div>

                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={e =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >

                  <option value="">
                    All Statuses
                  </option>

                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                </select>

              </div>

            </div>


            <div className="flex items-center gap-4">

              <div className="text-right">

                <span className="text-xs text-slate-500 block font-medium">
                  Logged Present:
                </span>

                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {presentCount}
                </span>

              </div>


              <button
                onClick={openAttendanceModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm shadow-md"
              >

                <Plus className="w-4 h-4" />

                Mark Attendance

              </button>

            </div>

          </div>


          {/* Attendance Table */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

            {loading ? (

              <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
                Loading attendance logs...
              </div>

            ) : attendanceList.length === 0 ? (

              <div className="p-12 text-center text-slate-500 space-y-3">

                <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                  No attendance records for selected date.
                </p>

                <button
                  onClick={openAttendanceModal}
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

                      <th className="p-4">
                        Member
                      </th>

                      <th className="p-4">
                        Date
                      </th>

                      <th className="p-4">
                        Check-In Time
                      </th>

                      <th className="p-4">
                        Attendance Status
                      </th>

                      <th className="p-4">
                        Marked By
                      </th>

                      <th className="p-4 text-right">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                    {attendanceList.map(a => (

                      <tr
                        key={a.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >

                        <td className="p-4">

                          <span className="font-extrabold text-rose-600 dark:text-rose-400">
                            {a.member_code}
                          </span>

                          <span className="block font-bold text-slate-900 dark:text-white">
                            {a.member_name}
                          </span>

                        </td>


                        <td className="p-4 text-slate-500">
                          {a.date}
                        </td>


                        <td className="p-4 font-mono font-semibold">
                          {a.check_in_time}
                        </td>


                        <td className="p-4">

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              a.status === 'Present'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >

                            {a.status === 'Present'
                              ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )
                              : (
                                <XCircle className="w-3.5 h-3.5" />
                              )
                            }

                            {a.status}

                          </span>

                        </td>


                        <td className="p-4 text-slate-500">
                          {a.marked_by_name || 'System Staff'}
                        </td>


                        <td className="p-4 text-right">

                          <button
                            onClick={() =>
                              handleDelete(a.id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Log"
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


          {/* MARK ATTENDANCE MODAL */}

          <Modal
            isOpen={isMarkOpen}
            onClose={closeAttendanceModal}
            title="Mark Member Attendance"
          >

            <form
              onSubmit={handleMarkSubmit}
              className="space-y-4 text-xs"
            >

              {/* Member ID */}

              <div>

                <label className="block font-bold uppercase mb-1">
                  Member ID *
                </label>

                <input
                  type="text"
                  required
                  autoFocus
                  value={memberCode}
                  onChange={e =>
                    findMemberByCode(
                      e.target.value
                    )
                  }
                  placeholder="Enter Member ID e.g. M101"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-extrabold text-base uppercase tracking-wide focus:outline-none focus:border-rose-500"
                />

                <p className="mt-1.5 text-[10px] text-slate-400">
                  Enter the member's unique ID to find the member.
                </p>

              </div>


              {/* Member Not Found */}

              {showMemberNotFound && (

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-semibold">
                  No member found with this Member ID.
                </div>

              )}


              {/* Member Found */}

              {selectedMember && (

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">

                  <div className="flex items-center justify-between">

                    <div>

                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        Member Found
                      </span>

                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {selectedMember.full_name}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {selectedMember.member_code}
                        {' • '}
                        {selectedMember.membership_type}
                      </p>

                    </div>

                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />

                  </div>

                </div>

              )}


              {/* Date & Time */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block font-bold uppercase mb-1">
                    Date *
                  </label>

                  <input
                    type="date"
                    required
                    value={markForm.date}
                    onChange={e =>
                      setMarkForm({
                        ...markForm,
                        date: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />

                </div>


                <div>

                  <label className="block font-bold uppercase mb-1">
                    Check-in Time
                  </label>

                  <input
                    type="text"
                    value={
                      markForm.check_in_time
                    }
                    onChange={e =>
                      setMarkForm({
                        ...markForm,
                        check_in_time:
                          e.target.value
                      })
                    }
                    placeholder="07:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />

                </div>

              </div>


              {/* Status */}

              <div>

                <label className="block font-bold uppercase mb-1">
                  Status
                </label>

                <select
                  value={markForm.status}
                  onChange={e =>
                    setMarkForm({
                      ...markForm,
                      status: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                >

                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                </select>

              </div>


              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">

                <button
                  type="button"
                  onClick={closeAttendanceModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !selectedMember
                  }
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold"
                >
                  Save Attendance Record
                </button>

              </div>

            </form>

          </Modal>

        </main>

      </div>

    </div>
  );
};