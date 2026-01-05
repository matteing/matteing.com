import styles from "./Link.module.css";

type LinkProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
};

export function Link({ href, children, external = false }: LinkProps) {
  const className = `${styles.link} ${external ? styles.outbound : ""}`;

  return (
    <a
      href={href}
      className={className}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  );
}
