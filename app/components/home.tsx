'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

import { IconButton } from './button';
import { Card, List, ListItem } from './uilib';

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
import { DeleteIcon } from '../icons/delete';
import { ResetIcon } from '../icons/reset';

import { Message, SubmitKey, useChatStore } from '../store';
import Link from 'next/link';

export function Markdown(props: { content: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkMath]}
			rehypePlugins={[rehypeKatex, rehypeHighlight]}
			className='prose prose-pre:bg-slate-900 prose-p:m-1 prose-pre:m-0 text-neutral-300 prose-code:text-neutral-200 prose-pre:scrollbar-thin prose-pre:scrollbar-thumb-gray-700 prose-pre:scrollbar-track-slate-800'
		>
			{props.content}
		</ReactMarkdown>
	);
}

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
			className={`group flex-wrap px-4 py-2  my-1 cursor-pointer rounded-2xl bg-slate-950 hover:bg-gray-900 ${
				props.selected ? ' border-2 border-slate-400' : ''
			}`}
			onClick={props.onClick}
		>
			<div className='flex'>
				<div className='flex text-neutral-300 h-6'>{props.title}</div>
				<CloseIcon
					className='m-1 h-4 w-4 opacity-0 group-hover:opacity-100 ml-auto text-stone-400 hover:text-stone-300'
					onClick={props.onDelete}
				/>
			</div>
			<div className='flex'>
				<div className='text-sm text-gray-500'>{props.count} 条对话</div>
				<div className='text-xs text-gray-500 mt-0.5 ml-auto '>
					{props.time}
				</div>
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

