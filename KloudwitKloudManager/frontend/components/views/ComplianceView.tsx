'use client';

import { Card, Table, Tag, Space, Typography, Spin } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useComplianceStore } from '@/store/complianceStore';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface NonCompliantResource {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  resource_group: string;
  location: string;
  policy_assignment: string;
  policy_definition: string;
  compliance_state: string;
}

export default function ComplianceView() {
  const { nonCompliantResources, loading, fetchNonCompliantResources } = useComplianceStore();

  useEffect(() => {
    fetchNonCompliantResources();
  }, [fetchNonCompliantResources]);

  const columns: ColumnsType<NonCompliantResource> = [
    {
      title: 'Resource Name',
      dataIndex: 'resource_name',
      key: 'resource_name',
      sorter: (a, b) => a.resource_name.localeCompare(b.resource_name),
    },
    {
      title: 'Type',
      dataIndex: 'resource_type',
      key: 'resource_type',
    },
    {
      title: 'Resource Group',
      dataIndex: 'resource_group',
      key: 'resource_group',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Policy Assignment',
      dataIndex: 'policy_assignment',
      key: 'policy_assignment',
      ellipsis: true,
    },
    {
      title: 'Policy Definition',
      dataIndex: 'policy_definition',
      key: 'policy_definition',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'compliance_state',
      key: 'compliance_state',
      render: (state: string) => (
        <Tag icon={<WarningOutlined />} color="error">
          {state.toUpperCase()}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading compliance data..." />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Compliance Overview</Title>
        {nonCompliantResources.length > 0 && (
          <Tag icon={<WarningOutlined />} color="error" style={{ fontSize: '14px', padding: '8px 16px' }}>
            {nonCompliantResources.length} Non-Compliant Resources
          </Tag>
        )}
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={nonCompliantResources}
          loading={loading}
          rowKey="resource_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} non-compliant resources`,
          }}
        />
      </Card>
    </Space>
  );
}
