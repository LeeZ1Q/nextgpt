'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { DarkIcon } from '../icons/dark';
import { LightIcon } from '../icons/light';

const ThemeSwitch = (): JSX.Element => {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	// useEffect only runs on the client, so now we can safely show the UI
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <LightIcon className='m-2 h-5 w-5' />;
	}

	const switchTheme = () => {
		if (theme === 'light') {
			setTheme('dark');
		} else {
			setTheme('light');
		}
	};

	return (
		<span onClick={switchTheme}>
			{theme === 'light' ? (
				<LightIcon className='m-2 h-5 w-5' />
			) : (
				<DarkIcon className='m-2 h-5 w-5' />
			)}
		</span>
	);
};

export default ThemeSwitch;
