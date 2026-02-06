import type { WorkflowConfig } from "@/lib/api/types";

const WORKFLOWS_STORAGE_KEY = "pycelize_workflows";
const MAX_WORKFLOWS = 10;

export interface StoredWorkflow extends WorkflowConfig {
  lastExecutionTime?: string;
  status?: "draft" | "running" | "completed" | "failed" | "cancelled";
}

/**
 * Get all workflows from localStorage
 */
export function getStoredWorkflows(): StoredWorkflow[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(WORKFLOWS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading workflows from localStorage:", error);
    return [];
  }
}

/**
 * Save a workflow to localStorage
 */
export function saveWorkflow(workflow: StoredWorkflow): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const workflows = getStoredWorkflows();
    const existingIndex = workflows.findIndex((w) => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      // Update existing workflow
      workflows[existingIndex] = {
        ...workflow,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new workflow
      if (workflows.length >= MAX_WORKFLOWS) {
        // Remove oldest workflow if limit reached
        workflows.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        workflows.shift();
      }
      
      workflows.push({
        ...workflow,
        updatedAt: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
    return true;
  } catch (error) {
    console.error("Error saving workflow to localStorage:", error);
    return false;
  }
}

/**
 * Get a specific workflow by ID
 */
export function getWorkflowById(id: string): StoredWorkflow | null {
  const workflows = getStoredWorkflows();
  return workflows.find((w) => w.id === id) || null;
}

/**
 * Delete a workflow from localStorage
 */
export function deleteWorkflow(id: string): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const workflows = getStoredWorkflows();
    const filtered = workflows.filter((w) => w.id !== id);
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting workflow from localStorage:", error);
    return false;
  }
}

/**
 * Update workflow status
 */
export function updateWorkflowStatus(
  id: string,
  status: StoredWorkflow["status"]
): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const workflows = getStoredWorkflows();
    const workflow = workflows.find((w) => w.id === id);
    
    if (workflow) {
      workflow.status = status;
      workflow.updatedAt = new Date().toISOString();
      
      if (status === "completed" || status === "failed" || status === "cancelled") {
        workflow.lastExecutionTime = new Date().toISOString();
      }
      
      localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error updating workflow status:", error);
    return false;
  }
}

/**
 * Clear all workflows (for testing purposes)
 */
export function clearAllWorkflows(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    localStorage.removeItem(WORKFLOWS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing workflows:", error);
    return false;
  }
}
