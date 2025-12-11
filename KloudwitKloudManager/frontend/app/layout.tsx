import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import StoreProvider from '@/providers/StoreProvider';
import { muiTheme } from '@/providers/theme/muiTheme';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'kloudmanager - Multi-Cloud Management Platform | Kloudwit Solutions',
  description: 'Enterprise-grade multi-cloud resource management platform by Kloudwit Solutions Pvt Ltd',
};

const antdTheme = {
  token: {
    colorPrimary: '#0ea5e9',
    colorBgContainer: '#141927',
    colorBgElevated: '#1e293b',
    colorBorder: '#334155',
    colorText: '#e2e8f0',
    colorTextSecondary: '#94a3b8',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#0f1419',
      siderBg: '#0f1419',
      bodyBg: '#0a0e1a',
    },
    Menu: {
      darkItemBg: '#0f1419',
      darkItemSelectedBg: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
      darkItemHoverBg: '#1e293b',
    },
    Card: {
      colorBgContainer: '#141927',
    },
  },
  algorithm: 'dark' as any,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <AntdRegistry>
            <ConfigProvider theme={antdTheme}>
              <StoreProvider>{children}</StoreProvider>
            </ConfigProvider>
          </AntdRegistry>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
