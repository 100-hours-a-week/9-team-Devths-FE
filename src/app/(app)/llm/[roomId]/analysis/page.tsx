import LlmAnalysisPage from '@/screens/llm/LlmAnalysisPage';

type Props = {
  params: { roomId: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ roomId: 'demo-room' }];
}

export default function Page({ params }: Props) {
  return <LlmAnalysisPage roomId={params.roomId} />;
}
