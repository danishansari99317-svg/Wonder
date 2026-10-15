import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useCart, MinecraftEdition, formatIgnForEdition } from '../context/CartContext';
import { useSale } from '../context/SaleContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useTickets } from '../context/TicketContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../data/storeData';
import { sendPaymentDiscordNotification } from '../utils/discordWebhook';
import { EditionSelector } from './EditionSelector';
import { X, Copy, Check, CheckCircle2, ExternalLink, QrCode, ShieldCheck, AlertCircle, MessageSquare, Upload, Image as ImageIcon, FileCheck, Trash2, Link as LinkIcon } from 'lucide-react';

export const UpiPaymentModal: React.FC = () => {
  const {
    isUpiModalOpen,
    setIsUpiModalOpen,
    directBuyItem,
    setDirectBuyItem,
    items,
    finalTotal,
    username,
    setUsername,
    edition,
    setEdition,
    clearCart,
  } = useCart();
  const { getItemPricing } = useSale();
  const { config } = useStoreConfig();
  const { addTicket } = useTickets();

  const { success, error } = useToast();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [ign, setIgn] = useState(username);
  const [discordTag, setDiscordTag] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState<boolean>(false);
  const [customScreenshotUrlInput, setCustomScreenshotUrlInput] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedUtr, setSubmittedUtr] = useState('');
  const [submittedScreenshot, setSubmittedScreenshot] = useState<string>('');

  // Sync ign whenever modal opens or username changes
  useEffect(() => {
    if (isUpiModalOpen) {
      setIgn(username);
    }
  }, [username, isUpiModalOpen]);

  const handleEditionChange = (newEd: MinecraftEdition) => {
    setEdition(newEd);
    if (newEd === 'bedrock') {
      setIgn((prev) => {
        const trimmed = (prev || username || '').trim();
        if (!trimmed) return '.';
        return trimmed.startsWith('.') ? trimmed : `.${trimmed.replace(/^\.+/, '')}`;
      });
    } else {
      setIgn((prev) => (prev || username || '').replace(/^\.+/, ''));
    }
  };

  // Calculate checkout details
  const isDirect = Boolean(directBuyItem);
  const totalAmount = isDirect
    ? getItemPricing(directBuyItem!).discountedPrice
    : finalTotal;

  const orderDescription = isDirect
    ? directBuyItem!.title
    : items.map((i) => `${i.qty}x ${i.name}`).join(', ');

  useEffect(() => {
    if (username && !ign) {
      setIgn(username);
    }
  }, [username, ign]);

  useEffect(() => {
    if (!isUpiModalOpen) {
      setIsSuccess(false);
      setUtrNumber('');
      setScreenshotUrl('');
      setScreenshotFileName('');
      setCustomScreenshotUrlInput('');
      setIsUrlInputOpen(false);
      return;
    }

    if (totalAmount <= 0) return;

    if (config.qrMode === 'custom' && config.customQrUrl) {
      setQrDataUrl(config.customQrUrl);
      return;
    }

    // Generate Dynamic UPI URI
    const upiUri = `upi://pay?pa=${encodeURIComponent(config.upiId)}&pn=${encodeURIComponent(
      config.upiPayeeName || config.brand
    )}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(
      orderDescription.slice(0, 40)
    )}`;

    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [isUpiModalOpen, totalAmount, orderDescription, config.qrMode, config.customQrUrl, config.upiId, config.upiPayeeName, config.brand]);

  if (!isUpiModalOpen) return null;

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(config.upiId);
      setCopiedUpi(true);
      success(`Copied UPI ID: ${config.upiId}`);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      error(`UPI ID: ${config.upiId}`);
    }
  };

  const handleScreenshotFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      error('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      error('Image file size must be smaller than 8MB');
      return;
    }
    setIsUploading(true);
    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotUrl(reader.result as string);
      setIsUploading(false);
      success('Payment screenshot attached!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      error('Failed to read payment screenshot image');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawIgn = ign.trim();
    const cleanUtr = utrNumber.trim();
    const cleanScreenshot = screenshotUrl.trim();

    if (!rawIgn || rawIgn === '.') {
      error('Please enter your Minecraft In-Game Name (IGN)');
      return;
    }

    const cleanIgn = formatIgnForEdition(rawIgn, edition);

    if (!cleanUtr || cleanUtr.length < 10) {
      error('Please enter a valid 12-digit UPI Reference / UTR Number');
      return;
    }

    setIsSubmitting(true);
    // Save IGN and edition
    setUsername(cleanIgn);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setSubmittedUtr(cleanUtr);
      setSubmittedScreenshot(cleanScreenshot);
      
      // Also automatically log to Admin Support / Payment Tickets
      let generatedTicketNumber: string | undefined;
      try {
        const newTicket = addTicket({
          ign: cleanIgn,
          contact: discordTag.trim(),
          category: 'Payment / Store Issue',
          subject: `UPI Payment ₹${totalAmount} · UTR: ${cleanUtr}`,
          message: `Order Item(s): ${orderDescription}\nTotal Paid: ₹${totalAmount}\nUTR/Transaction ID: ${cleanUtr}\nMinecraft IGN: ${cleanIgn} (${edition === 'bedrock' ? 'Bedrock Edition' : 'Java Edition'})${discordTag.trim() ? `\nDiscord Tag: ${discordTag.trim()}` : ''}${cleanScreenshot ? '\n[Payment Receipt Screenshot Attached]' : ''}`,
          screenshotUrl: cleanScreenshot || undefined,
          priority: 'high',
        });
        generatedTicketNumber = newTicket?.ticketNumber;
      } catch {
        // ignore
      }

      // Automatically dispatch Discord Webhook Notification to server admin/staff channel!
      sendPaymentDiscordNotification(
        {
          ign: cleanIgn,
          utr: cleanUtr,
          amount: totalAmount,
          itemsDescription: orderDescription,
          contact: discordTag.trim() || undefined,
          screenshotUrl: cleanScreenshot || undefined,
          ticketNumber: generatedTicketNumber,
          gamemode: config.serverName,
          serverIp: config.serverIp,
          paymentMethod: `UPI QR (${config.upiId})`,
          edition: edition,
        },
        config
      ).catch((err) => {
        console.warn('[Discord Payment Webhook]', err);
      });

      if (!isDirect) {
        clearCart();
      }
      setDirectBuyItem(null);
      success('Payment confirmation submitted & staff notified!');
    }, 900);
  };

  const handleClose = () => {
    setIsUpiModalOpen(false);
    setDirectBuyItem(null);
    setIsSuccess(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUpiModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUpiModalOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Clickable Backdrop overlay to close */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
        title="Click anywhere outside to close"
      />

      {/* Floating Viewport Close Button (always visible on screen) */}
      <button
        type="button"
        onClick={handleClose}
        title="Close payment modal (Esc)"
        className="fixed top-4 right-4 z-[60] flex items-center gap-1.5 rounded-full border-2 border-red-500/70 bg-[#12051f]/95 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-red-200 shadow-2xl backdrop-blur-md hover:bg-red-600 hover:text-white hover:border-red-400 transition-all cursor-pointer active:scale-95"
        aria-label="Close UPI Payment Modal"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
        <span>Close (Esc)</span>
      </button>

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border-2 border-border bg-surface p-5 sm:p-7 shadow-2xl my-8">
        {!isSuccess ? (
          <div>
            {/* Modal Header with prominent Title & Close Button */}
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-foreground font-display">
                    UPI Instant Payment
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Scan QR or pay UPI ID via GPay / PhonePe / Paytm
                  </p>
                </div>
              </div>

              {/* Dedicated Header Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/50 bg-red-950/60 px-3 py-1.5 text-xs font-black uppercase text-red-300 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all cursor-pointer shadow-sm shrink-0"
                aria-label="Close UPI Payment Modal"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>

            {/* Total Amount Card */}
            <div className="rounded-xl border border-gold/30 bg-surface-deep p-4 text-center mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Amount to Pay
              </span>
              <div className="text-3xl font-black text-gold font-display">
                {formatINR(totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate px-2">
                Order: <strong className="text-foreground">{orderDescription}</strong>
              </p>
            </div>

            {/* QR Code Presentation */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-white p-4 shadow-inner mb-2.5">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="UPI Payment QR Code"
                  className="h-48 w-48 rounded-lg shadow-sm"
                />
              ) : (
                <div className="h-48 w-48 flex items-center justify-center text-xs text-gray-500">
                  Generating QR Code...
                </div>
              )}
              <span className="mt-2 text-[11px] font-bold text-gray-700 tracking-wide text-center">
                Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)
              </span>
            </div>

            {/* Quick cancel payment under QR */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 mb-4">
              <span>Pay exact ₹{totalAmount} to activate</span>
              <button
                type="button"
                onClick={handleClose}
                className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
                <span>Cancel / Close</span>
              </button>
            </div>

            {/* Copyable UPI ID */}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-deep p-3 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Official {config.brand} UPI ID
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {config.upiId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-bold text-foreground border border-border hover:border-border-strong hover:bg-white/5 transition-all"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUpi ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Payment Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Minecraft Edition & IGN Input */}
              <div className="space-y-2 p-3.5 rounded-2xl border border-border/80 bg-surface/50">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground font-display">
                    Minecraft IGN <span className="text-destructive">*</span>
                  </label>
                  <EditionSelector
                    size="sm"
                    edition={edition}
                    onChange={handleEditionChange}
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ign}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (edition === 'bedrock' && val && !val.startsWith('.')) {
                        val = `.${val.replace(/^\.+/, '')}`;
                      }
                      setIgn(val);
                      setUsername(val);
                    }}
                    placeholder={edition === 'bedrock' ? '.BedrockPlayerName' : 'JavaPlayerName'}
                    className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent font-mono font-semibold placeholder:text-muted-foreground"
                  />
                </div>

                <p className="text-[11px] leading-tight font-medium">
                  {edition === 'bedrock' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span>📱</span>
                      <span>Bedrock Edition: Prefix <strong>'.'</strong> is added automatically for GeyserMC delivery.</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span>☕</span>
                      <span>Java Edition: Standard PC Minecraft IGN (without '.' prefix).</span>
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 flex items-center justify-between">
                  <span>Discord Username / Contact</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={discordTag}
                  onChange={(e) => setDiscordTag(e.target.value)}
                  placeholder="e.g. yourdiscord or @username"
                  className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent font-medium placeholder:text-muted-foreground"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Used by staff to ping you on Discord once perks are activated.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  12-Digit UTR / Transaction Reference Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 423589123456"
                  maxLength={18}
                  className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-sm font-mono text-foreground outline-none focus:border-accent placeholder:text-muted-foreground"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Found in your UPI app payment receipt details (Ref / UTR / Txn ID).
                </span>
              </div>

              {/* Payment Receipt / Screenshot Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-accent" />
                    <span>Attach Payment Screenshot / Receipt</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                    className="text-[10px] text-accent hover:underline font-bold"
                  >
                    {isUrlInputOpen ? 'Upload File' : 'Paste Image URL'}
                  </button>
                </div>

                {screenshotUrl ? (
                  <div className="relative rounded-xl border border-lime/40 bg-lime/10 p-3 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg border border-lime/30 bg-black/50 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={screenshotUrl} alt="Payment Receipt" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-black text-lime truncate">
                        <FileCheck className="w-4 h-4 shrink-0 text-lime" />
                        <span className="truncate">{screenshotFileName || 'Payment_Receipt.png'}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        ✓ Payment screenshot attached for staff verification
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotUrl('');
                        setScreenshotFileName('');
                        setCustomScreenshotUrlInput('');
                      }}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : isUrlInputOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={customScreenshotUrlInput}
                      onChange={(e) => {
                        setCustomScreenshotUrlInput(e.target.value);
                        setScreenshotUrl(e.target.value);
                        setScreenshotFileName('Direct_Image_URL.png');
                      }}
                      placeholder="https://... Imgur / Discord image link"
                      className="flex-1 rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-accent"
                    />
                  </div>
                ) : (
                  <label className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-accent bg-surface-deep/70 p-4 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleScreenshotFile(file);
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground group-hover:text-accent transition-colors">
                      <Upload className="w-4 h-4 text-accent" />
                      <span>{isUploading ? 'Processing Image...' : 'Click to Upload Payment Screenshot'}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      PNG, JPG, WEBP (Max 8MB) — Optional but recommended
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-lime py-3 text-sm font-black uppercase tracking-wider text-lime-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-lime/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verifying Payment...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Payment &amp; Submit UTR</span>
                  </>
                )}
              </button>

              {/* Explicit Cancel / Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl border border-red-500/40 bg-red-950/30 py-2.5 text-xs font-black uppercase tracking-wider text-red-300 hover:bg-red-950/60 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Cancel Payment &amp; Close Window</span>
              </button>
            </form>
          </div>
        ) : (
          /* Payment Success Confirmation View */
          <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success ring-8 ring-success/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-foreground font-display mb-1">
              Payment Details Submitted!
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Thank you for supporting {config.brand} Network!
            </p>

            <div className="rounded-xl border border-border bg-surface-deep p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Minecraft IGN:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-foreground font-mono">{ign}</strong>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                    edition === 'bedrock'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-accent/20 text-accent border border-accent/30'
                  }`}>
                    {edition === 'bedrock' ? '📱 Bedrock/PE' : '☕ Java'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Transaction UTR:</span>
                <strong className="font-mono text-accent">{submittedUtr}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Paid:</span>
                <strong className="text-gold">{formatINR(totalAmount)}</strong>
              </div>
              {submittedScreenshot && (
                <div className="flex justify-between items-center text-xs border-t border-border pt-2">
                  <span className="text-muted-foreground">Payment Screenshot:</span>
                  <span className="inline-flex items-center gap-1 text-lime font-bold">
                    <FileCheck className="w-3.5 h-3.5 text-lime" />
                    Receipt Screenshot Attached
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs border-t border-border pt-2">
                <span className="text-muted-foreground">Status:</span>
                <span className="inline-flex items-center gap-1 text-success font-bold">
                  <span className="h-2 w-2 rounded-full bg-success animate-ping" />
                  Queued for Instant Activation
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-deep/60 p-3.5 border border-border text-xs text-muted-foreground mb-6 flex items-start gap-2.5 text-left">
              <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                Your rank/items are being processed. They usually activate in-game within <strong>5–15 minutes</strong>. If you need priority support, hop onto our Discord server!
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={config.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-accent-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span>Join Discord Support</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-foreground hover:bg-surface-deep transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
