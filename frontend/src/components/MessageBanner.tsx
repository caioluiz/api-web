type MessageKind = "success" | "error" | "info";

interface MessageBannerProps {
  kind?: MessageKind;
  children?: string | null;
}

export function MessageBanner({ kind = "info", children }: MessageBannerProps) {
  if (!children) {
    return null;
  }

  return <div className={`message message-${kind}`}>{children}</div>;
}
