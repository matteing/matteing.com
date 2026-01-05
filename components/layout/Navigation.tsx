"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "motion/react";
import styles from "./Navigation.module.css";

const tabs = [
  { id: "about", label: "About", href: "/" },
  { id: "writing", label: "Writing", href: "/writing" },
];

export function Navigation() {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === "/writing") return "writing";
    return "about";
  };

  const activeTab = getActiveTab();

  return (
    <LayoutGroup>
      <nav className={styles.nav} aria-label="Main navigation">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={styles.tab}
            data-active={activeTab === tab.id}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.span
                layoutId="activeTab"
                className={styles.indicator}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                aria-hidden="true"
              />
            )}
          </Link>
        ))}
      </nav>
    </LayoutGroup>
  );
}
