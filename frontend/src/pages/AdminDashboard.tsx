import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import api from '../services/api';
import AdminSupportCenter from '../components/AdminSupportCenter';
import './AdminDashboard.css';

interface User {
  _id: string;
  name: string;
  email: string;
  walletAddress: string;
  phone: string;
  age: number;
  gender: string;
  createdAt: string;
  accountStatus?: string;
  violatedRuleName?: string;
  violationDescription?: string;
  violatedRules?: Array<{
    ruleName: string;
    reason: string;
    severity: string;
    timestamp: string;
  }>;
  blockTimestamp?: string;
}

interface Transaction {
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
  blockNumber?: number;
  riskScore?: number;
  riskLevel?: string;
  ruleBreakdown?: Array<{
    ruleName: string;
    ruleType: string;
    severity: string;
    reason: string;
    riskPoints: number;
  }>;
}

interface AMLRule {
  _id: string;
  name: string;
  description: string;
  ruleType: string;
  isActive: boolean;
  parameters: any;
  action: string;
  blockTarget: 'sender' | 'receiver' | 'both';
  priority: number;
  triggeredCount: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
  updatedBy?: {
    name: string;
    email: string;
  };
}

interface KYCSubmission {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    walletAddress: string;
  };
  documentType: string;
  documentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    name: string;
    email: string;
  };
}

