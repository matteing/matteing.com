"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup, AnimatePresence } from "motion/react";
import styles from "./Navigation.module.css";

const tabs = [
  { id: "about", label: "About", href: "/" },
  { id: "writing", label: "Writing", href: "/writing" },
  { id: "cv", label: "CV", href: "/cv" },
];

export function Navigation() {
  const pathname = usePathname();

  // Check if we're on a post page (nested under /writing/)
  const isPostPage =
    pathname.startsWith("/writing/") && pathname !== "/writing";

  const activeTab = tabs.find((tab) => tab.href === pathname)?.id ?? "about";

  return (
    <LayoutGroup>
      <nav className={styles.nav} aria-label="Main navigation">
        <AnimatePresence mode="wait" initial={false}>
          {isPostPage ? (
            <motion.div
              key="back"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            >
              <Link href="/writing" className={styles.backLink}>
                <span className={styles.backIcon}>&#xF5D5;</span>
                Go back
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="tabs"
              className={styles.tabsContainer}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            >
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
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 40,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </LayoutGroup>
  );
}
