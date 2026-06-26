import { api } from '@/services/api/apiClient';

// ── Types (mirror SupportTicketResponseDto / SupportChatMessage(Payload)Dto) ───

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SenderRole = 'USER' | 'AGENT' | 'SYSTEM';

/** Mirrors SupportTicketResponseDto. Dates arrive as ISO 8601 strings. */
export interface Ticket {
  id: string;
  userId: string;
  /** The opening message text — shown as the ticket subject in the list. */
  message: string;
  status: TicketStatus;
  /** Timestamp of the most recent message; drives "active first" ordering. */
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors SupportChatMessage(Payload)Dto — the wire shape of one chat message.
 *  Identical for REST history, the REST send response, and live WS frames. */
export interface Message {
  id: string;
  ticketId: string;
  senderRole: SenderRole;
  /** The user ID of the author; null for AGENT/SYSTEM messages. */
  senderUserId: string | null;
  content: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** Mirrors PaginatedSupportChatMessagesDto. */
export interface PaginatedMessages {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

// Page size used to translate a 0-based `page` into the backend's limit/offset.
export const MESSAGES_PAGE_SIZE = 50;

// ── Service ───────────────────────────────────────────────────────────────────

export const ticketsApi = {
  getTickets() {
    return api.get<Ticket[]>('/support/tickets');
  },

  // Paginated, chronological history. `page` is 0-based; mapped to limit/offset
  // (the backend's GetMessagesQueryDto contract).
  getMessages(ticketId: string, page = 0) {
    const limit = MESSAGES_PAGE_SIZE;
    const offset = page * limit;
    return api.get<PaginatedMessages>(
      `/support/tickets/${ticketId}/messages?limit=${limit}&offset=${offset}`,
    );
  },

  // REST send — same effect as the WS 'send' frame (persist + realtime fanout),
  // so a client without a live socket still works. Returns the persisted message.
  sendMessage(ticketId: string, content: string) {
    return api.post<Message>(`/support/tickets/${ticketId}/messages`, { content });
  },
};
