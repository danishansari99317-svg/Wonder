import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { 
  Compass, 
  Copy, 
  Check, 
  HelpCircle, 
  ArrowLeft,
  Monitor,
  Smartphone,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

import { ConnectionGuide } from '../types';

interface HowToJoinPageProps {
  connectionGuide?: ConnectionGuide;
  onBackToStore: () => void;
}

export const HowToJoinPage: React.FC<HowToJoinPageProps> = ({ connectionGuide, onBackToStore }) => {
  const { success } = useToast();
  const { config } = useStoreConfig();
  const [copied, setCopied] = useState(false);

  const ip = "play.wondermc.fun";
  const port = "19132";

  const guide = connectionGuide || {
    javaTitle: "Java Edition",
    javaDescription: "For PC and Laptop players",
    javaSteps: [
      "Open Launcher (Cracked Client / TLauncher Included)",
      "Launch game and click \"Multiplayer\" on menu",
      "Click \"Add Server\" at the bottom right",
      "Select the \"Server Address\" textbox",
      "Type the Server Address: play.wondermc.fun",
      "Click Done, select the server and click \"Join Server\""
    ],
    bedrockTitle: "Bedrock Edition",
    bedrockDescription: "For MCPE, Mobile, Console & Win 10",
    bedrockSteps: [
      "Launch Minecraft and click \"Play\" on the main screen",
      "Select the \"Servers\" tab on the top menu",
      "Scroll down to the bottom and click \"Add Server\"",
      "Type the Server Name as: WonderMC",
      "Type Server Address: play.wondermc.fun",
      "Enter the Port number as: 19132",
      "Click \"Play\" or \"Save\" to join the Server instantly!"
    ]
  };

  const handleCopyIp = () => {
    navigator.clipboard.writeText(ip);
    setCopied(true);
    success("Server IP copied: play.wondermc.fun");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-300">
      {/* Title Header Banner */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-[#d4fbff] via-surface to-transparent py-12 sm:py-16">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-700 mb-4 shadow-sm">
            <Compass className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Connection Guide</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground font-sans mb-4">
            How to Join the Server
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            WonderMC is compatible with both Java and Bedrock editions. Connect today and start your adventure with our vibrant community!
          </p>


        </div>
      </section>

      {/* Connection Steps Container */}
      <main className="mx-auto max-w-[1150px] px-4 sm:px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Java Edition Section */}
          <section className="relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-8 hover:border-sky-500/30 transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-sky-500/10 p-2.5 border border-sky-500/20 text-sky-600">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">{guide.javaTitle}</h2>
                    <p className="text-xs text-muted-foreground">{guide.javaDescription}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                  PC &amp; Laptop
                </span>
              </div>

              {/* Steps List */}
              <ol className="space-y-4">
                {guide.javaSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/30 font-mono text-xs font-extrabold text-sky-700 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="leading-6 font-semibold">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 pt-5 border-t border-border/40 text-center">
              <span className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-bold">
                Compatible with original and custom launchers.
              </span>
            </div>
          </section>

          {/* Bedrock Edition Section */}
          <section className="relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-8 hover:border-amber-500/30 transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500/10 p-2.5 border border-amber-500/20 text-amber-700">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">{guide.bedrockTitle}</h2>
                    <p className="text-xs text-muted-foreground">{guide.bedrockDescription}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  PE &amp; Consoles
                </span>
              </div>

              {/* Steps List */}
              <ol className="space-y-4">
                {guide.bedrockSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 font-mono text-xs font-extrabold text-amber-800 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="leading-6 font-semibold">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 pt-5 border-t border-border/40 text-center">
              <span className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-bold">
                Cross-play enabled. Play together across different devices!
              </span>
            </div>
          </section>

        </div>

        {/* Troubleshooting & Support Section */}
        <section className="rounded-2xl border border-dashed border-sky-500/30 bg-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="rounded-xl bg-sky-500/10 p-3 text-sky-600 shrink-0 h-12 w-12 flex items-center justify-center border border-sky-500/20">
              <HelpCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Having trouble connecting?</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                If you encounter any connection issues, server lag, or account errors, we are here to help. You can open a support ticket on our Discord or directly inside this website!
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
