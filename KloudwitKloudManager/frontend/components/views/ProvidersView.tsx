'use client';

import { Card, Row, Col, Space, Typography, Button, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useProviderStore } from '@/store/providerStore';

const { Title, Text } = Typography;

export default function ProvidersView() {
  const { providers, loading, fetchProviders, testConnection } = useProviderStore();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const getProviderIcon = (name: string) => {
    const icons: Record<string, string> = {
      Azure: '☁️',
      AWS: '☁️',
      GCP: '☁️',
    };
    return icons[name] || '☁️';
  };

  const getProviderColor = (name: string) => {
    const colors: Record<string, string> = {
      Azure: '#0089D6',
      AWS: '#FF9900',
      GCP: '#4285F4',
    };
    return colors[name] || '#666';
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Cloud Providers</Title>

      <Row gutter={[16, 16]}>
        {providers.map((provider) => (
          <Col xs={24} md={12} lg={8} key={provider.id}>
            <Card
              hoverable
              style={{
                borderLeft: `4px solid ${getProviderColor(provider.name)}`,
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <span style={{ fontSize: '32px' }}>{getProviderIcon(provider.name)}</span>
                    <Title level={4} style={{ margin: 0 }}>
                      {provider.name}
                    </Title>
                  </Space>
                  {provider.enabled ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Active
                    </Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="default">
                      Inactive
                    </Tag>
                  )}
                </div>

                <div>
                  <Text type="secondary">Resources</Text>
                  <Title level={3} style={{ margin: '4px 0' }}>
                    {provider.resource_count || 0}
                  </Title>
                </div>

                <div>
                  <Text type="secondary">Configuration</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>
                      <strong>Status:</strong>{' '}
                      {provider.enabled ? (
                        <Tag color="green">Configured</Tag>
                      ) : (
                        <Tag color="orange">Not Configured</Tag>
                      )}
                    </Text>
                  </div>
                </div>

                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={() => testConnection(provider.name)}
                  disabled={!provider.enabled}
                  block
                >
                  Test Connection
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
