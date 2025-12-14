// Re-export JSON data as TypeScript module
import rulesData from './dnd-5e-rules.json' assert { type: 'json' };

export const rules = rulesData;
export default rules;
