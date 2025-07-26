# AlgoTrading Environment URLs Reference

## 🌐 Production URLs (Render.com)

### Frontend URLs:
- **Production**: https://algotrading-frontend.onrender.com
- **Staging**: https://algotrading-frontend-staging.onrender.com

### Backend URLs:
- **Production**: https://algotrading-backend.onrender.com
- **Staging**: https://algotrading-backend-staging.onrender.com

### API Endpoints:
- **Health Check**: https://algotrading-backend.onrender.com/api/health/
- **User Registration**: https://algotrading-backend.onrender.com/api/register-user
- **Token Generation**: https://algotrading-backend.onrender.com/api/generate-token/
- **Trading API**: https://algotrading-backend.onrender.com/api/trades/
- **Screener API**: https://algotrading-backend.onrender.com/api/screener/
- **User ROI API**: https://algotrading-backend.onrender.com/api/user_roi/

## 🛠️ Development URLs (Local)

### Frontend URLs:
- **Development**: http://localhost:5173
- **Preview**: http://localhost:3000

### Backend URLs:
- **Development**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin/

### API Endpoints:
- **Health Check**: http://localhost:8000/api/health/
- **User Registration**: http://localhost:8000/api/register-user
- **Token Generation**: http://localhost:8000/api/generate-token/
- **Trading API**: http://localhost:8000/api/trades/
- **Screener API**: http://localhost:8000/api/screener/
- **User ROI API**: http://localhost:8000/api/user_roi/

## 🔗 Kite Connect Integration

### Redirect URLs for Kite API:
- **Production**: https://algotrading-frontend.onrender.com/trade
- **Development**: http://localhost:5173/trade

### Kite Login URL Format:
```
https://kite.trade/connect/login?api_key={KITE_API_KEY}&v=3
```

## 🔧 Environment Variables

### Frontend (.env files):
```bash
# Production
VITE_API_URL=https://algotrading-backend.onrender.com
VITE_FRONTEND_URL=https://algotrading-frontend.onrender.com
VITE_NODE_ENV=production
VITE_DEBUG=false

# Development  
VITE_API_URL=http://localhost:8000
VITE_FRONTEND_URL=http://localhost:5173
VITE_NODE_ENV=development
VITE_DEBUG=true
```

### Backend (Django settings):
```bash
# Production
ALLOWED_HOSTS=.onrender.com,algotrading-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://algotrading-frontend.onrender.com
DEBUG=False

# Development
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

## 📝 Notes

- All URLs use HTTPS in production for security
- Render.com provides automatic SSL certificates
- Frontend and backend are deployed as separate services
- SQLite database is included with the backend service
- CORS is configured to allow frontend-backend communication
