'use client';

import { Card, Space, Typography, Switch, Divider, Row, Col } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SettingsViewProps {
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
}

export default function SettingsView({ isDarkMode, onThemeChange }: SettingsViewProps) {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Settings</Title>

      <Card title="Appearance">
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              <Text strong>Theme</Text>
              <Text type="secondary">Choose between light and dark theme</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <SunOutlined style={{ fontSize: '18px' }} />
              <Switch checked={isDarkMode} onChange={onThemeChange} />
              <MoonOutlined style={{ fontSize: '18px' }} />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="General">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size="small">
                <Text strong>Auto Refresh</Text>
                <Text type="secondary">Automatically refresh dashboard data</Text>
              </Space>
            </Col>
            <Col>
              <Switch defaultChecked />
            </Col>
          </Row>
          <Divider />
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size="small">
                <Text strong>Notifications</Text>
                <Text type="secondary">Enable desktop notifications for alerts</Text>
              </Space>
            </Col>
            <Col>
              <Switch defaultChecked />
            </Col>
          </Row>
        </Space>
      </Card>

      <Card title="About">
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>Product:</Text> <Text>kloudmanager</Text>
          </div>
          <div>
            <Text strong>Organization:</Text> <Text>Kloudwit Solutions Pvt Ltd</Text>
          </div>
          <div>
            <Text strong>Version:</Text> <Text>1.0.0</Text>
          </div>
          <div>
            <Text strong>Description:</Text>{' '}
            <Text>Enterprise-grade multi-cloud resource management platform</Text>
          </div>
        </Space>
      </Card>
    </Space>
  );
}
