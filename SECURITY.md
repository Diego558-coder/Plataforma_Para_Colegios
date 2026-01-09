# 🔒 Política de Seguridad

## Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad, **por favor no la hagas pública**. En su lugar, envía un email a:

**📧 security@plataformaescolar.com**

Por favor incluye:

1. **Descripción** de la vulnerabilidad
2. **Pasos para reproducirla**
3. **Impacto potencial**
4. **Sugerencias de corrección** (si aplica)

Haremos todo lo posible por:
- Responder dentro de 48 horas
- Tener un fix dentro de 2 semanas (dependiendo de la severidad)
- Reconocer tu contribución al reportar

## Prácticas de Seguridad

### Autenticación
- ✅ JWT con expiración
- ✅ Refresh token rotation
- ✅ Bcrypt para contraseñas
- ✅ Rate limiting en login

### Autorización
- ✅ Role-Based Access Control (RBAC)
- ✅ Validación en servidor siempre
- ✅ Middleware de permisos

### Protección de Datos
- ✅ HTTPS en producción
- ✅ Variables de entorno para secretos
- ✅ Sanitización de inputs
- ✅ CORS configurado
- ✅ SQL Injection prevention (Prisma)
- ✅ XSS protection

### Almacenamiento
- ✅ Hashing de contraseñas
- ✅ Encriptación de datos sensibles
- ✅ Backups regulares

---

## Requisitos de Contraseña

Las contraseñas deben tener:
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 número
- Al menos 1 carácter especial

---

## Actualizaciones de Seguridad

Mantén tus dependencias actualizadas:

```bash
npm audit
npm audit fix
```

---

## Niveles de Severidad

| Nivel | Respuesta | Ejemplo |
|-------|-----------|---------|
| 🔴 Crítico | 24 horas | Remote code execution |
| 🟠 Alto | 48 horas | Authentication bypass |
| 🟡 Medio | 1 semana | Data leakage |
| 🟢 Bajo | 2 semanas | Minor vulnerability |

---

## Disclaimer

Aunque hacemos todo lo posible por asegurar esta plataforma, no podemos garantizar seguridad absoluta. Úsala bajo tu propio riesgo.

---

Gracias por ayudarnos a mantener Plataforma Escolar segura.
