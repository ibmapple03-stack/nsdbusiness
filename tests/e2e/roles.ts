export const ROLES = ["ceo", "coordinator", "manager", "secretary"] as const;
export const stateFile = (role: string) => `test-results/.auth/${role}.json`;
