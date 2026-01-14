import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const PRETTY_CODE_OPTIONS: PrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: "plaintext",
  grid: true,
};

export class MarkdownRenderer {
  private processor;

  constructor() {
    this.processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypePrettyCode, PRETTY_CODE_OPTIONS)
      .use(rehypeStringify);
  }

  async render(content: string): Promise<string> {
    const result = await this.processor.process(content);
    return result.toString();
  }

  static stripRedundantTitle(content: string, title: string): string {
    const lines = content.split("\n");
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();
    const normalizedTitle = normalizeText(title);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match) {
        if (normalizeText(h1Match[1]) === normalizedTitle) {
          lines.splice(i, 1);
          if (lines[i]?.trim() === "") {
            lines.splice(i, 1);
          }
          return lines.join("\n");
        }
      }
      break;
    }
    return content;
  }
}
