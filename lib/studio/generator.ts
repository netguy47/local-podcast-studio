import { PodcastEpisode, ScriptSegment, DEFAULT_HOSTS, Emotion } from './types';

const GENRES = {
  investigative: {
    templates: [
      "In this investigation, we peel back the layers of {topic}.",
      "Documents revealed a shocking truth about {topic}.",
      "But who benefits from keeping {topic} in the shadows?",
      "The evidence points to a massive oversight in how we perceive {topic}.",
      "Our story concludes, but the questions about {topic} remain."
    ]
  },
  parody: {
    templates: [
      "Welcome to 'The Absurd Reality', today featuring {topic}!",
      "I've always said that {topic} is basically just magic for people who hate fun.",
      "Is it even real? Or is {topic} just a giant prank by the universe?",
      "Let's consult the ancient scrolls of {topic}, which I found at a garage sale.",
      "That's all the nonsense we have for {topic} today. Stay weird!"
    ]
  },
  satire: {
    templates: [
      "Oh great, another 'revolutionary' look at {topic}.",
      "I'm sure {topic} will solve all our problems, just like the invention of the wheel did for the DMV.",
      "It's the ultimate solution to a problem that {topic} actually created.",
      "Let's applaud {topic} for being remarkably average in every conceivable way.",
      "Join us next time when we pretend {topic} actually matters."
    ]
  },
  sci_fi: {
    templates: [
      "The year is 2142, and {topic} has reached the singularity.",
      "Transmission received: the neural net for {topic} is fully operational.",
      "Warning: unauthorized access to {topic} core detected.",
      "Initiating jump to hyperspace alongside the {topic} module.",
      "The galaxy will never be the same after the {topic} event."
    ]
  }
};

export const THEMES: Record<string, { topics?: string[]; templates: string[] }> = {
  tech: {
    topics: ['AI Evolution', 'Sovereign Computing', 'Local Studios', 'Open Source Future'],
    templates: [
      "Hello everyone, and welcome to our deep dive into {topic}.",
      "It's fascinating how {topic} is changing the landscape as we speak.",
      "But what about the implications for individual creators?",
      "That's a valid point. Let's explore the technical hurdles.",
      "In summary, {topic} represents a massive shift in how we build."
    ]
  },
  lifestyle: {
    topics: ['Morning Routines', 'Digital Minimalism', 'Productivity Myths', 'Sustainable Travel'],
    templates: [
      "Today we're talking about something close to home: {topic}.",
      "Have you ever felt like {topic} is just out of reach?",
      "Actually, I've found that small changes lead to big results.",
      "Let's break down the three pillars of success in this area.",
      "Thanks for joining our slow-paced discussion on {topic}."
    ]
  },
  ...GENRES
};

export class LocalScriptGenerator {
  public generate(
    title: string,
    topic: string,
    theme: keyof typeof THEMES,
    durationMinutes: number,
    hostIds: string[]
  ): PodcastEpisode {
    const themeData = THEMES[theme];
    const activeTopic = topic || (themeData.topics?.[Math.floor(Math.random() * (themeData.topics?.length || 0))]) || 'The Future';
    const templates = themeData.templates;
    const segments: ScriptSegment[] = [];
    const segmentCount = durationMinutes * 2; 

    const turnId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID().substring(0, 8) : Math.random().toString(36).substring(2, 6);

    for (let i = 0; i < segmentCount; i++) {
      const hostId = hostIds.length > 0 ? hostIds[i % hostIds.length] : 'host-1';
      const template = templates[i % templates.length];
      const text = this.sculptText(template.replace(/{topic}/g, activeTopic), hostId);
      
      // Select emotion based on genre
      let emotion: Emotion = 'narrative';
      if (theme === 'investigative') emotion = 'investigative';
      else if (theme === 'parody') emotion = 'parody';
      else if (theme === 'satire') emotion = 'satire';
      else if (theme === 'sci_fi') emotion = 'dramatic';
      else emotion = this.getRandomEmotion(i, segmentCount);

      segments.push({
        id: `seg-${turnId}-${i}`,
        hostId,
        text,
        emotion,
      });
    }

    return {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      title: title || `${theme.charAt(0).toUpperCase() + theme.slice(1)} Session`,
      description: `A ${durationMinutes}-minute local session about ${activeTopic}.`,
      durationMinutes: durationMinutes as any,
      hosts: hostIds,
      segments,
      createdAt: Date.now()
    };
  }

