export type CursorPage<T> = {
  items: T[];
  lastId: number;
  hasNext: boolean;
};

export type AiChatRoom = {
  roomId: number;
  roomUuid: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageAttachment = {
  fileId: number;
  s3Key: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
};

export type ChatMessage = {
  roomId: number;
  messageId: number;
  interviewId: number | null;
  role: 'USER' | 'ASSISTANT';
  content: string;
  type: 'NORMAL';
  metadata: Record<string, unknown> | null;
  attachments?: ChatMessageAttachment[];
  createdAt: string;
};

export type FetchRoomsResponse = {
  rooms: AiChatRoom[];
  lastId: number;
  hasNext: boolean;
};

export type CreateRoomResponse = {
  roomId: number;
  roomUuid: string;
  title: string;
  createdAt: string;
};

export type FetchMessagesResponse = {
  messages: ChatMessage[];
  lastId: number;
  hasNext: boolean;
};

export type SendMessageResponse = {
  userMessage: ChatMessage;
  aiResponse: ChatMessage;
};

export type FetchRoomsParams = {
  size?: number;
  lastId?: number;
};

export type FetchMessagesParams = {
  size?: number;
  lastId?: number;
};

export type SendMessageRequest = {
  content: string;
  model: LlmModel;
};

export type SSEErrorEvent = {
  message: string;
};

export type InterviewType = 'TECH' | 'PERSONAL';

export type StartInterviewRequest = {
  interviewType: InterviewType;
};

export type InterviewMessage = {
  messageId: number;
  role: 'ASSISTANT';
  content: string;
  type: 'INTERVIEW';
  createdAt: string;
};

export type StartInterviewResponse = {
  interviewId: number;
  status: 'IN_PROGRESS';
  content: InterviewMessage;
};

export type EndInterviewRequest = {
  interviewId: number;
};

export type EndInterviewResponse = {
  taskId: number;
  status: TaskStatus;
};

export type LlmModel = 'GEMINI' | 'VLLM';

export type DocumentInput = {
  text: string;
  images: File[];
  pdf: File | null;
};

export type AnalysisFormState = {
  resume: DocumentInput;
  jobPosting: DocumentInput;
  model: LlmModel;
};

export type AnalysisDocumentInput = {
  fileId: number | null;
  s3Key: string | null;
  fileType: string | null;
  text: string | null;
};

export type StartAnalysisRequest = {
  model: LlmModel;
  resume: AnalysisDocumentInput;
  jobPost: AnalysisDocumentInput;
};

export type TaskStatus = 'PENDING' | 'PROGRESSING' | 'COMPLETED' | 'FAILED';

export type StartAnalysisResponse = {
  taskId: number;
  status: TaskStatus;
};

export type AnalysisResultMessage = {
  roomId: number;
  messageId: number;
  interviewId: number | null;
  role: 'ASSISTANT';
  type: 'REPORT';
  content: string;
  metadata: {
    score?: number;
    summary?: string;
    strengths?: string[];
  } | null;
  createdAt: string;
};

export type TaskResultData = {
  taskId: number;
  taskType: 'RESUME' | 'INTERVIEW' | 'SCHEDULE';
  referenceId: number;
  status: TaskStatus;
  result: AnalysisResultMessage | null;
  failReason?: string;
  failMessage?: string;
  createdAt: string;
  updatedAt: string;
  isNotified: boolean;
};
