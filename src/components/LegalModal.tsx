import React from 'react';
import { useStoreConfig } from '../context/StoreConfigContext';
import { X, FileText, ShieldAlert, RotateCcw } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'refund' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const { config } = useStoreConfig();
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7 my-8 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-2 text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
          aria-label="Close legal modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
            {type === 'terms' && <FileText className="w-6 h-6" />}
            {type === 'privacy' && <ShieldAlert className="w-6 h-6" />}
            {type === 'refund' && <RotateCcw className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground font-display">
              {type === 'terms' && 'Terms and Conditions'}
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'refund' && 'Refund Policy'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {config.brand} Network Legal Documentation
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-muted-foreground leading-relaxed">
          {type === 'terms' && (
            <>
              <p>
                By accessing or placing an order on the <strong>{config.brand} Store</strong>, you agree to be bound by these terms. All items sold are virtual in-game privileges and digital goods for the {config.brand} Minecraft Server ({config.serverIp}).
              </p>
              <h4 className="text-sm font-bold text-foreground">1. Minecraft EULA Compliance</h4>
              <p>
                {config.brand} is in no way affiliated with Mojang Studios or Microsoft. All purchases contribute directly to server hosting, custom development, maintenance, and hardware expenses.
              </p>
              <h4 className="text-sm font-bold text-foreground">2. Account Responsibility</h4>
              <p>
                You are responsible for ensuring that the Minecraft username entered at checkout is correct. Staff cannot refund purchases made for the incorrect account name.
              </p>
              <h4 className="text-sm font-bold text-foreground">3. Rule Violations & Ban Policy</h4>
              <p>
                Purchasing ranks or crate keys does not make you immune to server rules. If you are banned or muted for cheating, exploiting, or violating community guidelines, you will not receive a refund or compensation.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <p>
                We respect your privacy and process personal information strictly necessary for transaction fulfillment and fraud prevention.
              </p>
              <h4 className="text-sm font-bold text-foreground">1. Data Collected</h4>
              <p>
                We collect your Minecraft In-Game Name, Discord handle (if provided), and Transaction UTR / Reference code to process and verify payments.
              </p>
              <h4 className="text-sm font-bold text-foreground">2. Payment Processing</h4>
              <p>
                All payments are processed peer-to-peer via UPI. We do not store or process your bank account details or UPI PINs.
              </p>
              <h4 className="text-sm font-bold text-foreground">3. Third Parties</h4>
              <p>
                We do not sell, trade, or transfer your identifying information to outside parties.
              </p>
            </>
          )}

          {type === 'refund' && (
            <>
              <p>
                Because all items and ranks delivered on {config.brand} are intangible digital goods consumed immediately in-game, <strong>all sales are final</strong>.
              </p>
              <h4 className="text-sm font-bold text-foreground">1. No Chargebacks</h4>
              <p>
                Attempting an unauthorized chargeback or dispute will result in an immediate and permanent blacklist from the {config.brand} server, our Discord network, and the Tebex/Buycraft community fraud database.
              </p>
              <h4 className="text-sm font-bold text-foreground">2. Missing Items Assistance</h4>
              <p>
                If you made a payment and did not receive your rank or items within 24 hours, please contact us immediately on our Discord server ({config.discordUrl}) with your UTR receipt for manual review and fulfillment.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-border mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-accent px-5 py-2 text-xs font-black uppercase text-accent-foreground hover:opacity-90"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
