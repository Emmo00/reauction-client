export const  truncateAddress = (address: string, length: number = 24) => {
  if (!address) return "";
  return `${address.slice(0, length / 2)}...${address.slice(address.length - (length / 2))}`;
};
