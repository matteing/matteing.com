"use client";

import { useState } from "react";
import { motion } from "motion/react";
import styles from "./Navigation.module.css";

const tabs = [
  { id: "about", label: "About" },
  { id: "writing", label: "Writing" },
];

export function Navigation() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
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
        </button>
      ))}
    </nav>
  );
}
