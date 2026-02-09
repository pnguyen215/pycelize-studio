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
import { OutputFilesSection } from "@/components/features/chat/output-files-section";
import { WorkflowStepsViewer } from "@/components/features/chat/workflow-steps-viewer";
import { MessageSquare, Trash2, Loader2, ArrowLeft, Copy, RefreshCw } from "lucide-react";
import { NotificationManager } from "@/lib/services/notification-manager";
import { copyToClipboard } from "@/lib/utils/chat-utils";

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
        NotificationManager.success("Chat ID copied to clipboard");
        setTimeout(() => setCopiedChatId(false), 2000);
      } else {
        NotificationManager.error("Failed to copy Chat ID");
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
                          className="h-8 w-8 p-0"
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
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden mb-4">
          <ChatMessages messages={messages} workflowProgress={workflowProgress} />
          <ChatInput
            onSendMessage={sendMessage}
            onUploadFile={uploadFile}
            disabled={isLoading || !chatId}
            showOperations={true}
          />
        </Card>

        {/* Output Files Section */}
        {conversationData?.output_files && conversationData.output_files.length > 0 && (
          <OutputFilesSection outputFiles={conversationData.output_files} />
        )}

        {/* Workflow Steps Section */}
        {conversationData?.workflow_steps && conversationData.workflow_steps.length > 0 && (
          <WorkflowStepsViewer steps={conversationData.workflow_steps} />
        )}
      </div>

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
