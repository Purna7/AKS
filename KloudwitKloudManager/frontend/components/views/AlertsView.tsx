'use client';

import { Card, List, Tag, Space, Typography, Empty } from 'antd';
import { BellOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useAlertStore } from '@/store/alertStore';

const { Title, Text } = Typography;

export default function AlertsView() {
  const { alerts, loading, fetchAlerts } = useAlertStore();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <BellOutlined />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Alerts & Notifications</Title>

      <Card>
        {alerts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No alerts at this time"
          />
        ) : (
          <List
            dataSource={alerts}
            loading={loading}
            renderItem={(alert: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={getSeverityIcon(alert.severity)}
                  title={
                    <Space>
                      <Text strong>{alert.title}</Text>
                      <Tag color={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text>{alert.message}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </Space>
  );
}
