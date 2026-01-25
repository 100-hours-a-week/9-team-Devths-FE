'use client';

type Props = {
  roomId: string;
};

export default function LlmChatPage({ roomId }: Props) {
  return (
    <main className="p-4">
      <h1 className="text-lg font-semibold">LLM-003 채팅</h1>
      <p className="text-muted-foreground mt-2 text-sm">roomId: {roomId}</p>

      <section className="mt-6 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">메시지 리스트/입력창/버블 붙일 예정</p>
      </section>
    </main>
  );
}
