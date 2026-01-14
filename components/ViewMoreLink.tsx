import NextLink from "next/link";

interface ViewMoreLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * "View more" style link with arrow animation.
 */
export function ViewMoreLink({ href, children }: ViewMoreLinkProps) {
  return (
    <NextLink
      href={href}
      className="text-text-secondary hover:text-text-primary group flex items-center gap-1 text-sm transition-colors"
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">
        →
      </span>
    </NextLink>
  );
}
