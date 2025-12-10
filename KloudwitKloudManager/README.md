# KloudwitKloud Manager

Enterprise-grade multi-cloud management platform for centralized monitoring and management of AWS, Azure, and GCP resources.

## Features

- **Multi-Cloud Support**: Seamlessly manage AWS, Azure, and GCP from one dashboard
- **Real-time Monitoring**: Live updates of cloud resources and their status
- **Resource Discovery**: Automatic discovery of VMs, Storage, Networks, and Databases
- **Cost Tracking**: Monitor and analyze cloud spending across providers
- **Alert Management**: Centralized alerting system for critical events
- **Professional Dashboard**: Modern, responsive UI with dark theme
- **RESTful API**: Complete API for integration with other tools
- **Scheduled Sync**: Automatic background synchronization of cloud resources

## Architecture

```
KloudwitKloudManager/
├── app.py                      # Main Flask application
├── config.py                   # Configuration management
├── models.py                   # Database models (SQLAlchemy)
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
│
├── cloud_connectors/          # Cloud provider integrations
│   ├── __init__.py
│   ├── aws_connector.py       # AWS SDK integration
│   ├── azure_connector.py     # Azure SDK integration
│   └── gcp_connector.py       # GCP SDK integration
│
├── templates/                 # HTML templates
│   └── dashboard.html         # Main dashboard UI
│
└── static/                    # Static assets
    ├── css/
    │   └── dashboard.css      # Dashboard styles
    └── js/
        └── dashboard.js       # Dashboard functionality
```

## Database Schema

### Tables

1. **users**: User authentication and authorization
2. **cloud_providers**: Cloud provider configurations (AWS, Azure, GCP)
3. **cloud_resources**: Discovered cloud resources (VMs, Storage, Networks, etc.)
4. **resource_metrics**: Time-series metrics for resources
5. **cost_records**: Cost tracking data
6. **alerts**: System alerts and notifications
7. **audit_logs**: User activity audit trail

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Cloud provider accounts with appropriate credentials

### Setup Steps

1. **Clone the repository**:
```bash
cd c:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager
```

2. **Create virtual environment**:
```bash
python -m venv venv
.\venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**:
```bash
copy .env.example .env
# Edit .env with your cloud provider credentials
```

5. **Initialize database**:
```bash
python app.py
# Database will be created automatically on first run
```

6. **Access the application**:
```
Open browser: http://localhost:5000
Default credentials: admin / admin123
```

## Configuration

### Environment Variables

Edit `.env` file with your credentials:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

# Azure Configuration
AZURE_SUBSCRIPTION_ID=your_subscription_id
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret

# GCP Configuration
GCP_PROJECT_ID=your_project_id
GCP_SERVICE_ACCOUNT_FILE=path_to_service_account.json
```

### AWS Setup

1. Create IAM user with ReadOnlyAccess policy
2. Generate access keys
3. Add credentials to `.env` file

### Azure Setup

1. Register application in Azure AD
2. Create client secret
3. Assign "Reader" role to subscription
4. Add credentials to `.env` file

### GCP Setup

1. Create service account in GCP
2. Grant "Viewer" role
3. Download service account JSON
4. Add path to `.env` file

## Usage

### Dashboard

The main dashboard provides:
- **Summary Cards**: Total resources, providers, costs, and alerts
- **Resource Distribution**: Breakdown by resource type
- **Provider Overview**: Resources per cloud provider
- **Recent Alerts**: Latest system notifications

### Resources View

- View all discovered cloud resources
- Filter by resource type (VMs, Storage, Networks, Databases)
- See detailed resource information
- Monitor resource status

### Providers View

- Test connections to cloud providers
- View provider configuration status
- Manage provider settings

### Costs View

- Track cloud spending over time
- View cost trends
- Analyze spending by service

### Alerts View

- Monitor system alerts
- Filter by severity (critical, warning, info)
- Track resolved and unresolved alerts

## API Endpoints

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary statistics

### Resources
- `GET /api/resources` - List all cloud resources
- `GET /api/resources?type=VM` - Filter resources by type
- `GET /api/resources?provider_id=1` - Filter by provider

### Providers
- `GET /api/providers` - List all cloud providers
- `GET /api/test-connection/<provider>` - Test provider connection

### Costs
- `GET /api/costs?days=30` - Get cost data for specified period

### Alerts
- `GET /api/alerts` - List all alerts
- `GET /api/alerts?unresolved=true` - Get unresolved alerts only

### Sync
- `POST /api/sync` - Trigger manual resource synchronization

## Security

- **Environment Variables**: Sensitive credentials stored in `.env` (not committed)
- **Password Hashing**: User passwords hashed with werkzeug
- **Session Management**: Secure session cookies
- **API Authentication**: (To be implemented: JWT tokens)

## Performance

- **Background Sync**: Scheduled tasks run independently
- **Database Indexing**: Optimized queries on frequently accessed fields
- **Caching**: (To be implemented: Redis caching layer)
- **Connection Pooling**: Efficient database connections

## Troubleshooting

### Database Issues
```bash
# Reset database
rm kloudmanager.db
python app.py
```

### Connection Errors
- Verify cloud provider credentials in `.env`
- Check network connectivity
- Ensure IAM/RBAC permissions are correct
- Test connections using "Providers" view

### Resource Discovery Issues
- Check cloud provider API limits
- Verify account has resources in configured regions
- Review application logs for errors

## Development

### Running in Development Mode
```bash
set FLASK_ENV=development
python app.py
```

### Database Migrations
Currently using SQLAlchemy with automatic table creation. For production, consider using Alembic for migrations.

### Adding New Cloud Providers
1. Create connector in `cloud_connectors/`
2. Implement standard methods: `test_connection()`, `get_all_resources()`, `get_cost_data()`
3. Add provider to database initialization
4. Update dashboard UI

## Production Deployment

### Recommended Setup
- Use PostgreSQL instead of SQLite
- Deploy with Gunicorn + Nginx
- Enable SSL/TLS certificates
- Set up Redis for caching
- Implement proper logging (ELK stack)
- Use Docker containers
- Set up monitoring (Prometheus + Grafana)

### Environment
```bash
set FLASK_ENV=production
set SECRET_KEY=generate-strong-random-key
```

## Roadmap

- [ ] User authentication and RBAC
- [ ] Real-time notifications (WebSockets)
- [ ] Cost optimization recommendations
- [ ] Resource tagging and grouping
- [ ] Multi-region support
- [ ] Custom dashboards
- [ ] Export reports (PDF, CSV)
- [ ] Integration with ticketing systems
- [ ] Terraform/CloudFormation support
- [ ] Kubernetes cluster management

## License

Enterprise License - All Rights Reserved

## Support

For issues and support:
- Email: support@kloudmanager.com
- Documentation: https://docs.kloudmanager.com

## Credits

Developed by KloudwitKloud Team
Version: 1.0.0
