import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import StoreProvider from '@/providers/StoreProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'kloudmanager - Multi-Cloud Management Platform | Kloudwit Solutions',
  description: 'Enterprise-grade multi-cloud resource management platform by Kloudwit Solutions Pvt Ltd',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#3b82f6',
                borderRadius: 8,
                colorBgContainer: '#ffffff',
              },
              components: {
                Layout: {
                  headerBg: '#001529',
                  siderBg: '#001529',
                },
              },
            }}
          >
            <StoreProvider>{children}</StoreProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
