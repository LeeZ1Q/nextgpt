import React from 'react';

export function IconButton(props: {
	onClick: () => void;
	icon: JSX.Element;
	text?: string;
	className?: string;
}) {
	return (
		<button
			onClick={props.onClick}
			className={`flex items-center ${props.className}`}
		>
			{props.icon}
			{props.text && <span className='ml-1 m-1.5'>{props.text}</span>}
		</button>
	);
}
