# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a la Plataforma Escolar! Este documento proporciona directrices y pasos para contribuir al proyecto.

## 📋 Código de Conducta

Por favor, lee y respeta nuestro [Código de Conducta](./CODE_OF_CONDUCT.md). Esperamos que todos los contribuidores traten a otros con respeto y profesionalismo.

## 🐛 Reportar Bugs

Si encontraste un bug, por favor crea un issue con la siguiente información:

1. **Descripción clara** del problema
2. **Pasos para reproducirlo**
3. **Comportamiento esperado**
4. **Comportamiento actual**
5. **Capturas de pantalla** (si aplica)
6. **Información del sistema**:
   - OS
   - Navegador (si es frontend)
   - Versión de Node.js
   - Versión del proyecto

### Ejemplo de Issue

```
Título: [BUG] No se pueden enviar tareas con archivos PDF

Descripción:
Cuando intento enviar una tarea con un archivo PDF, recibo un error.

Pasos para reproducir:
1. Iniciar sesión como estudiante
2. Ir a la sección de tareas
3. Intentar enviar una tarea con un archivo PDF
4. Ver error

Esperado: La tarea se envía correctamente

Actual: Error 500 en el servidor

Sistema:
- OS: Windows 10
- Navegador: Chrome 120
- Node: 18.17.0
```

## 💡 Sugerir Mejoras

¿Tienes una idea para mejorar la plataforma? Abre un issue con:

1. **Descripción clara** de la mejora
2. **Caso de uso** y beneficios
3. **Ejemplos** o mockups (si aplica)
4. **Impacto potencial** en el proyecto

## 🔧 Proceso de Contribución

### 1. Fork el Repositorio

```bash
git clone https://github.com/Diego558-coder/plataforma-escolar.git
cd plataforma-escolar
```

### 2. Crea una Rama

```bash
# Actualiza main
git checkout main
git pull origin main

# Crea una rama para tu feature
git checkout -b feature/nombre-descriptivo
# o para bugs
git checkout -b bugfix/nombre-descriptivo
```

**Nomenclatura de ramas:**
- `feature/` - Para nuevas características
- `bugfix/` - Para correcciones de bugs
- `docs/` - Para documentación
- `refactor/` - Para refactorización
- `test/` - Para tests

### 3. Realiza tus Cambios

```bash
# Instala dependencias
npm install

# Hacer cambios en el código
# ...

# Asegúrate de que los tests pasen
npm test

# Formatea el código
npm run lint
```

### 4. Commit de Cambios

Sigue esta convención de commits:

```
<tipo>(<alcance>): <descripción>

<cuerpo>

<pie de página>
```

**Tipos:**
- `feat:` - Nueva característica
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios que no afectan el código (formato, espacios, etc.)
- `refactor:` - Cambios en código sin agregar features ni bugs
- `perf:` - Mejoras de rendimiento
- `test:` - Agregar o actualizar tests
- `ci:` - Cambios en CI/CD

### Ejemplo de Commit

```bash
git commit -m "feat(auth): agregar autenticación de dos factores

- Implementar TOTP para 2FA
- Agregar nuevas rutas de API
- Actualizar base de datos

Closes #123"
```

### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo

# Abre un PR en GitHub
```

**Template de Pull Request:**

```markdown
## Descripción
Describe brevemente los cambios que haces.

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Breaking change
- [ ] Cambio en documentación

## Cambios propuestos
- Cambio 1
- Cambio 2

## Testing
Describe cómo testear estos cambios.

## Checklist
- [ ] Mi código sigue el estilo del proyecto
- [ ] He actualizado la documentación
- [ ] He agregado tests
- [ ] Los tests pasan localmente
- [ ] No hay warnings nuevos

## Screenshots
(Si aplica)
```

## 📝 Estándares de Código

### TypeScript/JavaScript

```typescript
// ✅ BIEN
export interface User {
  id: string;
  email: string;
  name: string;
}

export async function getUser(id: string): Promise<User> {
  // ...
}

// ❌ MAL
export function getUser(id) {
  // ...
}
```

### Convenciones

- Usa **camelCase** para variables y funciones
- Usa **PascalCase** para clases e interfaces
- Usa **UPPER_SNAKE_CASE** para constantes
- Escribe comentarios para lógica compleja
- Mantén funciones pequeñas y enfocadas

### ESLint y Prettier

```bash
# Verificar código
npm run lint

# Formatear código
npm run format
```

## 🧪 Testing

Todos los cambios deben incluir tests.

```bash
# Ejecutar tests
npm test

# Con cobertura
npm run test:coverage

# En modo watch
npm run test:watch
```

## 📚 Documentación

- Actualiza el `README.md` si cambias funcionalidad
- Documenta nuevas rutas API
- Incluye ejemplos en comentarios del código
- Actualiza el `CHANGELOG.md`

## 🚀 Deployment

Los cambios en `main` se despliegan automáticamente en producción.

### Versioning

Seguimos [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - Nueva funcionalidad compatible
- **PATCH** - Bug fixes

## 📞 Preguntas o Ayuda

- Abre un **Discussion** en GitHub
- Envía un email a `support@plataformaescolar.com`
- Contacta directamente en Issues

## 🎯 Áreas de Contribución

Estos son los temas donde podemos usar ayuda:

- **Backend**: Mejoras en API, optimizaciones
- **Frontend**: UI/UX, responsividad
- **Documentación**: Guías, tutoriales
- **Testing**: Cobertura de tests
- **Traducción**: Soporte para otros idiomas
- **DevOps**: Mejoras en CI/CD

---

¡Gracias por contribuir a hacer Plataforma Escolar mejor! 🎉
