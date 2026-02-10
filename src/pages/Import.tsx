import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, Database, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { parseSkilineCSV } from '../data/csvParser';
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
        processFile(file);
      }
      // Reset so the same file can be re-selected
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
        <p className="text-snow-200/60 mt-1">Upload your Skiline CSV export or load demo data</p>
      </motion.div>

      {/* Drag & Drop Zone */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-ice-400 bg-ice-400/10'
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            }`}
            onClick={handleBrowseClick}
          >
            <div
              className={`p-4 rounded-full transition-colors duration-300 ${
                isDragging ? 'bg-ice-400/20' : 'bg-white/5'
              }`}
            >
              <Upload
                className={`w-8 h-8 transition-colors duration-300 ${
                  isDragging ? 'text-ice-400' : 'text-snow-200/50'
                }`}
              />
            </div>

            <div className="text-center">
              <p className="text-snow-100 font-medium">
                {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV file here'}
              </p>
              <p className="text-snow-200/50 text-sm mt-1">or click to browse</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-snow-200/40">
              <FileText className="w-3.5 h-3.5" />
              <span>Accepts .csv files from Skiline and similar trackers</span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-peak-800/80 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-3 text-ice-400">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success message */}
          {success && (
            <motion.div
              className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-pine-400/10 border border-pine-400/20"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle2 className="w-5 h-5 text-pine-400 flex-shrink-0 mt-0.5" />
              <p className="text-pine-400 text-sm">{success}</p>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>

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
              <span
                className={`text-sm font-medium ${store.isDemo ? 'text-powder-300' : 'text-pine-400'}`}
              >
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
