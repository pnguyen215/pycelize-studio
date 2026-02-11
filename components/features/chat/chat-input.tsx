"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Loader2, LayoutGrid, FileText, Workflow, Upload } from "lucide-react";
import { NotificationManager } from "@/lib/services/notification-manager";
import { OperationsModal } from "./operations-modal";
import type { WorkflowStep } from "@/lib/api/types";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onUploadFile: (file: File) => void;
  disabled?: boolean;
  showOperations?: boolean;
  onOpenOutputFiles?: () => void;
  onOpenWorkflowSteps?: () => void;
  onOpenUploadedFiles?: () => void;
  hasOutputFiles?: boolean;
  hasWorkflowSteps?: boolean;
  hasUploadedFiles?: boolean;
  onApplyOperation?: (workflowStep: WorkflowStep) => Promise<void>;
  chatId?: string;
}

export function ChatInput({
  onSendMessage,
  onUploadFile,
  disabled = false,
  showOperations = true,
  onOpenOutputFiles,
  onOpenWorkflowSteps,
  onOpenUploadedFiles,
  hasOutputFiles = false,
  hasWorkflowSteps = false,
  hasUploadedFiles = false,
  onApplyOperation,
  chatId,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showOperationsModal, setShowOperationsModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      NotificationManager.error("File size must be less than 10MB");
      return;
    }

    // Validate file type (Excel, CSV)
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
      NotificationManager.error("Please upload an Excel (.xlsx, .xls) or CSV file");
      return;
    }

    setIsUploading(true);
    try {
      await onUploadFile(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectOperation = (operation: string, endpoint: string) => {
    console.log("Selected operation:", operation, endpoint);
    // Don't close modal - let user configure and apply
  };

  const handleApplyOperation = async (workflowStep: WorkflowStep) => {
    if (onApplyOperation) {
      await onApplyOperation(workflowStep);
      setShowOperationsModal(false);
      NotificationManager.success("Operation applied successfully");
    }
  };

  return (
    <>
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />

          {showOperations && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowOperationsModal(true)}
              disabled={disabled}
              title="View supported operations"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          )}

          {onOpenUploadedFiles && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenUploadedFiles}
              disabled={disabled || !hasUploadedFiles}
              title="View uploaded files"
              className={hasUploadedFiles ? "text-green-600 dark:text-green-400" : ""}
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}

          {onOpenOutputFiles && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenOutputFiles}
              disabled={disabled || !hasOutputFiles}
              title="View output files"
              className={hasOutputFiles ? "text-blue-600 dark:text-blue-400" : ""}
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}

          {onOpenWorkflowSteps && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenWorkflowSteps}
              disabled={disabled || !hasWorkflowSteps}
              title="View workflow steps"
              className={hasWorkflowSteps ? "text-purple-600 dark:text-purple-400" : ""}
            >
              <Workflow className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            title="Upload file"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Upload Excel (.xlsx, .xls) or CSV files up to 10MB
        </p>
      </div>

      <OperationsModal
        open={showOperationsModal}
        onOpenChange={setShowOperationsModal}
        onSelectOperation={handleSelectOperation}
        onApplyOperation={handleApplyOperation}
        chatId={chatId}
      />
    </>
  );
}
