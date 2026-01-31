export const llmKeys = {
  all: ['llm'] as const,
  rooms: () => [...llmKeys.all, 'rooms'] as const,
  messages: (roomId: number) => [...llmKeys.all, 'messages', roomId] as const,
};
