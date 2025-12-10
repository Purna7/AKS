'use client';

import { Card, List, Tag, Empty } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useAlertStore } from '@/store/alertStore';

interface RecentAlertsProps {
  onNavigate: (view: string) => void;
}

export default function RecentAlerts({ onNavigate }: RecentAlertsProps) {
  const { alerts, fetchAlerts } = useAlertStore();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'processing';
    }
  };

  const recentAlerts = alerts.slice(0, 5);

  return (
    <Card
      title="Recent Alerts"
      extra={
        <a onClick={() => onNavigate('alerts')} style={{ cursor: 'pointer' }}>
          View All
        </a>
      }
    >
      {recentAlerts.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No recent alerts"
          style={{ padding: '40px 0' }}
        />
      ) : (
        <List
          dataSource={recentAlerts}
          renderItem={(alert: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={getSeverityIcon(alert.severity)}
                title={
                  <>
                    {alert.title}{' '}
                    <Tag color={getSeverityColor(alert.severity)} style={{ marginLeft: 8 }}>
                      {alert.severity}
                    </Tag>
                  </>
                }
                description={alert.message}
              />
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(alert.timestamp).toLocaleString()}
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
