"use client";

import Image from "next/image";
import { useCallback } from "react";

export default function SiteHeader() {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    target.classList.add("pill-link-clicked");
    setTimeout(() => {
      target.classList.remove("pill-link-clicked");
    }, 300);
  }, []);

  return (
    <header className="flex items-center w-full">
      <div
        className="relative mr-5"
        style={{ width: "5.75rem", height: "5.75rem" }}
      >
        <Image
          src="/me.png"
          alt="Site Logo"
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div>
        <div className="mb-2">
          <h1 className="text-xl font-[400]">Sergio Mattei</h1>
          <p className="text-text-secondary">Ambitious software engineer</p>
        </div>
        <div className="flex gap-2">
          <a className="pill-link" href="#" onClick={handleClick}>GitHub</a>
          <a className="pill-link" href="#" onClick={handleClick}>LinkedIn</a>
          <a className="pill-link" href="#" onClick={handleClick}>Resumé</a>
        </div>
      </div>
    </header>
  );
}
