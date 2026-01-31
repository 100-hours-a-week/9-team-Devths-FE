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
    buffer = buffer.replace(/\r\n/g, '\n');
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (!part.trim()) continue;

      const lines = part.split('\n');
      let event = 'message';
      const dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith(':')) {
          continue;
        }
        if (line.startsWith('event:')) {
          event = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          const value = line.slice(5);
          dataLines.push(value.startsWith(' ') ? value.slice(1) : value);
        }
      }

      if (dataLines.length === 0) {
        if (event === 'done') {
          const shouldContinue = onEvent({ event, data: '' });
          if (shouldContinue === false) {
            await reader.cancel();
            return;
          }
        }
        continue;
      }

      const shouldContinue = onEvent({ event, data: dataLines.join('\n') });
      if (shouldContinue === false) {
        await reader.cancel();
        return;
      }
    }
  }

  buffer += decoder.decode();
  const normalized = buffer.replace(/\r\n/g, '\n');

  if (normalized.trim()) {
    const lines = normalized.split('\n');
    let event = 'message';
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith(':')) {
        continue;
      }
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const value = line.slice(5);
        dataLines.push(value.startsWith(' ') ? value.slice(1) : value);
      }
    }

    if (dataLines.length > 0) {
      onEvent({ event, data: dataLines.join('\n') });
    } else if (event === 'done') {
      onEvent({ event, data: '' });
    }
  }
}
