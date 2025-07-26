# CORS and ALLOWED_HOSTS Configuration Guide

## 🔐 Security Configuration Overview

This document explains the CORS and ALLOWED_HOSTS configuration for the AlgoTrading application across different environments.

## 🎯 ALLOWED_HOSTS Configuration

### Development:
```bash
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
```

### Production (Render.com):
```bash
ALLOWED_HOSTS=.onrender.com,algotrading-backend.onrender.com,localhost,127.0.0.1
```

### Production (Railway.app):
```bash
ALLOWED_HOSTS=.railway.app,.up.railway.app,algotrading-backend.up.railway.app,localhost,127.0.0.1
```

### Production (DigitalOcean):
```bash
ALLOWED_HOSTS=.ondigitalocean.app,algotrading-app-backend.ondigitalocean.app,localhost,127.0.0.1
```

## 🌐 CORS_ALLOWED_ORIGINS Configuration

### Development:
```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

### Production (Render.com):
```bash
CORS_ALLOWED_ORIGINS=https://algotrading-frontend.onrender.com,http://localhost:3000,http://localhost:5173
```

### Production (Railway.app):
```bash
CORS_ALLOWED_ORIGINS=https://algotrading-frontend.up.railway.app,https://algotrading-frontend.railway.app,http://localhost:3000,http://localhost:5173
```

### Production (DigitalOcean):
```bash
CORS_ALLOWED_ORIGINS=https://algotrading-app-frontend.ondigitalocean.app,http://localhost:3000,http://localhost:5173
```

## 🔧 Django Settings Configuration

The Django settings automatically read from environment variables:

```python
# ALLOWED_HOSTS configuration
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS if host.strip()]

# CORS configuration
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS if origin.strip()]
```

## 🛡️ Security Features

### 1. Wildcard Domain Support:
- `.onrender.com` allows all subdomains
- `.railway.app` allows all Railway subdomains
- `.ondigitalocean.app` allows all DigitalOcean subdomains

### 2. Development Support:
- Always includes `localhost` and `127.0.0.1`
- Supports both port `3000` and `5173` for frontend development

### 3. CORS Credentials:
```python
CORS_ALLOW_CREDENTIALS = True
```

### 4. Environment-Specific Headers:
```python
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_HEADERS = [
        'accept', 'accept-encoding', 'authorization', 'content-type',
        'dnt', 'origin', 'user-agent', 'x-csrftoken', 'x-requested-with'
    ]
```

## 🚀 Deployment Platform URLs

### Render.com:
- **Frontend**: https://algotrading-frontend.onrender.com
- **Backend**: https://algotrading-backend.onrender.com

### Railway.app:
- **Frontend**: https://algotrading-frontend.up.railway.app
- **Backend**: https://algotrading-backend.up.railway.app

### DigitalOcean:
- **Frontend**: https://algotrading-app-frontend.ondigitalocean.app
- **Backend**: https://algotrading-app-backend.ondigitalocean.app

## 🔍 Troubleshooting

### Common CORS Errors:

1. **"Access to fetch has been blocked by CORS policy"**
   - Check CORS_ALLOWED_ORIGINS includes your frontend URL
   - Verify the frontend URL is using the correct protocol (http/https)

2. **"Invalid Host header"**
   - Check ALLOWED_HOSTS includes your backend domain
   - Verify the domain format matches exactly

3. **"CSRF verification failed"**
   - Ensure CORS_ALLOW_CREDENTIALS is True
   - Check that 'x-csrftoken' is in CORS_ALLOWED_HEADERS

### Debug Commands:

```bash
# Check current Django settings
python manage.py diffsettings

# Validate deployment configuration
python manage.py check --deploy

# Test CORS configuration
curl -H "Origin: https://algotrading-frontend.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://algotrading-backend.onrender.com/api/health/
```

## 📝 Best Practices

1. **Always include localhost** for development
2. **Use specific domains** instead of wildcards when possible
3. **Include both http and https** for development flexibility
4. **Test CORS** with browser developer tools
5. **Use environment variables** for different deployment stages
