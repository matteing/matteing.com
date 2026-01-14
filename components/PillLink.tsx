"use client";

import { useCallback, useState } from "react";
import styles from "./PillLink.module.css";

type PillLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function PillLink({ href, children }: PillLinkProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = useCallback(() => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  }, []);

  return (
    <a
      href={href}
      className={`${styles.pillLink} ${clicked ? styles.clicked : ""}`}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
