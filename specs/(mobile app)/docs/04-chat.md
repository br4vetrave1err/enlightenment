# Chat Tab

## Overview

**Purpose:** AI-powered chat with SSE streaming responses, source citations, and conversation history.
**User Stories:** As a learner, I want to ask questions about course content and get contextual answers with sources.
**Phase:** 4

---

## Components

### Chat Screen

| Component | File Path | Props | Description |
|-----------|-----------|-------|-------------|
| Chat Screen | `mobile/src/app/(tabs)/chat/index.tsx` | — | Main chat with message list, input, SSE streaming |
| ChatMessageList | `mobile/src/features/chat/components/ChatMessageList.tsx` | messages, streaming | FlatList of message bubbles, auto-scroll |
| ChatMessageBubble | `mobile/src/features/chat/components/ChatMessageBubble.tsx` | message, isUser | User/assistant bubble with markdown + sources |
| ChatInput | `mobile/src/features/chat/components/ChatInput.tsx` | onSend, disabled, courseContext | Text input + send button + context indicator |
| StreamingIndicator | `mobile/src/features/chat/components/StreamingIndicator.tsx` | isVisible | Animated dots during SSE streaming |

### Chat History

| Component | File Path | Props | Description |
|-----------|-----------|-------|-------------|
| History Screen | `mobile/src/app/(tabs)/chat/history.tsx` | — | List of past chat sessions |
| ChatSessionItem | `mobile/src/features/chat/components/ChatSessionItem.tsx` | session | Session summary, date, message count |

---

## API Integration

| Endpoint | Method | Used By | Request Shape | Response Shape |
|----------|--------|---------|---------------|----------------|
| `/api/chat/stream` | POST (SSE) | Chat Screen, sse.ts | Query: message, course_id?, node_id? | SSE: token, source, done events |
| `/api/chat/history` | GET | History Screen | — | `{ sessions: ChatSession[] }` |

### SSE Event Format

```
event: token
data: {"token": "A"}

event: source
data: {"node_id": "javascript-basics", "title": "JavaScript Basics"}

event: done
data: {"session_id": "abc123", "token_count": 3200}
```

---

## State Management

| Store | File Path | Data Managed |
|-------|-----------|--------------|
| chat-store | `mobile/src/lib/store/chat-store.ts` | Messages array, streaming flag, session ID, sources |

### Data Flow

```
User types message → ChatInput.onSend → chat-store.addMessage(userMsg)
    → sse.ts opens SSE connection → POST /api/chat/stream
    → SSE "token" events → chat-store.appendAssistantToken(token)
    → SSE "source" events → chat-store.addSource(source)
    → SSE "done" event → chat-store.setSessionId(id), stop streaming
    → ChatMessageList auto-scrolls to bottom
```

---

## Tests

| Test ID | Component | Test Case | Status | Notes |
|---------|-----------|-----------|--------|-------|
| T-073 | chat/index.tsx | Renders message list and input bar | ⬜ | — |
| T-074 | chat/index.tsx | Sends message, shows user bubble immediately | ⬜ | — |
| T-075 | chat/index.tsx | Streams assistant response token-by-token | ⬜ | — |
| T-076 | chat/index.tsx | Shows typing indicator during streaming | ⬜ | — |
| T-077 | chat/index.tsx | Displays source citations after response | ⬜ | — |
| T-078 | chat/index.tsx | Handles SSE errors with retry | ⬜ | — |
| T-079 | ChatMessageList | User messages right-aligned, cosmic color | ⬜ | — |
| T-080 | ChatMessageList | Assistant messages left-aligned, deepSpace | ⬜ | — |
| T-081 | ChatMessageList | Auto-scrolls to bottom on new message | ⬜ | — |
| T-082 | ChatMessageList | Shows timestamp on each message | ⬜ | — |
| T-083 | ChatMessageBubble | User bubble uses cosmic purple | ⬜ | — |
| T-084 | ChatMessageBubble | Assistant bubble uses deepSpace | ⬜ | — |
| T-085 | ChatMessageBubble | Renders markdown content | ⬜ | — |
| T-086 | ChatMessageBubble | Shows source links when available | ⬜ | — |
| T-087 | ChatInput | Renders text input and send button | ⬜ | — |
| T-088 | ChatInput | Send disabled when input empty | ⬜ | — |
| T-089 | ChatInput | Submits on send press, clears input | ⬜ | — |
| T-090 | ChatInput | Shows course context indicator | ⬜ | — |
| T-091 | StreamingIndicator | Shows animated dots during streaming | ⬜ | — |
| T-092 | StreamingIndicator | Stops animation when complete | ⬜ | — |
| T-093 | history.tsx | Fetches GET /api/chat/history on mount | ⬜ | — |
| T-094 | history.tsx | Renders list of ChatSession items | ⬜ | — |
| T-095 | history.tsx | Shows summary, date, message count | ⬜ | — |
| T-096 | history.tsx | Tap session loads conversation | ⬜ | — |
| T-097 | history.tsx | Empty state shows "No conversations yet" | ⬜ | — |
| T-098 | ChatSessionItem | Renders summary truncated to 2 lines | ⬜ | — |
| T-099 | ChatSessionItem | Shows relative date | ⬜ | — |
| T-100 | ChatSessionItem | Shows message count badge | ⬜ | — |

---

## Design Notes

### Space Theme Usage

- User messages: `spaceColors.cosmic` (purple) background, right-aligned
- Assistant messages: `spaceColors.deepSpace` background, left-aligned
- Streaming indicator: animated dots with `spaceColors.aurora` glow
- Source citations: small `HolographicCard` chips with node links
- History items: `spaceColors.nebula` cards with `spaceColors.starlightMuted` dates

### Accessibility

- Message bubbles have `accessibilityRole="text"` with full content
- Streaming indicator announces "Response is being generated"
- Source links have descriptive `accessibilityLabel` with node title
- Input bar has `accessibilityLabel="Type your message"`

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 4 | Initial creation | — |
