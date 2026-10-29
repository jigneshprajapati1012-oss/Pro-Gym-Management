import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import {
  Mail,
  Phone,
  Calendar,
  Eye,
  Trash2,
  X,
  CheckCircle2,
  Send
} from 'lucide-react';
import api from '../../services/api';

interface Query {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  replied_at: string | null;
}

export const Queries: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  const fetchQueries = async () => {
    try {
      setLoading(true);

      const response = await api.get('/queries');

      const responseData = response.data;

      const queryList = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData.queries)
          ? responseData.queries
          : [];

      setQueries(queryList);

    } catch (error) {
      console.error('Error loading inquiries:', error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await api.patch(
        `/queries/${id}/status`,
        { status }
      );

      const updatedQuery = response.data.query || response.data;

      setQueries((current) =>
        current.map((query) =>
          query.id === id ? updatedQuery : query
        )
      );

      if (selectedQuery?.id === id) {
        setSelectedQuery(updatedQuery);
      }

    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  const deleteQuery = async (id: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this inquiry?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/queries/${id}`);

      setQueries((current) =>
        current.filter((query) => query.id !== id)
      );

      setSelectedQuery(null);

    } catch (error) {
      console.error('Error deleting inquiry:', error);
    }
  };

  const openQuery = (query: Query) => {
    setSelectedQuery(query);
    setReplyMessage('');
    setReplyError('');
    setReplySuccess('');
  };

  const sendReply = async () => {
    if (!selectedQuery) {
      return;
    }

    if (!replyMessage.trim()) {
      setReplyError('Please enter a reply message.');
      return;
    }

    try {
      setSendingReply(true);
      setReplyError('');
      setReplySuccess('');

      const response = await api.post(
        `/queries/${selectedQuery.id}/reply`,
        {
          message: replyMessage.trim()
        }
      );

      const updatedQuery = response.data.query || response.data;

      setQueries((current) =>
        current.map((query) =>
          query.id === selectedQuery.id
            ? updatedQuery
            : query
        )
      );

      setSelectedQuery(updatedQuery);
      setReplyMessage('');
      setReplySuccess('Reply sent successfully.');

    } catch (error: any) {
      console.error('Error sending reply:', error);

      setReplyError(
        error.response?.data?.error ||
        'Unable to send reply. Please try again.'
      );

    } finally {
      setSendingReply(false);
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'New') {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }

    if (status === 'Read') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    }

    if (status === 'Replied') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }

    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
  };

  const newCount = queries.filter(
    (query) => query.status === 'New'
  ).length;

  const readCount = queries.filter(
    (query) => query.status === 'Read'
  ).length;

  const repliedCount = queries.filter(
    (query) => query.status === 'Replied'
  ).length;

  const closedCount = queries.filter(
    (query) => query.status === 'Closed'
  ).length;

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <DashboardHeader title="CUSTOMER INQUIRIES" />

        <main className="p-6 space-y-6">

          {/* Header */}

          <div>

            <h1 className="text-2xl font-extrabold">
              Customer Inquiries
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              View and manage questions submitted from the website contact form.
            </p>

          </div>

          {/* Status Cards */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">

              <p className="text-xs font-bold text-slate-500 uppercase">
                New
              </p>

              <p className="text-3xl font-extrabold text-blue-600 mt-2">
                {newCount}
              </p>

            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">

              <p className="text-xs font-bold text-slate-500 uppercase">
                Read
              </p>

              <p className="text-3xl font-extrabold text-amber-500 mt-2">
                {readCount}
              </p>

            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">

              <p className="text-xs font-bold text-slate-500 uppercase">
                Replied
              </p>

              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                {repliedCount}
              </p>

            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">

              <p className="text-xs font-bold text-slate-500 uppercase">
                Closed
              </p>

              <p className="text-3xl font-extrabold text-slate-600 dark:text-slate-400 mt-2">
                {closedCount}
              </p>

            </div>

          </div>

          {/* Inquiry Table */}

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

            {loading ? (

              <div className="py-20 text-center text-slate-500">
                Loading inquiries...
              </div>

            ) : queries.length === 0 ? (

              <div className="py-20 text-center">

                <Mail className="w-10 h-10 mx-auto text-slate-400 mb-3" />

                <h3 className="font-bold text-lg">
                  No inquiries yet
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Customer inquiries submitted from the website will appear here.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>

                    <tr className="border-b border-slate-200 dark:border-slate-800 text-left">

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                        Subject
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                        Date
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {queries.map((query) => (

                      <tr
                        key={query.id}
                        className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >

                        <td className="px-6 py-4">

                          <div className="font-bold">
                            {query.name}
                          </div>

                          <div className="text-xs text-slate-500 mt-1">
                            {query.email}
                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <span className="font-medium">
                            {query.subject}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2 text-slate-500">

                            <Calendar className="w-4 h-4" />

                            {new Date(
                              query.created_at
                            ).toLocaleDateString()}

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <select
                            value={query.status}
                            onChange={(e) =>
                              updateStatus(
                                query.id,
                                e.target.value
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 outline-none cursor-pointer ${getStatusClass(query.status)}`}
                          >

                            <option value="New">
                              New
                            </option>

                            <option value="Read">
                              Read
                            </option>

                            <option value="Replied">
                              Replied
                            </option>

                            <option value="Closed">
                              Closed
                            </option>

                          </select>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openQuery(query)
                              }
                              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                              title="View inquiry"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                deleteQuery(query.id)
                              }
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              title="Delete inquiry"
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

        </main>

      </div>

      {/* Inquiry Details Modal */}

      {selectedQuery && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl">

            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Inquiry Details
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Submitted on{' '}
                  {new Date(
                    selectedQuery.created_at
                  ).toLocaleString()}
                </p>

              </div>

              <button
                onClick={() => setSelectedQuery(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="p-6 space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">

                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Customer
                  </p>

                  <p className="font-bold mt-1">
                    {selectedQuery.name}
                  </p>

                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">

                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Subject
                  </p>

                  <p className="font-bold mt-1">
                    {selectedQuery.subject}
                  </p>

                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">

                    <Mail className="w-4 h-4" />

                    Email

                  </div>

                  <p className="font-medium mt-1 break-all">
                    {selectedQuery.email}
                  </p>

                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">

                    <Phone className="w-4 h-4" />

                    Phone

                  </div>

                  <p className="font-medium mt-1">
                    {selectedQuery.phone}
                  </p>

                </div>

              </div>

              <div>

                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Message
                </p>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 whitespace-pre-wrap text-sm leading-6">
                  {selectedQuery.message || 'No message provided.'}
                </div>

              </div>

              {/* Reply Section */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Reply to Customer
                  </p>

                  <span className="text-xs text-slate-500">
                    To: {selectedQuery.email}
                  </span>

                </div>

                <textarea
                  value={replyMessage}
                  onChange={(e) => {
                    setReplyMessage(e.target.value);
                    setReplyError('');
                    setReplySuccess('');
                  }}
                  placeholder="Write your reply to the customer..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  disabled={sendingReply}
                />

                {replyError && (

                  <p className="mt-2 text-sm text-red-500">
                    {replyError}
                  </p>

                )}

                {replySuccess && (

                  <p className="mt-2 text-sm text-emerald-500 flex items-center gap-1">

                    <CheckCircle2 className="w-4 h-4" />

                    {replySuccess}

                  </p>

                )}

                <div className="flex justify-end mt-3">

                  <button
                    onClick={sendReply}
                    disabled={sendingReply}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >

                    <Send className="w-4 h-4" />

                    {sendingReply
                      ? 'Sending...'
                      : 'Send Reply'}

                  </button>

                </div>

              </div>

              {/* Inquiry Status */}

              <div>

                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Inquiry Status
                </p>

                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() =>
                      updateStatus(
                        selectedQuery.id,
                        'New'
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-bold ${
                      selectedQuery.status === 'New'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    New
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        selectedQuery.id,
                        'Read'
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-bold ${
                      selectedQuery.status === 'Read'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Read
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        selectedQuery.id,
                        'Replied'
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-bold ${
                      selectedQuery.status === 'Replied'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Replied
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        selectedQuery.id,
                        'Closed'
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-bold ${
                      selectedQuery.status === 'Closed'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Closed
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Queries;