export const MODEL_TYPES = ["chat", "systemone", "image", "video", "audio_to_text"];

const MODEL_TYPE_LABELS = {
  chat: "Chat",
  systemone: "System One",
  image: "Image",
  video: "Video",
  audio_to_text: "Audio to text",
};

export function modelTypeLabel(type) {
  return MODEL_TYPE_LABELS[type] ?? type;
}

// Audio transcription models publish noisy nested capability flags, so only
// their top-level flags and modalities are trusted.
export function trustsNestedCapabilities(model) {
  return model.model_type !== "audio_to_text";
}
