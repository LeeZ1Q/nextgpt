import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ChatCompletionResponseMessage } from 'openai';
import {
	ControllerPool,
	requestChatStream,
	requestWithPrompt,
} from './requests';
import { trimTopic } from './utils';

export type Message = ChatCompletionResponseMessage & {
	date: string;
	streaming?: boolean;
};

export enum SubmitKey {
	Enter = 'Enter',
	CtrlEnter = 'Ctrl + Enter',
	ShiftEnter = 'Shift + Enter',
	AltEnter = 'Alt + Enter',
}

export interface ChatConfig {
	maxToken?: number;
	historyMessageCount: number; // -1 means all
	compressMessageLengthThreshold: number;
	sendBotMessages: boolean; // send bot's message or not
	submitKey: SubmitKey;

	modelConfig: {
		model: string;
		temperature: number;
		max_tokens: number;
		presence_penalty: number;
	};
}

export type ModelConfig = ChatConfig['modelConfig'];

export const ALL_MODELS = [
	{
		name: 'gpt-4',
		available: false,
	},
	{
		name: 'gpt-4-0314',
		available: false,
	},
	{
		name: 'gpt-4-32k',
		available: false,
	},
	{
		name: 'gpt-4-32k-0314',
		available: false,
	},
	{
		name: 'gpt-3.5-turbo',
		available: true,
	},
	{
		name: 'gpt-3.5-turbo-0301',
		available: true,
	},
];

export function isValidModel(name: string) {
	return ALL_MODELS.some((m) => m.name === name && m.available);
}

export function isValidNumber(x: number, min: number, max: number) {
	return typeof x === 'number' && x <= max && x >= min;
}

export function filterConfig(config: ModelConfig): Partial<ModelConfig> {
	const validator: {
		[k in keyof ModelConfig]: (x: ModelConfig[keyof ModelConfig]) => boolean;
	} = {
		model(x) {
			return isValidModel(x as string);
		},
		max_tokens(x) {
			return isValidNumber(x as number, 100, 4000);
		},
		presence_penalty(x) {
			return isValidNumber(x as number, -2, 2);
		},
		temperature(x) {
			return isValidNumber(x as number, 0, 1);
		},
	};

	Object.keys(validator).forEach((k) => {
		const key = k as keyof ModelConfig;
		if (!validator[key](config[key])) {
			delete config[key];
		}
	});

	return config;
}

const DEFAULT_CONFIG: ChatConfig = {
	historyMessageCount: 4,
	compressMessageLengthThreshold: 1000,
	sendBotMessages: true as boolean,
	submitKey: SubmitKey.CtrlEnter as SubmitKey,
	modelConfig: {
		model: 'gpt-3.5-turbo',
		temperature: 1,
		max_tokens: 2000,
		presence_penalty: 0,
	},
};

interface ChatStat {
	tokenCount: number;
	wordCount: number;
	charCount: number;
}

interface ChatSession {
	id: number;
	topic: string;
	memoryPrompt: string;
	messages: Message[];
	stat: ChatStat;
	lastUpdate: string;
	lastSummarizeIndex: number;
}

const DEFAULT_TOPIC = '新对话';

function createEmptySession(): ChatSession {
	const createDate = new Date().toLocaleString();

	return {
		id: Date.now(),
		topic: DEFAULT_TOPIC,
		memoryPrompt: '',
		messages: [
			{
				role: 'assistant',
				content: '有什么可以帮你的吗?',
				date: createDate,
			},
		],
		stat: {
			tokenCount: 0,
			wordCount: 0,
			charCount: 0,
		},
		lastUpdate: createDate,
		lastSummarizeIndex: 0,
	};
}

interface ChatStore {
	config: ChatConfig;
	sessions: ChatSession[];
	currentSessionIndex: number;
	removeSession: (index: number) => void;
	selectSession: (index: number) => void;
	newSession: () => void;
	currentSession: () => ChatSession;
	onNewMessage: (message: Message) => void;
	onUserInput: (content: string) => Promise<void>;
	summarizeSession: () => void;
	updateStat: (message: Message) => void;
	updateCurrentSession: (updater: (session: ChatSession) => void) => void;
	updateMessage: (
		sessionIndex: number,
		messageIndex: number,
		updater: (message?: Message) => void
	) => void;
	getMessagesWithMemory: () => Message[];
	getMemoryPrompt: () => Message;

	getConfig: () => ChatConfig;
	resetConfig: () => void;
	updateConfig: (updater: (config: ChatConfig) => void) => void;
	clearAllData: () => void;
}

const LOCAL_KEY = 'next-gpt-store';

