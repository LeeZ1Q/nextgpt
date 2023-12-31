import { OpenAIApi, Configuration } from 'openai';
import { ChatRequest } from './typing';
// export const runtime = 'edge';

const isPord = process.env.NODE_ENV === 'production';
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAIApi(
	new Configuration({
		apiKey,
	})
);

export async function POST(req: Request) {
	try {
		const requestBody = (await req.json()) as ChatRequest;
		const completion = await openai!.createChatCompletion(
			{
				...requestBody,
			},
			isPord
				? {}
				: {
						proxy: {
							protocol: 'socks',
							host: '127.0.0.1',
							port: 7890,
						},
				  }
		);


		return new Response(JSON.stringify(completion.data));
	} catch (e) {
		console.error('[Chat] ', e);
		return new Response(JSON.stringify(e));
	}
}
