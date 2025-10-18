export function formatPrice(price: number): string {
  // Consistent formatting for both server and client
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(price);
}