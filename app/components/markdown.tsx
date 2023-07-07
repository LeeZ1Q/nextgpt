import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

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
