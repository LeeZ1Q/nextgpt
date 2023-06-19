import React from 'react';

export function IconButton(props: {
	onClick?: () => void;
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
			{props.text && <span className='ml-1 mr-2 my-2'>{props.text}</span>}
		</button>
	);
}
