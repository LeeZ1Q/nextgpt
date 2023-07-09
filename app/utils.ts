export function trimTopic(topic: string) {
	return topic.replace(/[，。！？”“"、,.!?]*$/, '');
}

export function copyToClipboard(text: string) {
	navigator.clipboard
		.writeText(text)
		.then((res) => {
			alert('复制成功');
		})
		.catch((err) => {
			alert('复制失败，请赋予剪切板权限');
		});
}

export function downloadAs(text: string, filename: string) {
	const element = document.createElement('a');
	element.setAttribute(
		'href',
		'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
	);
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

export function selectOrCopy(el: HTMLElement, content: string) {
	const currentSelection = window.getSelection();

	if (currentSelection?.type === 'Range') {
		return false;
	}

	copyToClipboard(content);

	return true;
}
