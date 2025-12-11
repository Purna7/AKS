# 🚀 Quick Reference - React + Next.js + Ant + MUI

## ⚡ Installation & Start (2 Minutes)

### Step 1: Install Node.js
```
Download: https://nodejs.org/ (v20.x LTS)
Install and restart terminal
```

### Step 2: Setup & Run
```powershell
cd frontend
.\setup.ps1
# Or manually: npm install && npm run dev
```

### Step 3: Access
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000 (must be running)
```

---

## 📦 Tech Stack Overview

```
React 18.3         → UI framework
Next.js 14.2       → Production framework
TypeScript 5.5     → Type safety
Ant Design 5.20    → Enterprise components
Material-UI 5.15   → Material Design
Framer Motion 11   → Animations
Zustand 4.5        → State management
SWR 2.2            → Data fetching
```

---

## 🎨 Component Import Patterns

### Ant Design
```typescript
// Layout
import { Layout, Menu, Breadcrumb, Space } from 'antd';
const { Header, Sider, Content } = Layout;

// Components
import { Card, Button, Badge, Statistic, Dropdown } from 'antd';

// Icons
import { 
  DashboardOutlined, 
  CloudOutlined,
  SyncOutlined 
} from '@ant-design/icons';
```

### Material-UI
```typescript
// Layout
import { Grid, Box, Container, Paper } from '@mui/material';

// Typography
import { Typography } from '@mui/material';

// Components
import { Avatar, Chip, LinearProgress, IconButton, Tooltip } from '@mui/material';

// Icons
import { Menu as MenuIcon, Settings as SettingsIcon } from '@mui/icons-material';
```

---

## 🎯 Common Patterns

### 1. Create New Page
```typescript
// app/mypage/page.tsx
'use client';

export default function MyPage() {
  return (
    <Box>
      <Typography variant="h4">My Page</Typography>
    </Box>
  );
}
```

### 2. API Call with SWR
```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const { data, error, isLoading } = useSWR(
  'http://localhost:5000/api/resources',
  fetcher
);
```

### 3. Animated Card
```typescript
import { motion } from 'framer-motion';
import { Paper } from '@mui/material';

<motion.div whileHover={{ y: -8, scale: 1.02 }}>
  <Paper elevation={2}>
    {/* Content */}
  </Paper>
</motion.div>
```

### 4. Ant Design Form
```typescript
import { Form, Input, Button } from 'antd';

<Form onFinish={handleSubmit}>
  <Form.Item name="email" label="Email">
    <Input />
  </Form.Item>
  <Button type="primary" htmlType="submit">
    Submit
  </Button>
</Form>
```

### 5. MUI Grid Layout
```typescript
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Content */}
  </Grid>
</Grid>
```

---

## 🎨 Styling Patterns

### 1. MUI sx Prop (Inline)
```typescript
<Box sx={{ 
  p: 3,                // padding: 24px
  mb: 2,               // margin-bottom: 16px
  bgcolor: '#141927',  // background-color
  borderRadius: 2,     // 16px
}}>
```

### 2. Ant Design Style Prop
```typescript
<Card 
  style={{ 
    background: '#141927',
    border: '1px solid #334155'
  }}
>
```

### 3. Tailwind-like Shortcuts (MUI)
```typescript
p: 3      → padding: 24px (3 * 8px)
mt: 2     → margin-top: 16px
gap: 2    → gap: 16px
flex: 1   → flex: 1
width: 1  → width: 100%
```

---

## 🎨 Theme Colors

```typescript
// Access theme colors
sx={{ 
  color: 'primary.main',      // #0ea5e9
  bgcolor: 'background.paper', // #141927
  borderColor: 'divider',     // #334155
}}
```

---

## 📐 Common Layouts

### 1. Dashboard Grid
```typescript
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <SummaryCard />
  </Grid>
  {/* Repeat */}
