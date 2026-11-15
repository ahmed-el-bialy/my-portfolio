import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Terminal } from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { useScrollLock } from '../hooks/useScrollLock';

interface TerminalEasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'overview' | 'projects' | 'experience' | 'contact') => void;
}

interface TerminalLine {
  type: 'input' | 'output';
  text: string;
}

export const TerminalEasterEggModal: React.FC<TerminalEasterEggModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  useScrollLock(isOpen);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', text: 'Ahmed El-Bialy CLI · Flutter & AI Workspace' },
    { type: 'output', text: 'Type "help" to inspect available commands.' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const runCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    const nextLines: TerminalLine[] = [...history, { type: 'input', text: `> ${rawCmd}` }];

    switch (cmd) {
      case 'help':
      case 'ahmed --help':
        nextLines.push({
          type: 'output',
          text: 'Commands: whoami · stack · revio · contact · projects · clear · exit',
        });
        break;
      case 'whoami':
        nextLines.push({
          type: 'output',
          text: `${AHMED_CONFIG.name.en} — ${AHMED_CONFIG.title.en} | ${AHMED_CONFIG.education.faculty.en}, ${AHMED_CONFIG.education.university.en}`,
        });
        break;
      case 'stack':
      case 'ahmed skills --list':
        nextLines.push({
          type: 'output',
          text: 'Flutter SDK · Dart · Clean Architecture · BLoC / Cubit · Hive · Dio & Retrofit · Firebase Firestore · Python',
        });
        break;
      case 'revio':
        nextLines.push({
          type: 'output',
          text: `Revio (Google Play): ${AHMED_CONFIG.socials.playstore}`,
        });
        break;
      case 'contact':
      case 'ahmed contact --email':
        nextLines.push({
          type: 'output',
          text: `Email: ${AHMED_CONFIG.email} | Phone: ${AHMED_CONFIG.phone} | Status: Open to Work`,
        });
        break;
      case 'projects':
        onClose();
        onNavigateTab?.('projects');
        return;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'exit':
      case 'quit':
        onClose();
        return;
      default:
        nextLines.push({
          type: 'output',
          text: `Unknown command: "${cmd}". Try "help", "stack", "revio", or "contact".`,
        });
    }

    setHistory(nextLines);
    setInput('');
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Developer CLI Inspector"
    >
      <div
        dir="ltr"
        className="w-full max-w-2xl rounded-2xl bg-[#08090d] border border-white/15 shadow-2xl overflow-hidden text-left font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f1117] border-b border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-200">
            <Terminal size={14} className="text-[#00C7FF]" />
            <span>{AHMED_CONFIG.monogram} terminal-inspector</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center cursor-pointer"
            aria-label="Close terminal"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4 h-72 overflow-y-auto space-y-2 text-xs">
          {history.map((line, i) => (
            <div
              key={i}
              className={
                line.type === 'input'
                  ? 'text-[#00C7FF] font-semibold'
                  : 'text-slate-300 leading-relaxed whitespace-pre-wrap break-all'
              }
            >
              {line.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCommand(input);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-[#0f1117] border-t border-white/10"
        >
          <span className="text-[#027DFD] text-xs font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="help | stack | revio | contact"
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </form>
      </div>
    </div>,
    document.body
  );
};
