export const MESSAGE_PAGE_SIZE = 20;
export const LONG_MESSAGE_THRESHOLD = 300;
export const TOP_FETCH_THRESHOLD = 80;
export const BOTTOM_CONFIRM_THRESHOLD = 32;
export const DELETE_LONG_PRESS_MS = 2000;
export const MESSAGE_SEND_DESTINATION = '/app/chat/message';
export const MAX_IMAGE_ATTACHMENTS_PER_PICK = 9;
export const MAX_ATTACHMENT_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
export const ALLOWED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'applications/vnd.pdf',
  'text/pdf',
]);
export const PDF_FILE_EXTENSION_REGEX = /\.pdf$/i;
export const ROOM_PAGE_SIZE = 10;
export const ROOM_NAME_MAX_LENGTH = 6;
export const MIN_NICKNAME_LENGTH = 2;
export const MAX_NICKNAME_LENGTH = 10;
