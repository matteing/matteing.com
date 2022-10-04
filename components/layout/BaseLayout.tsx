import { PropsWithChildren } from "react";
import Footer from "./Footer";
import Nav from "./Nav";

export default function BaseLayout({ children }: PropsWithChildren) {
	return (
		<div>
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
