import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getDay, useLocalizedDb } from "../lib/db";
import { flattenWithPaths, regroupTree } from "../lib/outline";
import { askGuide, type ChatMessage } from "../lib/chat";
import { syncEnabled } from "../lib/supabase";
import { Icon } from "./Icon";

const MAX_CONTEXT_CHARS = 3000;

export function ChatBot() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const db = useLocalizedDb(i18n.language);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const dayMatch = location.pathname.match(/\/dies\/(\d+)/);
  const day = dayMatch?.[1];

  const context = useMemo(() => {
    if (!day) return undefined;
    const outline = getDay(db, day);
    if (!outline) return undefined;
    const flat = flattenWithPaths(regroupTree(outline.sections));
    const text = `${outline.title ?? ""}\n${flat.map((n) => n.text).join("\n")}`;
    return text.slice(0, MAX_CONTEXT_CHARS);
  }, [db, day]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(next);
    setInput("");
    setError(false);
    setLoading(true);
    try {
      const reply = await askGuide(next, context);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (!syncEnabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg active:opacity-90"
        aria-label={t("chat.title")}
      >
        <Icon name="festival" className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="flex h-[75vh] flex-col rounded-t-2xl bg-app-bg safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-text">
                <Icon name="festival" className="h-5 w-5 text-accent" />
                {t("chat.title")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-chip text-chip-text active:opacity-80"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            {day && (
              <p className="border-b border-line bg-accent-soft px-4 py-1.5 text-[11px] text-accent">
                {t("chat.dayContext", { day })}
              </p>
            )}

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted">{t("chat.greeting")}</p>
              )}
              <div className="flex flex-col gap-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "ml-auto bg-accent text-white"
                        : "bg-surface text-text"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {loading && (
                  <div className="max-w-[85%] rounded-2xl bg-surface px-3 py-2 text-sm text-muted">
                    {t("chat.thinking")}
                  </div>
                )}
                {error && (
                  <div className="max-w-[85%] rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
                    {t("chat.error")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-line p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("chat.placeholder")}
                className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm text-text"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white active:opacity-80 disabled:opacity-40"
              >
                <Icon name="send" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
