import { LoadingIcon } from '../icons/loading';
import { CloseIcon } from '../icons/close';
import { createRoot } from 'react-dom/client';

export function Card(props: { children: JSX.Element[]; className?: string }) {
	return <div className=''>{props.children}</div>;
}

export function ListItem(props: { children: JSX.Element[] }) {
	if (props.children.length > 2) {
		throw Error('Only Support Two Children');
	}

	return <div className='flex m-2 p-1 justify-between'>{props.children}</div>;
}

export function List(props: { children: JSX.Element[] }) {
	return <div className='items-center'>{props.children}</div>;
}

export function Loading() {
	return (
		<div
			style={{
				height: '100vh',
				width: '100vw',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<LoadingIcon />
		</div>
	);
}

interface ModalProps {
	title: string;
	children?: JSX.Element;
	actions?: JSX.Element[];
	onClose?: () => void;
}
export function Modal(props: ModalProps) {
	return (
		<div className='w-[50vw] rounded-xl bg-base border-2 border-gray-200 dark:border-gray-700'>
			<div className='p-5 flex items-center justify-between'>
				<div className='font-bold'>{props.title}</div>

				<div
					className='cursor-pointer '
					onClick={props.onClose}
				>
					<CloseIcon className='h-5 w-5' />
				</div>
			</div>

			<div className='max-h-[40vh] p-5 overflow-auto scl'>{props.children}</div>

			<div className='p-2 flex justify-end'>
				<div className='flex items-center'>
					{props.actions?.map((action, i) => (
						<div
							className='!mr-20'
							key={i}
						>
							{action}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function showModal(props: ModalProps) {
	const div = document.createElement('div');
	div.className = '';
	document.body.appendChild(div);

	const root = createRoot(div);
	root.render(
		<Modal
			{...props}
			onClose={() => {
				props.onClose?.();
				root.unmount();
				div.remove();
			}}
		></Modal>
	);
}
