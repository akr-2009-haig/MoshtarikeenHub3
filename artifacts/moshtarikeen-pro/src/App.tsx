import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "@/pages/Index";
import { ProApp } from "@/pro/ProApp";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, ArrowLeft } from "lucide-react";

const queryClient = new QueryClient();

function AppContent() {
  const [showPro, setShowPro] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {showPro ? (
        <motion.div key="pro" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} className="h-screen">
          <ProApp onExit={() => setShowPro(false)} />
        </motion.div>
      ) : (
        <motion.div key="base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {/* PRO Access Button */}
          <div className="fixed bottom-6 left-6 z-50" dir="rtl">
            <motion.button
              onClick={() => setShowPro(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-white text-sm shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #f59e0b 100%)',
                boxShadow: '0 8px 30px rgba(168,85,247,0.4), 0 0 60px rgba(168,85,247,0.15)',
              }}>
              <Crown size={16} />
              <span>النظام المتقدم PRO</span>
              <Sparkles size={12} className="text-amber-300" />
            </motion.button>
          </div>
          <Index />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