interface SARReport {
  _id: string;
  reportId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    walletAddress: string;
  };
  walletAddress: string;
  userDetails: {
    name: string;
    email: string;
    phone?: string;
    age?: number;
    gender?: string;
  };
  violationType: string;
  violatedRules: Array<{
    ruleName: string;
    severity: string;
    reason: string;
    timestamp: string;
  }>;
  transactionDetails?: {
    transactionHash: string;
    amount: string;
    timestamp: string;
    from: string;
    to: string;
  };
  blockTimestamp: string;
  status: 'PENDING' | 'REVIEWED' | 'CLOSED';
  investigationNotes?: string;
  reviewedBy?: {
    name: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWallets: 0,
    totalTransactions: 0,
    recentRegistrations: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPerPage] = useState(10);
  const [decoderTxHash, setDecoderTxHash] = useState('');
  const [decodedData, setDecodedData] = useState<any>(null);
  const [decoderLoading, setDecoderLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'blocked' | 'aml' | 'kyc' | 'sar' | 'support'>('overview');
  const [blockchainStatus, setBlockchainStatus] = useState('connected');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [amlRules, setAmlRules] = useState<AMLRule[]>([]);
  const [showAMLModal, setShowAMLModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AMLRule | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [sarReports, setSarReports] = useState<SARReport[]>([]);
  const [sarSearchTerm, setSarSearchTerm] = useState('');
  const [sarStatusFilter, setSarStatusFilter] = useState('ALL');
  const [sarStartDate, setSarStartDate] = useState('');
  const [sarEndDate, setSarEndDate] = useState('');
  const [selectedSAR, setSelectedSAR] = useState<SARReport | null>(null);
  const [showSARModal, setShowSARModal] = useState(false);
  const [selectedBlockedUser, setSelectedBlockedUser] = useState<User | null>(null);
  const [showBlockedUserModal, setShowBlockedUserModal] = useState(false);
  const [blockedSearchTerm, setBlockedSearchTerm] = useState('');
  const [blockedStartDate, setBlockedStartDate] = useState('');
  const [blockedEndDate, setBlockedEndDate] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [kycSearchTerm, setKycSearchTerm] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('ALL');
  const [kycStartDate, setKycStartDate] = useState('');
  const [kycEndDate, setKycEndDate] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingKycId, setReviewingKycId] = useState<string | null>(null);
  const [amlFormData, setAmlFormData] = useState({
    name: '',
    description: '',
    ruleType: 'transaction_limit',
    action: 'block',
    blockTarget: 'sender',
    priority: 5,
    isActive: true,
    parameters: {
      threshold: 0,
      maxAmount: 0,
      minAmount: 0,
      maxTransactions: 0,
      timeWindow: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'aml') {
      loadAMLRules();
    }
    if (activeTab === 'blocked') {
      loadBlockedUsers();
    }
    if (activeTab === 'kyc') {
      loadKYCSubmissions();
    }
    if (activeTab === 'sar') {
      loadSARReports();
    }
    
    // Auto-refresh overview data every 30 seconds when on overview tab
    let refreshInterval: NodeJS.Timeout | null = null;
    if (activeTab === 'overview') {
      refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing admin dashboard...');
        loadStats();
        loadRecentActivity();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      await loadStats();
      await loadUsers();
      await loadRecentActivity();
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err: any) {
      setError('Failed to load statistics');
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err: any) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Load recent transactions from all users
      const response = await api.get('/api/admin/recent-activity');
      if (response.data.success) {
        setRecentActivity(response.data.activities || []);
      }
    } catch (err: any) {
      console.error('Failed to load recent activity:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'blocked') {
      await loadBlockedUsers();
    }
    setRefreshing(false);
  };

  // Transaction Decoder Function
  const handleDecodeTransaction = async () => {
    if (!decoderTxHash.trim()) {
      alert('Please enter a transaction hash');
      return;
    }

    try {
      setDecoderLoading(true);
      setDecodedData(null);

      // Connect to Ganache
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get transaction details
      const tx = await provider.getTransaction(decoderTxHash);
      
      if (!tx) {
        alert('Transaction not found');
        return;
      }

      // Get transaction receipt for more details
      const receipt = await provider.getTransactionReceipt(decoderTxHash);

      // Decode the transaction data
      const decoded = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value || 0),
        gasLimit: tx.gasLimit?.toString(),
        gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : 'N/A',
        nonce: tx.nonce,
        data: tx.data,
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash,
        confirmations: receipt ? receipt.confirmations : 0,
        status: receipt ? (receipt.status === 1 ? 'Success' : 'Failed') : 'Pending',
        gasUsed: receipt ? receipt.gasUsed.toString() : 'N/A',
        cumulativeGasUsed: receipt ? receipt.cumulativeGasUsed.toString() : 'N/A',
        contractAddress: receipt?.contractAddress || 'N/A',
        logs: receipt?.logs.length || 0
      };

      setDecodedData(decoded);
    } catch (err: any) {
      console.error('Error decoding transaction:', err);
      alert(err.message || 'Failed to decode transaction');
    } finally {
      setDecoderLoading(false);
    }
  };

  // Blocked Users Functions
  const loadBlockedUsers = async () => {
    try {
      const response = await api.get('/api/admin/blocked-users');
      if (response.data.success) {
        setBlockedUsers(response.data.users);
      }
    } catch (err: any) {
      console.error('Failed to load blocked users:', err);
      setError('Failed to load blocked users');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to unblock this user?')) {
      return;
    }

    try {
      console.log('🔓 Unblocking user:', userId);
      const response = await api.post(`/api/admin/unblock-user/${userId}`);
      if (response.data.success) {
        await loadBlockedUsers();
        await loadStats(); // Refresh stats
        alert('User unblocked successfully');
      }
    } catch (err: any) {
      console.error('Failed to unblock user:', err);
      alert(err.response?.data?.message || 'Failed to unblock user');
    }
  };

  // KYC Functions
  const loadKYCSubmissions = async () => {
    try {
      const response = await api.get('/api/kyc/admin/all');
      if (response.data.success) {
        setKycSubmissions(response.data.submissions);
      }
    } catch (err: any) {
      console.error('Failed to load KYC submissions:', err);
      setError('Failed to load KYC submissions');
    }
  };

  const handleViewDocument = async (kycId: string) => {
    try {
      console.log('📄 Fetching document for KYC ID:', kycId);
      const response = await api.get(`/api/kyc/admin/document/${kycId}`, {
        responseType: 'blob'
      });
      
      console.log('✅ Document received:', {
        type: response.data.type,
        size: response.data.size,
        contentType: response.headers['content-type']
      });
      
      // Get content type from response headers or blob
      const contentType = response.headers['content-type'] || response.data.type;
      console.log('📋 Content-Type:', contentType);
      
      // Create blob URL with correct content type
      const blob = new Blob([response.data], { type: contentType });
      const documentUrl = URL.createObjectURL(blob);
      
      console.log('🖼️ Created blob URL:', documentUrl);
      
      // For PDFs, open in new tab
      if (contentType === 'application/pdf') {
        console.log('📄 Opening PDF in new tab');
        window.open(documentUrl, '_blank');
      } else {
        // For images, show in modal
        console.log('🖼️ Showing image in modal');
        setSelectedDocument(documentUrl);
        setShowDocumentModal(true);
      }
    } catch (err: any) {
      console.error('❌ Failed to load document:', err);
      console.error('Error response:', err.response);
      alert(`Failed to load document: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleApproveKYC = async (kycId: string) => {
    if (!window.confirm('Are you sure you want to APPROVE this KYC submission?')) {
      return;
    }

    try {
      console.log('✅ Approving KYC:', kycId);
      const response = await api.put(`/api/kyc/admin/review/${kycId}`, {
        status: 'APPROVED'
      });
      
      console.log('Response:', response.data);
      if (response.data.success) {
        alert('KYC approved successfully!');
        await loadKYCSubmissions();
        await loadStats(); // Refresh stats if needed
      }
    } catch (err: any) {
      console.error('Failed to approve KYC:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to approve KYC');
    }
  };

  const handleRejectKYC = async (kycId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      console.log('❌ Rejecting KYC:', kycId, 'Reason:', rejectionReason);
      const response = await api.put(`/api/kyc/admin/review/${kycId}`, {
        status: 'REJECTED',
        rejectionReason: rejectionReason
      });
      
      console.log('Response:', response.data);
      if (response.data.success) {
        alert('KYC rejected successfully!');
        setReviewingKycId(null);
        setRejectionReason('');
        await loadKYCSubmissions();
      }
    } catch (err: any) {
      console.error('Failed to reject KYC:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to reject KYC');
    }
  };

  // SAR Reports Functions
  const loadSARReports = async () => {
    try {
      const params = new URLSearchParams();
      if (sarSearchTerm) params.append('search', sarSearchTerm);
      if (sarStatusFilter !== 'ALL') params.append('status', sarStatusFilter);
      if (sarStartDate) params.append('startDate', sarStartDate);
      if (sarEndDate) params.append('endDate', sarEndDate);
      
      const response = await api.get(`/api/sar/reports?${params.toString()}`);
      if (response.data.success) {
        setSarReports(response.data.reports);
      }
    } catch (err: any) {
      console.error('Failed to load SAR reports:', err);
      setError('Failed to load SAR reports');
    }
  };

  const handleDownloadSAR = async (reportId: string) => {
    try {
      const response = await api.get(`/api/sar/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SAR_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download SAR:', err);
      alert('Failed to download SAR report');
    }
  };

  const handleViewSAR = async (reportId: string) => {
    try {
      const response = await api.get(`/api/sar/reports/${reportId}`);
      if (response.data.success) {
        setSelectedSAR(response.data.report);
        setShowSARModal(true);
      }
    } catch (err: any) {
      console.error('Failed to load SAR details:', err);
      alert('Failed to load SAR details');
    }
  };

  const handleUpdateSARStatus = async (reportId: string, status: string, notes: string) => {
    try {
      const response = await api.put(`/api/sar/reports/${reportId}`, {
        status,
        investigationNotes: notes
      });
      
      if (response.data.success) {
        alert('SAR report updated successfully!');
        setShowSARModal(false);
        await loadSARReports();
      }
    } catch (err: any) {
      console.error('Failed to update SAR:', err);
      alert('Failed to update SAR report');
    }
  };

  // AML Rules Functions
  const loadAMLRules = async () => {
    try {
      const response = await api.get('/api/aml/rules');
      if (response.data.success) {
        setAmlRules(response.data.rules);
      }
    } catch (err: any) {
      console.error('Failed to load AML rules:', err);
      setError('Failed to load AML rules');
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setAmlFormData({
      name: '',
      description: '',
      ruleType: 'transaction_limit',
      action: 'block',
      blockTarget: 'sender',
      priority: 5,
      isActive: true,
      parameters: {
        threshold: 0,
        maxAmount: 0,
        minAmount: 0,
        maxTransactions: 0,
        timeWindow: 0
      }
    });
    setShowAMLModal(true);
  };

  const handleEditRule = (rule: AMLRule) => {
    setEditingRule(rule);
    setAmlFormData({
      name: rule.name,
      description: rule.description,
      ruleType: rule.ruleType,
      action: 'block',
      blockTarget: rule.blockTarget || 'sender',
      priority: rule.priority,
      isActive: rule.isActive,
      parameters: rule.parameters || {
        threshold: 0,
        maxAmount: 0,
        minAmount: 0,
        maxTransactions: 0,
        timeWindow: 0
      }
    });
    setShowAMLModal(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this AML rule?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/aml/rules/${ruleId}`);
      if (response.data.success) {
        await loadAMLRules();
        alert('AML rule deleted successfully');
      }
    } catch (err: any) {
      console.error('Failed to delete AML rule:', err);
      alert('Failed to delete AML rule');
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      const response = await api.patch(`/api/aml/rules/${ruleId}/toggle`);
      if (response.data.success) {
        await loadAMLRules();
      }
    } catch (err: any) {
      console.error('Failed to toggle AML rule:', err);
      alert('Failed to toggle AML rule');
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...amlFormData,
      action: 'block'
    };

    try {
      if (editingRule) {
        // Update existing rule
        const response = await api.put(`/api/aml/rules/${editingRule._id}`, payload);
        if (response.data.success) {
          await loadAMLRules();
          setShowAMLModal(false);
          alert('AML rule updated successfully');
        }
      } else {
        // Create new rule
        const response = await api.post('/api/aml/rules', payload);
        if (response.data.success) {
          await loadAMLRules();
          setShowAMLModal(false);
          alert('AML rule created successfully');
        }
      }
    } catch (err: any) {
      console.error('Failed to save AML rule:', err);
      alert(err.response?.data?.message || 'Failed to save AML rule');
    }
  };

  const handleSeedRules = async () => {
    if (!window.confirm('This will create 10 default AML rules. Continue?')) {
      return;
    }

    try {
      const response = await api.post('/api/aml/rules/seed');
      if (response.data.success) {
        await loadAMLRules();
        alert(`Successfully created ${response.data.count} AML rules`);
      }
    } catch (err: any) {
      console.error('Failed to seed AML rules:', err);
      alert(err.response?.data?.message || 'Failed to seed AML rules');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString: string | number) => {
    const date = typeof dateString === 'number' 
      ? new Date(dateString * 1000) 
      : new Date(dateString);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleRiskClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowRiskModal(true);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage users, monitor transactions, and configure AML rules</p>
            <p className="admin-last-updated">Last updated: {formatLastUpdated()}</p>
          </div>
          <button className="admin-signout-btn" onClick={handleSignOut}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button 
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({stats.totalUsers})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          🚫 Blocked Users ({blockedUsers.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'aml' ? 'active' : ''}`}
          onClick={() => setActiveTab('aml')}
        >
          🛡️ AML Rules ({amlRules.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'kyc' ? 'active' : ''}`}
          onClick={() => setActiveTab('kyc')}
        >
          📄 KYC Management ({kycSubmissions.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'sar' ? 'active' : ''}`}
          onClick={() => setActiveTab('sar')}
        >
          📋 SAR Reports ({sarReports.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          💬 Support Center
        </button>
      </div>

      <div className="admin-container">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon blue">👥</div>
                <div>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon green">📈</div>
                <div>
                  <div className="stat-label">Active Users</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <div className="section-header-actions">
                  <span className="activity-count">
                    Showing {Math.min((activityPage - 1) * activityPerPage + 1, recentActivity.length)}-{Math.min(activityPage * activityPerPage, recentActivity.length)} of <strong>{recentActivity.length}</strong> transactions
                  </span>
                  <button 
                    className="refresh-btn" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="activity-table-container">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>ACTIVITY</th>
                      <th>USER</th>
                      <th>AMOUNT</th>
                      <th>TIME</th>
                      <th>VIEW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="no-activity">
                          No transactions found. Transactions will appear here when users send ETH.
                        </td>
                      </tr>
                    ) : (
                      recentActivity
                        .slice((activityPage - 1) * activityPerPage, activityPage * activityPerPage)
                        .map((activity, index) => {
                        return (
                          <tr key={`${activity.transactionHash}-${index}`}>
                            <td>
                              <div className="activity-details">
                                <div className="activity-type">ChainSecure Transfer: {activity.amount} ETH from {formatAddress(activity.from)} to {formatAddress(activity.to)}</div>
                                <div className="activity-subtext">Transfer</div>
                              </div>
                            </td>
                            <td>{formatAddress(activity.from)}</td>
                            <td className="amount-cell">{activity.amount} ETH</td>
                            <td className="time-cell">{formatDate(activity.timestamp)}</td>
                            <td>
                              <button 
                                className="view-btn"
                                onClick={() => handleViewTransaction(activity)}
                                style={{
                                  padding: '6px 16px',
                                  background: '#667eea',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {recentActivity.length > activityPerPage && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '15px', 
                  marginTop: '20px',
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <button 
                    onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                    disabled={activityPage === 1}
                    style={{
                      padding: '8px 16px',
                      background: activityPage === 1 ? '#e0e0e0' : '#667eea',
                      color: activityPage === 1 ? '#999' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: activityPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontWeight: '500', color: '#333' }}>
                    Page {activityPage} of {Math.ceil(recentActivity.length / activityPerPage)}
                  </span>
                  <button 
                    onClick={() => setActivityPage(p => Math.min(Math.ceil(recentActivity.length / activityPerPage), p + 1))}
                    disabled={activityPage >= Math.ceil(recentActivity.length / activityPerPage)}
                    style={{
                      padding: '8px 16px',
                      background: activityPage >= Math.ceil(recentActivity.length / activityPerPage) ? '#e0e0e0' : '#667eea',
                      color: activityPage >= Math.ceil(recentActivity.length / activityPerPage) ? '#999' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: activityPage >= Math.ceil(recentActivity.length / activityPerPage) ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* Transaction Decoder Section */}
            <div style={{ 
              marginTop: '30px', 
              padding: '25px', 
              background: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}>
              <h2 style={{ marginBottom: '15px', color: '#333', fontSize: '1.5rem' }}>🔍 Transaction Data Decoder</h2>
              <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.95rem' }}>
                Decode hashed transaction data from Ganache blockchain
              </p>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Enter transaction hash (0x...)"
                  value={decoderTxHash}
                  onChange={(e) => setDecoderTxHash(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '0.95rem',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  onClick={handleDecodeTransaction}
                  disabled={decoderLoading}
                  style={{
                    padding: '12px 30px',
                    background: decoderLoading ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: decoderLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                  }}
                >
                  {decoderLoading ? 'Decoding...' : 'Decode'}
                </button>
              </div>

              {decodedData && (
                <div style={{ 
                  padding: '20px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px', 
                  border: '1px solid #e0e0e0' 
                }}>
                  <h3 style={{ marginBottom: '15px', color: '#667eea' }}>Decoded Transaction Details</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.9rem' }}>
                    <div>
                      <strong>Status:</strong>
                      <span style={{ 
                        marginLeft: '10px', 
                        padding: '4px 10px', 
                        background: decodedData.status === 'Success' ? '#d4edda' : '#f8d7da',
                        color: decodedData.status === 'Success' ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {decodedData.status}
                      </span>
                    </div>
                    <div><strong>Block Number:</strong> {decodedData.blockNumber}</div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Hash:</strong> 
                      <code style={{ marginLeft: '10px', background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {decodedData.hash}
                      </code>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>From:</strong> 
                      <code style={{ marginLeft: '10px', background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {decodedData.from}
                      </code>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>To:</strong> 
                      <code style={{ marginLeft: '10px', background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {decodedData.to || 'Contract Creation'}
                      </code>
                    </div>
                    <div><strong>Value:</strong> {decodedData.value} ETH</div>
                    <div><strong>Gas Used:</strong> {decodedData.gasUsed}</div>
                    <div><strong>Gas Limit:</strong> {decodedData.gasLimit}</div>
                    <div><strong>Gas Price:</strong> {decodedData.gasPrice} Gwei</div>
                    <div><strong>Nonce:</strong> {decodedData.nonce}</div>
                    <div><strong>Confirmations:</strong> {decodedData.confirmations}</div>
                    <div><strong>Logs/Events:</strong> {decodedData.logs}</div>
                    <div><strong>Contract Address:</strong> {decodedData.contractAddress}</div>
                  </div>

                  {decodedData.data && decodedData.data !== '0x' && (
                    <div style={{ marginTop: '15px' }}>
                      <strong>Input Data:</strong>
                      <pre style={{ 
                        marginTop: '8px', 
                        padding: '12px', 
                        background: 'white', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        maxHeight: '200px',
                        border: '1px solid #ddd'
                      }}>
                        {decodedData.data}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            <h2>👥 User Management</h2>
            <p className="section-subtitle">
              Total registered users: <strong>{users.length}</strong>
            </p>

            {/* Search and Filter Bar */}
            <div style={{ marginBottom: '20px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Search by Name, Email, Wallet, ID..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={userStartDate}
                  onChange={(e) => setUserStartDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={userEndDate}
                  onChange={(e) => setUserEndDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button
                  className="primary-btn"
                  onClick={() => loadUsers()}
                  style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  🔍 Search
                </button>
              </div>
            </div>

            {users.filter(user => {
              const searchLower = userSearchTerm.toLowerCase();
              const matchesSearch = !userSearchTerm || 
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.walletAddress.toLowerCase().includes(searchLower) ||
                user._id.toLowerCase().includes(searchLower);
              
              const matchesDateRange = (!userStartDate || new Date(user.createdAt) >= new Date(userStartDate)) &&
                                       (!userEndDate || new Date(user.createdAt) <= new Date(userEndDate));
              
              return matchesSearch && matchesDateRange;
            }).length === 0 ? (
              <p className="no-data">{userSearchTerm || userStartDate || userEndDate ? 'No users found matching your search criteria' : 'No users registered yet'}</p>
            ) : (
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Wallet Address</th>
                      <th>Phone</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(user => {
                      const searchLower = userSearchTerm.toLowerCase();
                      const matchesSearch = !userSearchTerm || 
                        user.name.toLowerCase().includes(searchLower) ||
                        user.email.toLowerCase().includes(searchLower) ||
                        user.walletAddress.toLowerCase().includes(searchLower) ||
                        user._id.toLowerCase().includes(searchLower);
                      
                      const matchesDateRange = (!userStartDate || new Date(user.createdAt) >= new Date(userStartDate)) &&
                                               (!userEndDate || new Date(user.createdAt) <= new Date(userEndDate));
                      
                      return matchesSearch && matchesDateRange;
                    }).map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <code className="wallet-code">
                            {formatAddress(user.walletAddress)}
                          </code>
                        </td>
                        <td>{user.phone}</td>
                        <td>{user.age}</td>
                        <td>{user.gender}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedUserForDetails(user);
                              setShowUserDetailsModal(true);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Blocked Users Tab */}
        {activeTab === 'blocked' && (
          <div className="blocked-users-section">
            <div className="section-header">
              <div>
                <h2>🚫 Blocked Users - AML Violations</h2>
                <p className="section-subtitle">
                  Users with blocking history: <strong>{blockedUsers.length}</strong>
                </p>
              </div>
              <button className="refresh-btn" onClick={() => loadBlockedUsers()} disabled={refreshing}>
                {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ marginBottom: '20px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Search by Name, Email, Wallet, ID..."
                  value={blockedSearchTerm}
                  onChange={(e) => setBlockedSearchTerm(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={blockedStartDate}
                  onChange={(e) => setBlockedStartDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={blockedEndDate}
                  onChange={(e) => setBlockedEndDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button
                  className="primary-btn"
                  onClick={() => loadBlockedUsers()}
                  style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  🔍 Search
                </button>
              </div>
            </div>

            {blockedUsers.filter(user => {
              const searchLower = blockedSearchTerm.toLowerCase();
              const matchesSearch = !blockedSearchTerm || 
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.walletAddress.toLowerCase().includes(searchLower) ||
                user._id.toLowerCase().includes(searchLower);
              
              const matchesDateRange = (!blockedStartDate || !user.blockTimestamp || new Date(user.blockTimestamp) >= new Date(blockedStartDate)) &&
                                       (!blockedEndDate || !user.blockTimestamp || new Date(user.blockTimestamp) <= new Date(blockedEndDate));
              
              return matchesSearch && matchesDateRange;
            }).length === 0 ? (
              <div className="no-data-card">
                <div className="no-data-icon">✅</div>
                <h3>{blockedSearchTerm || blockedStartDate || blockedEndDate ? 'No Results Found' : 'No Blocked Users'}</h3>
                <p>{blockedSearchTerm || blockedStartDate || blockedEndDate ? 'Try adjusting your search criteria.' : 'All user accounts are currently active. Blocked users will appear here when AML violations are detected.'}</p>
              </div>
            ) : (
              <div className="blocked-users-grid">
                {blockedUsers.filter(user => {
                  const searchLower = blockedSearchTerm.toLowerCase();
                  const matchesSearch = !blockedSearchTerm || 
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.walletAddress.toLowerCase().includes(searchLower) ||
                    user._id.toLowerCase().includes(searchLower);
                  
                  const matchesDateRange = (!blockedStartDate || !user.blockTimestamp || new Date(user.blockTimestamp) >= new Date(blockedStartDate)) &&
                                           (!blockedEndDate || !user.blockTimestamp || new Date(user.blockTimestamp) <= new Date(blockedEndDate));
                  
                  return matchesSearch && matchesDateRange;
                }).map((user) => (
                  <div key={user._id} className="blocked-user-card">
                    <div className="blocked-user-header">
                      <div className="user-info">
                        <h3>{user.name}</h3>
                        <p className="user-email">{user.email}</p>
                      </div>
                      <div className={`violation-badge ${user.accountStatus === 'BLOCKED' ? 'critical' : 'info'}`}>
                        {user.accountStatus === 'BLOCKED' ? '🚨 BLOCKED' : '✅ UNBLOCKED'}
                      </div>
                    </div>

                    <div className="blocked-user-details">
                      <div className="detail-row">
                        <span className="detail-label">Wallet Address:</span>
                        <code className="detail-value">{formatAddress(user.walletAddress)}</code>
                      </div>
                      
                      {user.accountStatus === 'BLOCKED' && user.violatedRules && user.violatedRules.length > 0 ? (
                        <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span className="detail-label">Current Violations ({user.violatedRules.length}):</span>
                          <div style={{ marginTop: '10px', width: '100%' }}>
                            {user.violatedRules.map((violation, index) => (
                              <div key={index} style={{ 
                                marginBottom: '12px', 
                                padding: '10px', 
                                background: '#fff5f5', 
                                borderLeft: '4px solid #f44336',
                                borderRadius: '4px'
                              }}>
                                <div style={{ fontWeight: 'bold', color: '#d32f2f', marginBottom: '5px' }}>
                                  {index + 1}. {violation.ruleName} 
                                  <span style={{ 
                                    marginLeft: '8px', 
                                    padding: '2px 8px', 
                                    background: violation.severity === 'critical' ? '#d32f2f' : 
                                              violation.severity === 'high' ? '#f44336' : 
                                              violation.severity === 'medium' ? '#ff9800' : '#ffc107',
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase'
                                  }}>
                                    {violation.severity}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>{violation.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : user.accountStatus === 'BLOCKED' ? (
                        <>
                          <div className="detail-row">
                            <span className="detail-label">Violated Rule:</span>
                            <span className="detail-value rule-name">{user.violatedRuleName || 'N/A'}</span>
                          </div>
                          
                          <div className="detail-row">
                            <span className="detail-label">Violation Reason:</span>
                            <span className="detail-value violation-description">
                              {user.violationDescription || 'Suspicious activity detected'}
                            </span>
                          </div>
                        </>
                      ) : null}
                      
                      {user.accountStatus === 'BLOCKED' && (
                        <div className="detail-row">
                          <span className="detail-label">Blocked At:</span>
                          <span className="detail-value">
                            {user.blockTimestamp ? formatDate(user.blockTimestamp) : 'N/A'}
                          </span>
                        </div>
                      )}
                      
                      {(user as any).blockHistory && (user as any).blockHistory.length > 0 && (
                        <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '10px' }}>
                          <span className="detail-label">Block History ({(user as any).blockHistory.length}):</span>
                          <div style={{ marginTop: '8px', width: '100%', maxHeight: '150px', overflowY: 'auto' }}>
                            {(user as any).blockHistory.map((history: any, idx: number) => (
                              <div key={idx} style={{ 
                                marginBottom: '8px', 
                                padding: '8px', 
                                background: '#f5f5f5', 
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                              }}>
                                <div><strong>{history.ruleName}</strong></div>
                                <div style={{ color: '#666' }}>Blocked: {formatDate(history.blockedAt)}</div>
                                {history.unblockedAt && (
                                  <div style={{ color: '#10b981' }}>Unblocked: {formatDate(history.unblockedAt)} by {history.unblockedBy}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="detail-row">
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">{user.phone}</span>
                      </div>
                    </div>

                    <div className="blocked-user-actions">
                      {user.accountStatus === 'BLOCKED' && (
                        <button 
                          className="unblock-btn" 
                          onClick={() => handleUnblockUser(user._id)}
                        >
                          ✅ Unblock User
                        </button>
                      )}
                      <button 
                        className="view-details-btn"
                        onClick={() => {
                          setSelectedBlockedUser(user);
                          setShowBlockedUserModal(true);
                        }}
                      >
                        👁️ View Full Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AML Rules Tab */}
        {activeTab === 'aml' && (
          <div className="aml-section">
            <div className="section-header">
              <div>
                <h2>🛡️ AML Rules Management</h2>
                <p className="section-subtitle">
                  Configure Anti-Money Laundering detection rules
                </p>
              </div>
              <div className="section-header-actions">
                {amlRules.length === 0 && (
                  <button className="seed-btn" onClick={handleSeedRules}>
                    🌱 Seed Default Rules
                  </button>
                )}
                <button className="create-btn" onClick={handleCreateRule}>
                  ➕ Create New Rule
                </button>
              </div>
            </div>

            {amlRules.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛡️</div>
                <h3>No AML Rules Configured</h3>
                <p>Get started by seeding default rules or creating a custom rule</p>
                <button className="seed-btn-large" onClick={handleSeedRules}>
                  🌱 Seed 10 Default Rules
                </button>
              </div>
            ) : (
              <div className="aml-rules-grid">
                {amlRules.map((rule) => (
                  <div key={rule._id} className={`aml-rule-card ${!rule.isActive ? 'inactive' : ''}`}>
                    <div className="rule-header">
                      <div className="rule-title-section">
                        <h3>{rule.name}</h3>
                      </div>
                      <div className="rule-actions">
                        <button 
                          className={`toggle-btn ${rule.isActive ? 'active' : ''}`}
                          onClick={() => handleToggleRule(rule._id)}
                          title={rule.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {rule.isActive ? '✓' : '○'}
                        </button>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditRule(rule)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteRule(rule._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <p className="rule-description">{rule.description}</p>
                    
                    <div className="rule-details">
                      <div className="rule-detail-inline">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{rule.ruleType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="rule-detail-inline">
                        <span className="detail-label">Action:</span>
                        <span className="action-badge block">BLOCK</span>
                      </div>
                      <div className="rule-detail-inline">
                        <span className="detail-label">Block Account:</span>
                        <span className="detail-value">{(rule.blockTarget || 'sender').toUpperCase()}</span>
                      </div>
                      <div className="rule-detail-inline">
                        <span className="detail-label">Priority:</span>
                        <span className="detail-value">{rule.priority}/10</span>
                      </div>
                      <div className="rule-detail-inline">
                        <span className="detail-label">Triggered:</span>
                        <span className="detail-value">{rule.triggeredCount} times</span>
                      </div>
                    </div>
                    
                    <div className="rule-footer">
                      <span className="rule-status">
                        {rule.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                      <span className="rule-timestamp">
                        Updated: {formatDate(rule.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KYC Management Tab */}
        {activeTab === 'kyc' && (
          <div className="content-section">
            <div className="section-header">
              <div>
                <h2>📄 KYC Management</h2>
                <p>Review and approve user identity verifications</p>
              </div>
              <button className="refresh-btn" onClick={() => loadKYCSubmissions()} disabled={refreshing}>
                🔄 Refresh
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginBottom: '2rem'
            }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#667eea' }}>{kycSubmissions.filter(k => k.status === 'PENDING').length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Pending Review</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#10b981' }}>{kycSubmissions.filter(k => k.status === 'APPROVED').length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Approved</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#ef4444' }}>{kycSubmissions.filter(k => k.status === 'REJECTED').length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Rejected</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#667eea' }}>{kycSubmissions.length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Total Submissions</div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ marginBottom: '20px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Search by User, Email, Document ID..."
                  value={kycSearchTerm}
                  onChange={(e) => setKycSearchTerm(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <select
                  value={kycStatusFilter}
                  onChange={(e) => setKycStatusFilter(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={kycStartDate}
                  onChange={(e) => setKycStartDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={kycEndDate}
                  onChange={(e) => setKycEndDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            </div>

            {kycSubmissions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3>No KYC Submissions Yet</h3>
                <p>KYC submissions from users will appear here for review</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Wallet Address</th>
                      <th>Document Type</th>
                      <th>Document Number</th>
                      <th>Submitted At</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycSubmissions
                      .filter(kyc => {
                        // Search filter
                        const searchLower = kycSearchTerm.toLowerCase();
                        const matchesSearch = !kycSearchTerm || 
                          kyc.userId.name.toLowerCase().includes(searchLower) ||
                          kyc.userId.email.toLowerCase().includes(searchLower) ||
                          kyc.documentNumber.toLowerCase().includes(searchLower) ||
                          kyc._id.toLowerCase().includes(searchLower);
                        
                        // Status filter
                        const matchesStatus = kycStatusFilter === 'ALL' || kyc.status === kycStatusFilter;
                        
                        // Date filter
                        const submittedDate = new Date(kyc.submittedAt);
                        const matchesStartDate = !kycStartDate || submittedDate >= new Date(kycStartDate);
                        const matchesEndDate = !kycEndDate || submittedDate <= new Date(kycEndDate);
                        
                        return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
                      })
                      .map((kyc) => (
                      <tr key={kyc._id}>
                        <td>{kyc.userId.name}</td>
                        <td>{kyc.userId.email}</td>
                        <td>
                          <code style={{ 
                            fontSize: '0.85rem', 
                            padding: '4px 8px', 
                            background: '#f0f0f0', 
                            borderRadius: '4px',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}>
                            {kyc.userId.walletAddress}
                          </code>
                        </td>
                        <td>
                          <span className="document-type-badge">
                            {kyc.documentType.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td><code>{kyc.documentNumber}</code></td>
                        <td>{new Date(kyc.submittedAt).toLocaleString()}</td>
                        <td>
                          <span className={`status-badge status-${kyc.status.toLowerCase()}`}>
                            {kyc.status === 'PENDING' && '⏳ '}
                            {kyc.status === 'APPROVED' && '✅ '}
                            {kyc.status === 'REJECTED' && '❌ '}
                            {kyc.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewDocument(kyc._id)}
                              title="View Document"
                            >
                              👁️ View
                            </button>
                            
                            {kyc.status === 'PENDING' && (
                              <>
                                <button
                                  className="action-btn approve-btn"
                                  onClick={() => handleApproveKYC(kyc._id)}
                                  title="Approve KYC"
                                >
                                  ✅ Approve
                                </button>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={() => {
                                    setReviewingKycId(kyc._id);
                                    setRejectionReason('');
                                  }}
                                  title="Reject KYC"
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}

                            {kyc.status === 'REJECTED' && kyc.rejectionReason && (
                              <span className="rejection-reason-text" title={kyc.rejectionReason}>
                                📝 Reason: {kyc.rejectionReason.substring(0, 30)}...
                              </span>
                            )}
                          </div>

                          {reviewingKycId === kyc._id && (
                            <div className="rejection-form">
                              <textarea
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={() => handleRejectKYC(kyc._id)}
                                >
                                  Confirm Reject
                                </button>
                                <button
                                  className="action-btn cancel-btn"
                                  onClick={() => {
                                    setReviewingKycId(null);
                                    setRejectionReason('');
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SAR Reports Tab */}
        {activeTab === 'sar' && (
          <div className="content-section">
            <div className="section-header">
              <div>
                <h2>📋 SAR Reports</h2>
                <p>Suspicious Activity Reports generated from account blocks</p>
              </div>
              <button className="refresh-btn" onClick={() => loadSARReports()} disabled={refreshing}>
                🔄 Refresh
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ marginBottom: '20px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Search by Report ID, Wallet, Email..."
                  value={sarSearchTerm}
                  onChange={(e) => setSarSearchTerm(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <select
                  value={sarStatusFilter}
                  onChange={(e) => setSarStatusFilter(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={sarStartDate}
                  onChange={(e) => setSarStartDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={sarEndDate}
                  onChange={(e) => setSarEndDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button
                  className="primary-btn"
                  onClick={() => loadSARReports()}
                  style={{ padding: '10px 20px' }}
                >
                  🔍 Search
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginBottom: '2rem'
            }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#667eea' }}>{sarReports.length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Total Reports</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#f59e0b' }}>{sarReports.filter(s => s.status === 'PENDING').length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Pending</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#3b82f6' }}>{sarReports.filter(s => s.status === 'REVIEWED').length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Reviewed</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#10b981' }}>{sarReports.filter(s => s.status === 'CLOSED').length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Closed</div>
              </div>
            </div>

            {/* SAR Reports Table */}
            {sarReports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No SAR Reports Found</h3>
                <p>SAR reports are automatically generated when accounts are blocked due to AML violations.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>User</th>
                      <th>Wallet Address</th>
                      <th>Violation Type</th>
                      <th>Rules Violated</th>
                      <th>Block Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sarReports.map((sar) => (
                      <tr key={sar._id}>
                        <td><strong>{sar.reportId}</strong></td>
                        <td>
                          <div>{sar.userDetails.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>{sar.userDetails.email}</div>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.85rem', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                            {sar.walletAddress.substring(0, 10)}...{sar.walletAddress.substring(sar.walletAddress.length - 8)}
                          </code>
                        </td>
                        <td>
                          <span className={`badge badge-${getSeverityColor(sar.violationType)}`}>
                            {sar.violationType.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div style={{ maxWidth: '200px' }}>
                            {sar.violatedRules.slice(0, 2).map((rule, idx) => (
                              <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                • {rule.ruleName}
                              </div>
                            ))}
                            {sar.violatedRules.length > 2 && (
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                +{sar.violatedRules.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(sar.blockTimestamp)}</td>
                        <td>
                          <span className={`status-badge status-${sar.status.toLowerCase()}`}>
                            {sar.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewSAR(sar._id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              className="action-btn download-btn"
                              onClick={() => handleDownloadSAR(sar._id)}
                              title="Download PDF"
                            >
                              📥
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Support Center Tab */}
        {activeTab === 'support' && (
          <AdminSupportCenter />
        )}
      </div>

      {/* Document View Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => {
          setShowDocumentModal(false);
          setSelectedDocument(null);
        }}>
          <div className="modal-content document-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 KYC Document</h2>
              <button className="close-btn" onClick={() => {
                setShowDocumentModal(false);
                setSelectedDocument(null);
              }}>
                ✕
              </button>
            </div>
            <div className="document-image-container">
              <img src={selectedDocument} alt="KYC Document" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => {
                setShowDocumentModal(false);
                setSelectedDocument(null);
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked User Details Modal */}
      {showBlockedUserModal && selectedBlockedUser && (
        <div className="modal-overlay" onClick={() => setShowBlockedUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>🚫 Blocked User Details</h2>
              <button className="modal-close" onClick={() => setShowBlockedUserModal(false)}>×</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              {/* User Information */}
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#667eea' }}>User Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.95rem' }}>
                  <div><strong>Name:</strong> {selectedBlockedUser.name}</div>
                  <div><strong>Email:</strong> {selectedBlockedUser.email}</div>
                  <div><strong>Phone:</strong> {selectedBlockedUser.phone}</div>
                  <div><strong>Age:</strong> {selectedBlockedUser.age}</div>
                  <div><strong>Gender:</strong> {selectedBlockedUser.gender}</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Wallet Address:</strong> 
                    <code style={{ display: 'block', background: '#fff', padding: '8px', borderRadius: '4px', marginTop: '5px', wordBreak: 'break-all' }}>
                      {selectedBlockedUser.walletAddress}
                    </code>
                  </div>
                </div>
              </div>

              {/* Block Information */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ borderBottom: '2px solid #ef4444', paddingBottom: '8px', marginBottom: '12px', color: '#ef4444' }}>Block Information</h4>
                <div style={{ fontSize: '0.95rem' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Status:</strong> 
                    <span style={{ 
                      marginLeft: '10px',
                      padding: '6px 12px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      BLOCKED
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Blocked At:</strong> {selectedBlockedUser.blockTimestamp ? new Date(selectedBlockedUser.blockTimestamp).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Violated Rules */}
              {selectedBlockedUser.violatedRules && selectedBlockedUser.violatedRules.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '12px' }}>Violated AML Rules ({selectedBlockedUser.violatedRules.length})</h4>
                  <div>
                    {selectedBlockedUser.violatedRules.map((rule, idx) => (
                      <div key={idx} style={{ 
                        background: '#fff', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <strong style={{ color: '#1f2937' }}>{rule.ruleName}</strong>
                          <span style={{ 
                            padding: '4px 10px',
                            background: rule.severity === 'critical' ? '#fee2e2' : rule.severity === 'high' ? '#fed7aa' : rule.severity === 'medium' ? '#fef3c7' : '#dbeafe',
                            color: rule.severity === 'critical' ? '#991b1b' : rule.severity === 'high' ? '#9a3412' : rule.severity === 'medium' ? '#92400e' : '#1e40af',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {rule.severity}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>{rule.reason}</div>
                        <div style={{ fontSize: '0.85rem', color: '#999' }}>
                          <strong>Detected:</strong> {new Date(rule.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Violation Display (for backward compatibility) */}
              {(!selectedBlockedUser.violatedRules || selectedBlockedUser.violatedRules.length === 0) && selectedBlockedUser.violatedRuleName && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '12px' }}>Violation Details</h4>
                  <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{selectedBlockedUser.violatedRuleName}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{selectedBlockedUser.violationDescription}</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowBlockedUserModal(false)}
                >
                  Close
                </button>
                <button 
                  className="unblock-btn"
                  onClick={() => {
                    handleUnblockUser(selectedBlockedUser._id);
                    setShowBlockedUserModal(false);
                  }}
                  style={{ 
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ✅ Unblock User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AML Rule Modal */}
      {showAMLModal && (
        <div className="modal-overlay" onClick={() => setShowAMLModal(false)}>
          <div className="modal-content aml-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRule ? '✏️ Edit AML Rule' : '➕ Create New AML Rule'}</h2>
              <button className="modal-close" onClick={() => setShowAMLModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveRule} className="aml-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Rule Name *</label>
                  <input
                    type="text"
                    value={amlFormData.name}
                    onChange={(e) => setAmlFormData({ ...amlFormData, name: e.target.value })}
                    required
                    placeholder="e.g., Large Transaction Alert"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={amlFormData.description}
                  onChange={(e) => setAmlFormData({ ...amlFormData, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe what this rule detects..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rule Type *</label>
                  <select
                    value={amlFormData.ruleType}
                    onChange={(e) => setAmlFormData({ ...amlFormData, ruleType: e.target.value })}
                    required
                  >
                    <option value="transaction_limit">Transaction Limit</option>
                    <option value="velocity">Velocity</option>
                    <option value="pattern">Pattern</option>
                    <option value="geographic">Geographic</option>
                    <option value="identity">Identity</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="compliance">Compliance</option>
                    <option value="watchlist">Watchlist</option>
                    <option value="threshold">Threshold</option>
                    <option value="frequency">Frequency</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Block Account *</label>
                  <select
                    value={amlFormData.blockTarget}
                    onChange={(e) => setAmlFormData({ ...amlFormData, blockTarget: e.target.value as 'sender' | 'receiver' | 'both' })}
                    required
                  >
                    <option value="sender">Sender</option>
                    <option value="receiver">Receiver</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Action *</label>
                  <input
                    type="text"
                    value="Block"
                    disabled
                    className="readonly-input"
                  />
                </div>

                <div className="form-group">
                  <label>Priority (1-10) *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={amlFormData.priority}
                    onChange={(e) => setAmlFormData({ ...amlFormData, priority: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-section-title">Parameters (Optional)</div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Threshold Amount</label>
                  <input
                    type="number"
                    value={amlFormData.parameters.threshold || ''}
                    onChange={(e) => setAmlFormData({ 
                      ...amlFormData, 
                      parameters: { ...amlFormData.parameters, threshold: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="e.g., 10000"
                  />
                </div>

                <div className="form-group">
                  <label>Max Amount</label>
                  <input
                    type="number"
                    value={amlFormData.parameters.maxAmount || ''}
                    onChange={(e) => setAmlFormData({ 
                      ...amlFormData, 
                      parameters: { ...amlFormData.parameters, maxAmount: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Amount</label>
                  <input
                    type="number"
                    value={amlFormData.parameters.minAmount || ''}
                    onChange={(e) => setAmlFormData({ 
                      ...amlFormData, 
                      parameters: { ...amlFormData.parameters, minAmount: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="e.g., 1000"
                  />
                </div>

                <div className="form-group">
                  <label>Max Transactions</label>
                  <input
                    type="number"
                    value={amlFormData.parameters.maxTransactions || ''}
                    onChange={(e) => setAmlFormData({ 
                      ...amlFormData, 
                      parameters: { ...amlFormData.parameters, maxTransactions: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Time Window (seconds)</label>
                <input
                  type="number"
                  value={amlFormData.parameters.timeWindow || ''}
                  onChange={(e) => setAmlFormData({ 
                    ...amlFormData, 
                    parameters: { ...amlFormData.parameters, timeWindow: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="e.g., 3600 (1 hour)"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={amlFormData.isActive}
                    onChange={(e) => setAmlFormData({ ...amlFormData, isActive: e.target.checked })}
                  />
                  <span>Rule is active</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAMLModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAR Details Modal */}
      {showSARModal && selectedSAR && (
        <div className="modal-overlay" onClick={() => setShowSARModal(false)}>
          <div className="modal-content sar-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>📋 SAR Report Details</h2>
              <button className="modal-close" onClick={() => setShowSARModal(false)}>×</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              {/* Report Header */}
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>{selectedSAR.reportId}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                  <div><strong>Generated:</strong> {formatDate(selectedSAR.blockTimestamp)}</div>
                  <div><strong>Status:</strong> <span className={`status-badge status-${selectedSAR.status.toLowerCase()}`}>{selectedSAR.status}</span></div>
                </div>
              </div>

              {/* Account Information */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '12px' }}>Account Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.95rem' }}>
                  <div><strong>Name:</strong> {selectedSAR.userDetails.name}</div>
                  <div><strong>Email:</strong> {selectedSAR.userDetails.email}</div>
                  <div><strong>Phone:</strong> {selectedSAR.userDetails.phone || 'N/A'}</div>
                  <div><strong>Age:</strong> {selectedSAR.userDetails.age || 'N/A'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Wallet:</strong> <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>{selectedSAR.walletAddress}</code></div>
                </div>
              </div>

              {/* Violation Details */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '12px' }}>Violation Details</h4>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Type:</strong> <span className={`badge badge-${getSeverityColor(selectedSAR.violationType)}`}>{selectedSAR.violationType.replace('_', ' ')}</span>
                </div>
                <div>
                  <strong>AML Rules Violated:</strong>
                  <div style={{ marginTop: '10px' }}>
                    {selectedSAR.violatedRules.map((rule, idx) => (
                      <div key={idx} style={{ 
                        background: '#fff', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <strong>{rule.ruleName}</strong>
                          <span className={`badge badge-${rule.severity}`}>{rule.severity.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>{rule.reason}</div>
                        <div style={{ fontSize: '0.85rem', color: '#999' }}>Detected: {formatDate(rule.timestamp)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              {selectedSAR.transactionDetails && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '12px' }}>Transaction Details</h4>
                  <div style={{ fontSize: '0.95rem' }}>
                    <div style={{ marginBottom: '8px' }}><strong>Hash:</strong> <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{selectedSAR.transactionDetails.transactionHash}</code></div>
                    <div style={{ marginBottom: '8px' }}><strong>Amount:</strong> {selectedSAR.transactionDetails.amount} ETH</div>
                    <div style={{ marginBottom: '8px' }}><strong>From:</strong> <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{selectedSAR.transactionDetails.from}</code></div>
                    <div style={{ marginBottom: '8px' }}><strong>To:</strong> <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{selectedSAR.transactionDetails.to}</code></div>
                    <div><strong>Timestamp:</strong> {formatDate(selectedSAR.transactionDetails.timestamp)}</div>
                  </div>
                </div>
              )}

              {/* Investigation Status */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '8px', marginBottom: '12px' }}>Investigation Status</h4>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Status:</label>
                  <select
                    value={selectedSAR.status}
                    onChange={(e) => setSelectedSAR({ ...selectedSAR, status: e.target.value as any })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Investigation Notes:</label>
                  <textarea
                    value={selectedSAR.investigationNotes || ''}
                    onChange={(e) => setSelectedSAR({ ...selectedSAR, investigationNotes: e.target.value })}
                    rows={4}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    placeholder="Enter investigation notes..."
                  />
                </div>
                {selectedSAR.reviewedBy && (
                  <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#666' }}>
                    <div>Reviewed by: {selectedSAR.reviewedBy.name} ({selectedSAR.reviewedBy.email})</div>
                    <div>Reviewed at: {formatDate(selectedSAR.reviewedAt!)}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowSARModal(false)}
                >
                  Close
                </button>
                <button 
                  className="action-btn download-btn"
                  onClick={() => handleDownloadSAR(selectedSAR._id)}
                >
                  📥 Download PDF
                </button>
                <button 
                  className="save-btn"
                  onClick={() => handleUpdateSARStatus(selectedSAR._id, selectedSAR.status, selectedSAR.investigationNotes || '')}
                >
                  💾 Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Transaction Details</h2>
              <button className="close-btn" onClick={() => setShowTransactionModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* Transaction Summary Card */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>
                  Transaction Amount
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                  {selectedTransaction.amount} ETH
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  {formatDate(selectedTransaction.timestamp)}
                </div>
              </div>

              {/* Wallet Addresses */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#333' }}>💼 Wallet Addresses</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '6px', fontWeight: '600' }}>
                      From (Sender):
                    </div>
                    <div style={{ 
                      background: 'white', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordBreak: 'break-all',
                      border: '1px solid #e0e0e0'
                    }}>
                      {selectedTransaction.from}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '6px', fontWeight: '600' }}>
                      To (Receiver):
                    </div>
                    <div style={{ 
                      background: 'white', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordBreak: 'break-all',
                      border: '1px solid #e0e0e0'
                    }}>
                      {selectedTransaction.to}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Hash */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#333' }}>🔗 Transaction Hash</h3>
                <div style={{ 
                  background: 'white', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                  border: '1px solid #e0e0e0'
                }}>
                  {selectedTransaction.transactionHash}
                </div>
              </div>

              {/* Additional Details */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#333' }}>ℹ️ Additional Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Block Number:</div>
                    <div style={{ fontWeight: '600' }}>{selectedTransaction.blockNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Transaction Type:</div>
                    <div style={{ fontWeight: '600' }}>Transfer</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Status:</div>
                    <div>
                      <span style={{ 
                        background: '#d4edda', 
                        color: '#155724', 
                        padding: '4px 12px', 
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}>
                        ✓ Completed
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Timestamp:</div>
                    <div style={{ fontWeight: '600' }}>{new Date(selectedTransaction.timestamp * 1000).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowTransactionModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Risk Breakdown Modal */}
      {showRiskModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowRiskModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎯 Risk Score Breakdown</h2>
              <button className="close-btn" onClick={() => setShowRiskModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* Overall Risk Score */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '8px' }}>
                  Total Risk Score
                </div>
                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                  {selectedTransaction.riskScore || 0}
                </div>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600',
                  padding: '8px 20px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  display: 'inline-block'
                }}>
                  {selectedTransaction.riskLevel || 'Low'} Risk
                </div>
              </div>

              {/* Transaction Details */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '12px', 
                marginBottom: '24px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>📊 Transaction Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.95rem' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>From:</span> {selectedTransaction.from}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>To:</span> {selectedTransaction.to}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Amount:</span> {selectedTransaction.amount} ETH
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Time:</span> {formatDate(selectedTransaction.timestamp)}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontWeight: 'bold' }}>Tx Hash:</span> <code style={{ fontSize: '0.85rem' }}>{selectedTransaction.transactionHash}</code>
                  </div>
                </div>
              </div>

              {/* Risk Level Guide */}
              <div style={{ marginBottom: '24px', padding: '16px', background: '#f0f7ff', borderRadius: '12px', border: '1px solid #d0e4ff' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>📋 Risk Level Guide</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ 
                      background: '#d4edda', 
                      color: '#155724', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontWeight: '600' 
                    }}>Low</span>
                    <span style={{ marginLeft: '8px', color: '#666' }}>1-40 points</span>
                  </div>
                  <div>
                    <span style={{ 
                      background: '#fff3cd', 
                      color: '#856404', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontWeight: '600' 
                    }}>Medium</span>
                    <span style={{ marginLeft: '8px', color: '#666' }}>41-80 points</span>
                  </div>
                  <div>
                    <span style={{ 
                      background: '#f8d7da', 
                      color: '#721c24', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontWeight: '600' 
                    }}>High</span>
                    <span style={{ marginLeft: '8px', color: '#666' }}>81-100 points</span>
                  </div>
                </div>
              </div>

              {/* Rule Breakdown */}
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>🛡️ AML Rules Evaluation</h3>
                {!selectedTransaction.ruleBreakdown || selectedTransaction.ruleBreakdown.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    background: '#f8f9fa', 
                    borderRadius: '12px',
                    color: '#666'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
                      No AML Violations Detected
                    </div>
                    <div>This transaction passed all AML rule checks</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedTransaction.ruleBreakdown.map((rule, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '12px', 
                          padding: '16px',
                          background: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>
                              {rule.ruleName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              Type: {rule.ruleType}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className={`severity-badge ${getSeverityColor(rule.severity)}`}>
                              {rule.severity}
                            </span>
                            <div style={{ 
                              background: '#667eea', 
                              color: 'white', 
                              padding: '6px 16px', 
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              fontSize: '0.95rem'
                            }}>
                              +{rule.riskPoints} points
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          background: '#f8f9fa', 
                          padding: '12px', 
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          color: '#444'
                        }}>
                          <strong>Reason:</strong> {rule.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-Block Warning */}
              {selectedTransaction.riskScore && selectedTransaction.riskScore >= 81 && (
                <div style={{ 
                  marginTop: '24px',
                  padding: '16px', 
                  background: '#fff3cd', 
                  border: '2px solid #ffc107',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '2rem' }}>⚠️</div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#856404' }}>
                      High Risk - Auto-Block Triggered
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#856404' }}>
                      This transaction triggered automatic account blocking due to high risk score. A SAR report has been generated.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowRiskModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUserForDetails && (
        <div className="modal-overlay" onClick={() => setShowUserDetailsModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 User Details</h2>
              <button className="close-btn" onClick={() => setShowUserDetailsModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* User Profile Header */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👤</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
                  {selectedUserForDetails.name}
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                  {selectedUserForDetails.email}
                </div>
              </div>

              {/* Personal Information */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#333' }}>📋 Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.95rem' }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Full Name:</div>
                    <div style={{ fontWeight: '500' }}>{selectedUserForDetails.name}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Email:</div>
                    <div style={{ fontWeight: '500' }}>{selectedUserForDetails.email}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Phone:</div>
                    <div style={{ fontWeight: '500' }}>{selectedUserForDetails.phone}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Age:</div>
                    <div style={{ fontWeight: '500' }}>{selectedUserForDetails.age} years</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Gender:</div>
                    <div style={{ fontWeight: '500' }}>{selectedUserForDetails.gender}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>User ID:</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '500' }}>{selectedUserForDetails._id}</div>
                  </div>
                </div>
              </div>

              {/* Wallet Information */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#333' }}>💼 Wallet Information</h3>
                <div>
                  <div style={{ color: '#666', marginBottom: '8px', fontWeight: '600' }}>Wallet Address:</div>
                  <div style={{ 
                    background: 'white', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    wordBreak: 'break-all',
                    border: '1px solid #e0e0e0'
                  }}>
                    {selectedUserForDetails.walletAddress || 'Not connected'}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#333' }}>🔐 Account Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.95rem' }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Account Status:</div>
                    <div>
                      <span style={{ 
                        background: selectedUserForDetails.accountStatus === 'BLOCKED' ? '#fee' : '#dfd', 
                        color: selectedUserForDetails.accountStatus === 'BLOCKED' ? '#c00' : '#060', 
                        padding: '4px 12px', 
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}>
                        {selectedUserForDetails.accountStatus === 'BLOCKED' ? '🚫 BLOCKED' : '✓ ACTIVE'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>KYC Status:</div>
                    <div>
                      <span style={{ 
                        background: (selectedUserForDetails as any).kycStatus === 'APPROVED' ? '#dfd' : 
                                   (selectedUserForDetails as any).kycStatus === 'PENDING' ? '#ffc' : 
                                   (selectedUserForDetails as any).kycStatus === 'REJECTED' ? '#fee' : '#eee', 
                        color: (selectedUserForDetails as any).kycStatus === 'APPROVED' ? '#060' : 
                               (selectedUserForDetails as any).kycStatus === 'PENDING' ? '#860' : 
                               (selectedUserForDetails as any).kycStatus === 'REJECTED' ? '#c00' : '#666',
                        padding: '4px 12px', 
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}>
                        {(selectedUserForDetails as any).kycStatus || 'NOT_SUBMITTED'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Joined Date:</div>
                    <div style={{ fontWeight: '500' }}>{formatDate(selectedUserForDetails.createdAt)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Wallet Verified:</div>
                    <div style={{ fontWeight: '500' }}>
                      {(selectedUserForDetails as any).isWalletVerified ? '✓ Yes' : '✗ No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Block History (if any) */}
              {(selectedUserForDetails as any).blockHistory && (selectedUserForDetails as any).blockHistory.length > 0 && (
                <div style={{ 
                  background: '#fff5f5', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #fdd'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#c00' }}>⚠️ Block History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(selectedUserForDetails as any).blockHistory.map((history: any, idx: number) => (
                      <div key={idx} style={{ 
                        background: 'white', 
                        padding: '12px', 
                        borderRadius: '8px',
                        border: '1px solid #fcc'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#c00', marginBottom: '6px' }}>
                          {history.ruleName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                          {history.reason}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#999' }}>
                          Blocked: {formatDate(history.blockedAt)}
                          {history.unblockedAt && ` | Unblocked: ${formatDate(history.unblockedAt)} by ${history.unblockedBy}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowUserDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for severity colors
const getSeverityColor = (severity: string): string => {
  const lowerSeverity = severity.toLowerCase();
  if (lowerSeverity.includes('critical')) return 'critical';
  if (lowerSeverity.includes('high')) return 'high';
  if (lowerSeverity.includes('medium')) return 'medium';
  if (lowerSeverity.includes('low')) return 'low';
  return 'medium';
};

export default AdminDashboard;
