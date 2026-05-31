"use client";

import { useRef, useState } from "react";
import { Send, Bot, User, Sparkles, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS_FR = [
  "Je quitte Paris, budget 900€/mois de loyer. Top 3 ?",
  "Meilleure ville pour télétravail + montagne, moins de 700€/mois",
  "Famille avec 2 enfants, sécurité prioritaire, pas trop cher",
  "Comparer Lyon, Bordeaux et Nantes pour un freelance",
  "Quelle ville océanique avec bon score sécurité ?",
];

const STARTERS_EN = [
  "Leaving Paris, budget €900/month rent. Top 3?",
  "Best city for remote work + mountains, under €700/month",
  "Family with 2 kids, safety first, not too expensive",
  "Compare Lyon, Bordeaux and Nantes for a freelancer",
  "Which coastal city has a good safety score?",
];

function MessageBubble({ msg, idx }: { msg: Message; idx: number }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{ animationDelay: `${idx * 30}ms` }}
    >
      <div
        className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isUser
            ? "bg-[var(--accent)] text-white"
            : "bg-violet-600 text-white"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[var(--accent)] text-white rounded-tr-sm"
            : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-sm"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function CopilotClient({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const STARTERS = locale === "en" ? STARTERS_EN : STARTERS_FR;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t(
        "Bonjour ! Je suis le Copilote Déménagement — je connais les 352 villes françaises, leurs loyers, scores de qualité de vie, fiscalité et transports.\n\nDites-moi votre situation (ville actuelle, budget, profil, priorités) et je vous propose les meilleures options. Que puis-je faire pour vous ?",
        "Hi! I'm the Relocation Copilot — I know all 352 French cities, their rents, quality-of-life scores, taxes and transport.\n\nTell me about your situation (current city, budget, profile, priorities) and I'll suggest the best options. How can I help?"
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    // For EN, nudge the assistant to answer in English (the API system prompt defaults to French).
    const outgoing: Message[] =
      locale === "en"
        ? nextMessages.map((m, i) =>
            i === nextMessages.length - 1 && m.role === "user"
              ? { ...m, content: `${m.content}\n\n(Please answer in English.)` }
              : m
          )
        : nextMessages;

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outgoing, locale }),
      });
      const data = await res.json();
      const reply = data.reply ?? t("Une erreur est survenue.", "Something went wrong.");
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: t(
            "Erreur réseau. Vérifiez votre connexion et réessayez.",
            "Network error. Check your connection and try again."
          ),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const showStarters = messages.length === 1;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[820px]">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--bg-canvas)]/80 backdrop-blur">
        <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-[var(--text-primary)] text-sm">
            {t("Copilote Déménagement", "Relocation Copilot")}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">
            {t("352 villes · données 2026", "352 cities · 2026 data")}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            href="/city-match"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" />
            City Match
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} idx={i} />
        ))}
        {loading && <TypingDots />}
        {showStarters && !loading && (
          <div className="space-y-2 pt-2">
            <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest font-semibold">
              {t("Suggestions", "Suggestions")}
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--text-secondary)] rounded-full px-3 py-1.5 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-canvas)]/80 backdrop-blur">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={t("Posez votre question…", "Ask your question…")}
            disabled={loading}
            className="flex-1 resize-none bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60 min-h-[42px] max-h-[120px]"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="shrink-0 h-[42px] w-[42px] rounded-xl bg-[var(--accent)] text-white flex items-center justify-center hover:bg-[var(--accent)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 text-center">
          {t(
            "Entrée pour envoyer · Shift+Entrée pour sauter une ligne",
            "Enter to send · Shift+Enter for a new line"
          )}
        </p>
      </div>

      {/* Quick links after interaction */}
      {messages.length >= 3 && (
        <div className="shrink-0 px-4 pb-3 flex gap-3 flex-wrap">
          <Link
            href={locale === "en" ? "/compare" : "/comparer"}
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <ArrowRight className="h-3 w-3" />
            {t("Comparer deux villes", "Compare two cities")}
          </Link>
          <Link
            href="/projection-5ans"
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <ArrowRight className="h-3 w-3" />
            {t("Projection 5 ans", "5-year projection")}
          </Link>
          <Link
            href="/future-you"
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <ArrowRight className="h-3 w-3" />
            Future You
          </Link>
        </div>
      )}
    </div>
  );
}
