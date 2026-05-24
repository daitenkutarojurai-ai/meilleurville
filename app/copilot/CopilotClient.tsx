"use client";

import { useRef, useState } from "react";
import { Send, Bot, User, Sparkles, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "Je quitte Paris, budget 900€/mois de loyer. Top 3 ?",
  "Meilleure ville pour télétravail + montagne, moins de 700€/mois",
  "Famille avec 2 enfants, sécurité prioritaire, pas trop cher",
  "Comparer Lyon, Bordeaux et Nantes pour un freelance",
  "Quelle ville océanique avec bon score sécurité ?",
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

export function CopilotClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis le Copilote Déménagement — je connais les 352 villes françaises, leurs loyers, scores de qualité de vie, fiscalité et transports.\n\nDites-moi votre situation (ville actuelle, budget, profil, priorités) et je vous propose les meilleures options. Que puis-je faire pour vous ?",
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

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      const reply = data.reply ?? "Une erreur est survenue.";
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Erreur réseau. Vérifiez votre connexion et réessayez." },
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
          <p className="font-bold text-[var(--text-primary)] text-sm">Copilote Déménagement</p>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">
            352 villes · données 2026
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
              Suggestions
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
            placeholder="Posez votre question…"
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
          Entrée pour envoyer · Shift+Entrée pour sauter une ligne
        </p>
      </div>

      {/* Quick links after interaction */}
      {messages.length >= 3 && (
        <div className="shrink-0 px-4 pb-3 flex gap-3 flex-wrap">
          <Link
            href="/comparer"
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <ArrowRight className="h-3 w-3" />
            Comparer deux villes
          </Link>
          <Link
            href="/projection-5ans"
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <ArrowRight className="h-3 w-3" />
            Projection 5 ans
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
