export function formatCurrency(value: number | string | null | undefined): string {
  const numericValue =
    typeof value === "string"
      ? Number(value.replace(",", "."))
      : Number(value ?? 0);

  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
}

export function formatCurrencyCompact(value: number | string | null | undefined): string {
  const numericValue =
    typeof value === "string"
      ? Number(value.replace(",", "."))
      : Number(value ?? 0);

  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  if (Math.abs(safeValue) >= 1_000_000) {
    return `R$ ${(safeValue / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  }

  if (Math.abs(safeValue) >= 1_000) {
    return `R$ ${(safeValue / 1_000).toFixed(1).replace(".", ",")} mil`;
  }

  return formatCurrency(safeValue);
}