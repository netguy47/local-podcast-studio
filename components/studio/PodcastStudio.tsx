'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Play, Square, Download, Plus, 
  Settings, MoreVertical, Trash2, 
  Sparkles, Volume2, Clock, Users,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DEFAULT_HOSTS, 
  PodcastEpisode, 
  ScriptSegment, 
  Emotion 
} from '@/lib/studio/types';
import { scriptGenerator, THEMES } from '@/lib/studio/generator';
import { audioEngine } from '@/lib/studio/audio-engine';

export default function PodcastStudio() {
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);
  const isPlayingRef = useRef(false);
  const [theme, setTheme] = useState<keyof typeof THEMES>('tech');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<5 | 10 | 15 | 20>(5);
  const [selectedHosts, setSelectedHosts] = useState<string[]>(['host-1', 'host-2']);
  
  // Importer states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const generateNewScript = () => {
    // Defense: Ensure at least one host is selected
    const activeHosts = selectedHosts.length > 0 ? selectedHosts : ['host-1'];
    
    try {
      const newEpisode = scriptGenerator.generate(
        topic || "Unbounded Potential",
        topic,
        theme,
        duration,
        activeHosts
      );
      setEpisode(newEpisode);
    } catch (err) {
      console.error("Manual generation failed:", err);
    }
  };

  const handleRawImport = () => {
    if (!importText.trim()) return;
    const activeHosts = selectedHosts.length > 0 ? selectedHosts : ['host-1'];
    const newEpisode = scriptGenerator.generateFromRawText(
      "Imported Session",
      importText,
      activeHosts
    );
    setEpisode(newEpisode);
    setIsImportModalOpen(false);
    setImportText('');
  };

  const handleUrlImport = async () => {
    if (!importUrl.trim()) return;
    setIsFetching(true);
    try {
      // Basic fetch attempt (CORS might block, but good to have)
      const res = await fetch(importUrl);
      if (!res.ok) throw new Error("CORS or network error");
      const text = await res.text();
      // Extract main text (very basic)
      const cleanText = text.replace(/<[^>]*>?/gm, '').slice(0, 5000);
      const newEpisode = scriptGenerator.generateFromRawText(
        "URL Scrape",
        cleanText,
        selectedHosts.length > 0 ? selectedHosts : ['host-1']
      );
      setEpisode(newEpisode);
      setIsImportModalOpen(false);
      setImportUrl('');
    } catch (err) {
      alert("Note: External URL ingestion is often restricted by browser CORS policies in local-only environments. Please paste the raw text instead.");
    } finally {
      setIsFetching(false);
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      isPlayingRef.current = false;
      audioEngine?.stop();
      setIsPlaying(false);
      setCurrentSegmentId(null);
      return;
    }

    if (!episode || episode.segments.length === 0) return;

    console.log(`Starting playback for episode: ${episode.title} (${episode.segments.length} segments)`);
    setIsPlaying(true);
    isPlayingRef.current = true;

    for (const segment of episode.segments) {
      if (!isPlayingRef.current) {
        console.log("Playback manually stopped.");
        break;
      }
      
      console.log(`Playing segment: ${segment.id} (Host: ${segment.hostId}, Emotion: ${segment.emotion})`);
      
      // Data Validation Check
      if (!segment.text || segment.text.trim().length === 0) {
        console.warn(`Segment ${segment.id} has no text. Skipping.`);
        continue;
      }

      setCurrentSegmentId(segment.id);
      const host = DEFAULT_HOSTS.find(h => h.id === segment.hostId) || DEFAULT_HOSTS[0];
      
      try {
        await audioEngine?.speak(segment, host);
        console.log(`Finished segment: ${segment.id}`);
        // Micro-delay to prevent synthesis buffer overflow in some browsers
        await new Promise(r => setTimeout(r, 150));
      } catch (err: any) {
        // Ignore "canceled" or "interrupted" errors if we've manually stopped or are transitioning
        if (err?.code === 'canceled' || err?.code === 'interrupted' || !isPlayingRef.current) {
          console.log(`Playback segment ${segment.id} stopped/interrupted as expected.`);
          break;
        }
        
        console.error(`Timeline playback broken at segment ${segment.id}:`, err?.code || err);
        break;
      }
      
      if (!isPlayingRef.current) break;
    }
    
    console.log("Timeline playback session completed.");
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentSegmentId(null);
  };

  const updateSegmentText = (id: string, text: string) => {
    if (!episode) return;
    setEpisode({
      ...episode,
      segments: episode.segments.map(s => s.id === id ? { ...s, text } : s)
    });
  };

  const removeSegment = (id: string) => {
    if (!episode) return;
    setEpisode({
      ...episode,
      segments: episode.segments.filter(s => s.id !== id)
    });
  };

  const updateSegmentEmotion = (id: string, emotion: Emotion) => {
    if (!episode) return;
    setEpisode({
      ...episode,
      segments: episode.segments.map(s => s.id === id ? { ...s, emotion } : s)
    });
  };

  const EMOTIONS: Emotion[] = ['narrative', 'calm', 'excited', 'serious', 'dramatic', 'comedic', 'parody', 'investigative', 'satire'];

  return (
    <div className="flex flex-col h-screen h-[100svh] overflow-hidden bg-[#0F1117] font-sans selection:bg-blue-500/30 text-[#E2E8F0]">
      {/* --- TOP BAR --- */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-white/5 bg-[#0F1117] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            A
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Studio Architect Mode <span className="text-slate-500 font-normal ml-2">v1.5.0</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] mr-2"></span>
              LOCAL ENGINE: SOVEREIGN
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <button 
              onClick={generateNewScript}
              className="bg-[#3B82F6] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-500 transition-all active:scale-95 shadow-[0_4px_15px_rgba(59,130,246,0.2)] flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Episode
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN STUDIO AREA --- */}
      <div className="flex-1 grid grid-cols-[280px_1fr_320px] lg:grid-cols-[280px_1fr_320px] md:grid-cols-[240px_1fr] grid-cols-[1fr] overflow-hidden min-h-0 h-full">
        {/* SIDEBAR: LEFT (CONFIG & HOSTS) */}
        <aside className="border-r border-white/5 bg-[#0F1117] p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar min-h-0 h-full relative z-20">
          <section>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">Orchestration</span>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Sovereign Ingest
                </button>
                <label className="flex flex-col gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-2">
                  Duration
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {[5, 10, 15, 20].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d as any)}
                        className={cn(
                          "py-1.5 rounded text-[10px] font-bold transition-all",
                          duration === d 
                            ? "bg-blue-600 text-white" 
                            : "bg-[#1A1D24] text-slate-500 hover:bg-[#2D3139]"
                        )}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </label>
                <label className="flex flex-col gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  Topic
                  <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. AI Ethics, MLB Game..."
                    className="bg-[#1A1D24] border border-[#2D3139] rounded px-3 py-2 text-white text-[11px] mt-1 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  Style / Genre
                  <select 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="bg-[#1A1D24] border border-[#2D3139] rounded px-2 py-2 text-white text-[11px] mt-1 focus:outline-none focus:border-blue-500/50"
                  >
                    <optgroup label="Classical Themes">
                      <option value="tech">Technical</option>
                      <option value="lifestyle">Lifestyle</option>
                    </optgroup>
                    <optgroup label="Creative Expressions">
                      <option value="investigative">Investigative (PBS style)</option>
                      <option value="parody">Parody / Comedy</option>
                      <option value="satire">Satire</option>
                      <option value="sci_fi">Sci-Fi Narrative</option>
                    </optgroup>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">Active Cast</h2>
              <Settings className="w-3.5 h-3.5 text-white/20" />
            </div>
            <div className="space-y-2">
              {DEFAULT_HOSTS.map(host => (
                <div 
                  key={host.id}
                  onClick={() => {
                    setSelectedHosts(prev => 
                      prev.includes(host.id) 
                        ? prev.filter(id => id !== host.id) 
                        : [...prev, host.id]
                    );
                  }}
                  className={cn(
                    "p-2.5 rounded-lg border transition-all cursor-pointer",
                    selectedHosts.includes(host.id) 
                      ? "bg-blue-600/10 border-blue-500/40" 
                      : "bg-[#1A1D24]/40 border-[#2D3139] opacity-40 grayscale"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">{host.name}</span>
                    {selectedHosts.includes(host.id) && <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_5px_#3b82f6]" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-auto pt-6 border-t border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B] mb-4 block">Audio Layers</span>
            <div className="space-y-4">
              {['Voice Intensity', 'Emotional Depth', 'BGM Level'].map((label, i) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-medium text-slate-400"><span>{label}</span><span>{80 - i * 10}%</span></div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${80 - i * 10}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* MAIN: EDITOR & TIMELINE */}
        <main className="flex flex-col bg-[#090A0D] min-w-0 border-r border-white/5 overflow-hidden h-full">
          <div className="flex-1 p-6 flex flex-col min-h-0 overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Script & Expression Engine</h2>
              {episode && <span className="text-[10px] text-slate-600 font-mono italic">Sovereign_FS: ep_102.json</span>}
            </div>
            
            <div className="flex-1 bg-[#0F1117] rounded-xl border border-white/5 p-6 overflow-y-auto custom-scrollbar relative z-10 min-h-0">
              {!episode ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6 text-white/10" />
                  </div>
                  <h3 className="text-sm font-bold text-white/80 mb-2">Stage Ready</h3>
                  <button 
                    onClick={generateNewScript}
                    className="px-5 py-2 bg-blue-600 rounded-lg text-white text-[11px] font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/10"
                  >
                    Compose Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {episode.segments.map((segment, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "group relative p-4 rounded-lg border transition-all duration-300",
                          currentSegmentId === segment.id 
                            ? "bg-blue-500/5 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]" 
                            : "bg-black/20 border-transparent hover:border-white/5"
                        )}
                        key={segment.id}
                      >
                         <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] font-bold text-slate-500 uppercase overflow-hidden text-ellipsis whitespace-nowrap max-w-[124px] flex items-center gap-1.5">
                             {currentSegmentId === segment.id && (
                               <motion.div
                                 animate={{ scale: [1, 1.2, 1] }}
                                 transition={{ repeat: Infinity, duration: 1.5 }}
                               >
                                 <Volume2 className="w-3 h-3 text-blue-500" />
                               </motion.div>
                             )}
                             [{segment.hostId === 'host-5' ? 'Shakespeare Ext' : DEFAULT_HOSTS.find(h => h.id === segment.hostId)?.name}]
                           </span>
                           <select 
                             value={segment.emotion}
                             onChange={(e) => updateSegmentEmotion(segment.id, e.target.value as Emotion)}
                             className="text-[9px] font-mono text-blue-400 bg-transparent border-none focus:outline-none uppercase cursor-pointer hover:text-blue-300 transition-colors"
                           >
                             {EMOTIONS.map(e => <option key={e} value={e} className="bg-[#0F1117] text-white uppercase">{e}</option>)}
                           </select>
                           
                           <button 
                             onClick={() => removeSegment(segment.id)}
                             className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400"
                           >
                             <Trash2 className="w-3 h-3" />
                           </button>
                        </div>
                        <textarea 
                          value={segment.text}
                          onChange={(e) => updateSegmentText(segment.id, e.target.value)}
                          className="w-full bg-transparent border-none text-slate-300 font-serif text-base leading-relaxed resize-none focus:outline-none focus:text-white transition-colors min-h-[1.5em]"
                          rows={Math.max(1, segment.text.split('\n').length)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* LOWER: PIPELINE */}
          <div className="h-40 border-t border-white/5 p-5 bg-[#0F1117] flex flex-col shrink-0 relative z-20">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B] mb-3">Live Pipeline</span>
            <div className="flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-12 gap-1.5 h-12 items-center">
                <div className="col-span-2 h-6 bg-blue-500/10 border border-blue-500/30 rounded flex items-center px-2 text-[9px] text-blue-300">INTRO</div>
                <div className="col-span-8 h-6 bg-slate-500/5 border border-white/5 rounded flex items-center px-2 text-[9px] text-slate-500 italic">ACTIVE_DIALOGUE_STREAM</div>
                <div className="col-span-2 h-6 bg-blue-500/10 border border-blue-500/30 rounded flex items-center px-1.5 text-[9px] text-blue-300 overflow-hidden whitespace-nowrap">OUTRO</div>
              </div>

              <div className="flex justify-between items-center text-[9px] text-slate-600 font-mono">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={togglePlayback}
                    disabled={!episode}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95",
                      isPlaying ? "bg-white text-black" : "bg-blue-600 text-white hover:bg-blue-500"
                    )}
                  >
                    {isPlaying ? <Square className="fill-current w-3 h-3" /> : <Play className="fill-current w-3 h-3 ml-0.5" />}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-white/80 font-bold uppercase tracking-tight">{isPlaying ? "SYNTHESIZING..." : "READY_FOR_BOOT"}</span>
                    <span>MASTER_OUTPUT: SOVEREIGN_V12</span>
                  </div>
                </div>
                <div className="flex gap-6 hidden sm:flex">
                  <span>VOICES: {selectedHosts.length}</span>
                  <span>SR: 44.1KHZ</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* SIDEBAR: RIGHT (RESOURCES) */}
        <aside className="bg-[#0F1117] p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar hidden lg:flex border-l border-white/5 min-h-0 h-full">
          <section>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B] mb-4 block">Local Asset Pool</span>
            <div className="space-y-1">
              {['ambient_tech.wav', 'stinger_v3.mp3', 'swoosh_transition.wav'].map(asset => (
                <div key={asset} className="flex items-center gap-2.5 p-2 hover:bg-white/5 rounded transition-colors text-[11px] text-slate-400 group">
                  <Volume2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  <span>{asset}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-auto">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-500 leading-relaxed italic">
              &quot;Every word here is processed on your silicon. No packets leave. No cloud knows.&quot;
            </div>
          </section>
        </aside>
      </div>

      {/* --- SOVEREIGN IMPORTER MODAL --- */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] bg-[#0F1117] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6 overflow-hidden"
            >
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-white leading-none mb-1 text-shadow-glow">Sovereign Ingest</h2>
                  <p className="text-xs text-slate-500">Sculpt a podcast session from local raw sources.</p>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">
                <div className="flex flex-col gap-4 min-h-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Raw Text Paste</span>
                  <textarea 
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste paragraphs of text here... The engine will automatically distribute it among active hosts."
                    className="flex-1 bg-[#1A1D24] border border-[#2D3139] rounded-xl p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors custom-scrollbar min-h-[150px] resize-none"
                  />
                  <button 
                    onClick={handleRawImport}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-xs font-bold transition-all shrink-0 active:scale-95 transition-transform"
                  >
                    Sculpt from Text
                  </button>
                </div>

                <div className="flex flex-col gap-4 border-l border-white/5 pl-8 min-h-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">URL Ingestion (Exp)</span>
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    <input 
                      type="text" 
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="w-full bg-[#1A1D24] border border-[#2D3139] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                    <p className="text-[10px] text-slate-600 italic">
                      Note: Fetching external URLs is subject to CORS. For best results, use local file paths or paste text directly.
                    </p>
                  </div>
                  <button 
                    onClick={handleUrlImport}
                    disabled={isFetching}
                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0"
                  >
                    {isFetching ? "Ingesting..." : "Ingest URL Content"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
