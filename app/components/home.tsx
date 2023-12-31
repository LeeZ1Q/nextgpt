'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { IconButton } from './button';

import { SettingsIcon } from '../icons/settings';
import { AddIcon } from '../icons/add';
import { ExportIcon } from '../icons/export';
import { GithubIcon } from '../icons/github';
import { GPTIcon } from '../icons/gpt';
import { UserIcon } from '../icons/user';
import { SendIcon } from '../icons/send';
import { MaxIcon } from '../icons/max';
import { CloseIcon } from '../icons/close';
import { LoadingIcon } from '../icons/loading';
import { CopyIcon } from '../icons/copy';
import { DownloadIcon } from '../icons/download';

import { Message, SubmitKey, useChatStore } from '../store';
import Link from 'next/link';
import ThemeSwitch from './themeSwitch';

import { showModal } from './uilib';
import { copyToClipboard, downloadAs, selectOrCopy } from '../utils';

import dynamic from 'next/dynamic';
import { ControllerPool } from '../requests';

const Markdown = dynamic(async () => (await import('./markdown')).Markdown, {
	loading: () => <LoadingIcon />,
});

const Settings = dynamic(async () => (await import('./settings')).Settings, {
	loading: () => <LoadingIcon />,
});

export function Avatar(props: { role: Message['role'] }) {
	if (props.role === 'assistant') {
		return <GPTIcon className='h-6 w-6' />;
	}

	return <UserIcon className='h-6 w-6' />;
}

export function ChatItem(props: {
	onClick?: () => void;
	onDelete?: () => void;
	title: string;
	count: number;
	time: string;
	selected: boolean;
}) {
	return (
		<div
			className={`group flex-wrap px-4 py-2  my-1 cursor-pointer rounded-2xl bg-base hover:bg-gray-100 dark:hover:bg-gray-900 ${
				props.selected ? ' border-2 border-gray-400 dark:border-gray-600' : ''
			}`}
			onClick={props.onClick}
		>
			<div className='flex'>
				<div className='textc-base h-6'>{props.title}</div>
				<CloseIcon
					className='my-1 h-4 w-4 opacity-0 group-hover:opacity-100 ml-auto btn-base hover:text-zinc-400 dark:hover:text-stone-300'
					onClick={props.onDelete}
				/>
			</div>
			<div className='flex text-gray-400'>
				<div className='text-sm'>{props.count} 条对话</div>
				<div className='text-xs mt-0.5 ml-auto '>{props.time}</div>
			</div>
		</div>
	);
}

export function ChatList() {
	const [sessions, selectedIndex, selectSession, removeSession] = useChatStore(
		(state) => [
			state.sessions,
			state.currentSessionIndex,
			state.selectSession,
			state.removeSession,
		]
	);

	return (
		<div className='flex flex-col w-56 h-full my-2'>
			{sessions.map((item, index) => (
				<ChatItem
					title={item.topic}
					time={item.lastUpdate}
					count={item.messages.length}
					key={index}
					selected={index === selectedIndex}
					onClick={() => selectSession(index)}
					onDelete={() => removeSession(index)}
				/>
			))}
		</div>
	);
}

