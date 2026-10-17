import GRAMMAR_LESSONS from './grammer-lessons.json';

export { GRAMMAR_LESSONS };

export interface GrammarSectionNote {
  title: string;
  timeRange?: string;
  startSeconds?: number;
  endSeconds?: number;
  description: string;
  formula?: string;
  timeClues?: string[];
  tips?: string[];
}

export function formatSecondsToTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function findActiveSectionIndex(
  sections: GrammarSectionNote[] | undefined,
  currentSeconds: number
): number {
  if (!sections || sections.length === 0) return -1;
  return sections.findIndex((s) => {
    if (s.startSeconds === undefined) return false;
    const end = s.endSeconds !== undefined ? s.endSeconds : Infinity;
    return currentSeconds >= s.startSeconds && currentSeconds <= end;
  });
}

export interface GrammarExample {
  english: string;
  turkish: string;
  analysis: string;
}

export interface GrammarQuizQuestion {
  id: string;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarLesson {
  id: string;
  dayNumber: number;
  title: string;
  subtitle: string;
  videoId: string;
  playlistId: string;
  durationMinutes: number;
  overview: string;
  instructor: string;
  sections: GrammarSectionNote[];
  examTactics: string[];
  examples: GrammarExample[];
  quiz: GrammarQuizQuestion[];
}

export function getGrammarLessonById(lessonId: string): GrammarLesson | undefined {
  return GRAMMAR_LESSONS.find((l) => l.id === lessonId);
}
