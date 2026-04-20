export type Emotion = 'calm' | 'excited' | 'dramatic' | 'narrative' | 'comedic' | 'serious' | 'parody' | 'investigative' | 'satire';

export interface VoiceProfile {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'adult' | 'senior';
  characteristics: {
    pitchBase: number;
    rateBase: number;
    emotionalRange: Record<string, { pitchMod: number; rateMod: number }>;
  };
}

export interface ScriptSegment {
  id: string;
  hostId: string;
  text: string;
  emotion: Emotion;
  durationEstimate?: number; // In seconds
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  durationMinutes: 5 | 10 | 15 | 20;
  hosts: string[]; // IDs of VoiceProfiles
  segments: ScriptSegment[];
  backgroundMusicId?: string;
  createdAt: number;
}

export const DEFAULT_HOSTS: VoiceProfile[] = [
  {
    id: 'host-1',
    name: 'Alex (Narrator)',
    lang: 'en-US',
    gender: 'male',
    age: 'adult',
    characteristics: {
      pitchBase: 1.0,
      rateBase: 1.0,
      emotionalRange: {
        calm: { pitchMod: 0, rateMod: 0 },
        excited: { pitchMod: 0.1, rateMod: 0.2 },
        dramatic: { pitchMod: -0.1, rateMod: -0.1 },
        narrative: { pitchMod: 0, rateMod: 0.05 },
        comedic: { pitchMod: 0.15, rateMod: 0.1 },
        serious: { pitchMod: -0.05, rateMod: -0.05 }
      }
    }
  },
  {
    id: 'host-2',
    name: 'Sarah (Energetic)',
    lang: 'en-US',
    gender: 'female',
    age: 'young',
    characteristics: {
      pitchBase: 1.2,
      rateBase: 1.1,
      emotionalRange: {
        calm: { pitchMod: -0.05, rateMod: -0.1 },
        excited: { pitchMod: 0.2, rateMod: 0.3 },
        dramatic: { pitchMod: 0.1, rateMod: -0.2 },
        narrative: { pitchMod: 0, rateMod: 0 },
        comedic: { pitchMod: 0.2, rateMod: 0.1 },
        serious: { pitchMod: -0.1, rateMod: -0.1 }
      }
    }
  },
  {
    id: 'host-3',
    name: 'The Overseer (Logic)',
    lang: 'en-US',
    gender: 'male',
    age: 'senior',
    characteristics: {
      pitchBase: 0.8,
      rateBase: 1.2,
      emotionalRange: {
        calm: { pitchMod: 0, rateMod: 0 },
        excited: { pitchMod: 0.3, rateMod: 0.4 },
        dramatic: { pitchMod: -0.2, rateMod: -0.3 },
        narrative: { pitchMod: 0.05, rateMod: 0.1 },
        comedic: { pitchMod: 0.2, rateMod: 0.1 },
        serious: { pitchMod: -0.15, rateMod: -0.2 }
      }
    }
  },
  {
    id: 'host-4',
    name: 'Captain Barnaby (Pirate)',
    lang: 'en-GB', // Usually sounds better with a British/West Country accent
    gender: 'male',
    age: 'senior',
    characteristics: {
      pitchBase: 0.6, // Low, gravelly
      rateBase: 0.85, // Slower, rolling cadence
      emotionalRange: {
        calm: { pitchMod: 0, rateMod: 0 },
        excited: { pitchMod: 0.4, rateMod: 0.3 },
        dramatic: { pitchMod: -0.1, rateMod: -0.2 },
        narrative: { pitchMod: 0.1, rateMod: 0.05 },
        comedic: { pitchMod: 0.3, rateMod: 0.1 },
        serious: { pitchMod: -0.2, rateMod: -0.15 }
      }
    }
  },
  {
    id: 'host-5',
    name: 'Sir William (Shakespearean)',
    lang: 'en-GB',
    gender: 'male',
    age: 'senior',
    characteristics: {
      pitchBase: 1.1,
      rateBase: 0.9,
      emotionalRange: {
        calm: { pitchMod: 0, rateMod: 0 },
        excited: { pitchMod: 0.2, rateMod: 0.2 },
        dramatic: { pitchMod: -0.1, rateMod: -0.1 },
        narrative: { pitchMod: 0.05, rateMod: 0.05 },
        comedic: { pitchMod: 0.1, rateMod: 0.1 },
        serious: { pitchMod: -0.05, rateMod: -0.1 }
      }
    }
  },
  {
    id: 'host-6',
    name: 'Arthur (Vintage Radio)',
    lang: 'en-US',
    gender: 'male',
    age: 'adult',
    characteristics: {
      pitchBase: 1.05,
      rateBase: 1.1,
      emotionalRange: {
        calm: { pitchMod: 0, rateMod: 0 },
        excited: { pitchMod: 0.15, rateMod: 0.15 },
        dramatic: { pitchMod: -0.1, rateMod: -0.15 },
        narrative: { pitchMod: 0.05, rateMod: 0.05 },
        comedic: { pitchMod: 0.1, rateMod: 0.1 },
        serious: { pitchMod: -0.05, rateMod: -0.05 }
      }
    }
  },
  {
    id: 'host-7',
    name: 'Frontline (Investigative)',
    lang: 'en-US',
    gender: 'male',
    age: 'senior',
    characteristics: {
      pitchBase: 0.95,
      rateBase: 0.85,
      emotionalRange: {
        calm: { pitchMod: 0, rateMod: 0 },
        excited: { pitchMod: 0.1, rateMod: 0.1 },
        dramatic: { pitchMod: -0.15, rateMod: -0.2 },
        narrative: { pitchMod: 0, rateMod: 0.05 },
        comedic: { pitchMod: 0.05, rateMod: 0.05 },
        serious: { pitchMod: -0.1, rateMod: -0.1 }
      }
    }
  },
  {
    id: 'host-8',
    name: 'Socialite (Elegant)',
    lang: 'en-US',
    gender: 'female',
    age: 'adult',
    characteristics: {
      pitchBase: 1.15,
      rateBase: 1.1,
      emotionalRange: {
        calm: { pitchMod: 0, rateMod: 0 },
        excited: { pitchMod: 0.25, rateMod: 0.2 },
        dramatic: { pitchMod: 0.15, rateMod: -0.1 },
        narrative: { pitchMod: 0.1, rateMod: 0.1 },
        comedic: { pitchMod: 0.2, rateMod: 0.2 },
        serious: { pitchMod: -0.1, rateMod: -0.05 }
      }
    }
  },
  {
    id: 'host-9',
    name: 'Sir David (Naturalist)',
    lang: 'en-GB',
    gender: 'male',
    age: 'senior',
    characteristics: {
      pitchBase: 1.0,
      rateBase: 0.75,
      emotionalRange: {
        calm: { pitchMod: 0, rateMod: 0 },
        excited: { pitchMod: 0.2, rateMod: 0.2 },
        dramatic: { pitchMod: -0.2, rateMod: -0.3 },
        narrative: { pitchMod: 0.1, rateMod: 0.1 },
        comedic: { pitchMod: 0.15, rateMod: 0.1 },
        serious: { pitchMod: -0.1, rateMod: -0.2 }
      }
    }
  }
];
