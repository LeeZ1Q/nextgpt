export function AddIcon(props) {
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
				d='M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z'
			></path>
		</svg>
	);
}
