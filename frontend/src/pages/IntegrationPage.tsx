import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AccountBalance {
  amount: string;
  currency: string;
}

interface Account {
  id: string;
  name: string;
  balance: AccountBalance;
}

interface Amount {
  amount: string;
  currency: string;
}

interface Trade {
  id: string;
  payment_method_name: string;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: Amount;
  native_amount: Amount;
  created_at: string;
  resource: string;
  resource_path: string;
  trade: Trade;
}

const CoinbaseIntegration: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState<number>(1);

  const clientId = 'a13d5d98-7218-4d2c-9be2-b479aaf4aad9';
  const redirectUri = 'https://9b3b-185-5-68-206.ngrok-free.app/integration';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);

  const handleAuth = () => {
    const authUrl = `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=wallet:accounts:read,wallet:transactions:read`;
    window.location.href = authUrl;
  };

  const exchangeCodeForToken = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<{ access_token: string }>('http://localhost:5221/api/exchange-token', { code });
      setAccessToken(response.data.access_token);
    } catch (error) {
      setError('Failed to exchange code for token');
      console.error('Token exchange error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ data: Account[] }>('http://localhost:5221/api/fetch-accounts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAccounts(response.data.data);
    } catch (error) {
      setError('Failed to fetch accounts');
      console.error('Fetch accounts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!accessToken || !selectedAccount) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ data: Transaction[] }>(
        `http://localhost:5221/api/fetch-transactions?accountId=${selectedAccount}&page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setTransactions(response.data.data);
    } catch (error) {
      setError('Failed to fetch transactions');
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions();
    }
  }, [selectedAccount, page]);

  const renderAccounts = () => (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-2">Accounts:</h2>
      <ul className="space-y-2">
        {accounts.map((account) => (
          <li key={account.id} className="p-2 bg-gray-100 rounded">
            <button 
              onClick={() => setSelectedAccount(account.id)}
              className="w-full text-left"
            >
              <span className="font-medium">{account.name}</span>: {account.balance.amount} {account.balance.currency}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderTransactions = () => (
    <div>
      <h2 className="text-xl font-bold mb-2">Transactions:</h2>
      <ul className="space-y-2">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="p-2 bg-gray-100 rounded">
            <div className="font-medium">{transaction.type} - {transaction.status}</div>
            <div>Amount: {transaction.amount.amount} {transaction.amount.currency}</div>
            <div>Native Amount: {transaction.native_amount.amount} {transaction.native_amount.currency}</div>
            <div>Date: {new Date(transaction.created_at).toLocaleString()}</div>
            {transaction.trade && (
              <div>
                Trade ID: {transaction.trade.id}<br />
                Payment Method: {transaction.trade.payment_method_name}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <button 
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coinbase Integration</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div>
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try Again
          </button>
        </div>
      ) : accessToken ? (
        <div>
          <p className="mb-4 text-green-500">Successfully authenticated with Coinbase!</p>
          <button 
            onClick={fetchAccounts}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Fetch Accounts
          </button>
          {accounts.length > 0 && renderAccounts()}
          {selectedAccount && transactions.length > 0 && renderTransactions()}
        </div>
      ) : (
        <button 
          onClick={handleAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign in with Coinbase
        </button>
      )}
    </div>
  );
};

export default CoinbaseIntegration;