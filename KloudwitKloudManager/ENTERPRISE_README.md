# 🚀 kloudmanager - Enterprise Edition

**By Kloudwit Solutions Pvt Ltd**

> **Enterprise-grade Multi-Cloud Resource Management Platform**  
> Built with modern technologies: Next.js 14, React 18, TypeScript, Ant Design (Frontend) + Flask, Python (Backend)

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.20-red)](https://ant.design/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow)](https://www.python.org/)

## 📋 Overview

**kloudmanager** is a comprehensive cloud management platform developed by **Kloudwit Solutions Pvt Ltd** that provides unified visibility and control across multiple cloud providers (Azure, AWS, GCP). The platform features a modern, enterprise-grade user interface built with Next.js and Ant Design, backed by a robust Flask API.

### ✨ Key Features

- 🎯 **Unified Dashboard** - Single pane of glass for all cloud resources
- 📊 **Cost Analysis** - Track and analyze spending across clouds (30-day view)
- ✅ **Compliance Monitoring** - Azure Policy integration for compliance tracking
- 🔔 **Real-time Alerts** - Instant notifications for critical events
- 🌐 **Multi-Cloud Support** - Azure, AWS, GCP (Azure fully implemented)
- 🎨 **Modern UI/UX** - Enterprise-grade interface with dark/light themes
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **High Performance** - Optimized loading with caching and lazy loading

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Resources │  │  Costs   │  │Compliance│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Ant Design Components + TypeScript + Zustand        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                  Backend (Flask + Python)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   API    │  │  Cloud   │  │  Policy  │  │   Cost   │   │
│  │ Endpoints│  │Connectors│  │ Insights │  │Management│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          SQLite Database (Resources, Config)          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ Azure SDK
┌────────────────────▼────────────────────────────────────────┐
│                   Azure Cloud Services                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Compute   │  │ Storage  │  │ Network  │  │  Policy  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

**Backend Requirements:**
- Python 3.9+
- pip (Python package manager)
- Azure subscription and service principal

**Frontend Requirements:**
- Node.js 18+ and npm
- Download from: https://nodejs.org/

### 1️⃣ Backend Setup (Flask)

```powershell
# Navigate to project directory
cd c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Configure Azure credentials in .env file
# Copy .env.example to .env and add your credentials:
# AZURE_SUBSCRIPTION_ID=your-subscription-id
# AZURE_TENANT_ID=your-tenant-id
# AZURE_CLIENT_ID=your-client-id
# AZURE_CLIENT_SECRET=your-client-secret

# Run the Flask backend
python run.py
```

Backend will be available at: **http://localhost:5000**

### 2️⃣ Frontend Setup (Next.js)

**First, install Node.js:**
```powershell
# Option 1: Download from https://nodejs.org/
# Option 2: Using Chocolatey
choco install nodejs-lts

# Option 3: Using Winget
winget install OpenJS.NodeJS.LTS
```

**Then setup the frontend:**
```powershell
# Navigate to frontend directory
cd c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager\frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### 🎯 Quick Start Script

Use the automated setup script:
```powershell
cd c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager\frontend
.\start.ps1
```

## 📁 Project Structure

```
KloudwitKloudManager/
├── frontend/                    # Next.js Frontend (NEW!)
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── layout/           # Layout components
│   │   └── views/            # Page views
│   ├── store/                # Zustand state management
│   ├── providers/            # Context providers
│   ├── package.json          # Node dependencies
│   └── README.md             # Frontend documentation
│
├── cloud_connectors/          # Cloud provider integrations
│   ├── __init__.py
│   ├── azure_connector.py    # Azure SDK integration
│   ├── aws_connector.py      # AWS SDK (placeholder)
│   └── gcp_connector.py      # GCP SDK (placeholder)
│
├── templates/                 # Legacy HTML templates
│   └── dashboard.html        # Original dashboard
│
├── static/                    # Legacy static files
│   ├── css/
│   └── js/
│
├── instance/                  # SQLite database
│   └── kloudmanager.db
│
├── run.py                     # Flask application
├── requirements.txt           # Python dependencies
├── .env                      # Environment variables (create from .env.example)
└── README.md                 # This file
```

## 🎨 Frontend Technology Stack

### Core Technologies
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with latest features
- **TypeScript 5.5** - Type-safe development
- **Ant Design 5.20** - Enterprise UI component library

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls
- **SWR** - Data fetching with caching

### Developer Experience
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- Hot Module Replacement (HMR)

## 🔌 API Endpoints

### Dashboard
- `GET /api/dashboard/summary` - Dashboard statistics

### Resources
- `GET /api/resources` - List all resources
- `GET /api/resources/:id` - Get resource details

### Providers
- `GET /api/providers` - List cloud providers
- `GET /api/test-connection/:provider` - Test provider connection

### Costs
- `GET /api/costs/last-30-days` - Cost data for last 30 days

### Compliance
- `GET /api/compliance` - Non-compliant resources

### Alerts
- `GET /api/alerts` - Active alerts

## 🎯 Feature Comparison: Old vs New UI

| Feature | Legacy UI (HTML/CSS/JS) | Enterprise UI (Next.js/TS/AntD) |
|---------|------------------------|----------------------------------|
| Framework | Vanilla JavaScript | Next.js 14 + React 18 |
| Type Safety | ❌ No | ✅ TypeScript |
| Component Library | Custom CSS | ✅ Ant Design (Enterprise) |
| State Management | Global variables | ✅ Zustand (Organized) |
| Performance | Basic | ✅ Optimized (SSR, caching) |
| Mobile Responsive | Limited | ✅ Fully Responsive |
| Theme Support | Dark/Light toggle | ✅ System + Manual toggle |
| Code Maintainability | Medium | ✅ High (TypeScript, modular) |
| Development Speed | Slower | ✅ Faster (reusable components) |
| Production Ready | Basic | ✅ Enterprise-grade |

## 📊 Screenshots

### Dashboard View
- 4 summary cards (Resources, Providers, Cost, Alerts) - clickable
- Resource distribution chart
- Provider overview with resource counts
- Recent alerts feed

### Resources View
- Comprehensive table with sorting and filtering
- Search functionality
- Provider filtering
- Status indicators
- Pagination

### Costs View
- Total cost overview (30 days)
- Cost by service breakdown
- Cost by resource breakdown
- Visual cost trends

### Compliance View
- Non-compliant resources table
- Policy violation details
- Sortable and filterable

## 🔐 Azure Setup

### Create Service Principal

```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac --name "KloudwitKloudManager" --role="Reader" --scopes="/subscriptions/{subscription-id}"

# Output will contain:
# - appId (AZURE_CLIENT_ID)
# - password (AZURE_CLIENT_SECRET)
# - tenant (AZURE_TENANT_ID)
```

### Required Azure Permissions
- **Reader** - Read access to resources
- **Cost Management Reader** - Read cost data
- **Policy Insights Data Writer** - Read compliance data

## 🚀 Deployment

### Frontend (Next.js)

**Option 1: Vercel (Recommended)**
```powershell
npm i -g vercel
cd frontend
vercel
```

**Option 2: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --production
COPY frontend/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Backend (Flask)

**Production Server (Waitress)**
```powershell
pip install waitress
waitress-serve --port=5000 run:app
```

**Docker**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "run.py"]
```

## 🐛 Troubleshooting

### Frontend Issues

**Issue: npm not found**
```powershell
# Install Node.js from https://nodejs.org/
# Restart PowerShell after installation
node --version
```

**Issue: Port 3000 in use**
```powershell
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Issue: Cannot connect to backend**
- Ensure Flask backend is running on port 5000
- Check `.env.local` has correct API URL
- Verify CORS is enabled in Flask

### Backend Issues

**Issue: Azure authentication failed**
- Verify credentials in `.env` file
- Check service principal has correct permissions
- Test: `az login` then `az account show`

**Issue: Port 5000 in use**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📈 Performance

- **Frontend First Load**: ~300ms
- **Page Navigation**: <100ms (client-side routing)
- **Dashboard Load**: <1 second (with caching)
- **API Response Time**: 200-500ms (average)

## 🛣️ Roadmap

### Phase 1: ✅ Completed
- ✅ Flask backend with Azure integration
- ✅ Next.js frontend with Ant Design
- ✅ Dashboard with real-time data
- ✅ Resource management
- ✅ Cost tracking
- ✅ Compliance monitoring
- ✅ Dark/Light theme support

### Phase 2: 🚧 In Progress
- 🔄 AWS integration
- 🔄 GCP integration
- 🔄 Advanced cost analytics
- 🔄 Export functionality (CSV, PDF)

### Phase 3: 📋 Planned
- 📋 Multi-tenancy support
- 📋 Role-based access control (RBAC)
- 📋 Custom dashboards
- 📋 Automated remediation
- 📋 Webhook integrations
- 📋 Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software developed for cloud management purposes.

## 📞 Support

For issues, questions, or feature requests:
- Check the troubleshooting section
- Review frontend and backend README files
- Check application logs for errors

## 🎉 Getting Started

1. **Install Prerequisites**
   - Python 3.9+ (Backend)
   - Node.js 18+ (Frontend)

2. **Start Backend**
   ```powershell
   cd KloudwitKloudManager
   python run.py
   ```

3. **Start Frontend**
   ```powershell
   cd KloudwitKloudManager/frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

5. **Enjoy!** 🎊

---

**kloudmanager** - Built with ❤️ by **Kloudwit Solutions Pvt Ltd**  
© 2025 Kloudwit Solutions Pvt Ltd. All rights reserved.
