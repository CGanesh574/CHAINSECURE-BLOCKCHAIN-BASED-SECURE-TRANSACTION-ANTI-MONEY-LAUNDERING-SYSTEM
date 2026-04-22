import { ethers, BrowserProvider } from 'ethers';

// Extended window interface for Ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// MetaMask detection with multiple checks
export const hasMetaMask = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for ethereum provider
  const hasEthereumProvider = typeof window.ethereum !== 'undefined';
  
  // Check if it's MetaMask specifically
  const isMetaMask = window.ethereum?.isMetaMask === true;
  
  console.log('MetaMask detection:', { hasEthereumProvider, isMetaMask });
  
  return hasEthereumProvider;
};

// Get MetaMask provider
export const getProvider = (): BrowserProvider | null => {
  if (!hasMetaMask()) {
    console.error('MetaMask not detected');
    return null;
  }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log('Provider created successfully');
    return provider;
  } catch (error) {
    console.error('Error creating provider:', error);
    return null;
  }
};

// Request MetaMask account access
export const requestAccounts = async (): Promise<string[]> => {
  // Check if window object exists (SSR safety)
  if (typeof window === 'undefined') {
    throw new Error('Window object not available');
  }

  // Check for ethereum provider with detailed logging
  if (!window.ethereum) {
    console.error('No ethereum provider found on window object');
    throw new Error('MetaMask is not installed. Please install MetaMask extension from https://metamask.io/');
  }

  try {
    console.log('Requesting accounts from MetaMask...');
    console.log('window.ethereum exists:', !!window.ethereum);
    console.log('window.ethereum.isMetaMask:', window.ethereum?.isMetaMask);
    
    // Check if MetaMask is initialized
    if (typeof window.ethereum.request !== 'function') {
      console.error('window.ethereum.request is not a function');
      throw new Error('MetaMask provider is not properly initialized. Please refresh the page.');
    }
    
    // This will trigger MetaMask popup
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    
    console.log('MetaMask returned accounts:', accounts);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please create an account in MetaMask.');
    }
    
    return accounts;
  } catch (error: any) {
    console.error('MetaMask request error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 4001) {
      throw new Error('Connection request rejected. Please approve the connection in MetaMask.');
    }
    if (error.code === -32002) {
      throw new Error('MetaMask is already processing a request. Please check MetaMask extension and approve the pending request.');
    }
    if (error.code === -32603) {
      throw new Error('Internal MetaMask error. Please try restarting your browser.');
    }
    
    // More user-friendly error message
    const errorMessage = error.message || 'Failed to connect to MetaMask';
    throw new Error(`${errorMessage}. Please ensure MetaMask is unlocked and try again.`);
  }
};

// Get current accounts
export const getAccounts = async (): Promise<string[]> => {
  if (!hasMetaMask()) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  });
  return accounts;
};

// Get ETH balance
export const getBalance = async (address: string): Promise<string> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('MetaMask is not available');
  }

  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

// Get network information
export const getNetwork = async (): Promise<any> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('MetaMask is not available');
  }

  return await provider.getNetwork();
};

// Sign message for wallet verification
export const signMessage = async (message: string): Promise<{ signature: string; address: string }> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('MetaMask is not available');
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const signature = await signer.signMessage(message);

  return { signature, address };
};

// Send ETH transaction through smart contract
export const sendTransaction = async (
  contractAddress: string,
  contractABI: any[],
  toAddress: string,
  amount: string
): Promise<any> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('MetaMask is not available');
  }

  const signer = await provider.getSigner();
  
  // Normalize and validate the address (handles checksum)
  let normalizedAddress: string;
  try {
    normalizedAddress = ethers.getAddress(toAddress.trim());
  } catch (err) {
    throw new Error('Invalid Ethereum address format');
  }

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // Convert ETH to Wei
  const amountInWei = ethers.parseEther(amount);

  console.log('Sending transaction:', {
    to: normalizedAddress,
    amount: amount,
    amountInWei: amountInWei.toString()
  });

  // Call the recordTransaction function with normalized address
  const tx = await contract.recordTransaction(normalizedAddress, amountInWei, {
    value: amountInWei,
  });

  console.log('Transaction sent:', tx.hash);

  // Wait for transaction confirmation
  const receipt = await tx.wait();

  console.log('Transaction confirmed:', receipt);

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status,
  };
};

// Switch to Ganache network
export const switchToGanache = async (): Promise<void> => {
  if (!hasMetaMask()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x539' }], // 1337 in hex (Ganache default)
    });
  } catch (error: any) {
    // If the chain hasn't been added to MetaMask
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x539',
            chainName: 'Ganache',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [process.env.REACT_APP_GANACHE_RPC_URL || 'http://127.0.0.1:7545'],
          },
        ],
      });
    } else {
      throw error;
    }
  }
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (hasMetaMask() && window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// Listen for network changes
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (hasMetaMask() && window.ethereum) {
    window.ethereum.on('chainChanged', callback);
  }
};

// Remove event listeners
export const removeListeners = (): void => {
  if (hasMetaMask() && window.ethereum) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};
