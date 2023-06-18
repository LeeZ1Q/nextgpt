export function SendIcon(props) {
	const { className } = props;

	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			viewBox='0 0 24 24'
			{...props}

		>
			<path
				fill='currentColor'
				d='M3 20v-6l8-2l-8-2V4l19 8l-19 8Z'
			></path>
		</svg>
	);
}
