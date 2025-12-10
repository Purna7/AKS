'use client';

import { Card, Row, Col, Statistic, Space, Typography, Spin } from 'antd';
import {
  CloudOutlined,
  DollarOutlined,
  DatabaseOutlined,
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import ResourceDistribution from '@/components/dashboard/ResourceDistribution';
import ProviderOverview from '@/components/dashboard/ProviderOverview';
import RecentAlerts from '@/components/dashboard/RecentAlerts';

const { Title } = Typography;

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const { summary, loading, fetchSummary } = useDashboardStore();

  useEffect(() => {
    fetchSummary();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Dashboard Overview</Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => onNavigate('resources')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="Total Resources"
              value={summary.totalResources}
              prefix={<DatabaseOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => onNavigate('providers')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="Active Providers"
              value={summary.totalProviders}
              prefix={<CloudOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => onNavigate('costs')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="Cost (30 days)"
              value={summary.totalCost}
              prefix={<DollarOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => onNavigate('alerts')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="Active Alerts"
              value={summary.totalAlerts}
              prefix={<BellOutlined style={{ color: '#ef4444' }} />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Resource Status */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Running Resources"
              value={summary.runningCount}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Stopped Resources"
              value={summary.stoppedCount}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Details */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ResourceDistribution />
        </Col>
        <Col xs={24} lg={12}>
          <ProviderOverview onNavigate={onNavigate} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <RecentAlerts onNavigate={onNavigate} />
        </Col>
      </Row>
    </Space>
  );
}
