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
