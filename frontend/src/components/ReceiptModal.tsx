import React, { useEffect, useState } from 'react';
import { Printer, CheckCircle, Dumbbell } from 'lucide-react';
import { Modal } from './Modal';
import api from '../services/api';
import { Payment } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, paymentId }) => {
  const [receiptData, setReceiptData] = useState<{ payment: Payment; gymSettings: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      setLoading(true);
      api.get(`/payments/${paymentId}/receipt`)
        .then(res => setReceiptData(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, paymentId]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Payment Tax Receipt" maxWidth="max-w-xl">
      {loading || !receiptData ? (
        <div className="py-12 text-center text-slate-500 font-medium animate-pulse">Loading receipt data...</div>
      ) : (
        <div>
          {/* Printable Invoice Container */}
          <div id="printable-receipt" className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 text-slate-900 dark:text-slate-100">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Dumbbell className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight uppercase">
                    {receiptData.gymSettings.gym_name || 'SFW THE GYM'}
                  </h2>
                  <p className="text-xs text-slate-500">{receiptData.gymSettings.address}</p>
                  <p className="text-xs text-slate-500">Phone: {receiptData.gymSettings.phone} | GSTIN: 27AAAAA0000A1Z5</p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5" /> PAID
                </span>
                <p className="text-xs font-semibold text-slate-500 mt-2">OFFICIAL RECEIPT</p>
              </div>
            </div>

            {/* Bill Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Billed To:</span>
                <span className="font-bold text-sm block mt-0.5">{receiptData.payment.member_name}</span>
                <span className="text-slate-500 block">Phone: {receiptData.payment.member_phone || 'N/A'}</span>
                <span className="text-slate-500 block">Email: {receiptData.payment.member_email || 'N/A'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block font-medium">Invoice Info:</span>
                <span className="font-mono font-bold block mt-0.5">{receiptData.payment.transaction_id}</span>
                <span className="text-slate-500 block">Date: {receiptData.payment.payment_date}</span>
                <span className="text-slate-500 block">Method: {receiptData.payment.payment_method}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3">Description / Plan</th>
                    <th className="p-3 text-right">Tax (GST)</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3">
                      <span className="font-bold block">{receiptData.payment.membership_plan} Membership Fee</span>
                      <span className="text-slate-500 text-[11px]">Full access to gym strength & cardio areas</span>
                    </td>
                    <td className="p-3 text-right text-slate-500">Included (18%)</td>
                    <td className="p-3 text-right font-bold">₹{receiptData.payment.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                <p>Thank you for choosing SFW THE GYM!</p>
                <p className="text-[10px]">Computer generated invoice. Signature not required.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-semibold">Total Paid:</span>
                <span className="block text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  ₹{receiptData.payment.amount.toLocaleString()}
                </span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

