import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './DownloadStatementModal.css';

interface Transaction {
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
  transactionType: string;
  blockNumber?: number;
}

interface DownloadStatementModalProps {
  transactions: Transaction[];
  currentWallet: string;
  onClose: () => void;
}

const DownloadStatementModal: React.FC<DownloadStatementModalProps> = ({
  transactions,
  currentWallet,
  onClose,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [error, setError] = useState('');

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleFilterTransactions = () => {
    setError('');

    if (!fromDate || !toDate) {
      setError('Please select both From and To dates');
      return;
    }

    // Set from date to start of day (00:00:00)
    const fromDateTime = new Date(fromDate);
    fromDateTime.setHours(0, 0, 0, 0);
    const from = fromDateTime.getTime() / 1000;

    // Set to date to end of day (23:59:59)
    const toDateTime = new Date(toDate);
    toDateTime.setHours(23, 59, 59, 999);
    const to = toDateTime.getTime() / 1000;

    if (from > to) {
      setError('From date cannot be after To date');
      return;
    }

    const filtered = transactions.filter(tx => {
      return tx.timestamp >= from && tx.timestamp <= to;
    });

    setFilteredTransactions(filtered);
    setShowTransactions(true);
  };

  // Calculate statement statistics
  const calculateStatistics = () => {
    if (!fromDate || filteredTransactions.length === 0) {
      return {
        openingBalance: '0.0000',
        totalDeposits: '0.0000',
        totalWithdrawals: '0.0000',
        closingBalance: '0.0000'
      };
    }

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let openingBalance = 0;

    // Calculate opening balance (all transactions before start date)
    const fromDateTime = new Date(fromDate);
    fromDateTime.setHours(0, 0, 0, 0);
    const from = fromDateTime.getTime() / 1000;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      
      if (tx.timestamp < from) {
        // Calculate opening balance
        if (tx.to.toLowerCase() === currentWallet.toLowerCase()) {
          openingBalance += amount;
        } else if (tx.from.toLowerCase() === currentWallet.toLowerCase()) {
          openingBalance -= amount;
        }
      }
    });

    // Calculate deposits and withdrawals in the selected period
    filteredTransactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      
      if (tx.to.toLowerCase() === currentWallet.toLowerCase()) {
        totalDeposits += amount;
      } else if (tx.from.toLowerCase() === currentWallet.toLowerCase()) {
        totalWithdrawals += amount;
      }
    });

    const closingBalance = openingBalance + totalDeposits - totalWithdrawals;

    return {
      openingBalance: openingBalance.toFixed(4),
      totalDeposits: totalDeposits.toFixed(4),
      totalWithdrawals: totalWithdrawals.toFixed(4),
      closingBalance: closingBalance.toFixed(4)
    };
  };

  const handleDownloadCSV = () => {
    if (filteredTransactions.length === 0) {
      setError('No transactions to download');
      return;
    }

    const stats = calculateStatistics();

    // Create CSV content with summary
    let csvContent = 'ChainSecure Transaction Statement\n';
    csvContent += `Period: ${fromDate} to ${toDate}\n`;
    csvContent += `Wallet: ${currentWallet}\n\n`;
    csvContent += 'ACCOUNT SUMMARY\n';
    csvContent += `Opening Balance,${stats.openingBalance} ETH\n`;
    csvContent += `Total Deposits,${stats.totalDeposits} ETH\n`;
    csvContent += `Total Withdrawals,${stats.totalWithdrawals} ETH\n`;
    csvContent += `Closing Balance,${stats.closingBalance} ETH\n\n`;
    csvContent += 'TRANSACTION DETAILS\n';
    csvContent += 'Type,Transaction Hash,From,To,Amount (ETH),Block Number,Date & Time\n';
    
    filteredTransactions.forEach(tx => {
      const type = tx.from.toLowerCase() === currentWallet.toLowerCase() ? 'SENT' : 'RECEIVED';
      const row = [
        type,
        tx.transactionHash,
        tx.from,
        tx.to,
        tx.amount,
        tx.blockNumber || 'N/A',
        formatDate(tx.timestamp)
      ].map(field => `"${field}"`).join(',');
      csvContent += row + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ChainSecure_Statement_${fromDate}_to_${toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (filteredTransactions.length === 0) {
      setError('No transactions to download');
      return;
    }

    const stats = calculateStatistics();
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('ChainSecure Transaction Statement', 14, 20);

    // Add date range and wallet info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${fromDate} to ${toDate}`, 14, 30);
    doc.text(`Wallet: ${currentWallet}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

    // Add Account Summary Box
    doc.setFillColor(102, 126, 234);
    doc.rect(14, 48, 182, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('ACCOUNT SUMMARY', 16, 53);

    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(`Opening Balance: ${stats.openingBalance} ETH`, 16, 62);
    doc.text(`Total Deposits: ${stats.totalDeposits} ETH`, 16, 68);
    doc.text(`Total Withdrawals: ${stats.totalWithdrawals} ETH`, 16, 74);
    doc.setFont('helvetica', 'bold');
    doc.text(`Closing Balance: ${stats.closingBalance} ETH`, 16, 80);
    doc.setFont('helvetica', 'normal');

    // Transaction Details Header
    doc.setFillColor(102, 126, 234);
    doc.rect(14, 86, 182, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('TRANSACTION DETAILS', 16, 91);

    // Prepare table data
    const tableData = filteredTransactions.map(tx => {
      const type = tx.from.toLowerCase() === currentWallet.toLowerCase() ? 'SENT' : 'RECEIVED';
      return [
        type,
        formatAddress(tx.transactionHash),
        formatAddress(tx.from),
        formatAddress(tx.to),
        tx.amount + ' ETH',
        tx.blockNumber || 'N/A',
        formatDate(tx.timestamp)
      ];
    });

    // Add table
    autoTable(doc, {
      startY: 97,
      head: [['Type', 'Hash', 'From', 'To', 'Amount', 'Block', 'Date & Time']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'left', cellWidth: 25 },
        2: { halign: 'left', cellWidth: 25 },
        3: { halign: 'left', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'left', cellWidth: 40 }
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 97 }
    });

    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`ChainSecure_Statement_${fromDate}_to_${toDate}.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="statement-modal-content">
        <div className="modal-header">
          <h2>📥 Download Statement</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="statement-modal-body">
          {/* Date Range Selection */}
          {!showTransactions && (
            <div className="date-selection-section">
              <p className="date-instruction">Select date range to filter transactions:</p>
              
              <div className="date-inputs">
                <div className="input-group">
                  <label>From Date *</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="input-group">
                  <label>To Date *</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <button className="filter-btn" onClick={handleFilterTransactions}>
                🔍 Filter Transactions
              </button>
            </div>
          )}

          {/* Filtered Transactions Display */}
          {showTransactions && (() => {
            const stats = calculateStatistics();
            return (
            <div className="filtered-transactions-section">
              <div className="filter-summary">
                <p>📅 Period: <strong>{fromDate}</strong> to <strong>{toDate}</strong></p>
                <p>📊 Total Transactions: <strong>{filteredTransactions.length}</strong></p>
              </div>

              {/* Account Summary */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                color: 'white'
              }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>💰 Account Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Opening Balance</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px' }}>{stats.openingBalance} ETH</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Closing Balance</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px' }}>{stats.closingBalance} ETH</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Deposits</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px', color: '#4ade80' }}>+{stats.totalDeposits} ETH</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Withdrawals</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px', color: '#f87171' }}>-{stats.totalWithdrawals} ETH</div>
                  </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="no-transactions">
                  <p>No transactions found in the selected date range</p>
                  <button className="back-btn" onClick={() => setShowTransactions(false)}>
                    ← Change Date Range
                  </button>
                </div>
              ) : (
                <>
                  <div className="transactions-preview">
                    <table className="statement-table">
                      <thead>
                        <tr>
                          <th>TYPE</th>
                          <th>HASH</th>
                          <th>FROM</th>
                          <th>TO</th>
                          <th>AMOUNT</th>
                          <th>DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((tx, index) => (
                          <tr key={index}>
                            <td>
                              <span className={`tx-badge ${tx.from.toLowerCase() === currentWallet.toLowerCase() ? 'sent' : 'received'}`}>
                                {tx.from.toLowerCase() === currentWallet.toLowerCase() ? 'SENT' : 'RECEIVED'}
                              </span>
                            </td>
                            <td className="hash-cell">{formatAddress(tx.transactionHash)}</td>
                            <td className="address-cell">{formatAddress(tx.from)}</td>
                            <td className="address-cell">{formatAddress(tx.to)}</td>
                            <td className="value-cell">{tx.amount} ETH</td>
                            <td className="time-cell">{formatDate(tx.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="statement-actions">
                    <button className="back-btn" onClick={() => setShowTransactions(false)}>
                      ← Change Date Range
                    </button>
                    <button className="download-csv-btn" onClick={handleDownloadCSV}>
                      📊 Download CSV
                    </button>
                    <button className="download-pdf-btn" onClick={handleDownloadPDF}>
                      📄 Download PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          );
          })()}
        </div>
      </div>
    </div>
  );
};

export default DownloadStatementModal;
