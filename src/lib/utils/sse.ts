export type SseEvent = {
  event: string;
  data: string;
};

type SseEventHandler = (event: SseEvent) => boolean | void;

export async function readSseStream(response: Response, onEvent: SseEventHandler) {
  if (!response.ok) {
    throw new Error(`SSE 요청 실패 (HTTP ${response.status})`);
  }

  if (!response.body) {
    throw new Error('SSE 응답 스트림이 없습니다.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (!part.trim()) continue;

      const lines = part.split('\n');
      let event = 'message';
      const dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('event:')) {
          event = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart());
        }
      }

      if (dataLines.length === 0) continue;

      const shouldContinue = onEvent({ event, data: dataLines.join('\n') });
      if (shouldContinue === false) {
        await reader.cancel();
        return;
      }
    }
  }

  if (buffer.trim()) {
    const lines = buffer.split('\n');
    let event = 'message';
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length > 0) {
      onEvent({ event, data: dataLines.join('\n') });
    }
  }
}
