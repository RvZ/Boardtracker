import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, Database, Sparkles, Wifi, CreditCard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { parseSkilineCSV } from '../data/csvParser';
import { fetchSkilineData } from '../data/skilineFetcher';
import GlassCard from '../components/shared/GlassCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function Import() {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [keycard, setKeycard] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // --- Skiline Auto-Fetch ---
  const handleSkilineFetch = useCallback(async () => {
    if (!keycard.trim()) {
      setError('Enter your ski pass number first.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsFetching(true);

    try {
      const result = await fetchSkilineData(keycard);

      if (result.success && result.season) {
        store.importSeason(result.season);
        setSuccess(
          `Fetched "${result.season.name}" with ${result.season.days.length} ski day${result.season.days.length !== 1 ? 's' : ''} from Skiline.`
        );
      } else {
        setError(result.error || 'Could not fetch data from Skiline.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setIsFetching(false);
    }
  }, [keycard, store]);

  // --- CSV Import ---
  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuccess(null);
      setIsProcessing(true);

      try {
        const text = await file.text();
        const season = parseSkilineCSV(text);

        if (season.days.length === 0) {
          throw new Error('No valid ski days found in the CSV. Check the file format.');
        }

        store.importSeason(season);
        setSuccess(
          `Imported "${season.name}" with ${season.days.length} ski day${season.days.length !== 1 ? 's' : ''}.`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file.');
      } finally {
        setIsProcessing(false);
      }
    },
    [store]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        setError('Please drop a .csv file.');
      }
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.name.endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
          setError('Please select a .csv or text file.');
        } else {
          processFile(file);
        }
      }
      e.target.value = '';
    },
    [processFile]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLoadDemo = useCallback(() => {
    store.loadDemo();
    setError(null);
    setSuccess('Demo data loaded successfully.');
  }, [store]);

  return (
    <motion.div
      className="space-y-6 pb-8 max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-4xl text-snow-50 tracking-wide">Import Data</h1>
        <p className="text-snow-200/60 mt-1">Connect to Skiline, upload a CSV, or load demo data</p>
      </motion.div>

      {/* Skiline Auto-Fetch */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-5 h-5 text-ice-400" />
            <h2 className="font-display text-xl text-snow-50 tracking-wide">Connect to Skiline</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-ice-400/15 text-ice-300 border border-ice-400/30">
              AUTO
            </span>
          </div>

          <p className="text-snow-200/50 text-sm mb-4">
            Enter your ski pass number to automatically fetch your data. Find it printed on your ski pass (e.g. 01-1158-4-381384).
          </p>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-snow-200/30" />
              <input
                type="text"
                value={keycard}
                onChange={(e) => setKeycard(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSkilineFetch()}
                placeholder="01-1158-4-381384"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow-100 placeholder-snow-200/30 text-sm focus:outline-none focus:border-ice-400/50 focus:ring-1 focus:ring-ice-400/20 transition-all"
              />
            </div>
            <button
              onClick={handleSkilineFetch}
              disabled={isFetching || !keycard.trim()}
              className="px-5 py-3 rounded-xl bg-ice-400/15 border border-ice-400/30 text-ice-300 font-medium text-sm hover:bg-ice-400/25 hover:border-ice-400/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {isFetching ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fetching...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  Fetch Data
                </>
              )}
            </button>
          </div>

          <p className="text-snow-200/30 text-xs mt-3">
            Tries to connect directly to Skiline. If it can't connect (Skiline has no public API), you'll get instructions for the CSV method.
          </p>
        </GlassCard>
      </motion.div>

      {/* CSV Upload */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-powder-400" />
            <h2 className="font-display text-xl text-snow-50 tracking-wide">Upload CSV</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-powder-400/15 text-powder-300 border border-powder-400/30">
              MANUAL
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-ice-400 bg-ice-400/10'
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            }`}
            onClick={handleBrowseClick}
          >
            <Upload className={`w-6 h-6 ${isDragging ? 'text-ice-400' : 'text-snow-200/40'}`} />
            <div className="text-center">
              <p className="text-snow-100 text-sm font-medium">
                {isDragging ? 'Drop your CSV here' : 'Drag & drop CSV or click to browse'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-snow-200/30">
              <FileText className="w-3.5 h-3.5" />
              <span>Download CSV from app.skiline.cc &gt; My Skiline &gt; Season overview</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-peak-800/80 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-3 text-ice-400">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div
          className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          className="flex items-start gap-3 p-4 rounded-xl bg-pine-400/10 border border-pine-400/20"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle2 className="w-5 h-5 text-pine-400 flex-shrink-0 mt-0.5" />
          <p className="text-pine-400 text-sm">{success}</p>
        </motion.div>
      )}

      {/* Demo Data */}
      <motion.div variants={itemVariants}>
        <GlassCard className="text-center">
          <p className="text-snow-200/60 text-sm mb-4">No data yet? Try out the app with sample data.</p>
          <button
            onClick={handleLoadDemo}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-powder-400/15 border border-powder-400/30 text-powder-300 font-medium text-sm hover:bg-powder-400/25 hover:border-powder-400/50 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            Load Demo Data
          </button>
        </GlassCard>
      </motion.div>

      {/* Current Data Status */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <h2 className="font-display text-xl text-snow-50 tracking-wide mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-ice-400" />
            Data Status
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-snow-200/60 text-sm">Seasons loaded</span>
              <span className="text-snow-100 text-sm font-medium">{store.seasons.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-snow-200/60 text-sm">Total ski days</span>
              <span className="text-snow-100 text-sm font-medium">
                {store.seasons.reduce((sum, s) => sum + s.days.length, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-snow-200/60 text-sm">Data source</span>
              <span className={`text-sm font-medium ${store.isDemo ? 'text-powder-300' : 'text-pine-400'}`}>
                {store.isDemo ? 'Demo' : 'Imported'}
              </span>
            </div>
            {store.seasons.map((season) => (
              <div
                key={season.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0"
              >
                <span className="text-snow-200/60 text-sm">{season.name}</span>
                <span className="text-snow-200/50 text-xs">
                  {season.days.length} day{season.days.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
