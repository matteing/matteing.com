import imageSize from "image-size";
import { ISizeCalculationResult } from "image-size/dist/types/interface";
import path from "path";
import { getPlaiceholder } from "plaiceholder";
import { Node } from "unist";
import { visit } from "unist-util-visit";
import { promisify } from "util";

/**
 * This Remark plugin traverses the JSX AST to find any unoptimized <Image /> or <Figure />
 * components.
 *
 * Then, it uses `plaiceholder` and `image-size` to add image
 * size data and blur placeholders to the underlying components as props.
 */

const MDX_COMPONENTS = ["ImageFigure", "Image"];

// Convert the imageSize method from callback-based to a Promise-based
// promisify is a built-in nodejs utility function btw
const sizeOf = promisify(imageSize);

// The ImageNode type, because we're using TypeScript
type ImageNode = {
	type: "element";
	tagName: "img";
	properties: {
		src: string;
		height?: number;
		width?: number;
		blurDataURL?: string;
		placeholder?: "blur" | "empty";
	};
};

// Just to check if the node is an image node
function isImageNode(node: Node): node is ImageNode {
	const img = node as ImageNode;
	return (
		img.type === "element" &&
		img.tagName === "img" &&
		img.properties &&
		// eslint-disable-next-line lodash/prefer-lodash-typecheck
		typeof img.properties.src === "string"
	);
}

type MdxNode = {
	type: "mdxJsxFlowElement";
	name: string;
	attributes: {
		type: "mdxJsxAttribute";
		name: string;
		value: string;
	}[];
};

function isMdxImageComponent(node: Node): node is MdxNode {
	const img = node as MdxNode;
	return (
		img.type === "mdxJsxFlowElement" && MDX_COMPONENTS.includes(img.name)
	);
}

async function addPropsImg(node: ImageNode): Promise<void> {
	let res: ISizeCalculationResult | undefined;
	let blur64: string;

	// Check if the image is external (remote)
	const isExternal = node.properties.src.startsWith("http");

	// If it's local, we can use the sizeOf method directly, and pass the path of the image
	if (!isExternal) {
		// Calculate image resolution (width, height)
		res = await sizeOf(
			path.join(process.cwd(), "public", node.properties.src)
		);
		// Calculate base64 for the blur
		blur64 = (await getPlaiceholder(node.properties.src)).base64;
	} else {
		// If the image is external (remote), we'd want to fetch it first
		const imageRes = await fetch(node.properties.src);
		// Convert the HTTP result into a buffer
		const arrayBuffer = await imageRes.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Calculate the resolution using a buffer instead of a file path
		res = await imageSize(buffer);
		// Calculate the base64 for the blur using the same buffer
		blur64 = (await getPlaiceholder(buffer)).base64;
	}

	// If an error happened calculating the resolution, throw an error
	if (!res) throw Error(`Invalid image with src "${node.properties.src}"`);

	// add the props in the properties object of the node
	// the properties object later gets transformed as props
	node.properties.width = res.width;
	node.properties.height = res.height;

	node.properties.blurDataURL = blur64;
	node.properties.placeholder = "blur";
}

async function addPropsMdx(node: MdxNode): Promise<void> {
	let res: ISizeCalculationResult | undefined;
	let blur64: string;

	const { value: src } = node.attributes.find(
		(attr) => attr.name === "src"
	) ?? { value: undefined };
	if (!src) return;

	// Check if the image is external (remote)
	const isExternal = src.startsWith("http");

	// If it's local, we can use the sizeOf method directly, and pass the path of the image
	if (!isExternal) {
		// Calculate image resolution (width, height)
		res = await sizeOf(path.join(process.cwd(), "public", src));
		// Calculate base64 for the blur
		blur64 = (await getPlaiceholder(src)).base64;
	} else {
		// If the image is external (remote), we'd want to fetch it first
		const imageRes = await fetch(src);
		// Convert the HTTP result into a buffer
		const arrayBuffer = await imageRes.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Calculate the resolution using a buffer instead of a file path
		res = await imageSize(buffer);
		// Calculate the base64 for the blur using the same buffer
		blur64 = (await getPlaiceholder(buffer)).base64;
	}

	// If an error happened calculating the resolution, throw an error
	if (!res) throw Error(`Invalid image with src "${src}"`);

	// add the props in the properties object of the node
	// the properties object later gets transformed as props

	node.attributes = [
		...node.attributes,
		{
			type: "mdxJsxAttribute",
			name: "width",
			value: res.width?.toString() ?? "",
		},
		{
			type: "mdxJsxAttribute",
			name: "height",
			value: res.height?.toString() ?? "",
		},
		{ type: "mdxJsxAttribute", name: "blurDataURL", value: blur64 },
		{ type: "mdxJsxAttribute", name: "placeholder", value: "blur" },
	];
}

export interface CodeError extends Error {
	errno?: number;
	code?: string;
	path?: string;
	syscall?: string;
	stack?: string;
}

function onFsError(e: CodeError): void {
	if (e.code && e.code === "ENOENT") {
		throw new Error(`File ${e.path} not found.`);
	}
}

const imageMetadata = () => {
	return async function transformer(tree: Node): Promise<Node> {
		// Create an array to hold all of the images from the markdown file
		const images: ImageNode[] = [];
		const mdxObjects: MdxNode[] = [];

		visit(tree, "mdxJsxFlowElement", (node) => {
			if (isMdxImageComponent(node)) {
				mdxObjects.push(node);
			}
		});

		visit(tree, "element", (node) => {
			if (isImageNode(node)) {
				images.push(node);
			}
		});

		for (const image of mdxObjects) {
			try {
				await addPropsMdx(image);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.log(e);
				onFsError(e as CodeError);
			}
		}

		for (const image of images) {
			// Loop through all of the images and add their props
			try {
				await addPropsImg(image);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.log(e);
				onFsError(e as CodeError);
			}
		}

		return tree;
	};
};

export default imageMetadata;
