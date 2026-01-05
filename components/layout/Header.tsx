import Image from "next/image";
import { PillLink } from "@/components/ui/PillLink";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <figure className={styles.avatar}>
        <Image
          src="/me.png"
          alt="Sergio Mattei"
          fill
          className={styles.avatarImage}
        />
      </figure>
      <div>
        <hgroup className={styles.info}>
          <h1 className={styles.name}>Sergio Mattei</h1>
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