export const useChatStore = create<ChatStore>()(
	persist(
		(set, get) => ({
			sessions: [createEmptySession()],
			currentSessionIndex: 0,
			config: {
				...DEFAULT_CONFIG,
			},

			resetConfig() {
				set(() => ({ config: { ...DEFAULT_CONFIG } }));
			},

			getConfig() {
				return get().config;
			},

			updateConfig(updater) {
				const config = get().config;
				updater(config);
				set(() => ({ config }));
			},

			selectSession(index: number) {
				set({
					currentSessionIndex: index,
				});
			},

			removeSession(index: number) {
				set((state) => {
					let nextIndex = state.currentSessionIndex;
					const sessions = state.sessions;

					if (sessions.length === 1) {
						return {
							currentSessionIndex: 0,
							sessions: [createEmptySession()],
						};
					}

					sessions.splice(index, 1);

					if (nextIndex === index) {
						nextIndex -= 1;
					}

					return {
						currentSessionIndex: nextIndex,
						sessions,
					};
				});
			},

			newSession() {
				set((state) => ({
					currentSessionIndex: 0,
					sessions: [createEmptySession()].concat(state.sessions),
				}));
			},

			currentSession() {
				let index = get().currentSessionIndex;
				const sessions = get().sessions;

				if (index < 0 || index >= sessions.length) {
					index = Math.min(sessions.length - 1, Math.max(0, index));
					set(() => ({ currentSessionIndex: index }));
				}

				const session = sessions[index];

				return session;
			},

			onNewMessage(message) {
				get().updateCurrentSession((session) => {
					session.lastUpdate = new Date().toLocaleString();
				});
				get().updateStat(message);
				get().summarizeSession();
			},

			async onUserInput(content) {
				const userMessage: Message = {
					role: 'user',
					content,
					date: new Date().toLocaleString(),
				};

				const botMessage: Message = {
					content: '',
					role: 'assistant',
					date: new Date().toLocaleString(),
					streaming: true,
				};

				// get last five messges
				const recentMessages = get().getMessagesWithMemory();
				const sendMessages = recentMessages.concat(userMessage);
				const sessionIndex = get().currentSessionIndex;
				const messageIndex = get().currentSession().messages.length + 1;

				get().updateCurrentSession((session) => {
					session.messages.push(userMessage);
					session.messages.push(botMessage);
				});

				console.log('[User Input] ', sendMessages);

				requestChatStream(sendMessages, {
					onMessage(content, done) {
						if (done) {
							botMessage.streaming = false;
							botMessage.content = content;
							get().onNewMessage(botMessage);
							ControllerPool.remove(sessionIndex, messageIndex);
						} else {
							botMessage.content = content;
							set(() => ({}));
						}
					},
					onError(error) {
						botMessage.content += '\n\n出错了，稍后重试吧';
						botMessage.streaming = false;
						set(() => ({}));
						ControllerPool.remove(sessionIndex, messageIndex);
					},
					onController(controller) {
						// collect controller for stop/retry
						ControllerPool.addController(
							sessionIndex,
							messageIndex,
							controller
						);
					},
					filterBot: !get().config.sendBotMessages,
					modelConfig: get().config.modelConfig,
				});
			},

			getMemoryPrompt() {
				const session = get().currentSession();

				return {
					role: 'system',
					content: '这是你和用户的历史聊天总结：' + session.memoryPrompt,
					date: '',
				} as Message;
			},

			getMessagesWithMemory() {
				const session = get().currentSession();
				const config = get().config;
				const n = session.messages.length;
				const recentMessages = session.messages.slice(
					n - config.historyMessageCount
				);

				const memoryPrompt = get().getMemoryPrompt();

				if (session.memoryPrompt) {
					recentMessages.unshift(memoryPrompt);
				}

				return recentMessages;
			},

			updateMessage(
				sessionIndex: number,
				messageIndex: number,
				updater: (message?: Message) => void
			) {
				const sessions = get().sessions;
				const session = sessions.at(sessionIndex);
				const messages = session?.messages;
				updater(messages?.at(messageIndex));
				set(() => ({ sessions }));
			},

			summarizeSession() {
				const session = get().currentSession();

				if (session.topic === DEFAULT_TOPIC && session.messages.length >= 3) {
					// should summarize topic
					requestWithPrompt(
						session.messages,
						'使用四到五个字直接返回这句话的简要主题，不要解释、不要标点、不要语气词、不要多余文本，如果没有主题，请直接返回“闲聊”'
					).then((res) => {
						get().updateCurrentSession(
							(session) => (session.topic = trimTopic(res))
						);
					});
				}

				const config = get().config;
				let toBeSummarizedMsgs = session.messages.slice(
					session.lastSummarizeIndex
				);
				const historyMsgLength = toBeSummarizedMsgs.reduce(
					(pre, cur) => pre + (cur.content?.length ?? 0),
					0
				);

				if (historyMsgLength > 4000) {
					toBeSummarizedMsgs = toBeSummarizedMsgs.slice(
						-config.historyMessageCount
					);
				}

				toBeSummarizedMsgs.unshift(get().getMemoryPrompt());

				const lastSummarizeIndex = session.messages.length;

				console.log(
					'[Chat History] ',
					toBeSummarizedMsgs,
					historyMsgLength,
					config.compressMessageLengthThreshold
				);

				if (historyMsgLength > config.compressMessageLengthThreshold) {
					requestChatStream(
						toBeSummarizedMsgs.concat({
							role: 'system',
							content:
								'简要总结一下你和用户的对话，用作后续的上下文提示 prompt，控制在 50 字以内',
							date: '',
						}),
						{
							filterBot: false,
							onMessage(message, done) {
								session.memoryPrompt = message;
								if (done) {
									console.log('[Memory] ', session.memoryPrompt);
									session.lastSummarizeIndex = lastSummarizeIndex;
								}
							},
							onError(error) {
								console.error('[Summarize] ', error);
							},
						}
					);
				}
			},

			updateStat(message) {
				get().updateCurrentSession((session) => {
					session.stat.charCount += message.content?.length ?? 0;
					// TODO: should update chat count and word count
				});
			},

			updateCurrentSession(updater) {
				const sessions = get().sessions;
				const index = get().currentSessionIndex;
				updater(sessions[index]);
				set(() => ({ sessions }));
			},

			clearAllData() {
				if (confirm('确认清除所有聊天、设置数据？')) {
					localStorage.clear();
					location.reload();
				}
			},
		}),
		{
			name: LOCAL_KEY,
		}
	)
);
