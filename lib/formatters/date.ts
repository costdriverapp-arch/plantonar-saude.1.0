export function formatDate(date: Date | string | number): string {
  const d = new Date(date);

  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);

  return d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatTime(date: Date | string | number): string {
  const d = new Date(date);

  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();

  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays <= 7) return `${diffDays} dias atrás`;

  return formatDate(d);
}