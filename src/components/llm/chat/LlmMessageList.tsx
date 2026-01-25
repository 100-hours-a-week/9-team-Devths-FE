'use client';

type Message = {
  id: string;
  role: 'USER' | 'AI' | 'SYSTEM';
  text: string;
  time?: string;
  attachments?: Array<{ type: 'image' | 'file'; name: string }>;
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
                    {m.attachments && m.attachments.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {m.attachments.map((att, index) => (
                          <div
                            key={`${m.id}-att-${index}`}
                            className={[
                              'flex items-center gap-2 rounded-lg border px-2 py-1 text-[11px]',
                              isUser
                                ? 'border-white/20 text-white/90'
                                : 'border-neutral-200 text-neutral-700',
                            ].join(' ')}
                          >
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-neutral-200 text-[10px] text-neutral-600">
                              {att.type === 'image' ? 'IMG' : 'PDF'}
                            </span>
                            <span className="truncate">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
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
