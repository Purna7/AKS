'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, theme, Switch, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  CloudOutlined,
  DatabaseOutlined,
  DollarOutlined,
  SafetyOutlined,
  BellOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import DashboardView from '@/components/views/DashboardView';
import ResourcesView from '@/components/views/ResourcesView';
import ProvidersView from '@/components/views/ProvidersView';
import CostsView from '@/components/views/CostsView';
import ComplianceView from '@/components/views/ComplianceView';
import AlertsView from '@/components/views/AlertsView';
import SettingsView from '@/components/views/SettingsView';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type ViewKey = 'dashboard' | 'resources' | 'providers' | 'costs' | 'compliance' | 'alerts' | 'settings';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<ViewKey>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
    document.body.setAttribute('data-theme', checked ? 'dark' : 'light');
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'resources',
      icon: <DatabaseOutlined />,
      label: 'Resources',
    },
    {
      key: 'providers',
      icon: <CloudOutlined />,
      label: 'Providers',
    },
    {
      key: 'costs',
      icon: <DollarOutlined />,
      label: 'Costs',
    },
    {
      key: 'compliance',
      icon: <SafetyOutlined />,
      label: 'Compliance',
    },
    {
      key: 'alerts',
      icon: <BellOutlined />,
      label: 'Alerts',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'resources':
        return <ResourcesView />;
      case 'providers':
        return <ProvidersView />;
      case 'costs':
        return <CostsView />;
      case 'compliance':
        return <ComplianceView />;
      case 'alerts':
        return <AlertsView />;
      case 'settings':
        return <SettingsView isDarkMode={isDarkMode} onThemeChange={handleThemeChange} />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '18px' : '20px',
            fontWeight: 'bold',
            padding: '0 16px',
          }}
        >
          {collapsed ? 'KM' : 'kloudmanager'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentView]}
          items={menuItems}
          onClick={({ key }) => setCurrentView(key as ViewKey)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space>
            {collapsed ? (
              <MenuUnfoldOutlined
                style={{ fontSize: '18px', cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                style={{ fontSize: '18px', cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
            <Text strong style={{ fontSize: '16px' }}>
              kloudmanager - Multi-Cloud Management Platform
            </Text>
          </Space>
          <Space>
            <SunOutlined />
            <Switch checked={isDarkMode} onChange={handleThemeChange} />
            <MoonOutlined />
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderView()}
        </Content>
      </Layout>
    </Layout>
  );
}
