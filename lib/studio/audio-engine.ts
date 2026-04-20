'use client';

import { Emotion, VoiceProfile, ScriptSegment } from './types';

export class LocalAudioEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  private findBestVoice(profile: VoiceProfile): SpeechSynthesisVoice | undefined {
    const langMatch = this.voices.filter(v => v.lang.startsWith(profile.lang.split('-')[0]));
    if (langMatch.length === 0) return this.voices[0]; // Fallback

    // Simple matching logic
    const genderMatch = langMatch.find(v => 
      (profile.gender === 'female' && (v.name.includes('female') || v.name.includes('Natural') || v.name.includes('Samantha'))) ||
      (profile.gender === 'male' && (v.name.includes('male') || v.name.includes('Alex') || v.name.includes('Daniel')))
    );

    return genderMatch || langMatch[0];
  }

  public speak(segment: ScriptSegment, profile: VoiceProfile): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) return reject('Speech recognition not supported');

      const utterance = new SpeechSynthesisUtterance(segment.text);
      const voice = this.findBestVoice(profile);
      
      if (voice) {
        utterance.voice = voice;
      }

      // Apply emotional layers
      const getEmotionMods = () => {
        const coreEmotion = segment.emotion as string;
        // Direct match
        if (profile.characteristics.emotionalRange[coreEmotion as Emotion]) {
          return profile.characteristics.emotionalRange[coreEmotion as Emotion];
        }
        
        // Fallback mapping for specialized stylistic emotions
        const mapping: Record<string, Emotion> = {
          parody: 'comedic',
          investigative: 'serious',
          satire: 'narrative'
        };
        
        const mapped = mapping[coreEmotion] || 'narrative';
        return profile.characteristics.emotionalRange[mapped] || { pitchMod: 0, rateMod: 0 };
      };

      const emotionMod = getEmotionMods();
      utterance.pitch = profile.characteristics.pitchBase + emotionMod.pitchMod;
      utterance.rate = profile.characteristics.rateBase + emotionMod.rateMod;
      utterance.volume = 1.0;

      let heartbeat: any;

      utterance.onend = () => {
        if (heartbeat) clearInterval(heartbeat);
        resolve();
      };
      utterance.onerror = (e) => {
        if (heartbeat) clearInterval(heartbeat);
        const errorDetail = (e as any).error || 'unknown';
        console.error(`SpeechSynthesis Error [${errorDetail}]:`, e);
        reject({ code: errorDetail, event: e });
      };

      this.synth.speak(utterance);

      // Heartbeat to prevent 15-second timeout in Chromium browsers
      heartbeat = setInterval(() => {
        if (this.synth?.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    });
  }

  public stop() {
    this.synth?.cancel();
  }

  public isSupported(): boolean {
    return !!this.synth;
  }
}

export const audioEngine = typeof window !== 'undefined' ? new LocalAudioEngine() : null;
