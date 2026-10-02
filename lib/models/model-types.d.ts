export declare const MODEL_TYPES: readonly ["chat", "systemone", "image", "video", "audio_to_text"];
export type ModelType = (typeof MODEL_TYPES)[number];
export function modelTypeLabel(type: string): string;
export function trustsNestedCapabilities(model: { model_type: string }): boolean;