function useSubmitHandler() {
	const config = useChatStore((state) => state.config);
	const submitKey = config.submitKey;

	const shouldSubmit = (e: KeyboardEvent) => {
		if (e.key !== 'Enter') return false;

		return (
			(config.submitKey === SubmitKey.AltEnter && e.altKey) ||
			(config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
			(config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
			(config.submitKey === SubmitKey.Enter &&
				!e.altKey &&
				!e.ctrlKey &&
				!e.shiftKey)
		);
	};

	return {
		submitKey,
		shouldSubmit,
	};
}

export function Chat() {
	type RenderMessage = Message & { preview?: boolean };

	const [session, sessionIndex] = useChatStore((state) => [
		state.currentSession(),
		state.currentSessionIndex,
	]);
	const [userInput, setUserInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { submitKey, shouldSubmit } = useSubmitHandler();

	const onUserInput = useChatStore((state) => state.onUserInput);

	const onUserSubmit = () => {
		if (userInput.length <= 0) return;
		setIsLoading(true);
		onUserInput(userInput).then(() => setIsLoading(false));
		setUserInput('');
	};

	const onUserStop = (messageIndex: number) => {
		console.log(ControllerPool, sessionIndex, messageIndex);
		ControllerPool.stop(sessionIndex, messageIndex);
	};

	const onInputKeyDown = (e: KeyboardEvent) => {
		if (shouldSubmit(e)) {
			onUserSubmit();
			e.preventDefault();
		}
	};

	const onRightClick = (e: any, message: Message) => {
		// auto fill user input
		if (message.role === 'user') {
			setUserInput(String(message.content));
		}

		// copy to clipboard
		if (selectOrCopy(e.currentTarget, String(message.content))) {
			e.preventDefault();
		}
	};

	const onResend = (botIndex: number) => {
		// find last user input message and resend
		for (let i = botIndex; i >= 0; i -= 1) {
			if (messages[i].role === 'user') {
				setIsLoading(true);
				onUserInput(String(messages[i].content)).then(() =>
					setIsLoading(false)
				);
				return;
			}
		}
	};

	const latestMessageRef = useRef<HTMLDivElement>(null);

	const [autoScroll, setAutoScroll] = useState(false);

	const messages = (session.messages as RenderMessage[])
		.concat(
			isLoading
				? [
						{
							role: 'assistant',
							content: '……',
							date: new Date().toLocaleString(),
							preview: true,
						},
				  ]
				: []
		)
		.concat(
			userInput.length > 0
				? [
						{
							role: 'user',
							content: userInput,
							date: new Date().toLocaleString(),
							preview: true,
						},
				  ]
				: []
		);

	useLayoutEffect(() => {
		setTimeout(() => {
			const dom = latestMessageRef.current;
			if (dom && !autoScroll) {
				dom.scrollIntoView({
					behavior: 'smooth',
					block: 'end',
				});
			}
		}, 500);
	});

	return (
		<div
			className='h-5/6 flex flex-col flex-1'
			key={session.id}
		>
			{/* header */}
			<div className='border-b-2 rounded-md border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 py-2'>
				<div className='flex-wrap items-center '>
					<div className='text-lg font-bold textc-base'>{session.topic}</div>
					<div className='text-sm text-gray-500'>
						{session.messages.length}条对话
					</div>
				</div>
				<div className='flex btn-base'>
					<IconButton
						icon={<ExportIcon className='mx-2 h-5 w-5 ' />}
						onClick={() => {
							exportMessages(session.messages, session.topic);
						}}
					/>
					<IconButton
						icon={<MaxIcon className='mx-2 h-5 w-5' />}
						onClick={() => {}}
					/>
				</div>
			</div>

			{/* body */}
			<div className='mt-2 scl flex-col flex-1 overflow-y-auto'>
				{messages.map((message, index) => {
					const isUser = message.role === 'user';

					return (
						<div
							key={index}
							className='flex flex-col mb-2 first:mt-2'
						>
							{/* container */}
							<div className='flex items-start'>
								{/* avatar */}
								<div className='w-8 h-8 mx-2 mt-2 p-1'>
									<Avatar role={message.role} />
									{(message.preview || message.streaming) && (
										<div className='m-1 ml-1.5 font-bold text-sm textc-base '>
											···
										</div>
									)}
								</div>

								{/* content */}
								<div className='mr-10 my-1 flex flex-col'>
								
									{(message.preview || message.content?.length === 0) &&
									!isUser ? (
										<LoadingIcon className='h-5 w-5' />
									) : (
										<div
											className='p-2 mb-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-base-100'
											onContextMenu={(e) => onRightClick(e, message)}
										>
											<Markdown content={String(message.content)} />
										</div>
									)}
									{!isUser && !message.preview && (
										<div className='ml-2 text-xs text-gray-500 '>
											{message.date.toLocaleString()}
										</div>
									)}
									
									{/* <div className='transition-all ease-in-out duration-300 pointer-events-none flex flex-row-reverse text-xs'>
										{message.streaming ? (
											<div
												className='mr-2.5 opacity-50 cursor-pointer hover:opacity-100'
												onClick={() => onUserStop(index)}
											>
												Stop
											</div>
										) : (
											<div
												className='mr-2.5 opacity-50 cursor-pointer'
												onClick={() => onResend(index)}
											>
												Resend
											</div>
										)}

										<div
											className='mr-2.5 opacity-50 cursor-pointer'
											onClick={() => copyToClipboard(String(message.content))}
										>
											Copy
										</div>
								</div> */}
									
								</div>

							</div>
						</div>
					);
				})}
				<span
					ref={latestMessageRef}
					className='opacity-0 h-8'
				>
					-
				</span>
			</div>

			{/* input */}
			<div className='flex flex-col items-center px-4 py-2 border-t-2 rounded-md border-gray-200 dark:border-gray-700'>
				<div className='w-full flex-wrap'>
					<textarea
						className=' min-h-[96px] mt-2 scrollbar-none w-full p-2 resize-none textc-base bg-base border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500'
						placeholder={`请输入消息, ${submitKey} 发送`}
						rows={3}
						onInput={(e) => setUserInput(e.currentTarget.value)}
						value={userInput}
						onKeyDown={(e) => onInputKeyDown(e as any)}
						onFocus={() => setAutoScroll(true)}
						onBlur={() => setAutoScroll(false)}
						autoFocus
					/>
					<IconButton
						className='ml-auto p-0.5 text-sm m-0.5 btn-base bg-base-100 rounded-lg'
						icon={<SendIcon className='m-1.5 h-5 w-5' />}
						onClick={onUserSubmit}
					/>
				</div>
			</div>
		</div>
	);
}

function exportMessages(messages: Message[], topic: string) {
	const mdText =
		`**${topic}**\n\n` +
		messages
			.map((m) => {
				return m.role === 'user' ? `**${m.content}**` : m.content?.trim();
			})
			.join('\n\n');
	const filename = `${topic}.md`;

	showModal({
		title: '导出聊天记录为 Markdown',
		children: <Markdown content={String(mdText)} />,
		actions: [
			<IconButton
				key='copy'
				icon={<CopyIcon className='h-5 w-5' />}
				text='全部复制'
				onClick={() => copyToClipboard(mdText)}
			/>,
			<IconButton
				key='download'
				icon={<DownloadIcon className='h-5 w-5' />}
				text='下载文件'
				onClick={() => downloadAs(mdText, filename)}
			/>,
		],
	});
}

export function Home() {
	const [createNewSession] = useChatStore((state) => [state.newSession]);
	// const loading = !useChatStore?.persist?.hasHydrated();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	// settings
	const [openSettings, setOpenSettings] = useState(false);

	// if (loading) {
	// 	return (
	// 		<div className='flex items-center justify-center'>
	// 			<LoadingIcon />
	// 		</div>
	// 	);
	// }

	if (!mounted) {
		return (
			<div className='flex items-center justify-center'>
				<LoadingIcon />
			</div>
		);
	}

	return (
		mounted && (
			<div className='flex items-center justify-center h-screen'>
				<div className='w-11/12 h-5/6 max-w-screen-xl min-w-[600px] min-h-[480px] flex mx-auto bg-base border-2 border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden'>
					{/* siderbar*/}
					<div className='min-w-fit scl overflow-y-auto  p-5 bg-base-100 flex flex-col shadow-inner'>
						{/* header */}
						<div className='flex items-center mb-2'>
							<GPTIcon className='btn-base h-8 w-8' />
							<div className='text-lg font-bold ml-1 textc-base'>Next GPT</div>
							<IconButton
								icon={<AddIcon className='h-6 w-6' />}
								onClick={createNewSession}
								className=' textc-base bg-slate-100 dark:bg-slate-900 rounded-lg text-sm ml-auto'
								text='新对话'
							/>
						</div>
						<div
							className='flex-1 scrollbar-none overflow-y-auto'
							onClick={() => setOpenSettings(false)}
						>
							<ChatList />
						</div>
						<div className='flex items-center btn-base'>
							<IconButton
								icon={<SettingsIcon className='m-2 h-5 w-5' />}
								onClick={() => setOpenSettings(!openSettings)}
							/>

							<Link
								href='https://github.com/LeeZ1Q'
								target='_blank'
							>
								<IconButton icon={<GithubIcon className='h-6 w-6' />} />
							</Link>
							<ThemeSwitch />
						</div>
					</div>
					{/* main */}
					<div className='min-w-[240px] flex flex-col flex-1'>
						{openSettings ? (
							<Settings closeSettings={() => setOpenSettings(false)} />
						) : (
							<Chat key='chat' />
						)}
					</div>
				</div>
			</div>
		)
	);
}
