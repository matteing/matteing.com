import { BaseProps } from "../../types";

const PROSE_STYLES = `
    prose 
    lg:prose-xl
    mx-auto
    prose-h1:text-5xl
    prose-h1:tracking-tight 
    prose-h1:font-bold
    prose-h2:tracking-tight
    prose-figure:text-center
    prose-figcaption:text-sm
    prose-figcaption-text-gray-500
    prose-figcaption:mt-2
    last:mb-16
`;

export default function Prose({ children }: BaseProps) {
	return <div className={PROSE_STYLES}>{children}</div>;
}
