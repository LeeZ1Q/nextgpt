export function trimTopic(topic: string) {
	return topic.replace(/[，。！？”“"、,.!?]*$/, '');
}
