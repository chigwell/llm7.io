import chatScores from "@/data/model-scores.json";
import imageScores from "@/data/model-scores-image.json";
import type { PublicModel } from "./api-types";
import { SCORE_REQUIREMENTS, meetsRequirement, scoreSetFor, type ScoreCriterion, type ScoreGroup } from "./score-criteria";

type StoredScores = { criteria_version: number; judged_at: string | null; models: Record<string, { overall: number; opponents: number; scores: Record<string, number | null> }> };

export type CriterionScore = ScoreCriterion & { value: number | null; note?: string };
export type ModelScores = { overall: number; opponents: number; judgedAt: string | null; field: string; basis: string; groups: ScoreGroup[]; criteria: CriterionScore[] };

const stored: Record<string, StoredScores> = { chat: chatScores as unknown as StoredScores, image: imageScores as unknown as StoredScores };

export function modelScores(model: PublicModel): ModelScores | null {
  const set = scoreSetFor(model);
  const data = stored[model.model_type];
  if (!set || !data || data.criteria_version !== set.version) return null;
  const entry = data.models?.[model.model_id];
  if (!entry) return null;
  const criteria = set.criteria.map((criterion): CriterionScore => {
    if (!meetsRequirement(criterion, model)) return { ...criterion, value: null, note: SCORE_REQUIREMENTS[criterion.requires!].note };
    return { ...criterion, value: entry.scores[criterion.key] ?? null };
  });
  return { overall: entry.overall, opponents: entry.opponents, judgedAt: data.judged_at, field: set.field, basis: set.basis, groups: set.groups, criteria };
}
