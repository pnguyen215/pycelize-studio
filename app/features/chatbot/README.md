# Chat Bot Feature

## Overview

The Chat Bot feature provides a Telegram-like chat interface for interacting with the Pycelize backend's AI-powered file processing assistant. Users can upload files, send messages, and receive workflow suggestions with real-time progress updates via WebSocket.

## Features

- 💬 **Natural Language Chat** - Communicate with the AI assistant using natural language
- 📁 **File Upload** - Drag-and-drop or click to upload Excel/CSV files (up to 10MB)
- 🔄 **Real-time Progress** - Live workflow execution updates via WebSocket
- ✅ **Workflow Confirmation** - Review and confirm suggested workflows before execution
- 📥 **Download Results** - One-click download for processed files
- 📜 **Conversation History** - Complete chat history preserved
- 🗑️ **Conversation Management** - Delete conversations when done

## Architecture

### Components

1. **ChatBotPage** (`app/features/chatbot/page.tsx`)
   - Main page component orchestrating the chat interface
   - Manages WebSocket connections and state

2. **Chat Components** (`components/features/chat/`)
   - `ChatMessage` - Individual message bubble with sender avatar
   - `ChatInput` - Input field with file upload button
   - `ChatMessages` - Scrollable message container
   - `WorkflowProgress` - Real-time progress indicator
   - `WorkflowConfirmDialog` - Modal for confirming workflows

3. **API Client** (`lib/api/chatbot.ts`)
   - REST API endpoints for chat operations
   - 7 endpoints covering all chat functionality

4. **Hooks** (`lib/hooks/`)
   - `useChatBot` - Main bot interaction logic
   - `useChatWebSocket` - WebSocket connection management

### API Endpoints

1. **POST** `/chat/bot/conversations` - Create new conversation
2. **POST** `/chat/bot/conversations/{id}/message` - Send message
3. **POST** `/chat/bot/conversations/{id}/upload` - Upload file
4. **POST** `/chat/bot/conversations/{id}/confirm` - Confirm/cancel workflow
5. **GET** `/chat/bot/conversations/{id}/history` - Get conversation history
6. **DELETE** `/chat/bot/conversations/{id}` - Delete conversation
7. **GET** `/chat/bot/operations` - Get supported operations

### WebSocket Messages

The WebSocket connection (via existing `WebSocketManager`) handles real-time updates:

- `connected` - Connection established
- `workflow_started` - Workflow execution begins
- `progress` - Progress updates (0-100%)
- `workflow_completed` - Workflow finished successfully
- `workflow_failed` - Workflow execution failed

## Usage

### Basic Flow

1. User navigates to `/features/chatbot`
2. Chat initializes automatically with welcome message
3. User can:
   - Send text messages
   - Upload files
   - Confirm/cancel workflows
   - Download results
   - Delete conversation

### Code Example

```tsx
// Using the chat bot hook
const {
  chatId,
  messages,
  isLoading,
  pendingWorkflow,
  workflowProgress,
  sendMessage,
  uploadFile,
  confirmWorkflow,
} = useChatBot();

// Send a message
await sendMessage("Extract columns: name, email");

// Upload a file
await uploadFile(file);

// Confirm workflow
await confirmWorkflow(true);
```

## Configuration

The chat bot uses the existing environment configuration:

```bash
# .env.local
NEXT_PUBLIC_PYCELIZE_API_URL=http://localhost:5050/api/v1
```

WebSocket URL is automatically derived:
- API: `http://localhost:5050/api/v1`
- WebSocket: `ws://localhost:5050/chat/{chat_id}`

## UI/UX Design

### Telegram-like Interface

- **Message Bubbles**
  - Bot messages: Left-aligned, gray background
  - User messages: Right-aligned, blue background
  - File attachments: Download buttons
  - Timestamps on all messages

- **Input Area**
  - Text input with placeholder
  - Paperclip icon for file upload
  - Send button (disabled when empty)
  - File size and type information

- **Progress Indicators**
  - Progress bar (0-100%)
  - Status badge (running/completed/failed)
  - Operation name display
  - Live message updates

- **Confirmation Dialog**
  - Modal overlay
  - Workflow steps preview
  - JSON arguments display
  - Confirm/Cancel buttons

## File Upload

### Supported Formats
- Excel: `.xlsx`, `.xls`
- CSV: `.csv`

### Limitations
- Maximum file size: 10MB
- One file at a time

### Validation
- Client-side validation for file type and size
- Server-side processing and error handling

## Error Handling

The feature includes comprehensive error handling:

- Network errors → Toast notification
- File validation → User-friendly error messages
- WebSocket disconnection → Automatic reconnection (up to 5 attempts)
- API errors → Toast with error details
- Workflow failures → Error state with details

## Testing

To test the chat bot feature:

1. Ensure the Pycelize backend is running:
   ```bash
   # Backend should be running on ports:
   # - REST API: 5050
   # - WebSocket: 5051
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to http://localhost:3000/features/chatbot

4. Test scenarios:
   - Send a text message
   - Upload an Excel/CSV file
   - Confirm a suggested workflow
   - Monitor progress updates
   - Download results
   - Delete conversation

## Dependencies

### New Dependencies Installed
- `@radix-ui/react-avatar`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-separator`
- `@radix-ui/react-progress`

### Existing Dependencies Used
- `@radix-ui/react-dialog` (for confirmation modal)
- `sonner` (for toast notifications)
- `lucide-react` (for icons)
- Existing `WebSocketManager` class

## Future Enhancements

Potential improvements for future versions:

- [ ] Message editing/deletion
- [ ] File preview before upload
- [ ] Multiple file uploads
- [ ] Conversation search
- [ ] Export conversation history
- [ ] Voice input
- [ ] Mobile-optimized interface
- [ ] Conversation sharing
- [ ] Custom workflow templates
- [ ] Batch file processing

## Troubleshooting

### WebSocket Connection Issues
- Verify backend is running on port 5051
- Check browser console for connection errors
- Ensure no firewall blocking WebSocket connections

### File Upload Failures
- Verify file size is under 10MB
- Check file format is supported
- Ensure backend has write permissions

### Progress Updates Not Showing
- Verify WebSocket connection is established
- Check backend logs for workflow execution
- Refresh the page and try again

## References

- [Main Integration Guide](https://github.com/pnguyen215/pycelize/blob/master/docs/chat/FRONTEND_CHATBOT_INTEGRATION.md)
- [Architecture Documentation](https://github.com/pnguyen215/pycelize/blob/master/docs/chat/FRONTEND_CHATBOT_ARCHITECTURE.md)
- [Backend API Documentation](https://github.com/pnguyen215/pycelize/blob/master/docs/chat/FRONTEND_CHATBOT_README.md)
