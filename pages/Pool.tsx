
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { PoolRequest, ServiceCategory, ExpertBid } from '../types';
import { getPoolEstimate } from '../services/geminiService';
import { Plus, DollarSign, Clock, CheckCircle, Briefcase, Loader2, ChevronDown, ChevronUp, X, Zap, Search, Filter } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const PoolSkeleton = () => (
  <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 md:p-8 animate-pulse">
     <div className="flex justify-between items-start mb-4">
        <div className="space-y-3 w-2/3">
           <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div>
           <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-white/10 rounded-full w-20"></div>
     </div>
     <div className="space-y-2 mb-6">
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-5/6"></div>
     </div>
     <div className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl"></div>
  </div>
);

const Pool: React.FC = () => {
  const { poolRequests, addPoolRequest, addBidToRequest, getApiKey, userProfile } = useApp();
  const { addToast } = useToast();
  const apiKey = getApiKey('google');
  const userRole = userProfile.role;
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isLoadingPool, setIsLoadingPool] = useState(true);
  
  // Creation State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.DESIGN);

  // Filtering & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Interaction State
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [biddingRequestId, setBiddingRequestId] = useState<string | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidTime, setBidTime] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingPool(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      addToast("Please set your API key first.", "error");
      return;
    }
    
    setIsEstimating(true);
    try {
        const estimate = await getPoolEstimate(apiKey, title, desc, category);
        
        const newReq: PoolRequest = {
        id: Date.now().toString(),
        title,
        description: desc,
        category,
        files: [],
        aiEstimate: estimate,
        status: 'OPEN',
        createdAt: Date.now(),
        bids: []
        };

        addPoolRequest(newReq);
        addToast("Request posted successfully", "success");
        setIsCreating(false);
        setTitle('');
        setDesc('');
    } catch (e) {
        addToast("Failed to create request", "error");
    } finally {
        setIsEstimating(false);
    }
  };

  const openBidForm = (reqId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBiddingRequestId(reqId);
    setBidPrice('');
    setBidTime('');
  };

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingRequestId) return;

    const newBid: ExpertBid = {
      expertId: 'exp-' + Date.now(),
      expertName: userProfile.name, 
      price: parseFloat(bidPrice),
      deliveryTime: bidTime
    };

    addBidToRequest(biddingRequestId, newBid);
    addToast("Proposal submitted!", "success");
    setExpandedRequestId(biddingRequestId);
    setBiddingRequestId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedRequestId(prev => prev === id ? null : id);
  };

  // Filter Logic
  const filteredRequests = poolRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || req.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] relative overflow-hidden">
      <AnimatedBackground />
      <div className="p-6 md:p-10 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Talent Pool</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {userRole === 'USER' ? 'Leverage AI insights. Hire top experts.' : 'Browse high-value requests matched to your skills.'}
              </p>
            </div>
            
            {userRole === 'USER' && !isCreating && (
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus size={20} /> New Request
              </button>
            )}
          </div>

          {/* Creation Form */}
          {isCreating && (
            <div className="mb-8 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Zap className="text-yellow-500" /> Draft Request</h2>
                 <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Project Title</label>
                    <input 
                      required 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/40 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                      placeholder="e.g. 3D Product Animation"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Category</label>
                    <div className="relative">
                       <select 
                          value={category}
                          onChange={e => setCategory(e.target.value as ServiceCategory)}
                          className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/40 focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                       >
                          {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Detailed Description</label>
                  <textarea 
                    required
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/40 focus:ring-2 focus:ring-primary/50 outline-none h-40"
                    placeholder="What do you need? Be specific about deliverables and timeline..."
                  />
                </div>
                
                <div className="flex justify-end gap-4 pt-2">
                  <button 
                    type="submit" 
                    disabled={isEstimating}
                    className="px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-black rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                  >
                    {isEstimating ? <Loader2 className="animate-spin" /> : <><Zap size={18} fill="currentColor" /> Analyze & Post</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters & Search Bar */}
          {!isCreating && (
            <div className="mb-8 flex flex-col lg:flex-row gap-4 animate-fade-in-up">
               {/* Search */}
               <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search requests..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  />
               </div>

               {/* Filters */}
               <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative min-w-[200px]">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <select 
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as ServiceCategory | 'ALL')}
                      className="w-full pl-12 pr-10 py-4 appearance-none bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>

                  <div className="flex bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-1">
                    {(['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          filterStatus === status 
                          ? 'bg-white dark:bg-white/10 shadow-sm text-primary' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {status === 'ALL' ? 'All' : status === 'IN_PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}

          <div className="grid gap-6">
            {isLoadingPool ? (
              <><PoolSkeleton /><PoolSkeleton /><PoolSkeleton /></>
            ) : (
              <>
                {filteredRequests.length === 0 && !isCreating ? (
                   <div className="text-center py-24 glass rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 animate-fade-in-up">
                    <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                       <Briefcase size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Requests Found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or search term.</p>
                    {userRole === 'USER' && (
                       <button onClick={() => {setIsCreating(true); setSearchTerm(''); setFilterCategory('ALL');}} className="text-primary font-bold hover:underline">Create new request</button>
                    )}
                  </div>
                ) : (
                  <>
                  {isEstimating && <PoolSkeleton />}
                  {filteredRequests.map(req => {
                      const isExpanded = expandedRequestId === req.id;
                      return (
                      <div 
                          key={req.id} 
                          onClick={() => toggleExpand(req.id)}
                          className={`group relative glass rounded-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden animate-fade-in-up ${isExpanded ? 'ring-2 ring-primary shadow-2xl bg-white dark:bg-[#0a0a0a]' : 'hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-xl'}`}
                      >
                          <div className="p-6 md:p-8">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                                  {req.category}
                                  </span>
                                  <span className="text-xs text-gray-400 font-medium">Posted {new Date(req.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{req.title}</h3>
                              </div>
                              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'OPEN' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                              {req.status.replace('_', ' ')}
                              </div>
                          </div>
                          
                          <div className={`text-gray-600 dark:text-gray-300 mb-6 leading-relaxed ${!isExpanded && 'line-clamp-2'}`}>
                              {req.description}
                          </div>

                          {/* AI Estimate Display */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl mb-6 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3 relative overflow-hidden">
                              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-200 shrink-0 z-10">
                                <Zap size={20} />
                              </div>
                              <div className="z-10">
                                <div className="text-xs font-bold uppercase text-blue-500 dark:text-blue-400 mb-1">AI Preliminary Estimate</div>
                                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium leading-snug">
                                    {req.aiEstimate}
                                </p>
                              </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/5">
                              <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                              <span className="flex items-center gap-2"><Clock size={16} /> {req.bids.length} Bids</span>
                              {req.files.length > 0 && <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Files attached</span>}
                              </div>
                              
                              <div className="flex items-center gap-4">
                              {userRole === 'EXPERT' && req.status === 'OPEN' && (
                                  <button 
                                  onClick={(e) => openBidForm(req.id, e)}
                                  className="bg-gray-900 dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                                  >
                                  Submit Proposal
                                  </button>
                              )}
                              <div className={`p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown size={20} />
                              </div>
                              </div>
                          </div>
                          </div>

                          {/* Expanded View - Bids */}
                          {isExpanded && (
                          <div className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-6 md:p-8">
                              <h4 className="font-bold mb-6 flex items-center gap-2 text-lg">
                              <Briefcase size={20} className="text-primary" />
                              Submitted Proposals
                              </h4>
                              
                              {req.bids.length === 0 ? (
                              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                  <p className="text-sm text-gray-500 font-medium">No bids yet. Be the first!</p>
                              </div>
                              ) : (
                              <div className="space-y-4">
                                  {req.bids.map((bid, idx) => (
                                  <div key={idx} className="bg-white dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-white/10 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm">
                                          {bid.expertName.charAt(0)}
                                      </div>
                                      <div>
                                          <div className="font-bold text-gray-900 dark:text-white">{bid.expertName}</div>
                                          <div className="text-xs font-medium text-gray-500">Delivery in {bid.deliveryTime}</div>
                                      </div>
                                      </div>
                                      <div className="font-black text-green-600 dark:text-green-400 text-xl">
                                      ${bid.price}
                                      </div>
                                  </div>
                                  ))}
                              </div>
                              )}
                          </div>
                          )}
                      </div>
                      );
                  })}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bid Submission Modal */}
      {biddingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setBiddingRequestId(null)}>
          <div 
            className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] max-w-md w-full shadow-2xl border border-white/20 animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">Submit Proposal</h3>
              <button onClick={() => setBiddingRequestId(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBidSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Your Price ($)</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-4 top-4 text-gray-400" />
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={bidPrice}
                    onChange={e => setBidPrice(e.target.value)}
                    className="w-full pl-10 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary/50 outline-none font-bold text-lg" 
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Delivery Time</label>
                <input 
                  required 
                  type="text"
                  value={bidTime}
                  onChange={e => setBidTime(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary/50 outline-none" 
                  placeholder="e.g. 2 days"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setBiddingRequestId(null)}
                  className="flex-1 py-4 text-gray-600 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg transition-transform hover:scale-105"
                >
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pool;
    