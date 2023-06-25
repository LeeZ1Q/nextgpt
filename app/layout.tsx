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
			<body className='bg-base'>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
