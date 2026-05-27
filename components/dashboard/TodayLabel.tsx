"use client";

import { useEffect, useState } from "react";

export function TodayLabel() {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    setText(
      new Date().toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  return <>{text}</>;
}
