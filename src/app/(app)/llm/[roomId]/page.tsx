import LlmChatPage from '@/screens/llm/LlmChatPage';

type Props = {
  params: { roomId: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ roomId: 'demo-room' }];
}

export default function Page({ params }: Props) {
  return <LlmChatPage roomId={params.roomId} />;
}
