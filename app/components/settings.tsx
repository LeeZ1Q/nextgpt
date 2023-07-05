import { useState, useRef, useEffect } from 'react';

import { List, ListItem } from './uilib';
import { CloseIcon } from '../icons/close';
import { DeleteIcon } from '../icons/delete';
import { ResetIcon } from '../icons/reset';

import { IconButton } from './button';
import { SubmitKey, useChatStore } from '../store';

export function Settings(props: { closeSettings: () => void }) {
	const [config, updateConfig, resetConfig] = useChatStore((state) => [
		state.config,
		state.updateConfig,
		state.resetConfig,
	]);

	return (
		<div className='h-5/6 flex flex-col flex-1'>
			<div className='border-b-2 rounded-md border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 py-2'>
				<div className='flex-wrap items-center '>
					<div className='text-lg font-bold textc-base'>设置</div>
					<div className='text-sm text-gray-500'>设置选项</div>
				</div>
				<div className='flex btn-base'>
					<IconButton
						icon={<DeleteIcon className='mx-2 h-6 w-6' />}
						onClick={() => {}}
					/>
					<IconButton
						icon={<ResetIcon className='mx-2 h-6 w-6' />}
						onClick={resetConfig}
					/>
					<IconButton
						icon={<CloseIcon className='mx-2 h-6 w-6' />}
						onClick={props.closeSettings}
					/>
				</div>
			</div>

			<div className='scl flex-col flex-1 overflow-y-auto pr-10 my-5 mx-10 mr-0 textc-base'>
				<List>
					<ListItem>
						<div className='text-gray-500'>API Key</div>
						<div className='text-lg'>sk-****Elvt</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>余额查询</div>
						<div className='text-lg'>
							本月已使用${}，订阅总额${}
						</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Base URL</div>
						<div className='text-lg'>https://api.openai.com</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>AI Model</div>
						<div className='text-lg'>gpt-3.5-turbo</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Max Tokens</div>
						<div className='text-lg'>2048</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Temperature</div>
						<div className='text-lg'>0.7</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Top P</div>
						<div className='text-lg'>1</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Presence Penalty</div>
						<div className='text-lg'>0</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Frequency Penalty</div>
						<div className='text-lg'>0</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>发送键</div>
						<div>
							<select
								className='pr-5 items-center p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring focus:ring-slate-400 bg-base'
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
										className='bg-base'
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
						<div className='text-gray-500'>最大上下文消息数</div>
						<input
							type='range'
							title={config.historyMessageCount.toString()}
							value={config.historyMessageCount}
							min='5'
							max='20'
							step='5'
							onChange={(e) =>
								updateConfig(
									(config) =>
										(config.historyMessageCount = e.target.valueAsNumber)
								)
							}
						/>
					</ListItem>

					<ListItem>
						<div className='text-gray-500'>发送机器人回复消息</div>
						<input
							type='checkbox'
							checked={config.sendBotMessages}
							onChange={(e) =>
								updateConfig(
									(config) => (config.sendBotMessages = e.currentTarget.checked)
								)
							}
						/>
					</ListItem>
				</List>
			</div>
		</div>
	);
}