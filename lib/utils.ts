export function formatShortDate(date: string): string {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function isJson(str: string): boolean {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
