export function SettingsIcon(props) {
	const { className } = props;

	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			viewBox='0 0 48 48'
			{...props}

		>
			<mask id='ipSConfig0'>
				<g
					fill='none'
					strokeLinejoin='round'
					strokeWidth='4'
				>
					<path
						fill='#fff'
						stroke='#fff'
						d='m24 4l-6 6h-8v8l-6 6l6 6v8h8l6 6l6-6h8v-8l6-6l-6-6v-8h-8l-6-6Z'
					></path>
					<path
						fill='#000'
						stroke='#000'
						d='M24 30a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z'
					></path>
				</g>
			</mask>
			<path
				fill='currentColor'
				d='M0 0h48v48H0z'
				mask='url(#ipSConfig0)'
			></path>
		</svg>
	);
}
