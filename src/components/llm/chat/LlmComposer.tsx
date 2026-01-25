'use client';

import { Paperclip, SendHorizonal } from 'lucide-react';
import { useState } from 'react';

type Props = {
  onSend?: (text: string) => void;
  disabled?: boolean;
  onAttach?: () => void;
};

export default function LlmComposer({ onSend, disabled = false, onAttach }: Props) {
  const [text, setText] = useState('');

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="border-t bg-white px-3 py-2">
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={onAttach}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50"
          aria-label="파일 첨부"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          className="h-11 flex-1 resize-none rounded-2xl border bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          placeholder="메시지를 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          type="button"
          disabled={!canSend}
          onClick={() => {
            const v = text.trim();
            if (!v) return;
            onSend?.(v);
            setText('');
          }}
          className={[
            'inline-flex h-11 w-11 items-center justify-center rounded-2xl transition',
            canSend
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-neutral-200 text-neutral-500',
          ].join(' ')}
          aria-label="전송"
        >
          <SendHorizonal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
