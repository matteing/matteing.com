"use client";

import { useState } from "react";
import { motion } from "motion/react";

const tabs = [
  { id: "about", label: "About" },
  { id: "writing", label: "Writing" },
];

export default function SiteNavigation() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <nav className="flex gap-8 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative pb-2 text-base font-normal cursor-pointer transition-colors duration-200 ${
            activeTab === tab.id ? "text-gray-950" : "text-gray-400"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-px bg-gray-950"
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
