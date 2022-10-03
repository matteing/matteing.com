import { AnimatePresence, m } from "framer-motion";

function Icon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
		</svg>
	);
}

export default function FollowButton() {
	return (
		<div className="relative h-[28px] w-[254px]">
			<AnimatePresence>
				<m.a
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2 }}
					className="flex"
					href="https://twitter.com/intent/follow?region=follow_link&screen_name=matteing"
					target="_blank"
				>
					<div className="helvetica inline-flex h-[28px] shrink-0 cursor-pointer items-center rounded-full bg-[#1d9bf0] pt-[1px] pr-[12px] pb-[1px] pl-[12px] text-[13px] text-xs font-medium leading-normal tracking-normal text-white hover:bg-[#0c7abf]">
						<Icon />
						<span className="ml-[4px]">Follow @matteing</span>
					</div>
					<div className="helvetica ml-2 inline-flex grow items-center justify-center rounded-md border pl-[8px] pr-[8px] text-[11px] font-normal tracking-normal text-gray-700">
						6,687 followers
					</div>
				</m.a>
			</AnimatePresence>
		</div>
	);
}
