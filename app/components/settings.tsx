import { useState } from 'react';

import { List, ListItem } from './uilib';
import { CloseIcon } from '../icons/close';
import { DeleteIcon } from '../icons/delete';
import { ResetIcon } from '../icons/reset';

import { IconButton } from './button';
import { SubmitKey, useChatStore, ALL_MODELS } from '../store';

export function Settings(props: { closeSettings: () => void }) {
	const [config, updateConfig, resetConfig, clearAllData] = useChatStore(
		(state) => [
			state.config,
			state.updateConfig,
			state.resetConfig,
			state.clearAllData,
		]
	);

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
						onClick={clearAllData}
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
						<select
							className='items-center p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring focus:ring-slate-400 bg-base'
							value={config.modelConfig.model}
							onChange={(e) => {
								updateConfig(
									(config) => (config.modelConfig.model = e.currentTarget.value)
								);
							}}
						>
							{ALL_MODELS.map((v) => (
								<option
									value={v.name}
									key={v.name}
									disabled={!v.available}
								>
									{v.name}
								</option>
							))}
						</select>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Max Tokens</div>
						<input
							className='items-center p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring focus:ring-slate-400 bg-base'
							type='number'
							min={100}
							max={4000}
							value={config.modelConfig.max_tokens}
							onChange={(e) =>
								updateConfig(
									(config) =>
										(config.modelConfig.max_tokens =
											e.currentTarget.valueAsNumber)
								)
							}
						/>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Temperature</div>
						<input
							type='range'
							title={config.modelConfig.temperature.toString()}
							value={config.modelConfig.temperature.toFixed(1)}
							min='0'
							max='1'
							step='0.1'
							onChange={(e) => {
								updateConfig(
									(config) =>
										(config.modelConfig.temperature =
											e.currentTarget.valueAsNumber)
								);
							}}
						/>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Top P</div>
						<div className='text-lg'>1</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Presence Penalty</div>
						<input
							type='range'
							title={config.modelConfig.presence_penalty.toString()}
							value={config.modelConfig.presence_penalty.toFixed(1)}
							min='-2'
							max='2'
							step='0.5'
							onChange={(e) => {
								updateConfig(
									(config) =>
										(config.modelConfig.presence_penalty =
											e.currentTarget.valueAsNumber)
								);
							}}
						/>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>Frequency Penalty</div>
						<div className='text-lg'>0</div>
					</ListItem>
					<ListItem>
						<div className='text-gray-500'>发送键</div>
						<div>
							<select
								className='items-center p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring focus:ring-slate-400 bg-base'
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
							min='2'
							max='20'
							step='2'
							onChange={(e) =>
								updateConfig(
									(config) =>
										(config.historyMessageCount = e.target.valueAsNumber)
								)
							}
						/>
					</ListItem>

					<ListItem>
						<div className='text-gray-500'>历史消息压缩长度阈值</div>
						<input
							className='items-center p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring focus:ring-slate-400 bg-base'
							type='number'
							min={500}
							max={4000}
							value={config.compressMessageLengthThreshold}
							onChange={(e) =>
								updateConfig(
									(config) =>
										(config.compressMessageLengthThreshold =
											e.currentTarget.valueAsNumber)
								)
							}
						/>
					</ListItem>
				</List>
			</div>
		</div>
	);
}
