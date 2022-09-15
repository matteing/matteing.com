import Image from "next/image";
import Emblem from "../Emblem";
import Container from "./Container";

export default function Footer() {
	return (
		<div className="flex flex-col items-center justify-center bg-gray-50 py-24">
			<Container>
				<div className="flex w-full items-center gap-6">
					<div className="h-[60px] rounded-full border border-gray-300 shadow-sm">
						<Image
							className="rounded-full"
							width={60}
							height={60}
							src="/avatar.jpeg"
							alt="Sergio Mattei"
						/>
					</div>
					<div className="flex-grow">
						<div className="text-lg uppercase tracking-wider text-gray-900">
							Sergio Mattei Díaz
						</div>
						<div className="text-lg font-light uppercase tracking-wider text-gray-500">
							Proudly made in Puerto Rico 🏝
						</div>
					</div>
					<div className="text-gray-500">
						<Emblem dimensionMult={0.8} strokeWidth={9} />
					</div>
				</div>
			</Container>
		</div>
	);
}
