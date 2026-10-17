import sampleCampData from '../../../content/curriculum/sample-camp.json';
import { CampDefinitionSchema } from '../domain/schemas';
import type { CampDefinition, CampDayDefinition, DailyTaskDefinition } from '../domain/types';

let cachedCamp: CampDefinition | null = null;

export function loadCurriculum(): CampDefinition {
  if (cachedCamp) {
    return cachedCamp;
  }

  const parsed = CampDefinitionSchema.safeParse(sampleCampData);
  if (!parsed.success) {
    console.error('Müfredat şema doğrulama hatası:', parsed.error);
    throw new Error(`Curriculum validation failed: ${parsed.error.message}`);
  }

  cachedCamp = parsed.data as CampDefinition;
  return cachedCamp;
}

export function getCurriculum(): CampDefinition {
  return loadCurriculum();
}

export function getDayDefinition(dayNumber: number): CampDayDefinition | undefined {
  const camp = getCurriculum();
  return camp.days.find((d) => d.dayNumber === dayNumber);
}

export function getTaskDefinition(taskId: string): { task: DailyTaskDefinition; day: CampDayDefinition } | undefined {
  const camp = getCurriculum();
  for (const day of camp.days) {
    const task = day.tasks.find((t) => t.id === taskId);
    if (task) {
      return { task, day };
    }
  }
  return undefined;
}
