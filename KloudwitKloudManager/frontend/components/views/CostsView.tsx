'use client';

import { Card, Row, Col, Space, Typography, Statistic, List, Spin } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useCostStore } from '@/store/costStore';

const { Title, Text } = Typography;

export default function CostsView() {
  const { costData, loading, fetchCostData } = useCostStore();

  useEffect(() => {
    fetchCostData();
  }, [fetchCostData]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading cost data..." />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Cost Analysis</Title>

      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Statistic
              title="Total Cost (Last 30 Days)"
              value={costData.total_cost}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600', fontSize: '32px' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Text type="secondary">Period</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong>{costData.period}</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Cost by Service" bordered={false}>
            <List
              dataSource={costData.cost_by_service || []}
              renderItem={(item: any) => (
                <List.Item>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Text>{item.service}</Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      ${item.cost.toFixed(2)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Cost by Resource" bordered={false}>
            <List
              dataSource={costData.cost_by_resource || []}
              renderItem={(item: any) => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{item.resource_name}</Text>
                      <Text strong style={{ color: '#1890ff' }}>
                        ${item.cost.toFixed(2)}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.resource_type}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
