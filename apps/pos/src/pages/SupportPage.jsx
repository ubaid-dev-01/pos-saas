import {
    onValue,
    push,
    ref,
    serverTimestamp,
    set,
    update,
} from "firebase/database";
import { collection, onSnapshot } from "firebase/firestore";
import { Headphones, MessageSquare, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../components/ui/EmptyState";
import { db, rtdb } from "../config/firebase";
import { playAlertSound } from "../stores/alertStore";
import useAuthStore from "../stores/authStore";
import { formatDateTime } from "../utils/format";
import { useTranslation } from "../context/LocaleContext";

function normalizeMessages(snapshotVal) {
  if (!snapshotVal) return [];
  return Object.entries(snapshotVal)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
}

export default function SupportPage() {
  const { t } = useTranslation();
  const { userDoc, store } = useAuthStore();
  const [chatIndex, setChatIndex] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState("");
  const [activeMeta, setActiveMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const initializedRef = useRef(false);
  const lastIncomingIdRef = useRef(null);

  const isSuperAdmin = userDoc?.role === "superadmin";
  const myStoreId = userDoc?.storeId || "";

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    const unsubStores = onSnapshot(collection(db, "stores"), (snap) => {
      const byId = Object.fromEntries(
        snap.docs.map((docRef) => [
          docRef.id,
          docRef.data()?.name || docRef.id,
        ]),
      );
      setChatIndex((prev) =>
        prev.map((item) => ({
          ...item,
          storeName: item.storeName || byId[item.storeId] || item.storeId,
        })),
      );
    });
    return () => unsubStores();
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setActiveStoreId(myStoreId);
      return undefined;
    }
    const chatRootRef = ref(rtdb, "supportChats");
    const unsub = onValue(chatRootRef, (snap) => {
      const value = snap.val() || {};
      const list = Object.entries(value)
        .map(([storeId, payload]) => ({
          storeId,
          ...payload?.meta,
          unreadBySuperAdmin: Number(payload?.meta?.unreadBySuperAdmin || 0),
          unreadByStore: Number(payload?.meta?.unreadByStore || 0),
        }))
        .sort(
          (a, b) => Number(b.lastMessageAt || 0) - Number(a.lastMessageAt || 0),
        );

      setChatIndex(list);

      if (!activeStoreId && list.length) {
        setActiveStoreId(list[0].storeId);
      }
      if (
        activeStoreId &&
        !list.some((item) => item.storeId === activeStoreId)
      ) {
        setActiveStoreId(list[0]?.storeId || "");
      }
    });
    return () => unsub();
  }, [isSuperAdmin, myStoreId, activeStoreId]);

  useEffect(() => {
    if (!activeStoreId) return undefined;

    initializedRef.current = false;
    lastIncomingIdRef.current = null;

    const metaRef = ref(rtdb, `supportChats/${activeStoreId}/meta`);
    const messagesRef = ref(rtdb, `supportChats/${activeStoreId}/messages`);

    const offMeta = onValue(metaRef, (snap) => {
      setActiveMeta(snap.val() || null);
    });

    const offMessages = onValue(messagesRef, (snap) => {
      const list = normalizeMessages(snap.val());
      setMessages(list);

      const last = list[list.length - 1];
      if (!last) {
        initializedRef.current = true;
        return;
      }

      const incoming =
        last.senderRole !== userDoc?.role &&
        (!lastIncomingIdRef.current || lastIncomingIdRef.current !== last.id);

      if (initializedRef.current && incoming) {
        playAlertSound();
        toast(`New support message from ${last.senderName || "team"}`);
      }

      lastIncomingIdRef.current = last.id;
      initializedRef.current = true;
    });

    return () => {
      offMeta();
      offMessages();
    };
  }, [activeStoreId, userDoc?.role]);

  useEffect(() => {
    if (!activeStoreId) return;
    const unreadKey = isSuperAdmin ? "unreadBySuperAdmin" : "unreadByStore";
    const unreadCount = Number(activeMeta?.[unreadKey] || 0);
    if (unreadCount <= 0) return;
    update(ref(rtdb, `supportChats/${activeStoreId}/meta`), {
      [unreadKey]: 0,
      updatedAt: Date.now(),
    }).catch(() => {});
  }, [activeMeta, activeStoreId, isSuperAdmin]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const chatOptions = useMemo(() => {
    if (!isSuperAdmin) return [];
    return chatIndex.map((item) => ({
      value: item.storeId,
      label: item.storeName || item.storeId,
      unread: Number(item.unreadBySuperAdmin || 0),
    }));
  }, [chatIndex, isSuperAdmin]);

  const sendMessage = async () => {
    const value = text.trim();
    if (!value || !activeStoreId || !userDoc) return;

    try {
      setSending(true);
      const now = Date.now();
      const messageRef = push(
        ref(rtdb, `supportChats/${activeStoreId}/messages`),
      );
      const metaRef = ref(rtdb, `supportChats/${activeStoreId}/meta`);

      await set(messageRef, {
        id: messageRef.key,
        text: value,
        senderUid: userDoc.uid,
        senderName: userDoc.displayName || userDoc.email || "User",
        senderRole: userDoc.role,
        createdAt: now,
        serverTs: serverTimestamp(),
      });

      const nextUnreadByStore = isSuperAdmin
        ? Number(activeMeta?.unreadByStore || 0) + 1
        : 0;
      const nextUnreadBySuperAdmin = isSuperAdmin
        ? 0
        : Number(activeMeta?.unreadBySuperAdmin || 0) + 1;

      await update(metaRef, {
        storeId: activeStoreId,
        storeName: activeMeta?.storeName || store?.name || activeStoreId,
        lastMessage: value.slice(0, 180),
        lastMessageAt: now,
        lastSenderRole: userDoc.role,
        unreadByStore: nextUnreadByStore,
        unreadBySuperAdmin: nextUnreadBySuperAdmin,
        updatedAt: now,
      });

      setText("");
    } catch (e) {
      toast.error(e?.message || "Failed to send support message");
    } finally {
      setSending(false);
    }
  };

  if (!isSuperAdmin && !myStoreId) {
    return (
      <EmptyState
        title={t("support.chat.unavailable")}
        description={t("support.chat.noStoreContext")}
        icon={Headphones}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t("support.chat.title")}</h1>
        <p className="text-sm text-text-muted mt-1">
          {t("support.chat.subtitle")}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Conversations
          </p>
          {!isSuperAdmin && (
            <div className="rounded-xl border border-border p-3 bg-background">
              <p className="text-sm font-semibold text-text-primary">
                {store?.name || "Your Store"}
              </p>
              <p className="text-xs text-text-muted mt-1">
                You are chatting with Super Admin support.
              </p>
            </div>
          )}
          {isSuperAdmin && (
            <div className="space-y-2 max-h-[540px] overflow-y-auto">
              {chatOptions.length ? (
                chatOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setActiveStoreId(item.value)}
                    className={`w-full text-left rounded-xl border p-3 transition-colors ${
                      activeStoreId === item.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-text-primary truncate">
                        {item.label}
                      </p>
                      {item.unread > 0 && (
                        <span className="min-w-[20px] h-5 px-1 rounded-full bg-secondary text-[11px] font-semibold text-text-primary flex items-center justify-center">
                          {item.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-text-muted">No support chats yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-3 flex flex-col min-h-[560px]">
          {!activeStoreId ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                title="Select a conversation"
                description="Choose a store chat to start supporting in real time."
                icon={MessageSquare}
              />
            </div>
          ) : (
            <>
              <div className="pb-3 border-b border-border">
                <p className="text-sm font-semibold text-text-primary">
                  {activeMeta?.storeName || store?.name || activeStoreId}
                </p>
                <p className="text-xs text-text-muted">
                  {isSuperAdmin
                    ? "You are replying as Super Admin"
                    : "Support team is online in real time"}
                </p>
              </div>

              <div
                ref={listRef}
                className="flex-1 overflow-y-auto py-3 space-y-2"
              >
                {messages.length ? (
                  messages.map((msg) => {
                    const mine = msg.senderUid === userDoc?.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                            mine
                              ? "bg-primary text-white"
                              : "bg-background border border-border text-text-primary"
                          }`}
                        >
                          <p className="text-xs opacity-80 mb-1">
                            {msg.senderName || "User"}
                          </p>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                          <p className="text-[11px] opacity-75 mt-1">
                            {formatDateTime(
                              msg.createdAt || new Date().toISOString(),
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-text-muted text-center pt-8">
                    Start conversation with support.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background resize-none"
                  rows={2}
                  placeholder="Type support message..."
                />
                <button
                  type="button"
                  disabled={sending || !text.trim()}
                  onClick={sendMessage}
                  className="h-10 px-3 rounded-xl bg-primary text-white disabled:opacity-60 inline-flex items-center gap-2"
                >
                  <SendHorizonal className="w-4 h-4" />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
