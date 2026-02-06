import type { WorkflowStepConfig } from "@/lib/api/types";
import { WorkflowStep } from "../WorkflowStep";
import { ExtractionStep } from "./ExtractionStep";
import { NormalizationStep } from "./NormalizationStep";
import { MappingStep } from "./MappingStep";
import { SearchStep } from "./SearchStep";
import { SQLGenerationStep } from "./SQLGenerationStep";
import { JSONGenerationStep } from "./JSONGenerationStep";

/**
 * Factory for creating workflow step instances
 */
export class StepFactory {
  /**
   * Create a workflow step instance based on the step configuration
   */
  public static createStep(config: WorkflowStepConfig): WorkflowStep {
    switch (config.type) {
      case "extraction":
      case "extraction-file":
        return new ExtractionStep(config as any);
      
      case "normalization":
        return new NormalizationStep(config as any);
      
      case "mapping":
        return new MappingStep(config as any);
      
      case "search":
        return new SearchStep(config as any);
      
      case "sql-generation":
        return new SQLGenerationStep(config as any);
      
      case "json-generation":
        return new JSONGenerationStep(config as any);
      
      // TODO: Implement remaining step types
      case "binding-single":
      case "binding-multi":
      case "file-binding":
      case "sql-custom":
      case "json-template":
      case "csv-convert":
        throw new Error(`Step type "${config.type}" is not yet implemented`);
      
      default:
        throw new Error(`Unknown step type: ${(config as any).type}`);
    }
  }

  /**
   * Get available step types with their descriptions
   */
  public static getAvailableStepTypes(): Array<{
    type: string;
    name: string;
    description: string;
  }> {
    return [
      {
        type: "extraction",
        name: "Column Extraction",
        description: "Extract specific columns from the file",
      },
      {
        type: "mapping",
        name: "Column Mapping",
        description: "Rename and map columns to new names",
      },
      {
        type: "normalization",
        name: "Data Normalization",
        description: "Apply normalization rules to columns",
      },
      {
        type: "search",
        name: "Search and Filter",
        description: "Filter rows based on conditions",
      },
      {
        type: "sql-generation",
        name: "Generate SQL",
        description: "Generate SQL INSERT statements",
      },
      {
        type: "json-generation",
        name: "Generate JSON",
        description: "Convert data to JSON format",
      },
      // TODO: Add more step types as they are implemented
    ];
  }
}
