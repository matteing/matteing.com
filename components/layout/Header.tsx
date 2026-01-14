import Image from "next/image";
import Link from "next/link";
import { PillLink } from "@/components/PillLink";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.avatarLink}>
        <figure className={styles.avatar}>
          <Image
            sizes="(max-width: 640px) 64px, 92px"
            src="/me.png"
            alt="Sergio Mattei"
            fill
            className={styles.avatarImage}
          />
        </figure>
      </Link>
      <div>
        <hgroup className={styles.info}>
          <h1 className={styles.name}>
            <Link href="/" className={styles.nameLink}>
              Sergio Mattei
            </Link>
          </h1>
          <p className={styles.title}>Ambitious software engineer</p>
        </hgroup>
        <nav className={styles.links} aria-label="Social links">
          <PillLink href="https://github.com/matteing">GitHub</PillLink>
          <PillLink href="https://linkedin.com/in/matteing">LinkedIn</PillLink>
          <PillLink href="/resume.pdf">Resumé</PillLink>
        </nav>
      </div>
    </header>
  );
}
