import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCcw,
  DollarSign,
  TrendingUp,
  Coins,
  Cpu,
  History,
  Gamepad2,
  Globe,
  ChevronRight,
  X,
  TrendingDown,
  Activity,
  Info,
  ArrowRightLeft,
  Check,
  Clock,
} from "lucide-react";
import {
  fetchExchangeRates,
  fetchCurrencyAnalysis,
} from "../../services/ratesService";
import { CURRENCY_DATA } from "../../data/currencyData";
import { ExchangeRate } from "../../types";
import LoadingScreen from "../LoadingScreen";

interface ExchangeRateWithCalc extends ExchangeRate {
  calculatedRate: number;
}

const RatesTab: React.FC = () => {
  // Data State
  const [rates, setRates] = useState<ExchangeRate[]>(CURRENCY_DATA);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filter & Calc State
  const [searchQuery, setSearchQuery] = useState("");
  const [baseAmount, setBaseAmount] = useState(1);
  const [activeCategory, setActiveCategory] = useState<
    "All" | "Fiat" | "Crypto" | "Historical" | "Fictional"
  >("All");

  // Base Currency State
  const [baseCurrencyCode, setBaseCurrencyCode] = useState("USD");
  const [showBaseSelector, setShowBaseSelector] = useState(false);
  const [baseSearchQuery, setBaseSearchQuery] = useState("");

  // Detail View State
  const [selectedCurrency, setSelectedCurrency] =
    useState<ExchangeRateWithCalc | null>(null);
  const [currencyAnalysis, setCurrencyAnalysis] = useState<{
    history: string;
    economics: string;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadRates = async () => {
    setLoading(true);
    try {
      const data = await fetchExchangeRates();
      if (data && data.length > 0) {
        setRates(data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Failed to refresh rates", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  useEffect(() => {
    if (selectedCurrency) {
      setAnalyzing(true);
      setCurrencyAnalysis(null);
      fetchCurrencyAnalysis(selectedCurrency.currencyName)
        .then((data) => {
          setCurrencyAnalysis(data);
          setAnalyzing(false);
        })
        .catch(() => setAnalyzing(false));
    }
  }, [selectedCurrency]);

  // --- DERIVED DATA & MATH ---

  // 1. Find the rate of the currently selected Base Currency relative to USD
  // If base is USD, rate is 1.0. If base is EUR (0.92), we divide target rates by 0.92.
  const baseCurrencyRate = useMemo(() => {
    const base = rates.find((r) => r.currencyCode === baseCurrencyCode);
    return base ? base.rate : 1.0;
  }, [rates, baseCurrencyCode]);

  const baseCurrencySymbol = useMemo(() => {
    const base = rates.find((r) => r.currencyCode === baseCurrencyCode);
    return base ? base.symbol : "$";
  }, [rates, baseCurrencyCode]);

  // 2. Filter and Recalculate Rates
  const displayedRates = useMemo(() => {
    return rates
      .filter((r) => {
        const matchesSearch =
          r.currencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.currencyCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          activeCategory === "All" || r.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .map((r) => ({
        ...r,
        // Calculate relative rate: Target Rate (in USD) / Base Rate (in USD)
        calculatedRate: r.rate / baseCurrencyRate,
      }));
  }, [rates, searchQuery, activeCategory, baseCurrencyRate]);

  // 3. Filter for Base Selector Modal
  const baseSelectorOptions = useMemo(() => {
    return rates.filter(
      (r) =>
        r.currencyName.toLowerCase().includes(baseSearchQuery.toLowerCase()) ||
        r.currencyCode.toLowerCase().includes(baseSearchQuery.toLowerCase()),
    );
  }, [rates, baseSearchQuery]);

  // --- UI HELPERS ---

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case "Crypto":
        return <Cpu className="w-5 h-5" />;
      case "Historical":
        return <History className="w-5 h-5" />;
      case "Fictional":
        return <Gamepad2 className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "Crypto":
        return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20";
      case "Historical":
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      case "Fictional":
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
      default:
        return "bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700";
    }
  };

  return (
    <>
      <div className="h-full flex flex-col pb-24 bg-academic-bg dark:bg-stone-950 animate-in fade-in duration-700 ease-out">
        {/* HEADER AREA */}
        <div className="flex-none p-4 sm:p-6 border-b border-academic-line dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm relative z-20 transition-colors duration-500">
          {/* Top Row: Title & Update */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-academic-gold to-orange-500 flex items-center justify-center text-white shadow-lg hidden sm:flex">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-academic-text dark:text-stone-100 tracking-tight">
                  Exchange
                </h1>
                <button
                  onClick={() => setShowBaseSelector(true)}
                  className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-stone-500 dark:text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 transition-colors mt-0.5 group"
                >
                  Base:{" "}
                  <span className="font-bold text-academic-text dark:text-stone-200 border-b border-dotted border-stone-400 group-hover:border-academic-accent">
                    {baseCurrencyCode} ({baseCurrencySymbol})
                  </span>{" "}
                  <RefreshCcw className="w-3 h-3 ml-1 opacity-50" />
                </button>
              </div>
            </div>
            <button
              onClick={loadRates}
              disabled={loading}
              className={`p-3 rounded-full bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-academic-accent dark:hover:text-indigo-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all ${!loading && "group"}`}
            >
              <RefreshCcw
                className={`w-5 h-5 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
              />
            </button>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {/* Search */}
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-academic-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Find currency..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-serif focus:border-academic-accent dark:focus:border-indigo-500 focus:ring-1 focus:ring-academic-accent dark:focus:ring-indigo-500 outline-none text-academic-text dark:text-stone-200 transition-all placeholder:text-stone-400"
                />
              </div>
              {/* Amount Input */}
              <div className="relative w-36 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                  {baseCurrencySymbol}
                </span>
                <input
                  type="number"
                  value={baseAmount}
                  onChange={(e) =>
                    setBaseAmount(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-full pl-8 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-mono font-bold focus:border-academic-accent dark:focus:border-indigo-500 focus:ring-1 focus:ring-academic-accent dark:focus:ring-indigo-500 outline-none text-academic-text dark:text-stone-200 transition-all"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
              {["All", "Fiat", "Crypto", "Historical", "Fictional"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as any)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap active:scale-95
                            ${
                              activeCategory === cat
                                ? "bg-academic-text dark:bg-stone-100 text-white dark:text-stone-900 border-academic-text dark:border-stone-100 shadow-md"
                                : "bg-transparent text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-academic-accent dark:hover:border-indigo-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                            }`}
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* LIST CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 opacity-50">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce"></div>
              </div>
              <p className="text-sm font-serif text-stone-400">
                Loading market data...
              </p>
            </div>
          ) : displayedRates.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 opacity-50">
              <Search className="w-12 h-12 mb-4 text-stone-300" />
              <p className="text-sm font-serif text-stone-400">
                No currencies found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedRates.map((currency, idx) => (
                <button
                  key={`${currency.currencyCode}-${currency.category}-${idx}`}
                  onClick={() => setSelectedCurrency(currency)}
                  className="bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-academic-accent dark:hover:border-indigo-500 transition-all group active:scale-[0.98] cursor-pointer flex flex-col justify-between text-left h-28 relative overflow-hidden backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start w-full relative z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-colors shadow-sm ${getCategoryColor(currency.category)}`}
                      >
                        {getCategoryIcon(currency.category)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-academic-text dark:text-stone-200">
                            {currency.currencyCode}
                          </span>
                          {currency.currencyCode === baseCurrencyCode && (
                            <span className="text-[9px] bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-stone-500">
                              BASE
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-stone-400 uppercase tracking-wider truncate max-w-[120px]">
                          {currency.currencyName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex justify-between items-end w-full mt-2">
                    <div className="text-[9px] text-stone-400 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors">
                      Click to analyze
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-mono font-bold text-academic-accent dark:text-indigo-400 leading-none">
                        {(currency.calculatedRate * baseAmount).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits:
                              currency.calculatedRate < 0.01 ? 8 : 2,
                          },
                        )}
                      </span>
                      <span className="text-[10px] font-bold text-stone-300 dark:text-stone-600">
                        {currency.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-stone-50/50 dark:to-stone-800/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-12 text-center pb-8 opacity-60">
            <p className="text-[10px] font-mono text-stone-400 dark:text-stone-600 uppercase tracking-widest flex items-center justify-center gap-2">
              <Clock className="w-3 h-3" /> Updated:{" "}
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* --- BASE CURRENCY SELECTOR MODAL --- */}
      {showBaseSelector && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-stone-200 dark:border-stone-800">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/50">
              <div>
                <h3 className="text-lg font-serif font-bold text-academic-text dark:text-stone-100">
                  Select Base Currency
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  All rates will be converted relative to your selection.
                </p>
              </div>
              <button
                onClick={() => setShowBaseSelector(false)}
                className="p-2 bg-stone-200 dark:bg-stone-700 rounded-full hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
              >
                <X className="w-5 h-5 text-stone-600 dark:text-stone-300" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={baseSearchQuery}
                  onChange={(e) => setBaseSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-academic-accent dark:focus:ring-indigo-500 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-2 scroll-smooth">
              {baseSelectorOptions.length === 0 ? (
                <div className="text-center py-12 opacity-50">
                  <p className="text-sm font-serif italic text-stone-500">
                    No currencies found.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {baseSelectorOptions.map((curr, idx) => (
                    <button
                      key={`${curr.currencyCode}-${idx}`}
                      onClick={() => {
                        setBaseCurrencyCode(curr.currencyCode);
                        setShowBaseSelector(false);
                        setBaseSearchQuery("");
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group active:scale-[0.98]
                                    ${
                                      baseCurrencyCode === curr.currencyCode
                                        ? "bg-academic-accent dark:bg-indigo-600 text-white shadow-md"
                                        : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                                    }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold 
                                            ${baseCurrencyCode === curr.currencyCode ? "bg-white/20 text-white" : "bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400"}`}
                        >
                          {curr.symbol}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">
                            {curr.currencyCode}
                          </div>
                          <div
                            className={`text-xs ${baseCurrencyCode === curr.currencyCode ? "text-white/80" : "text-stone-400"}`}
                          >
                            {curr.currencyName}
                          </div>
                        </div>
                      </div>
                      {baseCurrencyCode === curr.currencyCode && (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- DETAIL OVERLAY --- */}
      {selectedCurrency && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300"
          onClick={() => setSelectedCurrency(null)}
        >
          <div
            className="w-full max-w-md bg-academic-bg dark:bg-stone-950 h-full shadow-2xl animate-in slide-in-from-right duration-500 ease-out p-0 overflow-y-auto relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Detail Header */}
            <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
              <button
                onClick={() => setSelectedCurrency(null)}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                {selectedCurrency.category} Asset
              </div>
            </div>

            {/* Hero Section */}
            <div className="bg-academic-accent dark:bg-indigo-900 pt-24 pb-12 px-8 text-white relative overflow-hidden rounded-b-[3rem] shadow-xl flex-shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-inner">
                  <span className="text-4xl">{selectedCurrency.symbol}</span>
                </div>
                <h2 className="text-3xl font-serif font-bold mb-2">
                  {selectedCurrency.currencyName}
                </h2>
                <div className="text-white/60 font-mono text-lg mb-6">
                  {selectedCurrency.currencyCode}
                </div>

                <div className="flex items-center justify-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
                  <div className="text-right">
                    <span className="block text-xs font-bold uppercase text-white/50 mb-1">
                      {baseCurrencyCode}
                    </span>
                    <span className="text-xl font-mono font-bold">
                      {baseAmount}
                    </span>
                  </div>
                  <ArrowRightLeft className="w-5 h-5 text-white/50" />
                  <div className="text-left">
                    <span className="block text-xs font-bold uppercase text-white/50 mb-1">
                      {selectedCurrency.currencyCode}
                    </span>
                    <span className="text-2xl font-mono font-bold text-academic-gold">
                      {(
                        selectedCurrency.calculatedRate * baseAmount
                      ).toLocaleString(undefined, {
                        maximumFractionDigits:
                          selectedCurrency.calculatedRate < 0.01 ? 8 : 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 p-8 space-y-8 bg-stone-50 dark:bg-stone-950">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-sm text-center">
                  <div className="w-10 h-10 mx-auto bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Market Trend
                  </span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                    Volatile
                  </span>
                </div>
                <div className="p-5 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-sm text-center">
                  <div className="w-10 h-10 mx-auto bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Trade Volume
                  </span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                    High Activity
                  </span>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-academic-gold" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Historical Context
                  </h3>
                </div>

                {analyzing ? (
                  <div className="space-y-3 animate-pulse p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
                    <div className="h-4 bg-stone-200 dark:bg-stone-800 w-full rounded"></div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-800 w-5/6 rounded"></div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-800 w-4/6 rounded"></div>
                  </div>
                ) : currencyAnalysis ? (
                  <div className="prose prose-stone dark:prose-invert prose-sm bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm text-justify">
                    <p className="font-serif leading-relaxed text-justify text-stone-600 dark:text-stone-300">
                      {currencyAnalysis.history}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-stone-400 italic text-center py-4">
                    Analysis unavailable.
                  </p>
                )}

                <div className="flex items-center gap-2 mb-2 mt-8">
                  <TrendingDown className="w-4 h-4 text-academic-gold" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Economic Profile
                  </h3>
                </div>

                {analyzing ? (
                  <div className="space-y-3 animate-pulse p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
                    <div className="h-4 bg-stone-200 dark:bg-stone-800 w-full rounded"></div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-800 w-5/6 rounded"></div>
                  </div>
                ) : currencyAnalysis ? (
                  <div className="prose prose-stone dark:prose-invert prose-sm bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm text-justify">
                    <p className="font-serif leading-relaxed text-justify text-stone-600 dark:text-stone-300">
                      {currencyAnalysis.economics}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RatesTab;
