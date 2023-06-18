export function ChatIcon(props) {
	const { className } = props;

	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			viewBox='0 0 24 24'
			{...props}
		>
			<path
				fill='#888888'
				d='M2 0a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3 9.06a1.39 1.39 0 1 1 1.37-1.39A1.39 1.39 0 0 1 5 9.06zm5.16 0a1.39 1.39 0 1 1 1.39-1.39a1.39 1.39 0 0 1-1.42 1.39zm5.16 0a1.39 1.39 0 1 1 1.39-1.39a1.39 1.39 0 0 1-1.42 1.39z'
			></path>
		</svg>
	);
}
