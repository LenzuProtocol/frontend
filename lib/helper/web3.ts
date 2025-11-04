export const urlExplorer = ({
  chainId = 84532,
  address,
  txHash,
}: {
  chainId?: ChainSupported;
  address?: string;
  txHash?: string;
}) => {
  const chainMetaMap: {
    [key: number]: {
      explorer: string;
    };
  } = {
    84532: {
      explorer: "https://hashscan.io/testnet",
    },
  };

  const chainMeta = chainMetaMap[chainId];

  if (!chainMeta) return "";

  if (address) {
    return `${chainMeta.explorer}/account/${address}`;
  }

  if (txHash) {
    return `${chainMeta.explorer}/transaction/${txHash}`;
  }

  return "";
};

export const formatAddress = (address: string) => {
  if (!address) return "";

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
