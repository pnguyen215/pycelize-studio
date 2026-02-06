import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique workflow ID
 */
export function generateWorkflowId(): string {
  return `workflow-${uuidv4()}`;
}

/**
 * Generate a unique step ID
 */
export function generateStepId(): string {
  return `step-${uuidv4()}`;
}

/**
 * Generate a generic unique ID
 */
export function generateUniqueId(prefix?: string): string {
  const id = uuidv4();
  return prefix ? `${prefix}-${id}` : id;
}
