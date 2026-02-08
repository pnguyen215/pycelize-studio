"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useChatBot } from "@/lib/hooks/useChatBot";
import { useChatWebSocket, WebSocketMessage } from "@/lib/hooks/useChatWebSocket";
import { ChatMessages } from "@/components/features/chat/chat-messages";
import { ChatInput } from "@/components/features/chat/chat-input";
import { WorkflowConfirmDialog } from "@/components/features/chat/workflow-confirm-dialog";
import { DeleteConfirmDialog } from "@/components/features/chat/delete-confirm-dialog";
import { OperationsSelector } from "@/components/features/chat/operations-selector";
import { MessageSquare, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { NotificationManager } from "@/lib/services/notification-manager";

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
    initChat,
    loadConversation,
    sendMessage,
    uploadFile,
    confirmWorkflow,
    deleteConversation,
    setWorkflowProgress,
  } = useChatBot();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
                <Badge variant="secondary" className="font-mono">
                  ID: {chatId.slice(0, 8)}
                </Badge>
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
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <ChatMessages messages={messages} workflowProgress={workflowProgress} />
            <ChatInput
              onSendMessage={sendMessage}
              onUploadFile={uploadFile}
              disabled={isLoading || !chatId}
            />
          </Card>
        </div>

        {/* Operations Sidebar */}
        <div className="w-80 overflow-y-auto">
          <OperationsSelector 
            onSelectOperation={(operation, endpoint) => {
              console.log("Selected:", operation, endpoint);
              // You can send this as a message or use it for suggestions
            }}
          />
        </div>
      </div>

      {/* Workflow Confirmation Dialog */}
      <WorkflowConfirmDialog
        open={!!pendingWorkflow}
        workflow={pendingWorkflow}
        onConfirm={() => confirmWorkflow(true)}
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
