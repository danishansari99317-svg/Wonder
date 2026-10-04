import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useCart } from '../context/CartContext';
import { useSale } from '../context/SaleContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useTickets } from '../context/TicketContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../data/storeData';
import { sendPaymentDiscordNotification } from '../utils/discordWebhook';
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
    const cleanIgn = ign.trim();
    const cleanUtr = utrNumber.trim();
    const cleanScreenshot = screenshotUrl.trim();

    if (!cleanIgn) {
      error('Please enter your Minecraft In-Game Name (IGN)');
      return;
    }

    if (!cleanUtr || cleanUtr.length < 10) {
      error('Please enter a valid 12-digit UPI Reference / UTR Number');
      return;
    }

    setIsSubmitting(true);
    // Save IGN
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
          message: `Order Item(s): ${orderDescription}\nTotal Paid: ₹${totalAmount}\nUTR/Transaction ID: ${cleanUtr}\nMinecraft IGN: ${cleanIgn}${discordTag.trim() ? `\nDiscord Tag: ${discordTag.trim()}` : ''}${cleanScreenshot ? '\n[Payment Receipt Screenshot Attached]' : ''}`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7 my-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-2 text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
          aria-label="Close UPI Payment Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-foreground font-display">
                  UPI Instant Payment
                </h2>
                <p className="text-xs text-muted-foreground">
                  Scan the QR code or pay to the UPI ID via GPay, PhonePe, or Paytm
                </p>
              </div>
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-inner mb-5">
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
              <span className="mt-2 text-[11px] font-bold text-gray-700 tracking-wide">
                Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)
              </span>
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
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Minecraft In-Game Name (IGN) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  placeholder="e.g. Steve_Gamer123"
                  className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent font-medium placeholder:text-muted-foreground"
                />
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
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Minecraft IGN:</span>
                <strong className="text-foreground">{ign}</strong>
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