export function Chat() {
	type RenderMessage = Message & { preview?: boolean };

	const session = useChatStore((state) => state.currentSession());
	const [userInput, setUserInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const onUserInput = useChatStore((state) => state.onUserInput);
	const onUserSubmit = () => {
		if (userInput.length <= 0) return;
		setIsLoading(true);
		onUserInput(userInput).then(() => setIsLoading(false));
		setUserInput('');
	};

	const onInputKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey)) {
			onUserSubmit();
			e.preventDefault();
		}
	};

	const latestMessageRef = useRef<HTMLDivElement>(null);

	const messages = (session.messages as RenderMessage[])
		.concat(
			isLoading
				? [
						{
							role: 'assistant',
							content: '……',
							date: new Date().toLocaleString().slice(0, -3),
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
							date: new Date().toLocaleString().slice(0, -3),
							preview: true,
						},
				  ]
				: []
		);

	useEffect(() => {
		latestMessageRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'end',
		});
	});

	return (
		<div className='h-5/6 flex flex-col flex-1'>
			{/* header */}
			<div className='border-b rounded-md border-gray-700 flex items-center justify-between px-4 py-2'>
				<div className='flex-wrap items-center '>
					<div className='text-lg font-bold text-neutral-300'>
						{session.topic}
					</div>
					<div className='text-sm text-gray-500'>
						{session.messages.length}条对话
					</div>
				</div>
				<div className='flex text-stone-400'>
					<IconButton
						icon={<ExportIcon className='mx-2 h-5 w-5 ' />}
						onClick={() => {}}
					/>
					<IconButton
						icon={<MaxIcon className='mx-2 h-5 w-5' />}
						onClick={() => {}}
					/>
				</div>
			</div>

			{/* body */}
			<div className='scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-slate-950  flex-col flex-1 overflow-y-auto'>
				{messages.map((message, index) => {
					const isUser = message.role === 'user';

					return (
						<div
							key={index}
							className='flex flex-row mb-2'
						>
							{/* container */}
							<div className='flex items-start'>
								{/* avatar */}
								<div className='w-8 h-8 mx-2 mt-2 p-1'>
									<Avatar role={message.role} />
									{(message.preview || message.streaming) && (
										<div className='m-1 font-bold text-sm text-neutral-300 '>
											···
										</div>
									)}
								</div>

								{/* content */}
								<div className='max-w-fit mr-8 my-1 flex flex-col'>
									{(message.preview || message.content?.length === 0) &&
									!isUser ? (
										<LoadingIcon className='h-5 w-5' />
									) : (
										<div className='p-2 mb-2 border-2 border-gray-700 rounded-lg bg-slate-800'>
											<Markdown content={message.content} />
										</div>
									)}
									{!isUser && !message.preview && (
										<div className=' ml-auto text-xs text-gray-500 '>
											{message.date}
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
				<span
					ref={latestMessageRef}
					style={{ opacity: 0 }}
				>
					-
				</span>
			</div>

			{/* input */}
			<div className='flex flex-col items-center px-4 py-2 border-t rounded-md border-gray-700'>
				<div className='w-full flex-wrap'>
					<textarea
						className=' min-h-[96px] mt-2 scrollbar-none w-full p-2 resize-none text-neutral-300 bg-slate-950 border border-gray-700 rounded-xl focus:outline-none focus:ring focus:ring-slate-400'
						placeholder='请输入消息，Ctrl + Enter 发送'
						rows={3}
						onInput={(e) => setUserInput(e.currentTarget.value)}
						value={userInput}
						onKeyDown={(e) => onInputKeyDown(e as any)}
					/>
					<IconButton
						className=' ml-auto p-0.5 text-sm m-0.5 text-neutral-300 bg-slate-800 rounded-lg'
						icon={<SendIcon className='m-1.5 h-5 w-5' />}
						onClick={onUserSubmit}
					/>
				</div>
			</div>
		</div>
	);
}

export function Home() {
	const [createNewSession] = useChatStore((state) => [state.newSession]);
	const loading = !useChatStore?.persist?.hasHydrated();

	// settings
	const [openSettings, setOpenSettings] = useState(false);

	return (
		<div className='flex items-center justify-center h-screen'>
			<div className='w-11/12 h-5/6 max-w-screen-xl min-w-[600px] min-h-[480px] flex mx-auto bg-slate-950 border-2 border-gray-700 rounded-3xl shadow-sm overflow-hidden'>
				{/* siderbar*/}
				<div className='min-w-fit scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-slate-800 overflow-y-auto  p-5 bg-slate-800 flex flex-col shadow-inner'>
					{/* header */}
					<div className='flex items-center mb-2'>
						<GPTIcon className='h-8 w-8' />
						<div className='text-lg font-bold ml-1 text-neutral-300'>
							Next GPT
						</div>
						<IconButton
							icon={<AddIcon className='h-6 w-6' />}
							onClick={createNewSession}
							className=' text-neutral-300 bg-slate-900 rounded-lg text-sm ml-auto'
							text='新对话'
						/>
					</div>
					<ChatList />
					<div className='flex items-center text-stone-400'>
						<IconButton
							icon={<SettingsIcon className='m-2 h-5 w-5' />}
							onClick={() => setOpenSettings(!openSettings)}
						/>

						<Link
							href='https://github.com/LeeZ1Q'
							target='_blank'
						>
							<IconButton icon={<GithubIcon className='mr-2 h-6 w-6' />} />
						</Link>
					</div>
				</div>
				{/* main */}
				<div className='flex flex-col flex-1'>
					{openSettings ? <Settings /> : <Chat key='chat' />}
				</div>
			</div>
		</div>
	);
}

export function Settings() {
	const [config, updateConfig] = useChatStore((state) => [
		state.config,
		state.updateConfig,
	]);

	return (
		<div className='h-5/6 flex flex-col flex-1'>
			<div className='border-b rounded-md border-gray-700 flex items-center justify-between px-4 py-2'>
				<div className='flex-wrap items-center '>
					<div className='text-lg font-bold text-neutral-300'>设置</div>
					<div className='text-sm text-gray-500'>设置选项</div>
				</div>
				<div className='flex text-stone-400'>
					<IconButton
						icon={<DeleteIcon className='mx-2 h-5 w-5' />}
						onClick={() => {}}
					/>
					<IconButton
						icon={<ResetIcon className='mx-2 h-5 w-5' />}
						onClick={() => {}}
					/>
					<IconButton
						icon={<CloseIcon className='mx-2 h-5 w-5' />}
						onClick={() => {}}
					/>
				</div>
			</div>

			<div className='m-5 text-neutral-300'>
				<List>
					<ListItem>
						<div className=''>API Key</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>余额查询</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>Base URL</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>AI Model</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>Max Tokens</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>Temperature</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>Top P</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>Presence Penalty</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>Frequency Penalty</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
					<ListItem>
						<div className=''>发送键</div>
						<div className=''>
							<select
								className='p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring focus:ring-slate-400 bg-slate-950 '
								value={config.submitKey}
								onChange={(e) => {
									updateConfig(
										(config) =>
											(config.submitKey = e.target.value as any as SubmitKey)
									);
								}}
							>
								{Object.entries(SubmitKey).map(([k, v]) => (
									<option
										className='bg-slate-950'
										value={k}
										key={v}
									>
										{v}
									</option>
								))}
							</select>
						</div>
					</ListItem>
					<ListItem>
						<div className=''>最大记忆历史消息数</div>
						<div className=''>{config.historyMessageCount}</div>
					</ListItem>

					<ListItem>
						<div className=''>发送机器人回复消息</div>
						<div className=''>{config.sendBotMessages ? '是' : '否'}</div>
					</ListItem>
				</List>
			</div>
		</div>
	);
}
