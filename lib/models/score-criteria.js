// Bump a version when that set's criteria wording or judging prompt changes so its stored judgments are regenerated.
export const SCORE_CRITERIA_VERSION = 2;
export const IMAGE_SCORE_CRITERIA_VERSION = 1;

// A criterion with `requires` is only judged and shown when both models meet the requirement.
export const SCORE_REQUIREMENTS = {
  image_input: { test: (model) => model.modalities.input.includes("image"), note: "No image input" },
  image_edits: { test: (model) => Boolean(model.capabilities?.image_edits), note: "No image editing" },
  multi_reference: { test: (model) => (model.capabilities?.max_reference_images ?? 0) >= 2, note: "No multi-image input" },
};

export const SCORE_GROUPS = [
  { key: "reasoning", label: "Knowledge & reasoning" },
  { key: "coding", label: "Coding & tools" },
  { key: "language", label: "Writing & language" },
  { key: "work", label: "Data & professional work" },
  { key: "control", label: "Reliability & control" },
  { key: "practical", label: "Speed, cost & vision" },
];

export const SCORE_CRITERIA = [
  { key: "general_knowledge", group: "reasoning", label: "General knowledge", description: "Breadth and accuracy of world knowledge across common domains." },
  { key: "reasoning", group: "reasoning", label: "Logical reasoning", description: "Multi-step deductive and analytical reasoning without losing the thread." },
  { key: "math", group: "reasoning", label: "Mathematics", description: "Solving arithmetic, algebra and competition-style math problems correctly." },
  { key: "scientific", group: "reasoning", label: "Scientific and technical depth", description: "Expert-level answers in physics, chemistry, biology and engineering." },
  { key: "planning", group: "reasoning", label: "Planning and task decomposition", description: "Breaking complex goals into ordered, actionable steps." },
  { key: "code_generation", group: "coding", label: "Code generation", description: "Writing correct, idiomatic, runnable code from a specification." },
  { key: "code_debugging", group: "coding", label: "Debugging and code review", description: "Finding and fixing bugs in existing code and explaining the root cause." },
  { key: "agentic_coding", group: "coding", label: "Agentic coding", description: "Working autonomously across a multi-file repository with tools and tests." },
  { key: "tool_use", group: "coding", label: "Tool and function calling", description: "Choosing the right tool, filling arguments correctly and chaining calls." },
  { key: "sql", group: "coding", label: "SQL and query writing", description: "Writing correct, efficient SQL and database queries from a described schema." },
  { key: "creative_writing", group: "language", label: "Creative writing", description: "Fiction, poetry and marketing copy with an original, engaging voice." },
  { key: "business_writing", group: "language", label: "Professional writing", description: "Clear emails, reports and documentation in a professional tone." },
  { key: "conversation", group: "language", label: "Conversational quality", description: "Natural, helpful, context-aware multi-turn dialogue." },
  { key: "multilingual", group: "language", label: "Multilingual ability", description: "Understanding and writing fluently in many non-English languages." },
  { key: "translation", group: "language", label: "Translation", description: "Accurate, idiomatic translation that preserves meaning and tone." },
  { key: "summarization", group: "language", label: "Summarization", description: "Condensing long documents faithfully without dropping key points." },
  { key: "data_analysis", group: "work", label: "Data analysis", description: "Interpreting tables, CSV data and statistics and drawing correct conclusions." },
  { key: "domain_expertise", group: "work", label: "Professional domains", description: "Competent answers in law, medicine and finance with appropriate caveats." },
  { key: "extraction", group: "work", label: "Information extraction", description: "Pulling entities, fields and facts from unstructured text precisely." },
  { key: "classification", group: "work", label: "Classification and labeling", description: "Assigning correct categories, sentiment and tags to text at scale." },
  { key: "long_context", group: "work", label: "Long-context handling", description: "Retrieving and using facts buried deep in very long inputs." },
  { key: "instruction_following", group: "control", label: "Instruction following", description: "Following explicit constraints on format, length, style and scope." },
  { key: "structured_output", group: "control", label: "Structured output", description: "Producing valid JSON and schema-conformant output reliably." },
  { key: "factual_accuracy", group: "control", label: "Factual accuracy", description: "Low hallucination rate; admits uncertainty instead of inventing facts." },
  { key: "safety", group: "control", label: "Safety and alignment", description: "Refusing genuinely harmful requests while avoiding over-refusal." },
  { key: "steerability", group: "control", label: "Steerability", description: "Adopting a requested persona, tone or system prompt consistently." },
  { key: "consistency", group: "control", label: "Output consistency", description: "Giving stable, reproducible answers to the same prompt." },
  { key: "speed", group: "practical", label: "Response speed", description: "Low latency and high tokens-per-second throughput." },
  { key: "cost_efficiency", group: "practical", label: "Cost efficiency", description: "Quality delivered per dollar of input and output tokens." },
  { key: "vision", group: "practical", label: "Image understanding", description: "Reading screenshots, charts, documents and photos accurately.", requires: "image_input" },
];

export const IMAGE_SCORE_GROUPS = [
  { key: "quality", label: "Image quality & realism" },
  { key: "prompt", label: "Prompt understanding" },
  { key: "text", label: "Text & graphic design" },
  { key: "style", label: "Style & aesthetics" },
  { key: "editing", label: "Editing & references" },
  { key: "practical", label: "Speed, cost & reliability" },
];

