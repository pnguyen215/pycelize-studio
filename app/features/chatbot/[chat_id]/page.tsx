"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useChatBot } from "@/lib/hooks/useChatBot";
import { useChatWebSocket, WebSocketMessage } from "@/lib/hooks/useChatWebSocket";
import { ChatMessages } from "@/components/features/chat/chat-messages";
import { ChatInput } from "@/components/features/chat/chat-input";
import { WorkflowConfirmDialog } from "@/components/features/chat/workflow-confirm-dialog";
import { DeleteConfirmDialog } from "@/components/features/chat/delete-confirm-dialog";
import { UploadedFilesDrawer } from "@/components/features/chat/uploaded-files-drawer";
import { OutputFilesDrawer } from "@/components/features/chat/output-files-drawer";
import { WorkflowStepsDrawer } from "@/components/features/chat/workflow-steps-drawer";
import { MessageSquare, Trash2, Loader2, ArrowLeft, Copy, RefreshCw, Download } from "lucide-react";
import { NotificationManager } from "@/lib/services/notification-manager";
import { copyToClipboard } from "@/lib/utils/chat-utils";
import { chatBotAPI } from "@/lib/api/chatbot";
import type { WorkflowStep } from "@/lib/api/types";

export default function ChatBotPage() {
  const router = useRouter();
  const params = useParams();
  const chatIdFromUrl = params.chat_id as string;
  const {
    chatId,
    messages,
    isLoading,
    pendingWorkflow,
    workflowProgress,
    conversationData,
    initChat,
    loadConversation,
    sendMessage,
    uploadFile,
    confirmWorkflow,
    deleteConversation,
    setWorkflowProgress,
    refreshConversation,
  } = useChatBot();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedChatId, setCopiedChatId] = useState(false);
  const [showUploadedFilesDrawer, setShowUploadedFilesDrawer] = useState(false);
  const [showOutputFilesDrawer, setShowOutputFilesDrawer] = useState(false);
  const [showWorkflowStepsDrawer, setShowWorkflowStepsDrawer] = useState(false);
  const [isDumping, setIsDumping] = useState(false);
  const [dumpDownloadUrl, setDumpDownloadUrl] = useState<string | null>(null);

  // Initialize chat on mount or use existing chat_id from URL
  useEffect(() => {
    if (chatIdFromUrl && !chatId) {
      // Load existing conversation
      loadConversation(chatIdFromUrl).catch((error) => {
        console.error("Failed to load conversation:", error);
        // If loading fails, redirect to create new conversation
        router.push("/features/chatbot");
      });
    } else if (!chatId && !chatIdFromUrl) {
      initChat().then((conversation) => {
        // Redirect to the new chat URL
        router.push(`/features/chatbot/${conversation.chat_id}`);
      });
    }
  }, [chatIdFromUrl, chatId, initChat, loadConversation, router]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log("WebSocket message:", message);

      switch (message.type) {
        case "connected":
          console.log("WebSocket connected");
          break;

        case "workflow_started":
          setWorkflowProgress({
            operation: message.operation || "Processing",
            progress: 0,
            status: "running",
            message: message.message || "Starting workflow...",
          });
          break;

        case "progress":
          setWorkflowProgress({
            operation: message.operation || "Processing",
            progress: message.progress || 0,
            status: message.status || "running",
            message: message.message || "Processing...",
          });
          break;

        case "workflow_completed":
          setWorkflowProgress({
            operation: message.operation || "Processing",
            progress: 100,
            status: "completed",
            message: message.message || "Workflow completed!",
          });
          
          // Clear progress after 3 seconds
          setTimeout(() => {
            setWorkflowProgress(null);
          }, 3000);
          
          NotificationManager.success("Workflow completed successfully!");
          break;

        case "workflow_failed":
          setWorkflowProgress({
            operation: message.operation || "Processing",
            progress: 0,
            status: "failed",
            message: message.error || "Workflow failed",
          });
          
          // Clear progress after 5 seconds
          setTimeout(() => {
            setWorkflowProgress(null);
          }, 5000);
          
          NotificationManager.error(message.error || "Workflow failed");
          break;
      }
    },
    [setWorkflowProgress]
  );

  // Connect to WebSocket
  useChatWebSocket(chatId, handleWebSocketMessage);

  const handleDeleteConversation = async () => {
    await deleteConversation();
    setShowDeleteDialog(false);
    // Redirect to conversations list
    router.push("/features/chatbot");
  };

  const handleBackToList = () => {
    router.push("/features/chatbot");
  };

  const handleCopyChatId = async () => {
    if (chatId) {
      const success = await copyToClipboard(chatId);
      if (success) {
        setCopiedChatId(true);
        setTimeout(() => setCopiedChatId(false), 2000);
      }
    }
  };

  const handleRefreshConversation = async () => {
    setIsRefreshing(true);
    try {
      await refreshConversation();
      NotificationManager.success("Conversation refreshed");
    } catch (error) {
      console.error("Failed to refresh:", error);
      NotificationManager.error("Failed to refresh conversation");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApplyOperation = async (workflowStep: WorkflowStep) => {
    if (!chatId) {
      NotificationManager.error("No active chat session");
      return;
    }

    try {
      // Call confirmWorkflow with the single step as a workflow
      // Pass true for confirmed and the workflow step array
      await confirmWorkflow(true, [workflowStep]);
      NotificationManager.success("Operation applied successfully");
    } catch (error) {
      console.error("Failed to apply operation:", error);
      NotificationManager.error("Failed to apply operation");
      throw error;
    }
  };

  const handleDumpConversation = async () => {
    if (!chatId) {
      NotificationManager.error("No active chat session");
      return;
    }

    setIsDumping(true);
    try {
      const response = await chatBotAPI.dumpConversation(chatId);
      setDumpDownloadUrl(response.data.download_url);
    } catch (error) {
      console.error("Failed to dump conversation:", error);
      NotificationManager.error("Failed to dump conversation");
    } finally {
      setIsDumping(false);
    }
  };

  const handleDownloadDump = () => {
    if (dumpDownloadUrl) {
      window.open(dumpDownloadUrl, "_blank");
      setDumpDownloadUrl(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl h-screen flex flex-col">
      {/* Header */}
      <Card className="mb-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Conversations
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Pycelize Chat Bot</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered file processing assistant
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {chatId && (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    ID: {chatId.slice(0, 8)}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip open={copiedChatId}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyChatId}
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copied!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshConversation}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {dumpDownloadUrl ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadDump}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Dump
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDumpConversation}
                    disabled={isDumping}
                  >
                    <Download className={`h-4 w-4 mr-2 ${isDumping ? 'animate-spin' : ''}`} />
                    {isDumping ? 'Dumping...' : 'Dump'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            
            {!chatId && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Initializing...
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Separator className="mb-4" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Area - Full Width */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ChatMessages messages={messages} workflowProgress={workflowProgress} />
          <ChatInput
            onSendMessage={sendMessage}
            onUploadFile={uploadFile}
            disabled={isLoading || !chatId}
            showOperations={true}
            onOpenUploadedFiles={() => setShowUploadedFilesDrawer(true)}
            onOpenOutputFiles={() => setShowOutputFilesDrawer(true)}
            onOpenWorkflowSteps={() => setShowWorkflowStepsDrawer(true)}
            hasUploadedFiles={!!conversationData?.uploaded_files?.length}
            hasOutputFiles={!!conversationData?.output_files?.length}
            hasWorkflowSteps={!!conversationData?.workflow_steps?.length}
            onApplyOperation={handleApplyOperation}
            chatId={chatId || undefined}
          />
        </Card>
      </div>

      {/* Uploaded Files Drawer - Bottom */}
      <UploadedFilesDrawer
        open={showUploadedFilesDrawer}
        onOpenChange={setShowUploadedFilesDrawer}
        uploadedFiles={conversationData?.uploaded_files || []}
      />

      {/* Output Files Drawer - Bottom */}
      <OutputFilesDrawer
        open={showOutputFilesDrawer}
        onOpenChange={setShowOutputFilesDrawer}
        outputFiles={conversationData?.output_files || []}
      />

      {/* Workflow Steps Drawer - Right */}
      <WorkflowStepsDrawer
        open={showWorkflowStepsDrawer}
        onOpenChange={setShowWorkflowStepsDrawer}
        steps={conversationData?.workflow_steps || []}
      />

      {/* Workflow Confirmation Dialog */}
      <WorkflowConfirmDialog
        open={!!pendingWorkflow}
        workflow={pendingWorkflow}
        onConfirm={(modifiedWorkflow) => confirmWorkflow(true, modifiedWorkflow)}
        onCancel={() => confirmWorkflow(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onConfirm={handleDeleteConversation}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
