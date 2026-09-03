// The model Athena's live discovery session runs on. Shared so the health
// check exercises exactly the same model the real session uses, which is what
// makes it able to catch a model that is not enabled for the workspace.
export const ATHENA_MODEL = "claude-sonnet-4-6";
