import React, { useEffect, useRef, useState } from "react";

interface Props {
  onClose: () => void;
  initialQuestion?: string;
}

interface Message {
  role: "user" | "bot";
  text: string;
  typing: boolean | undefined;
}

const STORAGE_KEY = "contract_chat_history_v2";

function ChatbotPanel({ onClose, initialQuestion }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [
          {
            role: "bot",
            text: "안녕하세요! 계약서를 이해하기 쉽게 도와드릴게요 🙂",
            typing: undefined
          }
        ];
  });

  const [input, setInput] = useState("");
  const [panelVisible, setPanelVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setPanelVisible(true));
  }, []);

  useEffect(() => {
    if (initialQuestion) {
      send(initialQuestion);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateBotAnswer = (q: string) => {
    if (q.includes("보증금")) {
      return "보증금 조항은 반환 시점과 조건이 핵심이에요. 반환 기한이 명시되지 않았다면 분쟁 가능성이 있습니다.";
    }
    if (q.includes("해지")) {
      return "중도 해지 조항은 위약금이나 통보 기간이 과도하지 않은지 꼭 확인해야 합니다.";
    }
    if (q.includes("임차인")) {
      return "임차인에게만 책임이 집중되어 있다면 불리한 조항일 수 있습니다.";
    }
    if (q.includes("위험") || q.includes("불리")) {
      return "이 조항은 일반적으로 임차인에게 불리하게 해석될 가능성이 있습니다.";
    }
    return "해당 조항은 계약 조건에 따라 해석이 달라질 수 있어 주의가 필요합니다.";
  };

  const send = (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [
      ...prev,
      { role: "user", text, typing: undefined },
      { role: "bot", text: "입력 중...", typing: true }
    ]);

    setInput("");

    setTimeout(() => {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing);
        return [
          ...filtered,
          {
            role: "bot",
            text: generateBotAnswer(text),
            typing: undefined
          }
        ];
      });
    }, 700);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 40,
        display: "flex",
        alignItems: "flex-end"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          height: "70%",
          background: "#FAFAF9",
          borderRadius: "20px 20px 0 0",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          transform: panelVisible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s ease-out"
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          AI 계약 도우미
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
          ※ UI 시연용 챗봇 (추후 LLM 연동 예정)
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          {messages.map((m, i) => (
            <ChatBubble
              key={i}
              role={m.role}
              text={m.text}
              typing={m.typing}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
          {[
            "이 계약서 위험한가요?",
            "보증금 돌려받을 수 있나요?",
            "임차인에게 불리한 조항은?"
          ].map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              style={{
                flex: 1,
                fontSize: 12,
                padding: "6px 8px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "#fff"
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="질문을 입력하세요"
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 13
            }}
          />
          <button
            onClick={() => send(input)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "#111",
              color: "#fff",
              fontSize: 13
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

// chatbubble & delay
function ChatBubble({
  role,
  text,
  typing
}: {
  role: "user" | "bot";
  text: string;
  typing: boolean | undefined;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      style={{
        alignSelf: role === "user" ? "flex-end" : "flex-start",
        background: role === "user" ? "#5865B9" : "#e5e7eb",
        color: role === "user" ? "#fff" : "#111",
        padding: "8px 12px",
        borderRadius: 14,
        maxWidth: "80%",
        fontSize: 13,
        fontStyle: typing ? "italic" : "normal",
        opacity: typing ? 0.6 : 1,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "all 0.25s ease-out"
      }}
    >
      {text}
    </div>
  );
}

export default ChatbotPanel;
