# Render Static Site Configuration

## Build Settings
- **Build Command**: `npm install --legacy-peer-deps && npm audit fix --force && npm run build`
- **Publish Directory**: `build`
- **Root Directory**: `frontend`

## Environment Variables
```
NODE_ENV=production
REACT_APP_API_URL=https://agriscope-backend.onrender.com
REACT_APP_FLASK_API_URL=https://agriscope-backend-flask.onrender.com
```

## Node.js Version
- **Version**: 20.11.0 (specified in .nvmrc)

## Routes
All routes will be handled by React Router.