export const IMAGE_SCORE_CRITERIA = [
  { key: "photorealism", group: "quality", label: "Photorealism", description: "Lifelike photographs with believable lighting, materials and skin texture." },
  { key: "detail", group: "quality", label: "Fine detail and sharpness", description: "Crisp textures and small details without blur, smearing or noise." },
  { key: "anatomy", group: "quality", label: "Human anatomy", description: "Correct hands, faces, limbs and body proportions without distortions." },
  { key: "lighting", group: "quality", label: "Lighting and color", description: "Coherent light direction, shadows and reflections with pleasing color grading." },
  { key: "artifacts", group: "quality", label: "Artifact-free output", description: "Clean images without warped geometry, melted objects or generation glitches." },
  { key: "prompt_adherence", group: "prompt", label: "Prompt adherence", description: "Including every requested subject, attribute and detail from a long prompt." },
  { key: "complex_scenes", group: "prompt", label: "Complex multi-subject scenes", description: "Handling many subjects with the right actions and interactions in one scene." },
  { key: "spatial", group: "prompt", label: "Spatial relationships", description: "Placing objects left, right, above, behind or in front of each other as described." },
  { key: "attribute_binding", group: "prompt", label: "Counting and attribute binding", description: "Drawing the exact number of objects and giving each the right color and attributes." },
  { key: "world_knowledge", group: "prompt", label: "World knowledge", description: "Accurately depicting real landmarks, products, cultural details and well-known concepts." },
  { key: "text_rendering", group: "text", label: "Text rendering", description: "Spelling words, signs and labels correctly and legibly inside the image." },
  { key: "multilingual_text", group: "text", label: "Non-Latin text", description: "Rendering Cyrillic, Chinese, Japanese, Arabic and other scripts correctly." },
  { key: "typography_layout", group: "text", label: "Posters and layouts", description: "Posters, ads and covers with a balanced composition of text and imagery." },
  { key: "infographics", group: "text", label: "Diagrams and infographics", description: "Readable, logically structured charts, diagrams, UI mockups and slides." },
  { key: "logos", group: "text", label: "Logos and icons", description: "Clean, simple logos, icons and brand assets with a flat graphic look." },
  { key: "aesthetics", group: "style", label: "Aesthetic appeal", description: "Visually striking images with professional taste even from short prompts." },
  { key: "artistic_styles", group: "style", label: "Artistic style range", description: "Convincing painting, illustration, anime, pixel art and 3D render styles on request." },
  { key: "composition", group: "style", label: "Composition and camera control", description: "Following requested framing, camera angle, lens and depth of field." },
  { key: "creativity", group: "style", label: "Creative interpretation", description: "Original, imaginative results for abstract or open-ended prompts." },
  { key: "product_imagery", group: "style", label: "Product and commercial imagery", description: "Studio-quality product shots, e-commerce photos and advertising visuals." },
  { key: "instruction_editing", group: "editing", label: "Instruction-based editing", description: "Changing exactly what an edit instruction asks while leaving the rest untouched.", requires: "image_edits" },
  { key: "object_editing", group: "editing", label: "Object and background replacement", description: "Adding, removing or swapping objects and backgrounds with seamless blending.", requires: "image_edits" },
  { key: "character_consistency", group: "editing", label: "Character consistency", description: "Keeping the same person, character or product recognisable across new images.", requires: "image_edits" },
  { key: "style_transfer", group: "editing", label: "Style transfer", description: "Restyling an input image while preserving its structure and content.", requires: "image_edits" },
  { key: "multi_reference", group: "editing", label: "Multi-reference composition", description: "Combining several reference images into one coherent result.", requires: "multi_reference" },
  { key: "speed", group: "practical", label: "Generation speed", description: "Short time from request to finished image." },
  { key: "cost_efficiency", group: "practical", label: "Cost efficiency", description: "Image quality delivered per dollar spent per image." },
  { key: "resolution", group: "practical", label: "Resolution and aspect ratios", description: "High native output resolution and flexible aspect ratios." },
  { key: "reliability", group: "practical", label: "Reliability", description: "Consistently successful generations without failures, timeouts or quality swings." },
  { key: "content_policy", group: "practical", label: "Content policy balance", description: "Blocking genuinely harmful requests without over-blocking legitimate creative prompts." },
];

// Each model type with its own criteria; its pairwise judgments and scores are stored separately.
export const SCORE_SETS = {
  chat: { version: SCORE_CRITERIA_VERSION, groups: SCORE_GROUPS, criteria: SCORE_CRITERIA, field: "text models", basis: "public information" },
  image: { version: IMAGE_SCORE_CRITERIA_VERSION, groups: IMAGE_SCORE_GROUPS, criteria: IMAGE_SCORE_CRITERIA, field: "image models", basis: "public information and live LLM7 traffic" },
};

export function scoreSetFor(model) {
  return SCORE_SETS[model.model_type] ?? null;
}

export function meetsRequirement(criterion, model) {
  return !criterion.requires || SCORE_REQUIREMENTS[criterion.requires].test(model);
}
