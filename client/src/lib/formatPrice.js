export function formatPrice(price, currency = "دج") {
  const n = Number(price);
  if (!price || isNaN(n) || n < 0) return `0 ${currency}`;
  return `${currency} ${n.toLocaleString("ar-DZ")} `;
}