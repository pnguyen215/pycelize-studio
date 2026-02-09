# Chat Interface Features - User Guide

## Quick Reference

### Header Actions

**Copy Chat ID**
- Button: Copy icon (📋)
- Location: Header, next to chat ID badge
- Action: Click to copy full conversation ID
- Feedback: "Copied!" tooltip + success notification

**Refresh Conversation**  
- Button: Refresh icon (🔄)
- Location: Header, between Copy and Delete
- Action: Click to reload latest conversation data
- Feedback: Spinning icon + "Conversation refreshed!" notification

### Chat Input Area

**Operations Selector**
- Button: Grid icon (⠿) 
- Location: Left side of input, after Upload button
- Action: Click to open operations menu in popover
- Contains: All supported file operations by category

### Message Interactions

**View Message ID**
- Trigger: Hover over any message bubble
- Display: Tooltip with message ID and copy button
- Use case: Backend debugging, support requests

**Download Uploaded Files**
- Display: Download button appears for file upload messages
- Logic: Matches message file path with uploaded files list
- Action: Click to download original file

### Conversation Results

**Output Files Panel**
- Location: Below chat input, left side
- Shows: All files generated during conversation
- Actions per file:
  - Download button (⬇️)
  - Copy path button (📋)
- Appears: Only when output files exist

**Workflow Steps Panel**
- Location: Below chat input, right side
- Shows: All workflow operations executed
- Per step information:
  - Operation name
  - Status (✓ completed, ✗ failed, ⟳ running)
  - Progress bar (if in progress)
  - Output file name
  - Completion timestamp
  - Error message (if failed)
- Actions:
  - Click to expand/collapse details
  - "View Arguments" → Opens full JSON
  - "Copy Arguments" → Copy to clipboard

## Layout Overview

```
╔═══════════════════════════════════════════════════════════╗
║ 🔙 Back | 💬 Chat ID: abc123 [📋][🔄][🗑️]                ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  👤 Message 1 (hover for ID)                             ║
║  🤖 Response 1                                            ║
║  👤 File uploaded: data.xlsx [⬇️ Download]               ║
║  🤖 Response with workflow...                             ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║ [📎] [⠿] [Type message here...              ] [➤]        ║
╠══════════════════════════╦════════════════════════════════╣
║ 📄 Output Files          ║ 🔄 Workflow Steps             ║
║                          ║                               ║
║ • result.xlsx            ║ Step 1: extract ✓             ║
║   [⬇️][📋]               ║   Progress: 100%              ║
║                          ║   [View Args] [Copy]          ║
║ • summary.csv            ║                               ║
║   [⬇️][📋]               ║ Step 2: normalize ✓           ║
║                          ║   Output: final.xlsx          ║
╚══════════════════════════╩════════════════════════════════╝
```

## Common Use Cases

### 1. Debugging a Conversation
1. Hover over problematic message
2. Copy message ID from tooltip
3. Share with support/backend team

### 2. Getting Latest Results
1. Click Refresh button in header
2. Wait for update confirmation
3. Check Output Files panel for new files

### 3. Re-downloading a File
1. Find the upload message in chat
2. Click Download button
3. File opens in browser/downloads

### 4. Checking Workflow Status
1. Scroll to Workflow Steps panel
2. Expand step to see details
3. Click "View Arguments" to see parameters used
4. Copy arguments if needed for reproduction

### 5. Sharing Conversation
1. Click Copy Chat ID in header
2. Share ID with team member
3. They can open: `/features/chatbot/{chat_id}`

## Keyboard Shortcuts

- `Esc` - Close open popover/modal
- `Enter` - Send message (in input field)
- `Shift+Enter` - New line (in input field)

## Tips

- **Workflow Progress**: Live updates via WebSocket during execution
- **Auto-refresh**: Conversation refreshes automatically after workflow completes
- **Download Links**: All output files include direct download URLs
- **Dark Mode**: All components support dark mode
- **Responsive**: Works on desktop and tablet sizes
