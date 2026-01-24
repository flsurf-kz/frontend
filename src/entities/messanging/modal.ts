import {
  CreateFileDto,
  type ChatEntity,
  type MessageEntity  
} from 'flsurf-client';
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { GlobalClient } from '$lib/shared/api';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { backendHost } from '$lib/shared/api/client';
import { CurrentUser } from '../user/model/modal';

export const CurrentChatsList   = writable<ChatEntity[]>([]);
export const CurrentChat        = writable<ChatEntity | undefined>();
export const CurrentMessages    = writable<MessageEntity[]>([]);
export const MessagesLoading    = writable(false);
export const UnreadCounter      = writable<Record<string, number>>({});
/** К какому сообщению пользователь отвечает (reply) */
export const CurrentMessageReplyTo = writable<MessageEntity | undefined>();

/** Какое сообщение сейчас редактируется (edit) */
export const CurrentEditingMessage = writable<MessageEntity | undefined>();

let previousChatId: string | undefined = undefined;

let hub: HubConnection | null = null;

let ws: WebSocket | null = null;
let sse: EventSource | null = null;

/* --- helpers ---------------------------------------------------------- */

export async function loadChats() {
  const list = await GlobalClient.getChats();
  CurrentChatsList.set(list);
}

export async function openChat(chat: ChatEntity) {
  if (previousChatId === chat.id && get(CurrentChat)?.id === chat.id) return; // Уже открыт

  // preload from getChatsList
  CurrentChat.set(chat); 
  let loadedChat = await GlobalClient.getChat(chat.id); 
  CurrentChat.set(loadedChat); 

  MessagesLoading.set(true);
  const msgs = await GlobalClient.getMessages(chat.id);
  CurrentMessages.set(msgs);
  MessagesLoading.set(false);

  // Убираем счетчик непрочитанных для этого чата
  UnreadCounter.update(counts => {
      const newCounts = {...counts};
      delete newCounts[chat.id];
      return newCounts;
  });

  if (hub && hub.state === HubConnectionState.Connected) {
    if (previousChatId) {
      await hub.invoke("LeaveChatGroup", previousChatId).catch(err => console.error("LeaveChatGroup error:", err));
    }
    await hub.invoke("JoinChatGroup", chat.id).catch(err => console.error("JoinChatGroup error:", err));
    previousChatId = chat.id;
  } else {
    console.warn("SignalR hub not connected. Cannot join/leave chat groups.");
    // Можно попробовать переподключиться, если это необходимо
    await initializeHubConnection(); // и затем снова попытаться войти в группу
  }
  
}

async function initializeHubConnection() {
  if (!browser || hub) return; // Уже подключены или не в браузере

  hub = new HubConnectionBuilder()
    .withUrl(backendHost + "/api/ws/general", {
      transport: HttpTransportType.WebSockets,
      // если фронт и бэк на разных origin-ах:
      withCredentials: true
    })
    .withAutomaticReconnect()
    .build();

  hub.on("ReceiveMessage", (chatId: string, message: MessageEntity) => {
    // Важно: Убедитесь, что сообщение пришло для текущего открытого чата
    // или обновите счетчик непрочитанных для других чатов
    const currentOpenChat = get(CurrentChat);
    if (message.senderId === get(CurrentUser)?.id) { 
      return
    }
    if (currentOpenChat && currentOpenChat.id === chatId) {
      CurrentMessages.update(msgs => [...msgs, message]);
    } else {
      // Обновить счетчик непрочитанных для chatId
      UnreadCounter.update(counts => ({
        ...counts,
        [chatId]: (counts[chatId] || 0) + 1
      }));
    }
  });

  // Другие обработчики hub.on(...)

  try {
    await hub.start();
    console.log("SignalR Hub connected.");
    // После успешного старта, можно загрузить чаты и подписаться на активный (если есть)
    const initialChatId = new URLSearchParams(window.location.search).get('chatId');
    if (initialChatId) {
        await hub.invoke("JoinChatGroup", initialChatId);
    }
  } catch (err) {
    console.error("SignalR Hub connection failed: ", err);
  }
}


/* --- WebSocket / SSE -------------------------------------------------- */

async function connectHub(chatId: string) {
  if (!browser) return;

  await disconnectHub();

  // SignalR из коробки отправит все куки того же домена
  hub = new HubConnectionBuilder()
    .withUrl(backendHost + "api/ws/general", {
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
  initializeHubConnection(); // Инициализация SignalR
}
