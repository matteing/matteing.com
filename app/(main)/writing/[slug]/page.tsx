import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { Prose } from "@/components/Prose";
import { LocaleDate } from "@/components/LocaleDate";
import { NEXT_PUBLIC_URL, SITE_TITLE } from "@/lib/config";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const { title, date, summary, cover, url } = post.frontmatter;
  const postUrl = `${NEXT_PUBLIC_URL}/writing/${slug}`;
  const ogImage = cover
    ? cover.startsWith("http")
      ? cover
      : `${NEXT_PUBLIC_URL}${cover}`
    : `${NEXT_PUBLIC_URL}/me.png`;

  return {
    title,
    description: summary,
    alternates: {
      canonical: url || postUrl,
    },
    openGraph: {
      title,
      description: summary,
      type: "article",
      publishedTime: date,
      url: postUrl,
      siteName: SITE_TITLE,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description: summary,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <header className="mb-6">
        <h1 className="mb-1 font-bold">{post.frontmatter.title}</h1>
        <LocaleDate
          date={post.frontmatter.date}
          className="text-text-secondary text-sm"
        />
      </header>
      <Prose html={post.contentHtml} />
    </article>
  );
}
