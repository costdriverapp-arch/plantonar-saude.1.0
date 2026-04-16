export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "R$ 0,00";

  const numericValue = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function currencyInputToNumber(value: string): number {
  const digits = value.replace(/\D/g, "");

  if (!digits) return 0;

  return Number(digits) / 100;
}