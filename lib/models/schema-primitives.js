import { z } from "zod";

export const DECIMAL_STRING = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
export const DENIED_PUBLIC_KEYS =
  /(?:^|_)(?:provider|owned_by|supplier|vendor|upstream_model|deployment|backend|hostname|region|internal_cost|margin)(?:$|_)/i;
export const NonNegativeNumber = z.number().finite().nonnegative();
export const NullableNonNegativeNumber = NonNegativeNumber.nullable();
export const Rate = z.number().finite().min(0).max(1).nullable();
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().positive(),
});
