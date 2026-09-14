/** Mask a full name: "John Doe" → "J*** D***" */
export function maskName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => `${w[0]}${"*".repeat(Math.max(w.length - 1, 2))}`)
    .join(" ");
}

/** Mask an email: "john@example.com" → "j***@example.com" */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local[0]}***@${domain}`;
}

/** Mask a phone: "0603802390" → "0603*****" */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return "****";
  return `${phone.slice(0, 4)}${"*".repeat(phone.length - 4)}`;
}
