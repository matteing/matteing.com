import { BaseProps } from "../types";

export const PROSE_STYLES = `
    prose 
    prose-gray
    lg:prose-xl
    mx-auto
    prose-h1:text-4xl
    prose-h1:tracking-tight 
    prose-h1:font-bold
    prose-h1:no-underline
    prose-h1:hover:underline
    prose-h2:tracking-tight
    prose-a:break-word
    prose-pre:!text-sm
    prose-pre:md:!text-base
    prose-pre:!leading-tight
    prose-pre:!bg-gray-900
    prose-pre:!py-8
    prose-a:no-underline
    prose-a:transition-colors
    prose-a:duration-150
    prose-a:text-purple-600
    prose-blockquote:text-gray-500
    prose-blockquote:not-italic
    prose-blockquote:font-normal
`;

export default function Prose({ children }: BaseProps) {
	return <div className={PROSE_STYLES}>{children}</div>;
}
