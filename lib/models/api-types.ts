import type { z } from "zod";
import type {
  HistoryResponseSchema,
  MetricsResponseSchema,
  ModelDetailSchema,
  ModelListResponseSchema,
  StatisticsSummarySchema,
  VersionResponseSchema,
} from "./schema";

export type PublicModel = z.infer<typeof ModelDetailSchema>;
export type PublicModelListResponse = z.infer<typeof ModelListResponseSchema>;
export type PublicModelHistory = z.infer<typeof HistoryResponseSchema>;
export type PublicModelMetrics = z.infer<typeof MetricsResponseSchema>;
export type PublicStatisticsSummary = z.infer<typeof StatisticsSummarySchema>;
export type PublicCatalogVersion = z.infer<typeof VersionResponseSchema>;

export type PublicModelSnapshot = {
  model: PublicModel;
  history: PublicModelHistory;
  metrics: PublicModelMetrics;
};

export type PublicModelDataSnapshot = {
  metadata: {
    generated_at: string;
    api_base: string;
    catalog_version: string;
    catalog_updated_at: string;
    latest_metrics_bucket: string | null;
    etags: Record<string, string>;
  };
  version: PublicCatalogVersion;
  list_pages: PublicModelListResponse[];
  models: PublicModelSnapshot[];
  summary: PublicStatisticsSummary;
};
