"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { chatBotAPI } from "@/lib/api/chatbot";
import type { ChatConversation } from "@/lib/api/types";
import { MessageSquare, Plus, Loader2, Calendar, User } from "lucide-react";
import { NotificationManager } from "@/lib/services/notification-manager";

export default function ChatConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatBotAPI.listConversations();
      setConversations(data);
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
      const conversation = await chatBotAPI.createConversation();
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
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Card
              key={conversation.chat_id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenConversation(conversation.chat_id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-lg">
                        Conversation
                      </CardTitle>
                      {conversation.state && (
                        <Badge variant={conversation.state === "active" ? "default" : "secondary"}>
                          {conversation.state}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span>{conversation.participant_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(conversation.created_at)}</span>
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
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {conversation.bot_message}
                    </p>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
