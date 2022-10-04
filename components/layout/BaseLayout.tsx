import { BaseProps } from "../../types";
import Footer from "./Footer";
import Nav from "./Nav";

export default function BaseLayout({ children, className }: BaseProps) {
	return (
		<div className={className}>
			<div className="min-h-[95vh]">
				<Nav />
				{children}
			</div>
			<div className="hidden md:block">
				<Footer />
			</div>
			<div className="mb-24 md:hidden">&nbsp;</div>
		</div>
	);
}
