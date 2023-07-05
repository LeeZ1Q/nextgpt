import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Next GPT',
	description: 'Get answers from AI',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
			className={inter.className}
		>
			<meta
				name='viewport'
				content='width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0'
			/>
			<body className='bg-base'>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
