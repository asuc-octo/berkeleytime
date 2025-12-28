// Common abbreviations for UC Berkeley departments
// Maps official subject code -> common nicknames/abbreviations
// Used to enhance fuzzy search when SIS departmentNicknames field is empty
export const SUBJECT_NICKNAME_MAP: Record<string, string[]> = {
  COMPSCI: ["CS", "COMP SCI"],
  EECS: ["EE"],
  INTEGBI: ["IB"],
  MCELLBI: ["MCB"],
  PLANTBI: ["PMB"],
  BIOENG: ["BIOE"],
  CIVENG: ["CE"],
  ELENG: ["EL ENG"],
  INDENG: ["IEOR"],
  MATSCI: ["MSE"],
  MECENG: ["ME", "MECH ENG"],
  NUCENG: ["NE"],
  PHYSICS: ["PHYS"],
  HISTORY: ["HIST"],
  PSYCH: ["PSYCHOLOGY"],
  POLSCI: ["POLI SCI", "PS"],
  SOCIOL: ["SOC"],
  LINGUIS: ["LING"],
  DATASCI: ["DATA"],
};
