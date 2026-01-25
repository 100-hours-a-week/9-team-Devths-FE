'use client';

type Message = {
  id: string;
  role: 'USER' | 'AI' | 'SYSTEM';
  text: string;
  time?: string;
};

type Props = {
  messages: Message[];
};

export default function LlmMessageList({ messages }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-4">
      <div className="space-y-3">
        {messages.map((m) => {
          if (m.role === 'SYSTEM') {
            return (
              <div key={m.id} className="flex justify-center">
                <span className="rounded-full bg-neutral-200 px-3 py-1 text-[11px] text-neutral-600">
                  {m.text}
                </span>
              </div>
            );
          }

          const isUser = m.role === 'USER';

          return (
            <div key={m.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
              <div className={isUser ? 'flex max-w-[85%] items-end gap-2' : 'flex max-w-[85%] items-end gap-2'}>
                {!isUser ? (
                  <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200" aria-hidden="true" />
                ) : null}

                <div className={isUser ? 'order-2 flex flex-col items-end' : 'order-1 flex flex-col items-start'}>
                  <div
                    className={[
                      'relative rounded-2xl px-3 py-2 text-sm leading-5',
                      isUser ? 'bg-neutral-900 text-white' : 'border bg-white text-neutral-900',
                    ].join(' ')}
                  >
                    <p>{m.text}</p>
                  </div>
                  {m.time ? (
                    <span className="mt-1 text-[10px] text-neutral-400">{m.time}</span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
