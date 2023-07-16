import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { useRef } from 'react';
import { copyToClipboard } from '../utils';

export function PreCode(props: { children: any }) {
	const ref = useRef<HTMLPreElement>(null);

	return (
		<pre ref={ref}>
			<span
				className=''
				onClick={() => {
					if (ref.current) {
						const code = ref.current.innerText;
						copyToClipboard(code);
					}
				}}
			></span>
			{props.children}
		</pre>
	);
}

export function Markdown(props: { content: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkMath, remarkGfm]}
			rehypePlugins={[rehypeKatex, rehypeHighlight]}
			className='prose-base'
		>
			{props.content}
		</ReactMarkdown>
	);
}
