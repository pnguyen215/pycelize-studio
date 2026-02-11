"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { chatBotAPI } from "@/lib/api/chatbot";
import type { ChatConversation } from "@/lib/api/types";
import { MessageSquare, Plus, Loader2, Calendar, User, Upload, LayoutGrid, List } from "lucide-react";
import { NotificationManager } from "@/lib/services/notification-manager";

// Gradient colors for conversation cards
const CONVERSATION_GRADIENTS = {
  list: [
    'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900',
    'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900',
    'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900',
    'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900',
    'bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950 dark:to-red-900',
  ],
  card: [
    'bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-900',
    'bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 dark:from-purple-900 dark:via-purple-950 dark:to-pink-900',
    'bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 dark:from-emerald-900 dark:via-emerald-950 dark:to-teal-900',
    'bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 dark:from-amber-900 dark:via-amber-950 dark:to-orange-900',
    'bg-gradient-to-br from-rose-100 via-rose-50 to-red-100 dark:from-rose-900 dark:via-rose-950 dark:to-red-900',
    'bg-gradient-to-br from-cyan-100 via-cyan-50 to-sky-100 dark:from-cyan-900 dark:via-cyan-950 dark:to-sky-900',
  ],
};

// Height constants for layout calculations
const HEADER_HEIGHT = 250; // px - combined height of page header and controls

export default function ChatConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatBotAPI.listConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      NotificationManager.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      setCreating(true);
      const response = await chatBotAPI.createConversation();
      const conversation = response.data;
      router.push(`/features/chatbot/${conversation.chat_id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      NotificationManager.error("Failed to create conversation");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenConversation = (chatId: string) => {
    router.push(`/features/chatbot/${chatId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleRestoreConversation = async (file: File) => {
    try {
      setRestoring(true);
      const response = await chatBotAPI.restoreConversation(file);
      const restoredChat = response.data;
      
      // Reload conversations to include the restored one
      await loadConversations();
      
      // Navigate to the restored conversation
      router.push(`/features/chatbot/${restoredChat.chat_id}`);
    } catch (error) {
      console.error("Error restoring conversation:", error);
      NotificationManager.error("Failed to restore conversation");
    } finally {
      setRestoring(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleRestoreConversation(file);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Chat Conversations
              </CardTitle>
              <CardDescription>
                View and manage your chat bot conversations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Layout Toggle */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Restore Button */}
              <Button
                variant="outline"
                onClick={() => document.getElementById('restore-file-input')?.click()}
                disabled={restoring}
              >
                {restoring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Restore
                  </>
                )}
              </Button>
              <input
                id="restore-file-input"
                type="file"
                accept=".tar.gz"
                className="hidden"
                onChange={handleFileUpload}
              />
              
              {/* New Conversation Button */}
              <Button onClick={handleCreateConversation} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    New Conversation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first conversation to start chatting with the AI assistant
              </p>
              <Button onClick={handleCreateConversation} disabled={creating}>
                <Plus className="h-4 w-4 mr-2" />
                Create Conversation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`max-h-[calc(100vh-${HEADER_HEIGHT}px)] overflow-y-auto scroll-smooth`}>
          {viewMode === 'list' ? (
            // List View
            <div className="grid gap-4">
              {conversations.map((conversation, index) => {
                const gradient = CONVERSATION_GRADIENTS.list[index % CONVERSATION_GRADIENTS.list.length];
                
                return (
                  <Card
                    key={conversation.chat_id}
                    className={`cursor-pointer hover:shadow-lg transition-all ${gradient}`}
                    onClick={() => handleOpenConversation(conversation.chat_id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-lg">
                              Conversation
                            </CardTitle>
                            {conversation.status && (
                              <Badge variant={conversation.status === "completed" ? "default" : "secondary"}>
                                {conversation.status}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <User className="h-3 w-3" />
                              <span>{conversation.participant_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {formatDate(conversation.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Calendar className="h-3 w-3" />
                              <span>Updated: {formatDate(conversation.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {conversation.chat_id.slice(0, 8)}
                        </Badge>
                      </div>
                    </CardHeader>
                    {conversation.bot_message && (
                      <>
                        <Separator />
                        <CardContent className="pt-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {conversation.bot_message}
                          </p>
                        </CardContent>
                      </>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conversations.map((conversation, index) => {
                const gradient = CONVERSATION_GRADIENTS.card[index % CONVERSATION_GRADIENTS.card.length];
                
                return (
                  <Card
                    key={conversation.chat_id}
                    className={`cursor-pointer hover:shadow-xl hover:scale-105 transition-all ${gradient} h-64 flex flex-col`}
                    onClick={() => handleOpenConversation(conversation.chat_id)}
                  >
                    <CardHeader className="flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-white/50 dark:bg-black/30">
                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              Chat
                            </CardTitle>
                            {conversation.status && (
                              <Badge variant={conversation.status === "completed" ? "default" : "secondary"} className="mt-1">
                                {conversation.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs bg-white/50 dark:bg-black/30">
                          {conversation.chat_id.slice(0, 8)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex-1 overflow-hidden pt-4">
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <User className="h-3 w-3" />
                          <span className="truncate">{conversation.participant_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <Calendar className="h-3 w-3" />
                          <span className="truncate">{formatDate(conversation.created_at)}</span>
                        </div>
                      </div>
                      {conversation.bot_message && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-4">
                          {conversation.bot_message}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
