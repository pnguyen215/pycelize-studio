"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { WorkflowStep } from "@/lib/workflow";
import type { WorkflowStepConfig } from "@/lib/api/types";
import { ExtractionStepConfig } from "./step-configs/ExtractionStepConfig";
import { NormalizationStepConfig } from "./step-configs/NormalizationStepConfig";
import { MappingStepConfig } from "./step-configs/MappingStepConfig";
import { SearchStepConfig } from "./step-configs/SearchStepConfig";
import { SQLGenerationStepConfig } from "./step-configs/SQLGenerationStepConfig";
import { JSONGenerationStepConfig } from "./step-configs/JSONGenerationStepConfig";

interface StepConfigurationPanelProps {
  step: WorkflowStep;
  stepConfig: WorkflowStepConfig;
  onUpdate: (stepId: string, newConfig: WorkflowStepConfig) => void;
  inputFile: File | null;
}

export function StepConfigurationPanel({
  step,
  stepConfig,
  onUpdate,
  inputFile,
}: StepConfigurationPanelProps) {
  const [localConfig, setLocalConfig] = useState<WorkflowStepConfig>(stepConfig);

  useEffect(() => {
    setLocalConfig(stepConfig);
  }, [stepConfig]);

  const handleUpdate = () => {
    onUpdate(step.getId(), localConfig);
  };

  const handleConfigChange = (config: Record<string, unknown>) => {
    setLocalConfig({
      ...localConfig,
      config,
    });
  };

  const handleNameChange = (name: string) => {
    setLocalConfig({
      ...localConfig,
      name,
    });
  };

  const handleDescriptionChange = (description: string) => {
    setLocalConfig({
      ...localConfig,
      description,
    });
  };

  const handleEnabledChange = (enabled: boolean) => {
    setLocalConfig({
      ...localConfig,
      enabled,
    });
  };

  const renderStepTypeConfig = () => {
    switch (step.getType()) {
      case "extraction":
      case "extraction-file":
        return (
          <ExtractionStepConfig
            config={localConfig.config}
            onChange={handleConfigChange}
            inputFile={inputFile}
          />
        );
      
      case "normalization":
        return (
          <NormalizationStepConfig
            config={localConfig.config}
            onChange={handleConfigChange}
            inputFile={inputFile}
          />
        );
      
      case "mapping":
        return (
          <MappingStepConfig
            config={localConfig.config}
            onChange={handleConfigChange}
            inputFile={inputFile}
          />
        );
      
      case "search":
        return (
          <SearchStepConfig
            config={localConfig.config}
            onChange={handleConfigChange}
            inputFile={inputFile}
          />
        );
      
      case "sql-generation":
        return (
          <SQLGenerationStepConfig
            config={localConfig.config}
            onChange={handleConfigChange}
            inputFile={inputFile}
          />
        );
      
      case "json-generation":
        return (
          <JSONGenerationStepConfig
            config={localConfig.config}
            onChange={handleConfigChange}
            inputFile={inputFile}
          />
        );
      
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Configuration for this step type is not yet implemented
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Step Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stepName">Step Name</Label>
          <Input
            id="stepName"
            value={localConfig.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter step name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stepDescription">Description (Optional)</Label>
          <Input
            id="stepDescription"
            value={localConfig.description || ""}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Enter step description"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="stepEnabled">Enabled</Label>
          <Switch
            id="stepEnabled"
            checked={localConfig.enabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>
      </div>

      {/* Step Type Configuration */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-4">Step Configuration</h4>
        {renderStepTypeConfig()}
      </div>

      {/* Save Button */}
      <div className="border-t pt-4">
        <Button onClick={handleUpdate} className="w-full">
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