  public generateFromRawText(title: string, rawText: string, hostIds: string[]): PodcastEpisode {
    const importId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID().substring(0, 8) : Math.random().toString(36).substring(2, 6);
    const paragraphs = rawText.split(/\n\n+/).filter(p => p.trim().length > 0);
    const segments: ScriptSegment[] = paragraphs.map((p, i) => {
      const hostId = hostIds.length > 0 ? hostIds[i % hostIds.length] : 'host-1';
      const text = this.sculptText(p.trim(), hostId);
      
      let emotion: Emotion = 'narrative';
      const lowP = p.toLowerCase();
      if (lowP.includes('amazing') || lowP.includes('incredible')) emotion = 'excited';
      else if (lowP.includes('serious') || lowP.includes('danger')) emotion = 'serious';
      else if (lowP.includes('dark') || lowP.includes('tragedy')) emotion = 'dramatic';
      else if (lowP.includes('joke') || lowP.includes('funny')) emotion = 'comedic';

      return {
        id: `seg-raw-${importId}-${i}`,
        hostId,
        text,
        emotion,
      };
    });

    return {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      title: title || "Imported Script",
      description: "Imported from local raw source",
      durationMinutes: Math.ceil(segments.length / 2) as any,
      hosts: hostIds,
      segments,
      createdAt: Date.now(),
    };
  }

  private sculptText(text: string, hostId: string): string {
    let processed = text;

    // The Overseer (Logic)
    if (hostId === 'host-3' && Math.random() > 0.4) {
      const signatures = ["Data indicates that", "It is mathematically certain:", "Processing the edge-cases..."];
      const sig = signatures[Math.floor(Math.random() * signatures.length)];
      processed = `${sig} ${processed.toLowerCase()}`;
    }

    // Captain Barnaby (Pirate)
    if (hostId === 'host-4') {
      const pirateIdioms = ["Arrr,", "Ahoy thar,", "Ye scallywag,", "By the seven seas,"];
      const idiom = pirateIdioms[Math.floor(Math.random() * pirateIdioms.length)];
      processed = processed.replace(/ing\b/g, "in'").replace(/and\b/g, "an'").replace(/you\b/gi, "ye");
      if (Math.random() > 0.5) processed = processed.replace(/sea/gi, "seeeeeea").replace(/gold/gi, "gooooold");
      processed = `${idiom} ${processed}`;
    }

    // Sir William (Shakespearean)
    if (hostId === 'host-5') {
       const shakesIdioms = ["Verily,", "Forsooth,", "Hark!", "Let it be known,"];
       const idiom = shakesIdioms[Math.floor(Math.random() * shakesIdioms.length)];
       processed = processed.replace(/\bare\b/gi, "art").replace(/\bis\b/gi, "is, in truth,").replace(/\byour\b/gi, "thy").replace(/\byou\b/gi, "thou");
       processed = `${idiom} ${processed}`;
    }

    // Arthur (Vintage Radio)
    if (hostId === 'host-6') {
      const radioIdioms = ["Ladies and gentlemen,", "Stay tuned,", "Good evening listeners,"];
      const idiom = radioIdioms[Math.floor(Math.random() * radioIdioms.length)];
      if (Math.random() > 0.5) processed += " — and we'll be right back!";
      processed = `${idiom} ${processed}`;
    }

    // Frontline (Investigative)
    if (hostId === 'host-7') {
      const pbsIdioms = ["In this investigation,", "What we found was...", "According to documents,"];
      const idiom = pbsIdioms[Math.floor(Math.random() * pbsIdioms.length)];
      processed = `${idiom} ${processed.toLowerCase()}`;
    }

    // Socialite (Elegant)
    if (hostId === 'host-8') {
      const socialiteIdioms = ["Quite extraordinary!", "Marvelous indeed,", "You simply must understand,"];
      const idiom = socialiteIdioms[Math.floor(Math.random() * socialiteIdioms.length)];
      processed = `${idiom} ${processed.replace(/very/gi, "awfully")}`;
    }

    // Sir David (Naturalist)
    if (hostId === 'host-9') {
      const naturalIdioms = ["Observe...", "Remarkably,", "In the wild,"];
      const idiom = naturalIdioms[Math.floor(Math.random() * naturalIdioms.length)];
      processed = `${idiom} ... ${processed}`;
    }

    return processed;
  }

  private getRandomEmotion(index: number, total: number): Emotion {
    if (index === 0) return 'excited';
    if (index === total - 1) return 'calm';
    const emotions: Emotion[] = ['narrative', 'serious', 'dramatic', 'comedic', 'calm'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }
}

export const scriptGenerator = new LocalScriptGenerator();
