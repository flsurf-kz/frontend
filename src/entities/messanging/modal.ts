import {
  CreateFileDto,
  type ChatEntity,
  type MessageEntity  
} from 'flsurf-client';
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { CurrentUser } from '../user/model/modal';
import { GlobalClient } from '$lib/shared/api';
  
export const CurrentChatsList   = writable<ChatEntity[]>([]);
export const CurrentChat        = writable<ChatEntity | undefined>();
export const CurrentMessages    = writable<MessageEntity[]>([]);
export const MessagesLoading    = writable(false);
export const UnreadCounter      = writable<Record<string, number>>({});

let ws: WebSocket | null = null;
let sse: EventSource | null = null;

/* --- helpers ---------------------------------------------------------- */

export async function loadChats() {
  const list = await GlobalClient.getChats();
  CurrentChatsList.set(list);
}

export async function openChat(id: string) {
  const chat = await GlobalClient.getChat(id);
  CurrentChat.set(chat);

  MessagesLoading.set(true);
  const msgs = await GlobalClient.getMessages(id);
  MessagesLoading.set(false);
  CurrentMessages.set(msgs);

  connectSocket(id);
}

/* --- WebSocket / SSE -------------------------------------------------- */

function connectSocket(chatId: string) {
  disconnect();

  if (!browser) return;

  const token = (get(CurrentUser)?.id) ?? ''; // если вы храните jwt
  ws = new WebSocket(`wss://<domain>/api/messenger/ws?chatId=${chatId}&token=${token}`);

  ws.onmessage = (ev) => {
    const msg: MessageEntity = JSON.parse(ev.data);
    CurrentMessages.update(arr => [...arr, msg]);
  };

  ws.onerror = () => {
    // fallback на SSE
    ws?.close();
    ws = null;
    sse = new EventSource(`/api/messenger/sse?chatId=${chatId}&token=${token}`);
    sse.onmessage = ev => {
      const msg: MessageEntity = JSON.parse(ev.data);
      CurrentMessages.update(arr => [...arr, msg]);
    };
  };
}

export function sendText(text: string, files: CreateFileDto[] = []) {
  const chat = get(CurrentChat);
  if (!chat || !ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({ chatId: chat.id, text, files }));
}

function disconnect() {
  ws?.close(); ws = null;
  sse?.close(); sse = null;
}

/* --- file upload à‑la Telegram --------------------------------------- */

export async function uploadFiles(nativeFiles: File[]): Promise<CreateFileDto[]> {
  const out: CreateFileDto[] = [];
  for (const f of nativeFiles) {
    const dto = await GlobalClient.uploadFile({ data: f, fileName: f.name });
    out.push(new CreateFileDto({ fileId: dto.id, name: dto.fileName }));
  }
  return out;
}

/* --- init ------------------------------------------------------------- */

loadChats();
