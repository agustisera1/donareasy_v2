// El server arma la key del objeto; una action solo acepta paths bajo el prefijo de su actor.
export const donorAttachmentPrefix = (donorId: string) => `donors/${donorId}/`;
export const guestAttachmentPrefix = (tokenId: string) => `guests/${tokenId}/`;

export function isAttachmentOf(path: string, prefix: string) {
  return path.startsWith(prefix) && !path.slice(prefix.length).includes("/");
}
