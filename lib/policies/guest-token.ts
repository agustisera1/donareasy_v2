export type GuestTokenState = "valid" | "used" | "expired";

export function guestTokenState(
  token: { used_at: string | null; expires_at: string },
  now: Date,
): GuestTokenState {
  if (token.used_at) return "used";
  if (new Date(token.expires_at) <= now) return "expired";
  return "valid";
}
