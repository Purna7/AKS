'use client';

import { Card, Row, Col, Statistic } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useProviderStore } from '@/store/providerStore';

interface ProviderOverviewProps {
  onNavigate: (view: string) => void;
}

export default function ProviderOverview({ onNavigate }: ProviderOverviewProps) {
  const { providers, fetchProviders } = useProviderStore();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const getProviderColor = (name: string) => {
    const colors: Record<string, string> = {
      Azure: '#0089D6',
      AWS: '#FF9900',
      GCP: '#4285F4',
    };
    return colors[name] || '#666';
  };

  return (
    <Card 
      title="Cloud Provider Overview"
      extra={
        <a onClick={() => onNavigate('providers')} style={{ cursor: 'pointer' }}>
          View All
        </a>
      }
    >
      <Row gutter={[16, 16]}>
        {providers.map((provider) => (
          <Col xs={24} sm={8} key={provider.id}>
            <Card
              size="small"
              hoverable
              style={{
                borderLeft: `4px solid ${getProviderColor(provider.name)}`,
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('providers')}
            >
              <Statistic
                title={provider.name}
                value={provider.resource_count || 0}
                prefix={<CloudOutlined style={{ color: getProviderColor(provider.name) }} />}
                valueStyle={{ color: getProviderColor(provider.name), fontSize: '24px' }}
                suffix="resources"
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
