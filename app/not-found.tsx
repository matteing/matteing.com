import Link from "next/link";
import Image from "next/image";
import styles from "./not-found.module.css";
import { NyanBackground } from "@/components/NyanBackground";

export const metadata = {
  title: "404: Page not found",
};

export default function NotFound() {
  return (
    <div className={styles.container}>
      <NyanBackground />
      <div className={styles.content}>
        <div className={styles.icon}>
          <Image
            src="/cat.png"
            alt="it's a nyan cat floating around"
            width={85}
            height={85}
            priority
            unoptimized
          />
        </div>
        <h1 className={styles.title}>Page not found</h1>
        <span className={styles.message}>
          bummer. on the other hand, here&apos;s a cute page?
        </span>
        <Link href="/" className={styles.link}>
          go home →
        </Link>
      </div>
    </div>
  );
}
