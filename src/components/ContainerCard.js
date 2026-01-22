"use client";

import { useEffect, useState } from "react";
import "../styles/components/container-card.css";

export default function ContainerCard({ title, subtitle, children }) {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
	setMounted(true);
	
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="container-card">
      {/* HEADER */}
      <div className="container-card-header">
        <div className="container-card-title">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="container-card-clock">
          <span className="container-card-date">
            {dateFormatter.format(now)}
          </span>
          <strong className="container-card-time">
            {timeFormatter.format(now)}
          </strong>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container-card-body">
        {children}
      </div>
    </div>
  );
}
