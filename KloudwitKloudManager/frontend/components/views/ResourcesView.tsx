'use client';

import { Card, Table, Tag, Space, Button, Input, Select, Typography, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useResourceStore } from '@/store/resourceStore';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

interface Resource {
  id: number;
  name: string;
  type: string;
  provider: string;
  location: string;
  status: string;
  created_at: string;
}

export default function ResourcesView() {
  const { resources, loading, fetchResources } = useResourceStore();
  const [searchText, setSearchText] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleRefresh = () => {
    message.loading('Refreshing resources...', 1);
    fetchResources();
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchText.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchText.toLowerCase());
    const matchesProvider = providerFilter === 'all' || resource.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  const columns: ColumnsType<Resource> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => {
        const colors: Record<string, string> = {
          Azure: 'blue',
          AWS: 'orange',
          GCP: 'green',
        };
        return <Tag color={colors[provider] || 'default'}>{provider}</Tag>;
      },
      filters: [
        { text: 'Azure', value: 'Azure' },
        { text: 'AWS', value: 'AWS' },
        { text: 'GCP', value: 'GCP' },
      ],
      onFilter: (value, record) => record.provider === value,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Running', value: 'running' },
        { text: 'Stopped', value: 'stopped' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Resources</Title>
        <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Search resources..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={providerFilter}
            onChange={setProviderFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Providers</Option>
            <Option value="Azure">Azure</Option>
            <Option value="AWS">AWS</Option>
            <Option value="GCP">GCP</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredResources}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} resources`,
          }}
        />
      </Card>
    </Space>
  );
}
