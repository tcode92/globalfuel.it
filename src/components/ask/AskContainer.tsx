import React from "react";
import { useAsk } from "./store";

export default function AskContainer() {
  const { elements } = useAsk();
  if (elements.length === 0) return null;
  return (
    <div>
      {elements.map((el) => (
        <React.Fragment key={el.id}>{el.component}</React.Fragment>
      ))}
    </div>
  );
}
