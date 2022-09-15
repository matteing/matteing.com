import { PropsWithChildren } from "react";
import Footer from "./Footer";

export default function Body({ children }: PropsWithChildren) {
	return (
		<div>
			<div className="min-h-screen">{children}</div>
			<Footer />
		</div>
	);
}
