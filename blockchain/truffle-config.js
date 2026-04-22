module.exports = {
  networks: {
    // Local Ganache network configuration
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ganache port (default: none)
      network_id: "*",       // Any network (default: none)
      gas: 6721975,          // Gas limit
      gasPrice: 20000000000  // 20 gwei
    },
    
    // Ganache CLI configuration (if using ganache-cli instead of Ganache GUI)
    ganache: {
      host: "127.0.0.1",
      port: 8545,            // Ganache CLI default port
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19",    // Fetch exact version from solc-bin
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "istanbul"
      }
    }
  },

  // Configure contract directory
  contracts_directory: './contracts',
  contracts_build_directory: './artifacts',

  // Mocha testing framework
  mocha: {
    timeout: 100000
  },

  // Console configuration
  console: {
    require: ['@babel/register']
  }
};
