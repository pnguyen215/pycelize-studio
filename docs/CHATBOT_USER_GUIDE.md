# Chatbot Enhancements - User Guide

## Overview

The chatbot feature has been enhanced with dynamic routing, conversations management, operations selector, and individual workflow confirmation. This guide covers all the new features and how to use them.

## New Features

### 1. Dynamic Chat URLs

**Old:** `/features/chatbot` (static)  
**New:** `/features/chatbot/{chat_id}` (dynamic)

Each conversation now has its own unique URL, making it easy to:
- Bookmark specific conversations
- Share conversation links
- Navigate back and forth between chats

### 2. Conversations List

Navigate to `/features/chatbot` to see all your conversations.

**Features:**
- View all past conversations
- See conversation metadata (participant, date, preview)
- Create new conversations
- Quick access to any conversation by clicking its card

**Empty State:**
- If no conversations exist, you'll see a friendly message with a "Create Conversation" button

### 3. Operations Selector

A new sidebar in the chat interface shows all supported operations from the backend.

**Location:** Right side of chat interface

**How it works:**
1. Select an operation intent (e.g., "bind_data", "convert_format")
2. Choose a specific endpoint from that intent
3. See your selection highlighted
4. Use it to inform your chat messages

**Supported Intents:**
- `bind_data` - Data binding operations
- `convert_format` - Format conversion
- `extract_columns` - Column extraction
- `generate_json` - JSON generation
- `generate_sql` - SQL generation
- `map_columns` - Column mapping
- `normalize_data` - Data normalization
- `search_filter` - Search and filter

### 4. Enhanced Workflow Confirmation

When the bot suggests a workflow, you now confirm each operation individually.

**Old Behavior:**
- All operations shown together
- Single "Confirm & Execute" button
- All-or-nothing approach

**New Behavior:**
- Each operation has its own card
- Individual "Confirm This Operation" button
- Visual feedback (green highlight when confirmed)
- Can revoke individual confirmations
- Progress tracker shows "X of Y operations confirmed"
- Execute button only enabled when ALL operations are confirmed

**Benefits:**
- Better understanding of each operation
- More control over workflow execution
- Clear visual feedback
- Can review and confirm at your own pace

## User Flow

### Creating a New Conversation

1. Click "Chat Conversations" in the sidebar
2. Click "New Conversation" button
3. You're redirected to `/features/chatbot/{new_chat_id}`
4. See welcome message from the bot
5. Start chatting!

### Working with Existing Conversations

1. Click "Chat Conversations" in the sidebar
2. Browse your conversation list
3. Click any conversation card to open it
4. Continue where you left off

### Using the Operations Selector

1. In any chat, look at the right sidebar
2. Select an operation type from the dropdown
3. Choose a specific endpoint
4. See the selection highlighted
5. Use it to guide your requests to the bot

### Confirming a Workflow

1. Upload a file or send a message
2. Bot suggests a workflow
3. Confirmation dialog opens
4. Review each operation carefully
5. Click "Confirm This Operation" for each one
6. Once all are confirmed, click "Execute Workflow"
7. Watch real-time progress
8. See results in the chat

## Navigation

### Sidebar
- **Chat Conversations** - View all conversations (index page)

### Chat Page
- **Back to Conversations** - Return to conversations list
- **Delete** - Delete current conversation (with confirmation)

### After Delete
- Automatically redirected to conversations list

## Layout

### Conversations List Page
```
┌─────────────────────────────────────────────┐
│  Chat Conversations        [New Conversation]│
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │  💬 Conversation                    │    │
│  │  👤 Participant  📅 Date            │    │
│  │  Preview: Welcome message...        │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │  💬 Conversation                    │    │
│  │  ...                                │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Chat Page
```
┌────────────────────────────────────────────────────────────┐
│  [← Back] Pycelize Chat Bot              ID: xxx [Delete]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────────────────┐  ┌─────────────────────────┐  │
│  │  Chat Messages        │  │  Operations Selector    │  │
│  │                       │  │  ──────────────────────  │  │
│  │  • System: Welcome!   │  │  Operation Type:        │  │
│  │  • User: Upload file  │  │  [Dropdown]             │  │
│  │  • System: Workflow?  │  │                         │  │
│  │  • Progress: 50%      │  │  Endpoint:              │  │
│  │                       │  │  [Dropdown]             │  │
│  ├───────────────────────┤  │                         │  │
│  │  [📎] Type message... │  │  Selected:              │  │
│  └───────────────────────┘  │  • bind_data            │  │
│                             │  • excel/bind...        │  │
│                             └─────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Workflow Confirmation Dialog
```
┌───────────────────────────────────────────────────────┐
│  Confirm Workflow Operations                          │
│  Review and confirm each operation individually       │
├───────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐  │
│  │  ✓ 1  Step 1: excel/extract-columns (Confirmed)│  │
│  │  📄 Arguments: {...}                            │  │
│  │  [Revoke Confirmation]                          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  2  Step 2: csv/convert-to-excel                │  │
│  │  📄 Arguments: {...}                            │  │
│  │  [✓ Confirm This Operation]                     │  │
│  └─────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────┤
│  1 of 2 operations confirmed                          │
│  [Cancel All]  [Execute Workflow] (disabled)          │
└───────────────────────────────────────────────────────┘
```

## API Endpoints

### New Endpoints Used

1. **GET** `/chat/bot/conversations`
   - Lists all conversations
   - Returns array of conversation objects

2. **GET** `/chat/bot/operations`
   - Returns supported operations
   - Format:
     ```json
     {
       "operations": {
         "bind_data": [...],
         "convert_format": [...]
       },
       "total_intents": 8
     }
     ```

## Tips & Best Practices

1. **Organize Your Work**
   - Create separate conversations for different tasks
   - Use meaningful file names for easy identification

2. **Review Before Confirming**
   - Read each operation's arguments carefully
   - Confirm operations one by one
   - Revoke if you need to reconsider

3. **Use Operations Selector**
   - Browse available operations to discover features
   - Select operations to see supported endpoints
   - Use it as a reference when asking the bot

4. **Manage Conversations**
   - Delete old conversations to keep things clean
   - Use the conversations list to stay organized
   - Bookmark important conversation URLs

## Troubleshooting

### "Failed to load conversations"
- Check that the backend is running on port 5050
- Verify API connectivity
- Refresh the page

### "Operations not loading"
- Ensure GET `/chat/bot/operations` endpoint is available
- Check browser console for errors
- Verify backend is running

### "Cannot confirm workflow"
- Make sure you've confirmed ALL operations
- Check for any error messages in the dialog
- Try refreshing if operations don't respond

### "Conversation not found"
- The conversation may have been deleted
- Go back to conversations list and select another
- Create a new conversation if needed

## Keyboard Shortcuts

- **Enter** - Send message (in chat input)
- **Esc** - Close dialogs
- **Click** - Select conversation from list

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

**Ready to use!** Start by navigating to "Chat Conversations" in the sidebar.
