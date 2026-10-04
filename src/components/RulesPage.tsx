import React from 'react';
import { useStoreConfig } from '../context/StoreConfigContext';
import { 
  ShieldAlert, 
  ArrowLeft,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Zap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { RuleCategory } from '../types';

interface RulesPageProps {
  rulesCategories?: RuleCategory[];
  onBackToStore: () => void;
}

export const RulesPage: React.FC<RulesPageProps> = ({ rulesCategories, onBackToStore }) => {
  const { config } = useStoreConfig();

  const getIconElement = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheck className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5" />;
      case 'alert':
        return <ShieldAlert className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getIconContainerStyle = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return 'rounded-lg bg-sky-500/10 p-2 text-sky-600 border border-sky-500/20';
      case 'zap':
        return 'rounded-lg bg-amber-500/10 p-2 text-amber-700 border border-amber-500/20';
      case 'chat':
        return 'rounded-lg bg-emerald-500/10 p-2 text-emerald-700 border border-emerald-500/20';
      case 'alert':
        return 'rounded-lg bg-rose-500/10 p-2 text-rose-600 border border-rose-500/20';
      default:
        return 'rounded-lg bg-sky-500/10 p-2 text-sky-600 border border-sky-500/20';
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-300">
      {/* Title Header Banner */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-[#d4fbff] via-surface to-transparent py-12 sm:py-16">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-rose-700 mb-4 shadow-md">
            <BookOpen className="w-4 h-4 text-rose-600" />
            <span>Server Regulations</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground font-sans mb-4">
            Official Server Rules
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Please read and follow these rules. They are designed to keep {config.brand} fair, enjoyable, and welcoming for everyone in our community.
          </p>


        </div>
      </section>

      {/* Rules Content Container */}
      <main className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-8">
        
        {/* Introduction Panel */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-black text-foreground uppercase tracking-wide mb-3 font-sans">
            Welcome to WONDER MC
          </h2>
          <p className="text-sm text-foreground/90 leading-relaxed font-semibold">
            By playing on <strong>WONDER MC</strong> or using any of our services, you agree to follow these rules. These rules are designed to keep <strong>WONDER MC</strong> fair, enjoyable, and welcoming for everyone.
          </p>
        </div>

        {/* Dynamic Rules Categories */}
        {(rulesCategories || []).map((category, catIdx) => (
          <section key={category.id || catIdx} className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className={getIconContainerStyle(category.icon)}>
                {getIconElement(category.icon)}
              </div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-wider font-sans">
                {category.name}
              </h2>
            </div>

            <div className="space-y-4">
              {category.rules.map((rule, rIdx) => (
                <div key={rule.id || rIdx} className="border-l-2 border-accent/20 pl-4 py-0.5">
                  <h3 className="text-sm font-bold text-sky-700 uppercase tracking-wider mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed font-semibold">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Support Alert Section */}
        <section className="rounded-2xl border border-dashed border-sky-500/30 bg-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="rounded-xl bg-sky-500/10 p-3 text-sky-600 shrink-0 h-12 w-12 flex items-center justify-center border border-sky-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Questions &amp; Appeals</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                If you have a question about the rules or believe a punishment was issued incorrectly, please open a support ticket on our Discord network.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="https://discord.gg/wondermc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discord Ticket</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};
