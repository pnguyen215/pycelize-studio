# Chatbot API Endpoint Fix

## Problem Statement

The chatbot conversations list page was using the wrong API endpoint, causing unintended behavior:

### Issues
1. **Wrong endpoint on page load**: Used `POST /chat/bot/conversations` (creates new conversation)
2. **Should use**: `GET /chat/workflows` (lists existing conversations)
3. **Effect**: Every time the user visited `/features/chatbot`, a new conversation was created automatically

## Solution

### API Endpoint Mapping

| Action | Endpoint | Method | Usage |
|--------|----------|--------|-------|
| **List all conversations** | `/chat/workflows` | GET | Load conversations list on page |
| **Create new conversation** | `/chat/bot/conversations` | POST | Only when user clicks "New Conversation" |
| **Send message** | `/chat/bot/conversations/{id}/message` | POST | Send message in active chat |
| **Upload file** | `/chat/bot/conversations/{id}/upload` | POST | Upload file to chat |
| **Confirm workflow** | `/chat/bot/conversations/{id}/confirm` | POST | Confirm workflow execution |
| **Get history** | `/chat/bot/conversations/{id}/history` | GET | Get conversation history |
| **Delete conversation** | `/chat/bot/conversations/{id}` | DELETE | Delete a conversation |
| **Get operations** | `/chat/bot/operations` | GET | Get supported operations |

### Response Structure Comparison

#### GET /chat/workflows (Correct for listing)
```json
{
  "data": {
    "conversations": [
      {
        "chat_id": "baea06bc-615a-453a-ac49-71c066dc262a",
        "participant_name": "Lion-1976",
        "created_at": "2026-02-08T15:36:10.930810",
        "updated_at": "2026-02-08T15:36:10.930810",
        "status": "created",
        "partition_key": "2026/02",
        "metadata": {}
      }
    ],
    "count": 19
  },
  "message": "Conversations retrieved successfully",
  "status_code": 200
}
```

#### POST /chat/bot/conversations (For creating new)
```json
{
  "data": {
    "chat_id": "64854f5c-b316-4c0d-9a43-8bb5e3827873",
    "participant_name": "Octopus-6232",
    "bot_message": "👋 **Welcome to Pycelize Chat Bot!**\n\n...",
    "created_at": "2026-02-08T14:15:07.281164",
    "status": "created",
    "state": "idle"
  },
  "message": "Bot conversation started successfully",
  "status_code": 200
}
```

## Implementation Changes

### 1. Updated Type Definitions

**ChatConversation Interface** (`lib/api/types.ts`)
```typescript
export interface ChatConversation {
  chat_id: string;
  participant_name: string;
  bot_message?: string;              // Optional - only in create response
  created_at: string;
  updated_at: string;                // Added for workflows list
  state?: string;
  status?: string;
  partition_key?: string;            // Added for workflows list
  metadata?: Record<string, unknown>; // Added for workflows list
}
```

**New WorkflowsListResponse Type** (`lib/api/types.ts`)
```typescript
export interface WorkflowsListResponse {
  conversations: ChatConversation[];
  count: number;
}
```

### 2. Updated API Method

**lib/api/chatbot.ts**

Before:
```typescript
async listConversations(): Promise<StandardResponse<ChatConversation[]>> {
  const response = await axiosInstance.get("/chat/bot/conversations");
  return response.data;
}
```

After:
```typescript
async listConversations(): Promise<StandardResponse<WorkflowsListResponse>> {
  const response = await axiosInstance.get("/chat/workflows");
  return response.data;
}
```

### 3. Updated Page Component

**app/features/chatbot/page.tsx**

Before:
```typescript
const loadConversations = async () => {
  const response = await chatBotAPI.listConversations();
  setConversations(response.data);  // Expected ChatConversation[] directly
};
```

After:
```typescript
const loadConversations = async () => {
  const response = await chatBotAPI.listConversations();
  setConversations(response.data.conversations);  // Extract from nested structure
};
```

### 4. Updated Hook (bot_message handling)

**lib/hooks/useChatBot.ts**

Before:
```typescript
setMessages([{
  type: "system",
  content: conversation.bot_message,  // Error if undefined
  timestamp: new Date(conversation.created_at),
}]);
```

After:
```typescript
if (conversation.bot_message) {
  setMessages([{
    type: "system",
    content: conversation.bot_message,
    timestamp: new Date(conversation.created_at),
  }]);
}
```

## User Flow

### Before Fix
1. User navigates to `/features/chatbot`
2. ❌ Page automatically calls `POST /chat/bot/conversations`
3. ❌ New conversation created without user action
4. ❌ List shows newly created empty conversation
5. ❌ Every page refresh creates another conversation

### After Fix
1. User navigates to `/features/chatbot`
2. ✅ Page calls `GET /chat/workflows`
3. ✅ Displays existing conversations
4. ✅ No new conversations created
5. ✅ User clicks "New Conversation" button
6. ✅ Only then `POST /chat/bot/conversations` is called
7. ✅ Redirects to new conversation chat page

## UI Enhancements

Added display of additional information:
- **Status badge**: Shows conversation status (created, completed, etc.)
- **Created timestamp**: Shows when conversation was created
- **Updated timestamp**: Shows last update time
- **Participant name**: Shows unique participant identifier

## Benefits

1. **Correct behavior**: Page load doesn't create conversations
2. **Better UX**: Users see their existing conversations immediately
3. **Resource efficient**: No unnecessary API calls creating conversations
4. **Data integrity**: Updated and partition_key fields properly handled
5. **Type safety**: Proper TypeScript types for all API responses

## Testing

### Manual Testing Steps

1. **Test conversation list loading**:
   ```bash
   # Navigate to: http://localhost:3000/features/chatbot
   # Verify: Page loads existing conversations
   # Verify: No new conversation is created
   ```

2. **Test new conversation creation**:
   ```bash
   # Click "New Conversation" button
   # Verify: POST /chat/bot/conversations is called
   # Verify: Redirects to /features/chatbot/{chat_id}
   # Verify: Chat interface opens with welcome message
   ```

3. **Test conversation list refresh**:
   ```bash
   # Refresh the page
   # Verify: Same conversations still shown
   # Verify: No duplicate conversations created
   ```

### API Verification

Check that the correct endpoints are called:

```bash
# List conversations (should be called on page load)
curl -X GET http://localhost:5050/api/v1/chat/workflows

# Create conversation (should only be called on button click)
curl -X POST http://localhost:5050/api/v1/chat/bot/conversations \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Migration Notes

### For Developers

If you're working with the chatbot API:

1. **List conversations**: Always use `GET /chat/workflows`
2. **Create conversation**: Only use `POST /chat/bot/conversations` when user explicitly requests it
3. **Response handling**: Remember to extract `response.data.conversations` for list endpoint
4. **Type safety**: Use `WorkflowsListResponse` for list endpoint, `ChatConversation` for create

### Breaking Changes

- `listConversations()` return type changed from `ChatConversation[]` to `WorkflowsListResponse`
- Must access conversations via `response.data.conversations` instead of `response.data`
- `bot_message` is now optional in `ChatConversation` interface

## Related Documentation

- [Chatbot Implementation Summary](./CHATBOT_IMPLEMENTATION_SUMMARY.md)
- [Chatbot User Guide](./CHATBOT_USER_GUIDE.md)
- [API Response Fix](./API_RESPONSE_FIX.md)

---

**Date Fixed**: 2026-02-08  
**Status**: ✅ Complete and Tested  
**Impact**: High - Fixes major UX issue with automatic conversation creation
