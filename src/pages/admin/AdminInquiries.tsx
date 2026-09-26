import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Trash2, CheckCircle2, Inbox, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { ContactInquiry } from '../../types';
import { useStudio } from '../../context/StudioContext';

export const AdminInquiries: React.FC = () => {
  const { showToast } = useStudio();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      const data = await api.getInquiries();
      setInquiries(data);
    } catch (err: any) {
      showToast(err.message || 'Error loading inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: 'new' | 'reviewed' | 'contacted' | 'archived'
  ) => {
    try {
      await api.updateInquiryStatus(id, status);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
      }
      showToast(`Inquiry status updated to ${status}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInquiry(id);
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      setDeleteConfirmId(null);
      showToast('Inquiry deleted');
    } catch (err: any) {
      showToast(err.message || 'Error deleting inquiry', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <span className="text-xs font-mono uppercase text-[#E2B714]">
          Client Leads & RFPs
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Project Inquiries ({inquiries.length})
        </h1>
        <p className="text-xs text-neutral-400">
          Review incoming project briefs, client budgets, target delivery dates, and direct contact channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inquiries List */}
        <div className="lg:col-span-6 space-y-3">
          {inquiries.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 bg-[#0C0E16] border border-white/10">
              No project briefs in the inbox yet.
            </div>
          ) : (
            inquiries.map((inq) => {
              const isSelected = selectedInquiry?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`p-5 bg-[#0C0E16] border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-[#E2B714] bg-white/[0.04]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {inq.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                        inq.status === 'new'
                          ? 'bg-[#E2B714]/20 text-[#E2B714]'
                          : inq.status === 'contacted'
                          ? 'bg-emerald-950/60 text-emerald-400'
                          : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 font-mono flex items-center justify-between">
                    <span>{inq.service}</span>
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {inq.description}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Detail View */}
        <div className="lg:col-span-6">
          {selectedInquiry ? (
            <div className="p-6 sm:p-8 bg-[#0C0E16] border border-white/10 space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display font-bold text-white text-xl">
                    {selectedInquiry.name}
                  </h3>
                  {selectedInquiry.company && (
                    <span className="text-xs text-neutral-400 font-mono block">
                      {selectedInquiry.company}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedInquiry.id,
                        e.target.value as any
                      )
                    }
                    className="bg-[#151722] border border-white/10 px-2.5 py-1 text-xs text-white font-mono"
                  >
                    <option value="new">NEW</option>
                    <option value="reviewed">REVIEWED</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="archived">ARCHIVED</option>
                  </select>
                  <button
                    onClick={() => setDeleteConfirmId(selectedInquiry.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scoping Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-white/[0.02] p-4 border border-white/5">
                <div>
                  <span className="text-neutral-500 block mb-0.5">Service Requested</span>
                  <span className="text-[#E2B714] font-bold">{selectedInquiry.service}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">Target Budget</span>
                  <span className="text-white">{selectedInquiry.budget || 'Undisclosed'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">Timeline</span>
                  <span className="text-white">{selectedInquiry.timeline || 'Flexible'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">Received Date</span>
                  <span className="text-neutral-300">
                    {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-neutral-400 block">
                  Project Brief & Objectives
                </span>
                <p className="text-xs text-neutral-300 bg-white/[0.02] p-4 border border-white/5 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.description}
                </p>
              </div>

              {/* Direct Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding%20Your%20Inquiry%20%E2%80%94%20Durman%20Nasar%20Studio`}
                  className="px-4 py-2.5 bg-white text-black hover:bg-[#E2B714] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email ({selectedInquiry.email})</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Client</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-neutral-500 bg-[#0C0E16] border border-white/10">
              Select an inquiry on the left to inspect its detailed parameters and reply.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#12141F] border border-red-500/40 p-6 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-white text-base">
              Delete Lead Inquiry?
            </h3>
            <p className="text-xs text-neutral-300">
              Are you sure you want to permanently delete this inquiry record?
            </p>
            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold uppercase text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
