import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTicketThread } from "@/features/support/hooks/useTicketThread";
import type { Message } from "@/features/support/services/ticketsApi";

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TicketThreadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const { messages, loading, error, send } = useTicketThread(ticketId ?? "");

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setDraft("");
    try {
      setSending(true);
      await send(trimmed);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch {
      // Restore the draft so the user can retry; nothing was persisted.
      setDraft(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[s.root, { paddingTop: insets.top }]}>
        {/* ── Header ── */}
        <LinearGradient
          colors={["#14B8A6", "#06B6D4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Conversation</Text>
          <View style={s.headerDecor} />
        </LinearGradient>

        {loading ? (
          <View style={s.loadingState}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        ) : error ? (
          <Animated.View entering={FadeInDown.duration(400)} style={s.emptyState}>
            <MaterialIcons
              name="error-outline"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>Couldn&apos;t load messages</Text>
            <Text style={s.emptySubtitle}>{error}</Text>
          </Animated.View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[s.thread, { paddingBottom: spacing.lg }]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: false })
            }
          >
            {messages.length === 0 ? (
              <Animated.View entering={FadeInDown.duration(400)} style={s.emptyState}>
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={48}
                  color={colors.text.placeholder}
                />
                <Text style={s.emptyTitle}>No messages yet</Text>
                <Text style={s.emptySubtitle}>
                  Send a message to start the conversation.
                </Text>
              </Animated.View>
            ) : (
              messages.map((m) => <MessageBubble key={m.id} message={m} />)
            )}
          </ScrollView>
        )}

        {/* ── Composer ── */}
        <View style={[s.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            style={s.composerInput}
            placeholder="Type a message…"
            placeholderTextColor={colors.text.placeholder}
            value={draft}
            onChangeText={setDraft}
            maxLength={2000}
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            style={[s.sendButton, (!draft.trim() || sending) && s.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || sending}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isOwn = message.senderRole === "USER";
  const isSystem = message.senderRole === "SYSTEM";
  const time = formatTime(message.createdAt);

  if (isSystem) {
    return (
      <View style={s.systemRow}>
        <View style={s.systemBubble}>
          <Text style={s.systemText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.row, isOwn ? s.rowOwn : s.rowAgent]}>
      <View style={[s.bubble, isOwn ? s.bubbleOwn : s.bubbleAgent]}>
        <Text style={[s.bubbleText, isOwn ? s.bubbleTextOwn : s.bubbleTextAgent]}>
          {message.content}
        </Text>
        {time ? (
          <Text style={[s.bubbleTime, isOwn ? s.bubbleTimeOwn : s.bubbleTimeAgent]}>
            {time}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    overflow: "hidden",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.xxl,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.white,
    marginLeft: spacing.md,
  },
  headerDecor: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.placeholder,
    textAlign: "center",
  },
  thread: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  // Rows
  row: {
    flexDirection: "row",
  },
  rowOwn: {
    justifyContent: "flex-end",
  },
  rowAgent: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: 2,
  },
  bubbleOwn: {
    backgroundColor: colors.primary.DEFAULT,
    borderBottomRightRadius: borderRadius.sm,
  },
  bubbleAgent: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderBottomLeftRadius: borderRadius.sm,
  },
  bubbleText: {
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  bubbleTextOwn: {
    color: colors.white,
  },
  bubbleTextAgent: {
    color: colors.text.primary,
  },
  bubbleTime: {
    fontSize: fontSize.xs,
    alignSelf: "flex-end",
  },
  bubbleTimeOwn: {
    color: "rgba(255,255,255,0.7)",
  },
  bubbleTimeAgent: {
    color: colors.text.placeholder,
  },
  // System notice
  systemRow: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  systemBubble: {
    maxWidth: "90%",
    backgroundColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  systemText: {
    fontSize: fontSize.sm,
    color: colors.text.light,
    textAlign: "center",
  },
  // Composer
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.DEFAULT,
    backgroundColor: colors.white,
  },
  composerInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    fontSize: fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.border.focus,
  },
});
