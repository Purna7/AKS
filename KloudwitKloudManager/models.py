from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    """User accounts"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class CloudProvider(db.Model):
    """Cloud provider configurations"""
    __tablename__ = 'cloud_providers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)  # AWS, Azure, GCP
    display_name = db.Column(db.String(100))
    is_enabled = db.Column(db.Boolean, default=True)
    credentials_encrypted = db.Column(db.Text)
    region = db.Column(db.String(50))
    last_sync = db.Column(db.DateTime)
    sync_status = db.Column(db.String(20))  # success, failed, in_progress
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    resources = db.relationship('CloudResource', backref='provider', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<CloudProvider {self.name}>'

class CloudResource(db.Model):
    """Cloud resources (VMs, Storage, Networks, etc.)"""
    __tablename__ = 'cloud_resources'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('cloud_providers.id'), nullable=False)
    resource_id = db.Column(db.String(255), nullable=False)  # Provider's resource ID
    resource_type = db.Column(db.String(50), nullable=False)  # VM, Storage, Network, etc.
    name = db.Column(db.String(255))
    region = db.Column(db.String(50))
    status = db.Column(db.String(50))  # running, stopped, terminated, etc.
    size = db.Column(db.String(50))  # Instance type/size
    tags = db.Column(db.JSON)
    resource_metadata = db.Column(db.JSON)  # Additional resource-specific data
    cost_per_hour = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    discovered_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    metrics = db.relationship('ResourceMetric', backref='resource', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<CloudResource {self.name} ({self.resource_type})>'

class ResourceMetric(db.Model):
    """Time-series metrics for resources"""
    __tablename__ = 'resource_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, db.ForeignKey('cloud_resources.id'), nullable=False)
    metric_name = db.Column(db.String(100), nullable=False)  # CPU, Memory, Network, etc.
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20))  # %, GB, Mbps, etc.
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ResourceMetric {self.metric_name}: {self.value}{self.unit}>'

class CostRecord(db.Model):
    """Cost tracking for cloud resources"""
    __tablename__ = 'cost_records'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('cloud_providers.id'), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey('cloud_resources.id'))
    date = db.Column(db.Date, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    service_name = db.Column(db.String(100))
    category = db.Column(db.String(50))  # compute, storage, network, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<CostRecord {self.date}: {self.cost} {self.currency}>'

class Alert(db.Model):
    """System alerts and notifications"""
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('cloud_providers.id'))
    resource_id = db.Column(db.Integer, db.ForeignKey('cloud_resources.id'))
    severity = db.Column(db.String(20), nullable=False)  # critical, warning, info
    alert_type = db.Column(db.String(50), nullable=False)  # cost_spike, resource_down, etc.
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text)
    is_resolved = db.Column(db.Boolean, default=False)
    resolved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Alert {self.severity}: {self.title}>'

class AuditLog(db.Model):
    """Audit trail for user actions"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.Integer)
    details = db.Column(db.JSON)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<AuditLog {self.action} at {self.timestamp}>'
