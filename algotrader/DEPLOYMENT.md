# 🚀 AlgoTrading Production Deployment Guide

This guide covers deploying your AlgoTrading application to various cloud platforms.

## 📋 Prerequisites

- Git repository with your code
- Node.js 18+ and npm
- Python 3.11+
- Docker (for local testing)

## 🗄️ Database Configuration

This application uses **SQLite** as the default database for simplicity and ease of deployment.

### **SQLite Benefits:**
- ✅ **Zero configuration** - no database server needed
- ✅ **Built into Python** - no additional dependencies
- ✅ **Perfect for small to medium apps** (up to 100GB)
- ✅ **File-based** - easy backup and migration
- ✅ **FREE deployment** on any platform

### **Database Setup:**
```bash
# Initialize SQLite database
./scripts/init-database.sh

# Or manually:
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### **Database Location:**
- **Development**: `backend/db.sqlite3`
- **Production**: Persistent volume (automatically handled)

## 🎯 Platform Options

### 1. Railway.app (Recommended) ⭐

**Pros:**
- Excellent Django/React support
- Automatic database provisioning
- Built-in Redis
- Easy deployment process
- Great free tier

**Steps:**
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `./deploy-production.sh` and select option 1

**Cost:** $5/month for hobby plan, free tier available

### 2. Render.com (Best FREE Option) 🆓

**Pros:**
- **FREE hosting** for both frontend and backend
- **SQLite included** - no separate database service needed
- **Zero database costs** - SQLite is file-based
- Auto-deploy from git
- SSL certificates included
- Easy configuration with render.yaml

**Steps:**
1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. The `render.yaml` file will auto-configure your services
4. Deploy: `./scripts/deploy-render.sh`

**Configuration:**
- **Frontend**: https://algotrading-frontend.onrender.com
- **Backend**: https://algotrading-backend.onrender.com
- **Database**: SQLite (file-based, included with backend)
- **API Base**: https://algotrading-backend.onrender.com/api/

**Cost:** Completely FREE (services sleep after 15 min inactivity)

### 3. DigitalOcean App Platform

**Pros:**
- Predictable pricing
- Good performance
- Managed databases
- CDN included

**Steps:**
1. Install doctl CLI
2. Authenticate: `doctl auth init`
3. Deploy: `./deploy-production.sh` and select option 3

**Cost:** $12/month for basic plan

## 🔧 Configuration Files

### Railway (`railway.json`)
- Configures Django deployment
- Sets up environment variables
- Defines health checks

### Render (`render.yaml`)
- Defines both frontend and backend services
- Configures database connections
- Sets up static file serving

### DigitalOcean (`.do/app.yaml`)
- App platform configuration
- Service definitions
- Environment setup

## 🌍 Environment Variables

Update these for production:

**Backend:**
```
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=your-secret-key
```

**Frontend:**
```
VITE_API_URL=https://your-backend-url.com
VITE_NODE_ENV=production
```

## 🔒 Security Checklist

- [ ] Update SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Enable HTTPS redirects
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets

## 🗄️ Database Migration

For production deployments:

```bash
# Railway
railway run python manage.py migrate

# Render (auto-runs in render.yaml)

# DigitalOcean
doctl apps create-deployment <app-id>
```

## 📊 Monitoring

**Railway:**
- Built-in metrics dashboard
- Log aggregation
- Performance monitoring

**Render:**
- Service metrics
- Real-time logs
- Health checks

**DigitalOcean:**
- App insights
- Scaling metrics
- Alert policies

## 🚨 Troubleshooting

**Common Issues:**

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify package.json scripts
   - Review build logs

2. **Database Connection:**
   - Verify DATABASE_URL format
   - Check firewall settings
   - Confirm database service is running

3. **Static Files:**
   - Ensure `collectstatic` runs during build
   - Check STATIC_URL and STATIC_ROOT settings
   - Verify nginx configuration

4. **CORS Errors:**
   - Update CORS_ALLOWED_ORIGINS
   - Check frontend API_URL
   - Verify domain configurations

## 🔄 CI/CD Setup

**GitHub Actions Example:**
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: railway up
```

## 📈 Scaling

**Railway:**
- Auto-scaling available
- Resource monitoring
- Load balancer included

**Render:**
- Manual scaling options
- Performance metrics
- CDN integration

**DigitalOcean:**
- Horizontal scaling
- Load balancer add-on
- Database clustering

## 💰 Cost Estimation

| Platform | Frontend | Backend | Database | Total/Month |
|----------|----------|---------|----------|-------------|
| Railway | $5 | $5 | Included | $10 |
| Render | $7 | $7 | $7 | $21 |
| DigitalOcean | $12 | $12 | $15 | $39 |

## 🆘 Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- DigitalOcean: [docs.digitalocean.com](https://docs.digitalocean.com)

---

**Next Steps:**
1. Choose your platform
2. Run `./deploy-production.sh`
3. Configure environment variables
4. Test your deployment
5. Set up monitoring and alerts
