import {
  CreateFileDto,
  type ChatEntity,
  type MessageEntity  
} from 'flsurf-client';
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { GlobalClient } from '$lib/shared/api';
import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
  
export const CurrentChatsList   = writable<ChatEntity[]>([]);
export const CurrentChat        = writable<ChatEntity | undefined>();
export const CurrentMessages    = writable<MessageEntity[]>([]);
export const MessagesLoading    = writable(false);
export const UnreadCounter      = writable<Record<string, number>>({});
/** К какому сообщению пользователь отвечает (reply) */
export const CurrentMessageReplyTo = writable<MessageEntity | undefined>();

/** Какое сообщение сейчас редактируется (edit) */
export const CurrentEditingMessage = writable<MessageEntity | undefined>();

let hub: HubConnection | null = null;

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

  await connectHub(id)
}

/* --- WebSocket / SSE -------------------------------------------------- */

async function connectHub(chatId: string) {
  if (!browser) return;

  await disconnectHub();

  // SignalR из коробки отправит все куки того же домена
  hub = new HubConnectionBuilder()
    .withUrl("/ws/general", {
      transport: HttpTransportType.WebSockets,
      // если фронт и бэк на разных origin-ах:
      withCredentials: true
    })
    .withAutomaticReconnect()
    .build();

  hub.on("ReceiveMessage", msg => { /* … */ });

  await hub.start();
  await hub.invoke("JoinChat", chatId);
}

async function disconnectHub() {
  if (hub) {
    try { await hub.stop(); } catch { /* ignore */ }
    hub = null;
  }
}

export function sendText(text: string, files: CreateFileDto[] = []) {
  const chat = get(CurrentChat);
  if (!chat || !ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({ chatId: chat.id, text, files }));
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

if (browser) {
  loadChats();
}
