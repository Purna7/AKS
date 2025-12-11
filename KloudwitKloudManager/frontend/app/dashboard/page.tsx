'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Card, Row, Col, Statistic, Badge, Button, Space, Dropdown } from 'antd';
import {
  DashboardOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  ApartmentOutlined,
  DollarOutlined,
  SafetyOutlined,
  BellOutlined,
  SettingOutlined,
  SyncOutlined,
  GithubOutlined,
  AzureOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';

const { Header, Sider, Content } = Layout;

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedView, setSelectedView] = useState('dashboard');
  const [stats, setStats] = useState({
    totalResources: 0,
    activeProviders: 0,
    totalCost: 0,
    activeAlerts: 0,
  });

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'resources', icon: <CloudOutlined />, label: 'Resources' },
    { key: 'github', icon: <GithubOutlined />, label: 'GitHub Actions' },
    { key: 'azuredevops', icon: <AzureOutlined />, label: 'ADO Pipelines' },
    { key: 'providers', icon: <ApartmentOutlined />, label: 'Providers' },
    { key: 'costs', icon: <DollarOutlined />, label: 'Costs' },
    { key: 'compliance', icon: <SafetyOutlined />, label: 'Compliance' },
    { key: 'alerts', icon: <BellOutlined />, label: 'Alerts' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  useEffect(() => {
    // Fetch dashboard stats
    fetch('http://localhost:5000/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats({
          totalResources: data.total_resources || 0,
          activeProviders: data.active_providers || 0,
          totalCost: data.total_cost || 0,
          activeAlerts: data.active_alerts || 0,
        });
      })
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  const SummaryCard = ({ title, value, icon, color, gradient }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${gradient})`,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          height: '100%',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: `${color}20`,
              color: color,
              fontSize: '2rem',
            }}
          >
            {icon}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h3" color="white" fontWeight={700}>
              {value}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mt={0.5}>
              {title}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        style={{
          background: '#0f1419',
          borderRight: '1px solid #334155',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
            borderBottom: '2px solid #334155',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'white',
              color: '#0ea5e9',
            }}
          >
            K
          </Avatar>
          {!collapsed && (
            <Typography variant="h6" color="white" fontWeight={700}>
              kloudmanager
            </Typography>
          )}
        </Box>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedView]}
          onClick={(e) => setSelectedView(e.key)}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: 16,
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#141927',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #334155',
          }}
        >
          <Space>
            <IconButton
              onClick={() => setCollapsed(!collapsed)}
              sx={{ color: 'white' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </IconButton>
            <Breadcrumb
              items={[
                { title: '🏠 Home' },
                { title: 'Dashboard' },
              ]}
            />
          </Space>

          <Space>
            <Badge dot status="success">
              <Typography variant="body2" color="text.secondary">
                Syncing...
              </Typography>
            </Badge>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Box mb={3}>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Multi-Cloud Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time overview of your cloud resources
            </Typography>
          </Box>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Total Resources"
                value={stats.totalResources}
                icon="💻"
                color="#0ea5e9"
                gradient="rgba(14, 165, 233, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Active Providers"
                value={stats.activeProviders}
                icon="☁️"
                color="#10b981"
                gradient="rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Cost (30 days)"
                value={`$${stats.totalCost.toFixed(2)}`}
                icon="💰"
                color="#f59e0b"
                gradient="rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Active Alerts"
                value={stats.activeAlerts}
                icon="🔔"
                color="#ef4444"
                gradient="rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.15) 100%"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                title="Resource Distribution by Type"
                bordered={false}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">🖥️ Virtual Machines</Typography>
                      <Typography variant="body2" fontWeight={600}>0</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">💾 Storage</Typography>
                      <Typography variant="body2" fontWeight={600}>0</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">🌐 Networks</Typography>
                      <Typography variant="body2" fontWeight={600}>0</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">🗄️ Databases</Typography>
                      <Typography variant="body2" fontWeight={600}>0</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Space>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                title="Provider Status"
                bordered={false}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">☁️ AWS</Typography>
                    <Chip label="Connected" color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">☁️ Azure</Typography>
                    <Chip label="Connected" color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">☁️ GCP</Typography>
                    <Chip label="Not Configured" color="default" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">⚡ GitHub</Typography>
                    <Chip label="Connected" color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">🔷 Azure DevOps</Typography>
                    <Chip label="Connected" color="success" size="small" />
                  </Box>
                </Space>
              </Card>
            </Grid>
          </Grid>
        </Content>
      </Layout>
    </Layout>
  );
}
