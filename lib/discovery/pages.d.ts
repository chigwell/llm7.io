import type { PublicModel, PublicModelDataSnapshot } from "../models/api-types";
export type Template = {
  slug: string;
  title: string;
  description?: string;
  limitation?: string;
  reviewed?: string;
  sources?: string[];
  steps?: string[];
  input?: number;
  output?: number;
};
export type DiscoveryPage = {
  family: string;
  slug: string;
  title: string;
  description: string;
  path: string;
  models: PublicModel[];
  indexable: boolean;
  template?: Template;
  original?: PublicModel;
  children?: { path: string; title: string; indexable: boolean }[];
};
export const BASE: string;
export const TEMPLATE_VERSION: number;
export const features: Template[];
export const integrations: Template[];
export const scenarios: Template[];
export function definePages(snapshot: PublicModelDataSnapshot): DiscoveryPage[];
export function capability(model: PublicModel, name: string): boolean | null;
export function facts(model: PublicModel): string[];
export function alternatives(
  model: PublicModel,
  models: PublicModel[],
): PublicModel[];
export function configuration(slug: string, model: PublicModel): string;
export function featureExample(slug: string, model: PublicModel): string;
export function estimate(
  model: PublicModel,
  requests: string | number,
  input: string | number,
  output: string | number,
): { cost: string | null; status: string };
export function validCount(value: string | number): boolean;
export function idOrder(a: PublicModel, b: PublicModel): number;
export function integrationEligible(model: PublicModel, slug: string): boolean;
export function chatInterface(model: PublicModel): boolean;
