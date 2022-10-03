import Image from "next/image";
import avatar from "../../public/avatar.jpeg";

export default function Footer() {
	return (
		<div className="flex flex-col items-center py-32">
			<div className="mb-4 h-[72px] w-[72px] rounded-full ">
				<Image
					className="rounded-full"
					layout="responsive"
					width={72}
					height={72}
					src={avatar}
					alt="Sergio Mattei"
					placeholder="blur"
				/>
			</div>
			<span className="text-3xl font-medium text-gray-700">
				Sergio Mattei
			</span>
			<span className="mb-8 text-lg text-gray-500">
				matteing.com · @matteing
			</span>
			<div className="flex gap-6">
				<a
					className="text-purple-500 transition-colors duration-300 hover:text-purple-400 active:text-purple-600"
					href="https://twitter.com/matteing"
					target="_blank"
					rel="noreferrer"
				>
					Twitter
				</a>
				<a
					className="text-purple-500 transition-colors duration-300 hover:text-purple-400 active:text-purple-600"
					href="https://instagram.com/matteing"
					target="_blank"
					rel="noreferrer"
				>
					Instagram
				</a>
				<a
					className="text-purple-500 transition-colors duration-300 hover:text-purple-400 active:text-purple-600"
					href="/rss.xml"
					target="_blank"
				>
					RSS
				</a>
			</div>
		</div>
	);
}
