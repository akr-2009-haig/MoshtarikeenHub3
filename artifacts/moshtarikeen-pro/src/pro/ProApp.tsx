import React, { useState } from 'react';
import { ProProvider } from './store/ProContext';
import { ProLayout } from './ProLayout';
import { ProDashboard } from './pages/ProDashboard';
import { ProAnalytics } from './pages/ProAnalytics';
import { ProSubscribers } from './pages/ProSubscribers';
import { ProOperations } from './pages/ProOperations';
import { ProFinancials } from './pages/ProFinancials';
import { ProReports } from './pages/ProReports';
import { ProAuditLogs } from './pages/ProAuditLogs';
import { ProSystemHealth } from './pages/ProSystemHealth';
import { ProSettings } from './pages/ProSettings';
import { ProFieldManager } from './pages/ProFieldManager';
import { ProProfitInquiry } from './pages/ProProfitInquiry';
import { ProTasks } from './pages/ProTasks';
import { ProNotifications } from './pages/ProNotifications';
import type { Tab } from './ProLayout';

interface ProAppProps {
  onExit: () => void;
}

function ProAppInner({ onExit }: ProAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <ProDashboard />;
      case 'analytics': return <ProAnalytics />;
      case 'subscribers': return <ProSubscribers />;
      case 'operations': return <ProOperations />;
      case 'financials': return <ProFinancials />;
      case 'reports': return <ProReports />;
      case 'inquiry': return <ProProfitInquiry />;
      case 'audit': return <ProAuditLogs />;
      case 'health': return <ProSystemHealth />;
      case 'backup': return <ProSystemHealth />;
      case 'tasks': return <ProTasks />;
      case 'notifications': return <ProNotifications />;
      case 'settings': return <ProSettings />;
      case 'fields': return <ProFieldManager />;
      default: return <ProDashboard />;
    }
  };

  return (
    <ProLayout activeTab={activeTab} onTabChange={setActiveTab} onExit={onExit}>
      {renderPage()}
    </ProLayout>
  );
}

export function ProApp({ onExit }: ProAppProps) {
  return (
    <ProProvider>
      <ProAppInner onExit={onExit} />
    </ProProvider>
  );
}
