import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SendMoneyModal from '../components/SendMoneyModal';
import QRCodeModal from '../components/QRCodeModal';
import QRScannerModal from '../components/QRScannerModal';
import DownloadStatementModal from '../components/DownloadStatementModal';
import ProfileModal from '../components/ProfileModal';
import api from '../services/api';
import {
  hasMetaMask,
  requestAccounts,
  getBalance,
  getNetwork,
  onAccountsChanged,
  onChainChanged,
  removeListeners,
} from '../services/web3';
import './UserDashboard.css';

interface Transaction {
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
  transactionType: string;
  blockNumber?: number;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Initialize user from localStorage
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log('📦 Loaded user from localStorage:', parsed);
        return parsed;
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        return null;
      }
    }
    return null;
  });
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentWallet, setCurrentWallet] = useState('');
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState(''); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [qrScanData, setQrScanData] = useState<{ address: string; amount?: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [addressExpanded, setAddressExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingTransactions, setRefreshingTransactions] = useState(false);
  const [accountBlocked, setAccountBlocked] = useState(false);
  const [violationInfo, setViolationInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [kycStatus, setKycStatus] = useState('NOT_SUBMITTED');
  const [showBlockedDetailsModal, setShowBlockedDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    // Clear any previous errors on mount
    setError('');
    
    loadUserData();
    loadTransactions();
    checkAccountStatus();
    fetchNotifications();

    // Listen for account changes
    onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        handleDisconnectWallet();
      } else {
        setCurrentWallet(accounts[0]);
        loadBalance(accounts[0]);
      }
    });

    // Listen for network changes
    onChainChanged(() => {
      window.location.reload();
    });

    // Close notification panel when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotificationPanel && !target.closest('.notification-panel') && !target.closest('.notification-btn')) {
        setShowNotificationPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      removeListeners();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationPanel]);

  const loadUserData = async () => {
    try {
      console.log('🔄 Loading user data from API...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.error('❌ No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      const response = await api.get('/api/user/dashboard');
      console.log('📊 User data response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        console.log('✅ User loaded:', userData);
        console.log('User name:', userData.name);
        console.log('User email:', userData.email);
        console.log('User wallet:', userData.walletAddress);
        
        setUser(userData);
        
        // Update localStorage with latest user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Check if account is blocked
        if (response.data.data.user.accountStatus === 'BLOCKED') {
          console.log('🚫 Account is BLOCKED');
          setAccountBlocked(true);
          setViolationInfo({
            ruleName: response.data.data.user.violatedRuleName,
            description: response.data.data.user.violationDescription,
            timestamp: response.data.data.user.blockTimestamp,
            allViolations: response.data.data.user.violatedRules || []
          });
        } else {
          console.log('✅ Account is ACTIVE');
          setAccountBlocked(false);
          setViolationInfo(null);
        }
        
        // Set KYC status
        setKycStatus(response.data.data.user.kycStatus || 'NOT_SUBMITTED');
        console.log('📄 KYC Status:', response.data.data.user.kycStatus);
      }
    } catch (err: any) {
      console.error('❌ Failed to load user data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const checkAccountStatus = async () => {
    try {
      const response = await api.get('/api/aml-monitor/check-account-status');
      if (response.data.success) {
        setAccountBlocked(response.data.isBlocked);
        if (response.data.isBlocked) {
          setViolationInfo({
            ruleName: response.data.violatedRuleName,
            description: response.data.violationDescription,
            timestamp: response.data.blockTimestamp,
            allViolations: response.data.violatedRules || []
          });
        }
      }
    } catch (err) {
      console.error('Failed to check account status:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching notifications...');
      const response = await api.get('/api/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        console.log('✅ Notifications loaded:', response.data.count, 'total,', response.data.unreadCount, 'unread');
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const loadTransactions = async (showLoading = false) => {
    if (showLoading) {
      setRefreshingTransactions(true);
    }
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const userData = JSON.parse(userStr);
      const response = await api.get(`/api/transactions/user/${userData.walletAddress}`);

      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      if (showLoading) {
        setRefreshingTransactions(false);
      }
    }
  };

  const loadBalance = async (address: string) => {
    try {
      const bal = await getBalance(address);
      setBalance(parseFloat(bal).toFixed(4));
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const handleRefreshBalance = async () => {
    if (!walletConnected || !currentWallet) return;
    
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing wallet data...');
      
      // Reload balance
      await loadBalance(currentWallet);
      
      // Reload network
      const net = await getNetwork();
      setNetwork(net.name || 'Unknown');
      
      // Reload user data
      await loadUserData();
      
      // Reload transactions
      await loadTransactions();
      
      console.log('✅ Wallet data refreshed successfully!');
    } catch (err) {
      console.error('Failed to refresh:', err);
      setError('Failed to refresh wallet data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      console.log('🔌 Starting MetaMask connection...');
      console.log('User data:', user);
      
      if (!hasMetaMask()) {
        console.error('❌ MetaMask not detected');
        setError('MetaMask is not installed. Please install MetaMask extension.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      console.log('✅ MetaMask detected');
      setError('');
      setLoading(true);

      try {
        console.log('📤 Requesting MetaMask accounts...');
        const accounts = await requestAccounts();
        console.log('📥 Received accounts:', accounts);

        if (!accounts || accounts.length === 0) {
          setError('No accounts found in MetaMask. Please create or unlock an account.');
          setLoading(false);
          return;
        }

        const connectedAccount = accounts[0].toLowerCase();
        console.log('✅ Connected account:', connectedAccount);

        const registeredAddress = user?.walletAddress?.toLowerCase();
        console.log('📋 Registered wallet:', registeredAddress);

        // If user has no registered wallet, save the connected one
        if (!registeredAddress || registeredAddress === '') {
          console.log('💾 No registered wallet, saving current MetaMask account...');
          
          const response = await api.post('/api/user/validate-wallet', {
            connectedWallet: connectedAccount,
          });

          if (response.data.success) {
            console.log('✅ Wallet saved to backend');
            setCurrentWallet(connectedAccount);
            setWalletConnected(true);
            
            // Reload user data to get updated wallet
            await loadUserData();
            await loadBalance(connectedAccount);
            const net = await getNetwork();
            setNetwork(net.name || 'Unknown');
            
            console.log('✅ Connection successful!');
          }
          setLoading(false);
          return;
        }

        // Check if connected account matches registered wallet
        if (connectedAccount === registeredAddress) {
          console.log('✅ Account matches! Validating with backend...');
          
          const response = await api.post('/api/user/validate-wallet', {
            connectedWallet: connectedAccount,
          });

          if (response.data.success) {
            console.log('✅ Backend validation successful');
            setCurrentWallet(connectedAccount);
            setWalletConnected(true);

            console.log('💰 Loading balance...');
            await loadBalance(connectedAccount);
            
            console.log('🌐 Getting network...');
            const net = await getNetwork();
            setNetwork(net.name || 'Unknown');
            
            console.log('✅ Wallet connected successfully!');
          }
        } else {
          // Account mismatch - provide clear error
          console.warn('⚠️ Account mismatch!');
          console.log('Expected:', registeredAddress);
          console.log('Got:', connectedAccount);
          
          setError(
            `Wrong MetaMask account!\n\n` +
            `Your registered wallet: ${user?.walletAddress}\n` +
            `Current MetaMask account: ${accounts[0]}\n\n` +
            `Please switch to the correct account in MetaMask and try again.`
          );
        }
      } catch (requestError: any) {
        console.error('❌ Error requesting accounts:', requestError);
        
        if (requestError.code === 4001) {
          setError('You rejected the connection request. Please try again and approve.');
        } else if (requestError.code === -32002) {
          setError('MetaMask is already processing a request. Please check your MetaMask extension.');
        } else {
          setError(requestError.message || 'Failed to connect to MetaMask');
        }
      }
    } catch (err: any) {
      console.error('❌ Connection error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setCurrentWallet('');
    setBalance('0');
    setNetwork('');
  };

  const handleTransactionComplete = async () => {
    setShowSendModal(false);
    setQrScanData(null); // Clear scan data
    
    console.log('🔄 Transaction complete! Refreshing all data...');
    
    // Reload everything to show new transaction and any status changes
    try {
      // Reload user data (to check if blocked) - CRITICAL for AML blocking
      await loadUserData();
      await checkAccountStatus();
      
      // Fetch notifications (important for AML blocking notifications)
      await fetchNotifications();
      
      // Reload balance
      if (currentWallet) {
        await loadBalance(currentWallet);
      }
      
      // Reload transactions with a small delay to ensure blockchain has indexed
      setTimeout(async () => {
        await loadTransactions(true);
        console.log('✅ All data refreshed!');
      }, 1000);
    } catch (err) {
      console.error('Error refreshing data:', err);
      // Still try to load transactions even if other calls fail
      loadTransactions(true);
    }
  };

  const handleScanSuccess = (address: string, amount?: string) => {
    console.log('QR Scan successful:', { address, amount });
    setShowScannerModal(false);
    // Small delay to ensure scanner modal closes before opening send modal
    setTimeout(() => {
      console.log('Setting qrScanData and opening Send modal');
      setQrScanData({ address, amount });
      setShowSendModal(true);
    }, 100);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-nav">
          <button className="nav-tab active">🏠 Dashboard</button>
          <button className="nav-tab" onClick={() => navigate('/kyc-verification')}>📄 KYC Verification</button>
          <button className="nav-tab" onClick={() => navigate('/support-center')}>❓ Support Center</button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Account Blocked Compact Banner */}
        {accountBlocked && (
          <div className="blocked-account-compact">
            <div className="blocked-compact-content">
              <span className="blocked-icon-compact">⛔</span>
              <span className="blocked-text-compact">Account Blocked</span>
            </div>
            <button className="blocked-view-btn" onClick={() => setShowBlockedDetailsModal(true)}>
              View Details
            </button>
          </div>
        )}
        
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome, {user?.name || 'User'}!</h1>
            <p className="welcome-subtitle">Manage your ChainSecure assets securely</p>
          </div>
          <div className="welcome-actions">
            <button className="profile-btn" onClick={() => setShowProfileModal(true)} title="View Profile">👤</button>
            <div style={{ position: 'relative' }}>
              <button 
                className="notification-btn" 
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {/* Notification Panel */}
              {showNotificationPanel && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="mark-all-read" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <p>📭 No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification._id} 
                          className={`notification-item ${!notification.isRead ? 'unread' : ''} ${notification.type === 'AML_VIOLATION' ? 'violation' : ''}`}
                          onClick={() => !notification.isRead && markNotificationAsRead(notification._id)}
                        >
                          <div className="notification-icon">
                            {notification.type === 'AML_VIOLATION' ? '🚫' : 
                             notification.type === 'ACCOUNT_UNBLOCKED' ? '✅' : '📢'}
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                          {!notification.isRead && (
                            <div className="unread-indicator"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>

        {/* Main Cards Grid */}
        <div className="cards-grid">
          {/* ChainSecure Wallet Card */}
          <div className="defi-wallet-card">
            <div className="card-header">
              <span className="wallet-icon">💳</span>
              <span className="card-title">ChainSecure Wallet</span>
              {walletConnected ? (
                <button className="wallet-status-btn connected" onClick={handleDisconnectWallet}>
                  <span className="status-dot"></span> Disconnect
                </button>
              ) : (
                <button className="wallet-status-btn disconnected" onClick={handleConnectWallet} disabled={loading}>
                  {loading ? '⏳' : '🔌'} Connect
                </button>
              )}
            </div>
            
            <div className="portfolio-section">
              <div className="portfolio-label">PORTFOLIO BALANCE</div>
              <div className="portfolio-balance">
                {walletConnected ? balance : '0.0000'} <span className="currency">ETH</span>
              </div>
              <div className="portfolio-inr">≈ ₹{walletConnected ? (parseFloat(balance) * 19302659).toLocaleString('en-IN') : '0'} INR</div>
            </div>

            <div className="wallet-address-section">
              <div className="address-label">WALLET ADDRESS</div>
              <div className="address-value">
                <span className={addressExpanded ? 'address-full' : 'address-short'}>
                  {walletConnected ? (addressExpanded ? currentWallet : formatAddress(currentWallet)) : (user?.walletAddress ? (addressExpanded ? user.walletAddress : formatAddress(user.walletAddress)) : 'Not Connected')}
                </span>
                {(walletConnected || user?.walletAddress) && (
                  <button className="expand-btn" onClick={() => setAddressExpanded(!addressExpanded)}>
                    {addressExpanded ? 'Collapse' : 'Expand'}
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <div className="wallet-error" style={{ position: 'relative', padding: '15px', marginTop: '15px' }}>
                <button 
                  onClick={() => setError('')}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0',
                    lineHeight: '1'
                  }}
                  title="Dismiss"
                >
                  ✕
                </button>
                <div style={{ whiteSpace: 'pre-line', paddingRight: '30px' }}>
                  {error}
                </div>
                {!walletConnected && (
                  <button 
                    onClick={() => {
                      setError('');
                      handleConnectWallet();
                    }}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      background: '#5865F2',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔄 Try Connecting Again
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Send ETH Card */}
          <div 
            className="action-card send-card" 
            onClick={() => walletConnected && !accountBlocked && setShowSendModal(true)} 
            style={{ 
              cursor: (walletConnected && !accountBlocked) ? 'pointer' : 'not-allowed', 
              opacity: (walletConnected && !accountBlocked) ? 1 : 0.6 
            }}
          >
            <div className="action-icon">{accountBlocked ? '🚫' : '↑'}</div>
            <h3 className="action-title">{accountBlocked ? 'Account Blocked' : 'Send ETH'}</h3>
            <p className="action-subtitle">{accountBlocked ? 'Cannot send funds' : 'Transfer funds securely'}</p>
          </div>

          {/* QR Code Card */}
          <div className="action-card qr-card" onClick={() => walletConnected && setShowQRModal(true)} style={{ cursor: walletConnected ? 'pointer' : 'not-allowed', opacity: walletConnected ? 1 : 0.6 }}>
            <div className="action-icon">📱</div>
            <h3 className="action-title">QR Code</h3>
            <p className="action-subtitle">Share wallet address</p>
          </div>

          {/* Refresh Balance Card */}
          <div className="action-card refresh-card" onClick={handleRefreshBalance} style={{ cursor: walletConnected ? 'pointer' : 'not-allowed', opacity: walletConnected ? 1 : 0.6 }}>
            <div className="action-icon">{refreshing ? '⏳' : '🔄'}</div>
            <h3 className="action-title">{refreshing ? 'Refreshing...' : 'Refresh Balance'}</h3>
            <p className="action-subtitle">Update wallet data</p>
          </div>
        </div>



        {/* Scan/Upload Buttons */}
        <div className="scan-upload-section">
          <button 
            className="scan-btn" 
            onClick={() => setShowScannerModal(true)}
            disabled={!walletConnected || accountBlocked}
            style={{ opacity: (walletConnected && !accountBlocked) ? 1 : 0.6 }}
          >
            📷 Scan QR Code
          </button>
          <button 
            className="upload-btn"
            onClick={() => setShowUploadModal(true)}
            disabled={!walletConnected || accountBlocked}
            style={{ opacity: (walletConnected && !accountBlocked) ? 1 : 0.6 }}
          >
            📁 Upload QR Image
          </button>
        </div>

        {/* Transaction History */}
        <div className="transaction-history-section">
          <div className="history-header">
            <h2 className="history-title">Transaction History</h2>
            <div className="history-actions">
              <button className="action-btn download-btn" onClick={() => setShowStatementModal(true)}>📥 Download Statement</button>
              <button 
                className="action-btn refresh-btn" 
                onClick={() => loadTransactions(true)}
                disabled={refreshingTransactions}
              >
                {refreshingTransactions ? '⏳ Refreshing...' : '🔄 Refresh Transactions'}
              </button>
            </div>
          </div>

          <div className="transaction-table-wrapper">
            {transactions.length === 0 ? (
              <div className="no-transactions">
                <p>No transactions found</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  {walletConnected ? 'Your transactions will appear here once you make a transfer' : 'Connect your wallet to view transactions'}
                </p>
              </div>
            ) : (
              <>
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>TYPE</th>
                      <th>HASH</th>
                      <th>FROM</th>
                      <th>TO</th>
                      <th>VALUE</th>
                      <th>BLOCK</th>
                      <th>TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage)
                      .map((tx, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`tx-badge ${tx.from.toLowerCase() === currentWallet.toLowerCase() ? 'sent' : 'received'}`}>
                              {tx.from.toLowerCase() === currentWallet.toLowerCase() ? 'SENT' : 'RECEIVED'}
                            </span>
                          </td>
                          <td>
                            <a 
                              href={`https://etherscan.io/tx/${tx.transactionHash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="tx-hash"
                            >
                              {formatAddress(tx.transactionHash)}
                            </a>
                          </td>
                          <td className="address-cell">{formatAddress(tx.from)}</td>
                          <td className="address-cell">{formatAddress(tx.to)}</td>
                          <td className="value-cell">{tx.amount} ETH</td>
                          <td>{tx.blockNumber || 'N/A'}</td>
                          <td className="time-cell">{formatDate(tx.timestamp)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                {transactions.length > transactionsPerPage && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '15px',
                    marginTop: '20px',
                    padding: '15px'
                  }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '10px 20px',
                        background: currentPage === 1 ? '#e0e0e0' : '#667eea',
                        color: currentPage === 1 ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}
                    >
                      ← Previous
                    </button>
                    <span style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                      Page {currentPage} of {Math.ceil(transactions.length / transactionsPerPage)}
                      <span style={{ color: '#666', marginLeft: '10px', fontSize: '0.85rem' }}>
                        ({transactions.length} total transactions)
                      </span>
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(transactions.length / transactionsPerPage), p + 1))}
                      disabled={currentPage >= Math.ceil(transactions.length / transactionsPerPage)}
                      style={{
                        padding: '10px 20px',
                        background: currentPage >= Math.ceil(transactions.length / transactionsPerPage) ? '#e0e0e0' : '#667eea',
                        color: currentPage >= Math.ceil(transactions.length / transactionsPerPage) ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: currentPage >= Math.ceil(transactions.length / transactionsPerPage) ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Send Money Modal */}
      {showSendModal && (
        <SendMoneyModal
          userWallet={currentWallet}
          onClose={() => {
            setShowSendModal(false);
            setQrScanData(null);
          }}
          onSuccess={handleTransactionComplete}
          initialRecipient={qrScanData?.address}
          initialAmount={qrScanData?.amount}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeModal
          walletAddress={currentWallet}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* QR Scanner Modal - Camera Only */}
      {showScannerModal && (
        <QRScannerModal
          mode="scan"
          onClose={() => {
            setShowScannerModal(false);
            setQrScanData(null);
          }}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* QR Upload Modal - Upload Only */}
      {showUploadModal && (
        <QRScannerModal
          mode="upload"
          onClose={() => {
            setShowUploadModal(false);
            setQrScanData(null);
          }}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Download Statement Modal */}
      {showStatementModal && (
        <DownloadStatementModal
          transactions={transactions}
          currentWallet={currentWallet}
          onClose={() => setShowStatementModal(false)}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Blocked Details Modal */}
      {showBlockedDetailsModal && accountBlocked && (
        <div className="modal-overlay" onClick={() => setShowBlockedDetailsModal(false)}>
          <div className="blocked-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="blocked-modal-header">
              <h2>⛔ Account Blocked - AML Violation</h2>
              <button className="close-modal-btn" onClick={() => setShowBlockedDetailsModal(false)}>×</button>
            </div>
            <div className="blocked-modal-content">
              {violationInfo?.allViolations && violationInfo.allViolations.length > 0 ? (
                <>
                  <div className="violation-count">
                    <strong>{violationInfo.allViolations.length} Rule(s) Violated:</strong>
                  </div>
                  {violationInfo.allViolations.map((v: any, index: number) => (
                    <div key={index} className="violation-item">
                      <div className="violation-number">{index + 1}</div>
                      <div className="violation-details">
                        <div className="violation-name">
                          <strong>{v.ruleName}</strong>
                        </div>
                        <div className="violation-reason">{v.reason}</div>
                      </div>
                    </div>
                  ))}
                  <div className="blocked-timestamp">
                    <strong>Blocked On:</strong> {violationInfo?.timestamp ? new Date(violationInfo.timestamp).toLocaleString() : 'N/A'}
                  </div>
                </>
              ) : (
                <>
                  <div className="single-violation">
                    <p><strong>Rule Violated:</strong> {violationInfo?.ruleName || 'AML Rule'}</p>
                    <p><strong>Reason:</strong> {violationInfo?.description || 'Suspicious transaction activity detected'}</p>
                    <p><strong>Blocked On:</strong> {violationInfo?.timestamp ? new Date(violationInfo.timestamp).toLocaleString() : 'N/A'}</p>
                  </div>
                </>
              )}
              <div className="blocked-modal-warning">
                <p>⚠️ <strong>All transaction capabilities have been disabled.</strong></p>
                <p>You can view your balance and transaction history, but you cannot send or receive funds.</p>
                <p>Please contact an administrator to review your account and request unblocking.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
