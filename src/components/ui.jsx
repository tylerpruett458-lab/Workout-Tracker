import React from "react";

export function Button({ children, className = "", variant, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow-sm ${
        variant === "outline"
          ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
          : "bg-zinc-900 text-white hover:bg-zinc-800"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-3xl bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
