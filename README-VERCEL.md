# Despliegue en Vercel - Video Segments Player Backend

Este proyecto ha sido adaptado para funcionar como funciones serverless en Vercel.

## 🚀 Estructura del Proyecto

```
Back_tallerjs/
├── api/                          # Funciones serverless de Vercel
│   ├── lib/                      # Utilidades compartidas
│   │   ├── mongodb.js           # Conexión optimizada a MongoDB
│   │   └── middleware.js        # Middleware helpers
│   ├── auth/                     # Rutas de autenticación
│   │   ├── login.js             # POST /api/auth/login
│   │   └── register.js          # POST /api/auth/register
│   ├── projects/                 # Rutas de proyectos
│   │   └── [id].js              # GET/PUT/DELETE /api/projects/[id]
│   ├── projects.js               # GET/POST /api/projects
│   └── users.js                  # GET/POST /api/users
├── models/                       # Modelos de Mongoose (sin cambios)
├── config/                       # Configuración (sin cambios)
├── vercel.json                   # Configuración de Vercel
└── package.json                  # Dependencias
```

## 🔧 Configuración

### 1. Variables de Entorno

Configura estas variables en el dashboard de Vercel:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

### 2. Instalación Local

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local para desarrollo
cp .env.example .env.local

# Configurar variables de entorno locales
```

## 📡 Rutas Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `POST /api/users` - Crear nuevo usuario

### Proyectos
- `GET /api/projects` - Obtener todos los proyectos
- `POST /api/projects` - Crear nuevo proyecto
- `GET /api/projects/[id]` - Obtener proyecto específico
- `PUT /api/projects/[id]` - Actualizar proyecto
- `DELETE /api/projects/[id]` - Eliminar proyecto

## 🚀 Despliegue en Vercel

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Login en Vercel
```bash
vercel login
```

### 3. Desplegar
```bash
vercel
```

### 4. Configurar Variables de Entorno
En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`

## 🔄 Diferencias con Express Tradicional

### Antes (Express):
```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;
```

### Después (Vercel Serverless):
```javascript
// api/users.js
const { connectToDatabase } = require('./lib/mongodb');
const { withMiddleware, successResponse } = require('./lib/middleware');
const User = require('../models/User');

async function handler(req, res) {
  await connectToDatabase();
  
  if (req.method === 'GET') {
    const users = await User.find();
    return successResponse(res, users);
  }
}

module.exports = withMiddleware(handler);
```

## ⚡ Optimizaciones para Serverless

### 1. Conexión a MongoDB
- Reutiliza conexiones existentes
- Evita crear múltiples conexiones por request
- Configuración optimizada para serverless

### 2. Middleware
- CORS automático
- Manejo de errores centralizado
- Respuestas estandarizadas

### 3. Estructura de Archivos
- Cada ruta es una función independiente
- Parámetros dinámicos con `[id].js`
- Utilidades compartidas en `/lib`

## 🧪 Testing Local

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ejecutar localmente
vercel dev

# Las rutas estarán disponibles en:
# http://localhost:3000/api/users
# http://localhost:3000/api/projects
# etc.
```

## 📝 Notas Importantes

1. **Conexiones a MongoDB**: El código está optimizado para reutilizar conexiones
2. **Variables de Entorno**: Configúralas en el dashboard de Vercel
3. **Logs**: Los logs aparecerán en el dashboard de Vercel
4. **Cold Starts**: La primera request puede ser más lenta
5. **Timeouts**: Las funciones tienen un límite de tiempo de ejecución

## 🔍 Troubleshooting

### Error de Conexión a MongoDB
- Verifica que `MONGODB_URI` esté configurada correctamente
- Asegúrate de que la IP de Vercel esté en la whitelist de MongoDB Atlas

### Error de CORS
- El middleware de CORS está configurado automáticamente
- Verifica que las rutas estén correctas

### Error de JWT
- Verifica que `JWT_SECRET` esté configurada
- Usa una clave secreta fuerte en producción 