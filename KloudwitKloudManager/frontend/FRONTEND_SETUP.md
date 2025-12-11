# KloudManager - Next.js Frontend with React, Ant Design & Material-UI

## 🚀 Modern Enterprise UI Framework

This frontend is built with cutting-edge technologies:
- **React 18.3** - Latest React features with hooks
- **Next.js 14.2** - Production-ready React framework with App Router
- **Ant Design 5.20** - Enterprise-grade UI components
- **Material-UI 5.15** - Google's Material Design components
- **TypeScript** - Type-safe development
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management
- **SWR** - Data fetching and caching

## 📋 Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Recommended: LTS version (v20.x)

2. **npm** (comes with Node.js) or **yarn**

### Verify Installation

```powershell
node --version  # Should show v18+ or v20+
npm --version   # Should show v8+ or higher
```

## 🛠️ Installation Steps

### 1. Install Node.js (if not installed)

**Windows:**
1. Download Node.js LTS from https://nodejs.org/
2. Run the installer (node-vXX.X.X-x64.msi)
3. Follow installation wizard (check "Add to PATH")
4. Restart PowerShell/Terminal
5. Verify: `node --version`

### 2. Install Dependencies

```powershell
cd frontend
npm install
```

This will install all dependencies including:
- React & React DOM
- Next.js
- Ant Design & icons
- Material-UI & icons
- Emotion (CSS-in-JS for MUI)
- Framer Motion
- Axios
- And more...

### 3. Configure Backend API

Create `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=kloudmanager
```

## 🎨 UI Framework Features

### Ant Design Components
- **Layout** - Enterprise sidebar with collapsible menu
- **Menu** - Beautiful navigation with icons
- **Card** - Content containers with gradient headers
- **Button** - Primary, secondary, danger variants
- **Badge** - Status indicators
- **Statistic** - Numeric data display
- **Breadcrumb** - Navigation trail
- **Dropdown** - Context menus

### Material-UI Components
- **Grid & Box** - Flexible layouts
- **Paper** - Elevated content containers
- **Typography** - Consistent text styling
- **Avatar** - User/icon containers
- **Chip** - Status tags
- **LinearProgress** - Progress bars
- **IconButton** - Circular action buttons
- **Tooltip** - Helpful hints

### Design System

**Color Palette:**
```
Primary:   #0ea5e9 (Cyan/Sky Blue)
Secondary: #8b5cf6 (Purple)
Success:   #10b981 (Green)
Warning:   #f59e0b (Orange)
Error:     #ef4444 (Red)

Background: #0a0e1a (Deep Navy)
Card:       #141927 (Dark Slate)
Sidebar:    #0f1419 (Charcoal)
```

**Typography:**
- Font Family: Inter
- Heading Weights: 600-700
- Body Weights: 400-500
- Letter Spacing: -0.02em (headings)

**Shadows:**
```
Small:  0 1px 2px 0 rgba(0, 0, 0, 0.25)
Medium: 0 4px 6px -1px rgba(0, 0, 0, 0.3)
Large:  0 10px 15px -3px rgba(0, 0, 0, 0.4)
```

**Animations:**
- Cubic-bezier easing: (0.4, 0, 0.2, 1)
- Hover lift: translateY(-2px to -8px)
- Button transitions: 0.2s
- Card transitions: 0.3s

## 🏃‍♂️ Running the Application

### Development Mode

```powershell
cd frontend
npm run dev
```

The app will start on: **http://localhost:3000**

### Production Build

```powershell
npm run build
npm start
```

### Type Checking

```powershell
npm run type-check
```

### Linting

