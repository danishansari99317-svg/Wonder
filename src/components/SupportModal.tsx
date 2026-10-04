import React, { useState } from 'react';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useToast } from '../context/ToastContext';
import { useTickets } from '../context/TicketContext';
import { sendTicketDiscordNotification } from '../utils/discordWebhook';
import { X, HeartHandshake, ExternalLink, Send, CheckCircle2, MessageSquare, HelpCircle, Tag } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { config } = useStoreConfig();
  const { success, error } = useToast();
  const { addTicket } = useTickets();
  const [tab, setTab] = useState<'ticket' | 'faq'>('ticket');
  const [ign, setIgn] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [category, setCategory] = useState('Payment / Store Issue');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim()) {
      error('Please provide your Minecraft username');
      return;
    }
    if (!message.trim()) {
      error('Please describe your issue');
      return;
    }

    const newTicket = addTicket({
      ign: ign.trim(),
      contact: discordTag.trim(),
      category,
      subject: subject.trim() || `${category} - ${ign.trim()}`,
      message: message.trim(),
      priority: category.includes('Payment') ? 'high' : 'medium',
    });

    setSubmittedTicketNumber(newTicket.ticketNumber);

    // Send Discord Webhook Notification to staff channel
    sendTicketDiscordNotification(
      {
        ticketNumber: newTicket.ticketNumber,
        ign: ign.trim(),
        contact: discordTag.trim() || undefined,
        category,
        subject: subject.trim() || `${category} - ${ign.trim()}`,
        message: message.trim(),
        priority: category.includes('Payment') ? 'high' : 'medium',
      },
      config
    ).catch((err) => {
      console.warn('[Discord Ticket Notification]', err);
    });

    success(`Ticket #${newTicket.ticketNumber} submitted! Staff has been notified.`);
  };

  const handleReset = () => {
    setSubmittedTicketNumber(null);
    setMessage('');
    setSubject('');
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-2 text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors cursor-pointer"
          aria-label="Close support modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground font-display">
              {config.brand} Support
            </h2>
            <p className="text-xs text-muted-foreground">
              Have questions about your order or need in-game assistance?
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface-deep p-1 mb-5 border border-border">
          <button
            type="button"
            onClick={() => setTab('ticket')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
              tab === 'ticket' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('faq')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
              tab === 'faq' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs</span>
          </button>
        </div>

        {tab === 'ticket' ? (
          !submittedTicketNumber ? (
            <form onSubmit={handleSubmitTicket} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Minecraft IGN <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ign}
                    onChange={(e) => setIgn(e.target.value)}
                    placeholder="e.g. Steve123"
                    className="w-full rounded-xl border border-border bg-surface-deep px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Discord Username
                  </label>
                  <input
                    type="text"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    placeholder="e.g. user#1234"
                    className="w-full rounded-xl border border-border bg-surface-deep px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Issue Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-deep px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="Payment / Store Issue">Payment / Store Issue</option>
                  <option value="Rank Activation Delay">Rank Activation Delay</option>
                  <option value="In-Game Report / Bug">In-Game Report / Bug</option>
                  <option value="Other Inquiries">Other Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Subject / Short Title
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. UTR 42938472910 payment confirmation"
                  className="w-full rounded-xl border border-border bg-surface-deep px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Description of Issue <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide transaction details, UTR number, or describe what you need help with..."
                  className="w-full rounded-xl border border-border bg-surface-deep px-3 py-2 text-xs text-foreground outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-accent py-2.5 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
                <a
                  href={config.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border bg-surface-deep px-4 py-2.5 text-xs font-bold text-foreground hover:bg-white/5 transition-colors flex items-center gap-1.5"
                >
                  <span>Discord</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-success">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-foreground font-display mb-1">
                Ticket #{submittedTicketNumber} Created
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Your support request has been logged into our administration system.
              </p>
              <p className="text-[11px] text-accent font-mono mb-5">
                Our staff team will review your ticket and reach out via Discord or in-game.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl bg-accent px-5 py-2 text-xs font-black uppercase text-accent-foreground cursor-pointer"
              >
                Done
              </button>
            </div>
          )
        ) : (

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
            <div className="rounded-xl border border-border bg-surface-deep p-3">
              <h4 className="font-bold text-foreground mb-1">How fast are purchases delivered?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Most purchases activate within 5–15 minutes after submitting your UTR reference code. You must be connected to <strong>{config.serverIp}</strong> or rejoin the server.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-deep p-3">
              <h4 className="font-bold text-foreground mb-1">Can I transfer ranks to another IGN?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Rank transfers are subject to administrator approval. Please open a ticket on our official Discord server with proof of purchase.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-deep p-3">
              <h4 className="font-bold text-foreground mb-1">Which payment methods are accepted?</h4>
              <p className="text-muted-foreground leading-relaxed">
                We accept all standard Indian UPI applications including Google Pay (GPay), PhonePe, Paytm, and BHIM UPI.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
