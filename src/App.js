import React, { useState, useEffect } from 'react';
import { Wallet, Zap, Plus, ArrowUpDown, ArrowDownUp, TrendingUp, Star, Sparkles } from 'lucide-react';

const CosmicSwapDEX = () => {
  // Load Tailwind CSS dynamically
  React.useEffect(() => {
    const existingLink = document.querySelector('link[href*="tailwindcss"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.tailwindcss.com';
      document.head.appendChild(link);
    }
  }, []);
  const [account, setAccount] = useState('');
  const [balances, setBalances] = useState({
    BASED: '0',
    WBASED: '0',
    DUST: '0'
  });
  const [activeTab, setActiveTab] = useState('swap');
  const [swapAmount, setSwapAmount] = useState('');
  const [liquidityAmountA, setLiquidityAmountA] = useState('');
  const [liquidityAmountB, setLiquidityAmountB] = useState('');
  const [wrapAmount, setWrapAmount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedTokenFrom, setSelectedTokenFrom] = useState('DUST');
  const [selectedTokenTo, setSelectedTokenTo] = useState('WBASED');
  const [tokenSearch, setTokenSearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [liquidityTokenA, setLiquidityTokenA] = useState('DUST');
  const [liquidityTokenB, setLiquidityTokenB] = useState('WBASED');
  const [tradingTokens, setTradingTokens] = useState([
    {
      symbol: 'DUST',
      address: '0x44662d9491334A93e4D8B3aa73C4781fDE28A90F',
      lastPrice: '1.0000',
      volume24h: '125,432',
      change24h: '+2.5%'
    },
    {
      symbol: 'WBASED',
      address: '0x39f359d14108b6Ded21527Fe6Bbb9cF7322d21e4',
      lastPrice: '1.0000',
      volume24h: '98,765',
      change24h: '+1.2%'
    }
  ]);
  
  // Function to add new token to the list
  const addTokenToList = (tokenData) => {
    setTradingTokens(prev => {
      const exists = prev.find(t => t.address.toLowerCase() === tokenData.address.toLowerCase());
      if (exists) return prev;
      
      return [...prev, {
        symbol: tokenData.symbol || 'UNKNOWN',
        address: tokenData.address,
        lastPrice: '0.0000',
        volume24h: '0',
        change24h: '0%'
      }];
    });
  };

  // Function to search for token by address or symbol
  const searchToken = async (query) => {
    if (!query) return null;
    
    // Check if it's an address (starts with 0x and 42 chars)
    if (query.startsWith('0x') && query.length === 42) {
      // TODO: Call contract to get token info
      const tokenData = {
        symbol: 'TOKEN', // This would come from contract call
        address: query
      };
      addTokenToList(tokenData);
      return tokenData;
    }
    
    // Search existing tokens by symbol
    return tradingTokens.find(token => 
      token.symbol.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Token selector component
  const TokenSelector = ({ 
    value, 
    onChange, 
    placeholder = "Search token or paste address...",
    excludeToken = null 
  }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    
    const filteredTokens = tradingTokens.filter(token => {
      if (excludeToken && token.symbol === excludeToken) return false;
      if (!searchQuery) return true;
      return token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
             token.address.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleSelect = async (token) => {
      onChange(token.symbol);
      setSearchQuery('');
      setIsOpen(false);
    };

    const handleSearchChange = async (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      
      if (query.startsWith('0x') && query.length === 42) {
        const tokenData = await searchToken(query);
        if (tokenData) {
          handleSelect(tokenData);
        }
      }
    };

    return (
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={searchQuery || value}
            onChange={handleSearchChange}
            placeholder={placeholder}
            style={{
              backgroundColor: 'rgba(124, 58, 237, 0.6)',
              color: 'white',
              border: '1px solid #c084fc',
              borderRadius: '0.75rem',
              padding: '0.5rem 1rem',
              outline: 'none',
              flex: '1'
            }}
            onFocus={(e) => {
              setIsOpen(true);
              e.target.style.backgroundColor = 'rgba(124, 58, 237, 0.6)';
              e.target.style.color = 'white';
            }}
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-purple-600 hover:bg-purple-500 px-3 rounded-r-xl transition-colors text-white border border-purple-400 border-l-0"
            style={{
              backgroundColor: '#9333ea',
              color: 'white',
              border: '1px solid #c084fc',
              borderLeft: 'none',
              borderRadius: '0 0.75rem 0.75rem 0',
              padding: '0 0.75rem',
              cursor: 'pointer'
            }}
          >
            ▼
          </button>
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-purple-700 border border-purple-400 rounded-xl mt-1 max-h-48 overflow-y-auto z-50">
            {filteredTokens.map(token => (
              <button
                key={token.address}
                onClick={() => handleSelect(token)}
                className="w-full p-3 text-left hover:bg-purple-600 flex items-center justify-between text-white"
              >
                <div>
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-xs text-purple-200 font-mono">
                    {token.address.slice(0, 8)}...{token.address.slice(-6)}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-white">{token.lastPrice} WBASED</div>
                  <div className="text-xs text-purple-200">{token.volume24h}</div>
                </div>
              </button>
            ))}
            {filteredTokens.length === 0 && (
              <div className="p-3 text-purple-200 text-center">
                {searchQuery.startsWith('0x') ? 'Searching for token...' : 'No tokens found'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  const [recentActivity, setRecentActivity] = useState([
    { type: 'Swap', from: 'DUST', to: 'WBASED', amount: '1,250', user: '0x1234...5678', time: '2 min ago' },
    { type: 'Add Liquidity', token1: 'DUST', token2: 'WBASED', amount: '5,000', user: '0x9876...4321', time: '5 min ago' },
    { type: 'Swap', from: 'WBASED', to: 'DUST', amount: '850', user: '0x5555...9999', time: '8 min ago' }
  ]);

  // Contract addresses
  const CONTRACTS = {
    ROUTER: '0x6CcCC2AACd3C87cF03036fA53F20CA6f1d6C1798',
    DUST: '0x44662d9491334A93e4D8B3aa73C4781fDE28A90F',
    WBASED: '0x39f359d14108b6Ded21527Fe6Bbb9cF7322d21e4',
    FACTORY: '0xc00F5905595aFa3B1773C67f2856B18ce81b288B'
  };

  // BasedAI Network Configuration
  const BASEDAI_NETWORK = {
    chainId: '0x7E23', // 32323 in hex
    chainName: 'BasedAI',
    nativeCurrency: {
      name: 'BASED',
      symbol: 'BASED',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.basedaibridge.com/rpc/'],
    blockExplorerUrls: ['https://explorer.bf1337.org']
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or Rabby Wallet');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Add/Switch to BasedAI network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASEDAI_NETWORK.chainId }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASEDAI_NETWORK]
          });
        }
      }

      setAccount(accounts[0]);
      await updateBalances(accounts[0]);
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect wallet');
    }
    setIsConnecting(false);
  };

  const updateBalances = async (address) => {
    if (!window.ethereum || !address) return;

    try {
      const web3 = window.ethereum;
      
      // Get BASED balance
      const basedBalance = await web3.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert from wei to ether (simplified)
      const basedEther = parseInt(basedBalance, 16) / Math.pow(10, 18);
      
      setBalances(prev => ({
        ...prev,
        BASED: basedEther.toFixed(4)
      }));

      // TODO: Add ERC20 token balance calls for WBASED and DUST
      // This would require contract ABI and web3 library integration
      
    } catch (error) {
      console.error('Failed to update balances:', error);
    }
  };

  const executeSwap = async () => {
    if (!account || !swapAmount) {
      alert('Please connect wallet and enter amount');
      return;
    }

    try {
      // TODO: Implement actual contract interaction
      console.log(`Swapping ${swapAmount} ${selectedTokenFrom} for ${selectedTokenTo}`);
      alert(`Swap function called! (Implementation needed with web3 library)`);
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed');
    }
  };

  const addLiquidityHandler = async () => {
    if (!account || !liquidityAmountA || !liquidityAmountB) {
      alert('Please connect wallet and enter amounts');
      return;
    }

    try {
      // TODO: Implement actual contract interaction
      console.log(`Adding liquidity: ${liquidityAmountA} DUST, ${liquidityAmountB} WBASED`);
      alert(`Add liquidity function called! (Implementation needed with web3 library)`);
    } catch (error) {
      console.error('Add liquidity failed:', error);
      alert('Add liquidity failed');
    }
  };

  const wrapTokens = async () => {
    if (!account || !wrapAmount) {
      alert('Please connect wallet and enter amount');
      return;
    }

    try {
      // TODO: Implement actual contract interaction
      console.log(`Wrapping ${wrapAmount} BASED to WBASED`);
      alert(`Wrap function called! (Implementation needed with web3 library)`);
    } catch (error) {
      console.error('Wrap failed:', error);
      alert('Wrap failed');
    }
  };

  const unwrapTokens = async () => {
    if (!account || !wrapAmount) {
      alert('Please connect wallet and enter amount');
      return;
    }

    try {
      // TODO: Implement actual contract interaction
      console.log(`Unwrapping ${wrapAmount} WBASED to BASED`);
      alert(`Unwrap function called! (Implementation needed with web3 library)`);
    } catch (error) {
      console.error('Unwrap failed:', error);
      alert('Unwrap failed');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateBalances(accounts[0]);
        } else {
          setAccount('');
          setBalances({ BASED: '0', WBASED: '0', DUST: '0' });
        }
      });
    }
  }, []);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)',
        color: 'white'
      }}
    >
      {/* Animated Background Stars */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div 
          className="absolute animate-pulse top-20 left-20 w-2 h-2 bg-white rounded-full opacity-60"
          style={{
            position: 'absolute',
            top: '5rem',
            left: '5rem',
            width: '8px',
            height: '8px',
            backgroundColor: 'white',
            borderRadius: '50%',
            opacity: 0.6,
            animation: 'pulse 2s infinite'
          }}
        ></div>
        <div 
          className="absolute animate-pulse top-40 right-32 w-1 h-1 bg-purple-300 rounded-full opacity-80"
          style={{
            position: 'absolute',
            top: '10rem',
            right: '8rem',
            width: '4px',
            height: '4px',
            backgroundColor: '#d8b4fe',
            borderRadius: '50%',
            opacity: 0.8,
            animation: 'pulse 2s infinite'
          }}
        ></div>
        <div 
          className="absolute animate-pulse top-60 left-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-70"
          style={{
            position: 'absolute',
            top: '15rem',
            left: '33%',
            width: '6px',
            height: '6px',
            backgroundColor: '#93c5fd',
            borderRadius: '50%',
            opacity: 0.7,
            animation: 'pulse 2s infinite'
          }}
        ></div>
        <div 
          className="absolute animate-pulse bottom-40 right-20 w-2 h-2 bg-pink-300 rounded-full opacity-60"
          style={{
            position: 'absolute',
            bottom: '10rem',
            right: '5rem',
            width: '8px',
            height: '8px',
            backgroundColor: '#f9a8d4',
            borderRadius: '50%',
            opacity: 0.6,
            animation: 'pulse 2s infinite'
          }}
        ></div>
        <div 
          className="absolute animate-pulse bottom-60 left-16 w-1 h-1 bg-cyan-300 rounded-full opacity-80"
          style={{
            position: 'absolute',
            bottom: '15rem',
            left: '4rem',
            width: '4px',
            height: '4px',
            backgroundColor: '#67e8f9',
            borderRadius: '50%',
            opacity: 0.8,
            animation: 'pulse 2s infinite'
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 border-b border-purple-800/30 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CosmicSwap
            </h1>
            <p className="text-sm text-purple-300">First DEX on BasedAI</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-purple-300">BasedAI Network</p>
            <p className="text-xs text-purple-400">Chain ID: 32323</p>
          </div>
          
          {account ? (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full">
              <p className="text-sm font-medium">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              <Wallet className="w-5 h-5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Balance Cards */}
        {account && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Object.entries(balances).map(([token, balance]) => (
              <div key={token} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">{token} Balance</p>
                    <p className="text-2xl font-bold">{balance}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Interface */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-purple-500/20 overflow-hidden">
          {/* Tab Navigation */}
          <div 
            className="flex border-b border-purple-500/20"
            style={{ display: 'flex', borderBottom: '1px solid rgba(168, 85, 247, 0.2)' }}
          >
            {['swap', 'liquidity', 'wrap'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 p-4 text-center font-medium transition-all duration-300`}
                style={{
                  flex: '1',
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  background: activeTab === tab 
                    ? 'linear-gradient(90deg, rgba(147, 51, 234, 0.5) 0%, rgba(219, 39, 119, 0.5) 100%)'
                    : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activeTab === tab ? 'white' : '#d8b4fe'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.target.style.color = 'white';
                    e.target.style.backgroundColor = 'rgba(126, 34, 206, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.target.style.color = '#d8b4fe';
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {tab === 'swap' && <Zap className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />}
                  {tab === 'liquidity' && <Plus className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />}
                  {tab === 'wrap' && <ArrowUpDown className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Swap Tab */}
            {activeTab === 'swap' && (
                              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6 text-white">Swap Tokens</h2>
                
                <div className="space-y-4">
                  <div className="bg-purple-800/30 rounded-2xl p-4 border border-purple-500/30">
                    <label className="block text-sm text-purple-200 mb-2 font-medium">From</label>
                    <div className="flex space-x-4">
                      <div className="min-w-32">
                        <TokenSelector
                          value={selectedTokenFrom}
                          onChange={setSelectedTokenFrom}
                          excludeToken={selectedTokenTo}
                        />
                      </div>
                      <input
                        type="number"
                        placeholder="0.0"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          outline: 'none',
                          border: 'none',
                          flex: '1'
                        }}
                        onFocus={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'white';
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        const temp = selectedTokenFrom;
                        setSelectedTokenFrom(selectedTokenTo);
                        setSelectedTokenTo(temp);
                      }}
                      className="bg-purple-600 hover:bg-purple-500 rounded-full p-3 transition-colors border border-purple-400"
                    >
                      <ArrowDownUp className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  <div className="bg-purple-800/30 rounded-2xl p-4 border border-purple-500/30">
                    <label className="block text-sm text-purple-200 mb-2 font-medium">To</label>
                    <div className="flex space-x-4">
                      <div className="min-w-32">
                        <TokenSelector
                          value={selectedTokenTo}
                          onChange={setSelectedTokenTo}
                          excludeToken={selectedTokenFrom}
                        />
                      </div>
                      <div className="flex-1 text-2xl font-bold text-purple-100">
                        {swapAmount ? (parseFloat(swapAmount) * 0.997).toFixed(4) : '0.0'}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={executeSwap}
                  disabled={!account}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {account ? 'Swap Tokens' : 'Connect Wallet'}
                </button>
              </div>
            )}

            {/* Liquidity Tab */}
            {activeTab === 'liquidity' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">Add Liquidity</h2>
                
                <div className="space-y-4">
                  <div className="bg-purple-800/30 rounded-2xl p-4">
                    <label className="block text-sm text-purple-300 mb-2">Token A</label>
                    <div className="flex space-x-4">
                      <div className="min-w-32">
                        <TokenSelector
                          value={liquidityTokenA}
                          onChange={setLiquidityTokenA}
                          excludeToken={liquidityTokenB}
                          placeholder="Select Token A"
                        />
                      </div>
                      <input
                        type="number"
                        placeholder="0.0"
                        value={liquidityAmountA}
                        onChange={(e) => setLiquidityAmountA(e.target.value)}
                        className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder-purple-400"
                      />
                    </div>
                  </div>

                  <div className="bg-purple-800/30 rounded-2xl p-4">
                    <label className="block text-sm text-purple-300 mb-2">Token B</label>
                    <div className="flex space-x-4">
                      <div className="min-w-32">
                        <TokenSelector
                          value={liquidityTokenB}
                          onChange={setLiquidityTokenB}
                          excludeToken={liquidityTokenA}
                          placeholder="Select Token B"
                        />
                      </div>
                      <input
                        type="number"
                        placeholder="0.0"
                        value={liquidityAmountB}
                        onChange={(e) => setLiquidityAmountB(e.target.value)}
                        className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder-purple-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={addLiquidityHandler}
                  disabled={!account}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {account ? 'Add Liquidity' : 'Connect Wallet'}
                </button>
              </div>
            )}

            {/* Wrap Tab */}
            {activeTab === 'wrap' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">Wrap/Unwrap BASED</h2>
                
                <div className="bg-purple-800/30 rounded-2xl p-4">
                  <label className="block text-sm text-purple-300 mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={wrapAmount}
                    onChange={(e) => setWrapAmount(e.target.value)}
                    className="w-full bg-transparent text-2xl font-bold outline-none placeholder-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={wrapTokens}
                    disabled={!account}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                  >
                    Wrap BASED
                  </button>
                  <button
                    onClick={unwrapTokens}
                    disabled={!account}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                  >
                    Unwrap WBASED
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contract Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Tokens */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-bold mb-4 text-purple-300 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Trading Tokens
            </h3>
            <div className="space-y-3">
              {tradingTokens.map((token, index) => (
                <div key={token.symbol} className="bg-purple-800/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold">{token.symbol}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-purple-400 font-mono">
                            {token.address.slice(0, 6)}...{token.address.slice(-4)}
                          </span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(token.address)}
                            className="text-purple-400 hover:text-white transition-colors"
                            title="Copy address"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-300">Price (WBASED)</p>
                      <p className="font-bold">{token.lastPrice}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-purple-400">24h Volume</p>
                      <p className="font-semibold">{token.volume24h}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400">24h Change</p>
                      <p className={`font-semibold ${token.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {token.change24h}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-bold mb-4 text-purple-300 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="bg-purple-800/20 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'Swap' ? 'bg-blue-400' : 'bg-green-400'
                      }`}></div>
                      <span className="font-medium text-sm">{activity.type}</span>
                    </div>
                    <span className="text-xs text-purple-400">{activity.time}</span>
                  </div>
                  <div className="text-sm">
                    {activity.type === 'Swap' ? (
                      <p>
                        <span className="text-purple-300">{activity.amount}</span> {activity.from} → {activity.to}
                      </p>
                    ) : (
                      <p>
                        <span className="text-purple-300">{activity.amount}</span> {activity.token1}/{activity.token2}
                      </p>
                    )}
                    <p className="text-xs text-purple-400 font-mono">
                      {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicSwapDEX;