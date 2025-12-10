'use client';

import { Card, Typography, Progress } from 'antd';
import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

const { Title } = Typography;

export default function ResourceDistribution() {
  const { summary } = useDashboardStore();

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const total = summary.totalResources;

  return (
    <Card title="Resource Distribution by Type">
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>🖥️ Virtual Machines</span>
            <span>{summary.vmCount || 0}</span>
          </div>
          <Progress
            percent={calculatePercentage(summary.vmCount || 0, total)}
            strokeColor="#3b82f6"
            showInfo={false}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>💾 Storage</span>
            <span>{summary.storageCount || 0}</span>
          </div>
          <Progress
            percent={calculatePercentage(summary.storageCount || 0, total)}
            strokeColor="#10b981"
            showInfo={false}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>🌐 Networks</span>
            <span>{summary.networkCount || 0}</span>
          </div>
          <Progress
            percent={calculatePercentage(summary.networkCount || 0, total)}
            strokeColor="#f59e0b"
            showInfo={false}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>🗄️ Databases</span>
            <span>{summary.databaseCount || 0}</span>
          </div>
          <Progress
            percent={calculatePercentage(summary.databaseCount || 0, total)}
            strokeColor="#8b5cf6"
            showInfo={false}
          />
        </div>
      </div>
    </Card>
  );
}
