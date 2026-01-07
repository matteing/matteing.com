'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import styles from './error.module.css';
import NyanBackground from '@/components/ui/NyanBackground';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.container}>
      <NyanBackground />
      <div className={styles.content}>
        <div className={styles.icon}>
          <Image
            src="/cat.png"
            alt="it's a nyan floating around"
            width={85}
            height={85}
            priority
            unoptimized
          />
        </div>
        <h1 className={styles.title}>Something went wrong</h1>
        <span className={styles.message}>bummer. on the other hand, here&apos;s a cute page?</span>
        <Link href="/" className={styles.link}>
          go home →
        </Link>
      </div>
    </div>
  );
}
