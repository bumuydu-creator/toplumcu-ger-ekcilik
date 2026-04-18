/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  BookOpen, 
  Menu, 
  X,
  Type,
  Maximize2
} from 'lucide-react';
import { ESSAY_SECTIONS } from './constants';
import { generateSpeech } from './services/geminiService';
import { AppState } from './types';

export default function App() {
  const [state, setState] = useState<AppState>({
    activeSection: 'intro',
    isAudioLoading: false,
    audioUrl: null,
    isPlaying: false,
    voiceName: 'Kore'
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const activeSection = ESSAY_SECTIONS.find(s => s.id === state.activeSection) || ESSAY_SECTIONS[0];
  const sectionIndex = ESSAY_SECTIONS.findIndex(s => s.id === state.activeSection);

  const handleNarrate = async () => {
    if (state.isPlaying) {
      audioRef.current?.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    if (state.audioUrl) {
      audioRef.current?.play();
      setState(prev => ({ ...prev, isPlaying: true }));
      return;
    }

    setState(prev => ({ ...prev, isAudioLoading: true }));
    const base64 = await generateSpeech(activeSection.content, state.voiceName);
    
    if (base64) {
      const blob = await fetch(`data:audio/wav;base64,${base64}`).then(r => r.blob());
      const url = URL.createObjectURL(blob);
      setState(prev => ({ 
        ...prev, 
        audioUrl: url, 
        isAudioLoading: false, 
        isPlaying: true 
      }));
    } else {
      setState(prev => ({ ...prev, isAudioLoading: false }));
    }
  };

  useEffect(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState(prev => ({ ...prev, audioUrl: null, isPlaying: false }));
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [state.activeSection]);

  const goToNext = () => {
    if (sectionIndex < ESSAY_SECTIONS.length - 1) {
      setState(prev => ({ ...prev, activeSection: ESSAY_SECTIONS[sectionIndex + 1].id }));
    }
  };

  const goToPrev = () => {
    if (sectionIndex > 0) {
      setState(prev => ({ ...prev, activeSection: ESSAY_SECTIONS[sectionIndex - 1].id }));
    }
  };

  return (
    <div className="h-screen w-full flex bg-bg overflow-hidden border border-border/20">
      {/* Rail Navigation (80px) */}
      <div className="hidden lg:flex w-20 flex-col items-center py-10 gap-10 border-r border-border shrink-0">
        <div className="writing-vertical rotate-180 uppercase tracking-[4px] text-[10px] text-accent font-bold font-sans">
          KRİTİK ANALİZ
        </div>
        <div className="writing-vertical rotate-180 uppercase tracking-[4px] text-[10px] text-accent font-bold font-sans">
          LİTERATÜR
        </div>
        <div className="mt-auto">
          <BookOpen size={20} className="text-accent" />
        </div>
      </div>

      {/* Main Content Area (Center) */}
      <main className="flex-1 flex flex-col border-r border-border overflow-y-auto px-10 py-16 lg:px-20 lg:py-20 relative">
        <header className="mb-10">
          <h2 className="text-[14px] uppercase text-accent tracking-[2px] mb-2 font-sans font-bold">Teori ve Estetik</h2>
          <h1 className="text-4xl lg:text-5xl text-title font-serif leading-tight tracking-tight">
            Şemsiyenin Altında: Vedat Türkali ve {activeSection.title}
          </h1>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <div className="prose prose-invert max-w-none">
              <p className="text-lg lg:text-xl font-serif leading-relaxed text-ink/90 text-justify first-letter:text-7xl first-letter:float-left first-letter:leading-[1] first-letter:pr-3 first-letter:text-accent first-letter:font-sans first-letter:font-bold">
                {activeSection.content}
              </p>
            </div>

            <div className="bg-surface border-l-2 border-accent p-6 my-10 font-serif italic text-title">
              "Acaba Türkali bu şemsiyenin altında mı, yoksa eleştiri dünyası mı onu bu kategoriye itmeye çalışıyor? Bir Gün Tek Başına o dar kalıba sığıyor mu?"
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Nav */}
        <div className="mt-auto pt-10 border-t border-border flex items-center justify-between text-[11px] text-muted font-sans uppercase tracking-widest bg-bg z-20 sticky bottom-0">
          <span className="whitespace-nowrap">BÖLÜM 0{sectionIndex + 1}: {activeSection.id.toUpperCase()}</span>
          
          <div className="flex-1 mx-8 h-[2px] bg-border relative overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ width: `${((sectionIndex + 1) / ESSAY_SECTIONS.length) * 100}%` }}
              className="absolute left-0 top-0 h-full bg-accent shadow-[0_0_10px_rgba(197,160,89,0.5)]" 
            />
          </div>

          <div className="flex items-center gap-6">
            <span className="whitespace-nowrap">SAYFA 0{sectionIndex + 1} / 0{ESSAY_SECTIONS.length}</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={goToPrev}
                disabled={sectionIndex === 0}
                className="hover:text-accent transition-colors disabled:opacity-20"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={goToNext}
                disabled={sectionIndex === ESSAY_SECTIONS.length - 1}
                className="hover:text-accent transition-colors disabled:opacity-20"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar (300px) */}
      <aside className="hidden lg:flex w-[300px] flex-col p-10 gap-8 shrink-0 bg-bg/50">
        <section>
          <div className="text-[11px] uppercase tracking-[2px] text-muted border-bottom border-border pb-3 mb-6 font-sans font-bold">KAVRAMSAL ANALİZ</div>
          <div className="flex flex-col gap-4">
            <div className="bg-white/[0.02] p-4 border border-white/[0.05] group hover:border-accent/40 transition-all cursor-pointer">
              <span className="block text-[10px] text-muted mb-1 font-sans">METİNLERARASI</span>
              <p className="text-sm text-ink group-hover:text-title transition-colors">Joseph Campbell vs. Vedat Türkali</p>
            </div>
            <div className="bg-white/[0.02] p-4 border border-white/[0.05] group hover:border-accent/40 transition-all cursor-pointer">
              <span className="block text-[10px] text-muted mb-1 font-sans">KURAMSAL ÇERÇEVE</span>
              <p className="text-sm text-ink group-hover:text-title transition-colors">Foucault ve Panoptikon Mekanizması</p>
            </div>
          </div>
        </section>

        <section>
          <div className="text-[11px] uppercase tracking-[2px] text-muted border-bottom border-border pb-3 mb-6 font-sans font-bold">ETİKETLER</div>
          <div className="flex flex-wrap gap-2">
            {activeSection.keywords.map(kw => (
              <span key={kw} className="text-[10px] px-3 py-1 border border-accent/40 rounded-[2px] uppercase text-accent font-sans tracking-wide">
                {kw}
              </span>
            ))}
            <span className="text-[10px] px-3 py-1 border border-accent/40 rounded-[2px] uppercase text-accent font-sans tracking-wide">Modernizm</span>
          </div>
        </section>

        <section className="mt-auto">
          <div className="text-[11px] uppercase tracking-[2px] text-muted border-bottom border-border pb-3 mb-4 font-sans font-bold">NAVİGASYON</div>
          <div className="flex flex-col gap-2">
            {ESSAY_SECTIONS.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setState(prev => ({ ...prev, activeSection: section.id }))}
                className={`text-left text-xs font-sans py-1 transition-all flex items-center gap-2 ${
                  state.activeSection === section.id ? 'text-accent pl-2 border-l border-accent' : 'text-muted hover:text-ink'
                }`}
              >
                <span className="opacity-40">0{idx + 1}</span> {section.title}
              </button>
            ))}
          </div>
        </section>

        <section className="pt-8 border-t border-border mt-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handleNarrate}
              disabled={state.isAudioLoading}
              className="p-3 bg-accent text-bg rounded-md hover:bg-accent/90 transition-all disabled:opacity-50"
            >
              {state.isAudioLoading ? (
                <div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
              ) : state.isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
            </button>
            <select 
              value={state.voiceName}
              onChange={(e) => setState(prev => ({ ...prev, voiceName: e.target.value, audioUrl: null }))}
              className="bg-transparent text-ink text-[10px] font-sans font-bold uppercase tracking-widest outline-none cursor-pointer border border-border px-2 py-1"
            >
              <option className="bg-bg" value="Kore">Kore</option>
              <option className="bg-bg" value="Fenrir">Fenrir</option>
              <option className="bg-bg" value="Zephyr">Zephyr</option>
            </select>
          </div>
        </section>
      </aside>

      {/* Hidden Audio */}
      <audio 
        ref={audioRef} 
        src={state.audioUrl || undefined} 
        onEnded={() => setState(prev => ({ ...prev, isPlaying: false }))}
        className="hidden"
      />
    </div>
  );
}
