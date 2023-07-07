import { createParser } from 'eventsource-parser';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const apiKey = process.env.OPENAI_API_KEY;

async function createStream(payload: ReadableStream<Uint8Array>) {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	console.log('[ChatStream]', payload);

	const res = await fetch('https://api.openai-proxy.com/v1/chat/completions', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		method: 'POST',
		body: payload,
		duplex: 'half',
	});

	const stream = new ReadableStream({
		async start(controller) {
			function onParse(event: any) {
				const { data, type } = event;
				if (type === 'event') {
					if (data === '[DONE]') {
						controller.close();
						return;
					}
					try {
						const json = JSON.parse(data);
						const text = json.choices[0].delta.content;
						const queue = encoder.encode(text);
						controller.enqueue(queue);
					} catch (e) {
						controller.error(e);
					}
				}
			}

			const parser = createParser(onParse);
			for await (const chunk of res.body as any) {
				parser.feed(decoder.decode(chunk));
			}
		},
	});
	return stream;
}

export async function POST(req: NextRequest) {
	try {
		console.log('Request', req);
		const stream = await createStream(req.body!);
		return new Response(stream);
	} catch (error) {
		console.error('[Chat Stream]', error);
	}
}
