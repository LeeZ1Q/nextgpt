'use client';

import { IconButton } from './button';

import { SettingsIcon } from '../icons/settings';
import { AddIcon } from '../icons/add';
import { ChatIcon } from '../icons/chat';
import { ExportIcon } from '../icons/export';
import { GithubIcon } from '../icons/github';
import { GPTIcon } from '../icons/gpt';
import { UserIcon } from '../icons/user';
import { SendIcon } from '../icons/send';
import { MaxIcon } from '../icons/max';

export function ChatItem(props: {
	onClick: () => void;
	title: string;
	count: number;
	time: string;
	selected: boolean;
}) {
	return (
		<div
			className={`flex-wrap px-4 py-2  my-1 cursor-pointer rounded-2xl bg-slate-950 hover:bg-slate-600 ${
				props.selected ? ' border-2 border-slate-400' : ''
			}`}
		>
			<div className='flex text-neutral-300 h-6'>{props.title}</div>
			<div className='flex'>
				<div className='text-sm text-gray-500'>{props.count} 条对话</div>
				<div className='text-sm text-gray-500 ml-auto'>{props.time}</div>
			</div>
		</div>
	);
}

export function ChatList() {
	const listData = new Array(5).fill({
		title: '对话标题',
		count: 10,
		time: new Date().toLocaleString().slice(0, -3),
	});

	const selectedIndex = 0;

	return (
		<div className='flex flex-col w-64 h-full my-2'>
			{listData.map((item, index) => (
				<ChatItem
					key={index}
					{...item}
					selected={index === selectedIndex}
					onClick={() => {}}
				/>
			))}
		</div>
	);
}

export function Chat() {
	const messages = [
		{
			role: 'user',
			content: '这是一条消息',
			date: new Date().toLocaleString(),
		},
		{
			role: 'bot',
			content: '这是一条回复'.repeat(10),
			date: new Date().toLocaleString(),
		},
	];

	const title = '对话标题';
	const count = 10;

	return (
		<div className='flex flex-col flex-1'>
			{/* header */}
			<div className='flex items-center justify-between px-4 py-2 '>
				<div className='flex-wrap items-center '>
					<div className='text-lg font-bold text-neutral-300'>{title}</div>
					<div className='text-sm text-gray-500'>{count} 条对话</div>
				</div>
				<div className='flex'>
					<IconButton
						icon={<ExportIcon className='mx-2 h-5 w-5 text-stone-400' />}
						onClick={() => {}}
					/>
					<IconButton
						icon={<MaxIcon className='mx-2 h-5 w-5 text-stone-400' />}
						onClick={() => {}}
					/>
				</div>
			</div>

			{/* body */}
			<div className='flex-col flex-1 overflow-y-auto'>
				{messages.map((message, index) => {
					const isUser = message.role === 'user';

					return (
						<div
							key={index}
							className={`flex flex-col mb-2`}
						>
							{/* container */}
							<div className='flex items-start'>
								{/* avatar */}
								<div className='w-8 h-8 m-2'>
									{message.role === 'user' ? <UserIcon className = 'h-6 w-6'/> : <GPTIcon className = 'h-6 w-6'/>}
								</div>
								{/* content */}
								<div className='mr-8 my-1 flex flex-col  text-neutral-300'>
									{message.content}
									{!isUser && (
									<div className='ml-auto text-sm text-gray-500'>
										{message.date}
									</div>
								)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* input */}
			<div className='flex items-center px-4 py-2 border-t rounded-xl border-gray-700'>
				<div className='relative w-full'>
					<textarea
						className='w-full h-24 p-2 bg-slate-950 border border-gray-700 rounded-xl focus:border-slate-400'
						placeholder='请输入消息'
					/>
					<IconButton
					 	className='absolute bottom-2 right-0 m-2 text-neutral-300 bg-cyan-800 rounded-lg'
						icon={<SendIcon className='mx-1 h-5 w-5 text-neutral-300'/>}
						onClick={() => {}}
						text='发送'
					/>
				</div>
			</div>
		</div>
	);
}

export function Home() {
	return (
		<div className='flex items-center justify-center h-screen'>
		<div className='flex mx-auto max-w-screen-lg min-w-min  w-90vw h-90vh bg-slate-950 border-2 border-gray-700 rounded-3xl shadow-sm overflow-hidden '>
			{/* siderbar*/}
			<div className='max-w-xs p-5 bg-slate-800 flex flex-col shadow-inner'>
				{/* header */}
				<div className='flex items-center mb-2'>
					<GPTIcon className='h-8 w-8' />
					<div className='text-lg font-bold ml-1 text-neutral-300'>
						Next GPT
					</div>
				</div>
				{/* body */}
				<ChatList />
				{/* footer */}
				<div className='flex'>
					<IconButton
						icon={<SettingsIcon className='m-2 h-5 w-5 text-stone-400' />}
						onClick={() => {}}
					/>

					<IconButton
						icon={<GithubIcon className='mr-2 h-6 w-6 text-stone-400' />}
						onClick={() => {}}
					/>

					<IconButton
						icon={<AddIcon className='h-6 w-6' />}
						onClick={() => {}}
						className=' text-neutral-300 bg-slate-900 rounded-lg text-md ml-auto'
						text='新对话'
					/>
				</div>
			</div>

			{/* main */}
			<div className='flex flex-col flex-1'>
				<Chat />
			</div>
		</div>
		</div>
	);
}
