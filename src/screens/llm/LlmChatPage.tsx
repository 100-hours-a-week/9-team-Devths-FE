'use client';

type Props = {
  roomId: string;
};

export default function LlmChatPage({ roomId }: Props) {
  return (
    <main className="p-4">
      <h1 className="text-lg font-semibold">LLM-003 채팅</h1>
      <p className="mt-2 text-sm text-muted-foreground">roomId: {roomId}</p>

      <section className="mt-6 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          다음 커밋에서 카카오톡 스타일(메시지 리스트/입력창/버블)로 퍼블리싱합니다.
        </p>
      </section>
    </main>
  );
}
