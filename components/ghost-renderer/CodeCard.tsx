export interface CodeCardPayload {
	code: string;
	language: string;
	html?: string;
}

export default function CodeCard({ payload }: { payload: CodeCardPayload }) {
	return (
		<pre
			dangerouslySetInnerHTML={{ __html: payload.html || payload.code }}
		></pre>
	);
}