</Grid>
```

### 2. Sidebar Layout
```typescript
<Layout>
  <Sider width={280} collapsible>
    <Menu items={menuItems} />
  </Sider>
  <Layout>
    <Header>
      <Breadcrumb />
    </Header>
    <Content>
      {children}
    </Content>
  </Layout>
</Layout>
```

### 3. Card Grid
```typescript
<Grid container spacing={2}>
  {items.map(item => (
    <Grid item xs={12} md={6} key={item.id}>
      <Card>{item.content}</Card>
    </Grid>
  ))}
</Grid>
```

---

## 🎭 Animation Recipes

### 1. Fade In
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
```

### 2. Slide Up
```typescript
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

### 3. Hover Effect
```typescript
<motion.div
  whileHover={{ scale: 1.05, y: -5 }}
  transition={{ duration: 0.2 }}
>
```

### 4. Stagger Children
```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="show"
>
  {children}
</motion.div>
```

---

## 🔧 NPM Commands

```powershell
npm run dev        # Development server (localhost:3000)
npm run build      # Production build
npm start          # Production server
npm run lint       # ESLint check
npm run type-check # TypeScript validation
npm install        # Install dependencies
npm update         # Update packages
```

---

## 🐛 Common Issues & Fixes

### 1. Module Not Found
```powershell
rm -rf node_modules package-lock.json
npm install
```

### 2. Port 3000 in Use
```powershell
# Find process
netstat -ano | findstr :3000
# Kill it
taskkill /PID <PID> /F
```

### 3. TypeScript Errors
```powershell
npm run type-check
# Fix errors, then rebuild
```

### 4. Ant Design Styles Not Working
```typescript
// Make sure AntdRegistry is in layout.tsx
import { AntdRegistry } from '@ant-design/nextjs-registry';
```

### 5. MUI Theme Not Applied
```typescript
// Verify ThemeProvider wraps app
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
```

---

## 📝 File Locations

```
frontend/
├── app/
│   ├── layout.tsx          ← Root layout (themes)
│   ├── page.tsx            ← Home (redirects)
│   ├── globals.css         ← Global styles
│   └── dashboard/
│       └── page.tsx        ← Main dashboard
├── components/             ← Reusable components
├── providers/
│   └── theme/
│       └── muiTheme.ts     ← MUI theme config
├── package.json            ← Dependencies
└── next.config.js          ← Next.js config
```

---

## 🎯 Quick Checklist

**Before Development:**
- [ ] Node.js v20+ installed
- [ ] npm install completed
- [ ] Backend running on :5000
- [ ] .env.local configured

**During Development:**
- [ ] npm run dev running
- [ ] Browser on localhost:3000
- [ ] TypeScript errors = 0
- [ ] Components rendering

**Before Deployment:**
- [ ] npm run build passes
- [ ] No console errors
- [ ] All features tested
- [ ] API endpoints verified

---

## 🔗 Quick Links

**Documentation:**
- Next.js: https://nextjs.org/docs
- Ant Design: https://ant.design/components/overview/
- Material-UI: https://mui.com/material-ui/
- Framer Motion: https://www.framer.com/motion/

**Your Docs:**
- `FRONTEND_SETUP.md` - Complete guide
- `UI_FRAMEWORK_SUMMARY.md` - What was built
- `BEFORE_AFTER_COMPARISON.md` - Old vs New

---

## 💡 Pro Tips

1. **Use TypeScript**: Get autocomplete and type safety
2. **Component Composition**: Build small, reusable components
3. **SWR for Data**: Automatic caching and revalidation
4. **Framer Motion**: Smooth animations with minimal code
5. **MUI Grid**: Responsive layouts made easy
6. **Ant Design**: Enterprise components out of the box
7. **Hot Reload**: Edit and see changes instantly
8. **Browser DevTools**: React DevTools extension helpful

---

**Quick Start**: `cd frontend && .\setup.ps1`

**Access**: http://localhost:3000

**Status**: ✅ Ready to develop!