```powershell
npm run lint
```

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with theme providers
│   ├── page.tsx             # Home page (redirects to /dashboard)
│   ├── globals.css          # Global styles & customizations
│   └── dashboard/
│       └── page.tsx         # Main dashboard page
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   ├── layout/              # Layout components
│   └── views/               # View components (Resources, Costs, etc.)
├── providers/
│   ├── theme/
│   │   ├── muiTheme.ts     # Material-UI theme config
│   │   └── antdTheme.ts    # Ant Design theme config
│   └── StoreProvider.tsx    # Zustand store provider
├── store/                   # State management
├── package.json             # Dependencies
├── next.config.js           # Next.js configuration
└── tsconfig.json            # TypeScript configuration
```

## 🎯 Key Features

### 1. Hybrid UI Framework
- **Ant Design** for layout, navigation, and forms
- **Material-UI** for data display, cards, and dialogs
- Seamless integration of both libraries

### 2. Enterprise-Grade Design
- Professional dark theme
- Gradient accents
- Multi-level shadows
- Smooth animations with Framer Motion

### 3. Responsive Layout
- Collapsible sidebar
- Mobile-friendly breakpoints
- Adaptive grid system
- Touch-friendly components

### 4. Type Safety
- Full TypeScript support
- Intellisense in VS Code
- Compile-time error checking

### 5. Performance Optimized
- Next.js App Router
- React Server Components
- Code splitting
- Image optimization

### 6. State Management
- Zustand for global state
- SWR for data fetching
- Automatic revalidation
- Optimistic UI updates

## 🔌 API Integration

### Backend Configuration

The frontend expects the Flask backend to run on `http://localhost:5000`

**Available Endpoints:**
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/resources` - Cloud resources
- `GET /api/providers` - Cloud providers
- `GET /api/github/actions` - GitHub Actions workflows
- `GET /api/azuredevops/pipelines` - Azure DevOps pipelines
- `POST /api/providers/test-connection` - Test provider connection

### CORS Configuration

Make sure Flask backend has CORS enabled:

```python
from flask_cors import CORS
CORS(app, origins=['http://localhost:3000'])
```

## 🎨 Customization Guide

### Changing Primary Color

**Material-UI Theme** (`providers/theme/muiTheme.ts`):
```typescript
primary: {
  main: '#YOUR_COLOR',
}
```

**Ant Design Theme** (`app/layout.tsx`):
```typescript
token: {
  colorPrimary: '#YOUR_COLOR',
}
```

**CSS Variables** (`app/globals.css`):
```css
.ant-menu-dark .ant-menu-item-selected {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR_DARKER 100%) !important;
}
```

### Adding New Views

1. Create component in `app/your-view/page.tsx`
2. Add menu item in dashboard page
3. Update navigation routing

### Custom Components

Create reusable components in `components/` directory:

```typescript
// components/MyComponent.tsx
import { Card } from 'antd';
import { Box } from '@mui/material';

export default function MyComponent() {
  return (
    <Card>
      <Box>Your content</Box>
    </Card>
  );
}
```

## 📦 Additional Packages

### Already Installed
- **@ant-design/icons** - 5000+ icons
- **@mui/icons-material** - Material icons
- **dayjs** - Date/time library
- **axios** - HTTP client
- **recharts** - Chart library

### Recommended Additions

```powershell
# Form validation
npm install react-hook-form yup

# Advanced charts
npm install @ant-design/charts

# Rich text editor
npm install @tiptap/react

# Drag and drop
npm install @dnd-kit/core
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found
```powershell
rm -rf node_modules
rm package-lock.json
npm install
```

### Build Errors
```powershell
npm run type-check  # Check TypeScript errors
npm run lint        # Check linting errors
```

### API Connection Issues
1. Verify Flask backend is running on port 5000
2. Check CORS configuration
3. Verify `.env.local` file exists
4. Check browser console for errors

## 🚀 Deployment

### Vercel (Recommended)
```powershell
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Build for Production
```powershell
npm run build
# Output in .next/ directory
```

## 📚 Documentation Links

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Ant Design**: https://ant.design/components/overview/
- **Material-UI**: https://mui.com/material-ui/getting-started/
- **Framer Motion**: https://www.framer.com/motion/
- **TypeScript**: https://www.typescriptlang.org/docs/

## 🎉 Features Roadmap

- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Export to CSV/PDF
- [ ] Dark/Light theme toggle
- [ ] User preferences
- [ ] Notification center
- [ ] Dashboard customization
- [ ] Advanced analytics
- [ ] Multi-language support

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Maintain consistent styling
4. Add proper type definitions
5. Test on multiple browsers

## 📝 License

Copyright © 2025 Kloudwit Solutions Pvt Ltd

---

**Status:** ✅ Ready for Development
**Framework:** React + Next.js + Ant Design + Material-UI
**Backend:** Flask (http://localhost:5000)
**Frontend:** Next.js (http://localhost:3000)
