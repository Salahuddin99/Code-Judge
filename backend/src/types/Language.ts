// Shared across the app: the languages this judge currently supports.
// Both the database model and the execution services import from here,
// so there's exactly one place to update when adding a new language.
export type SupportedLanguage = 'javascript' | 'python' | 'c++' | 'c#'
