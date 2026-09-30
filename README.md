# Punto 1 – Aplicación base de Sistema de Información Geográfica

API RESTful en Django + interfaz básica en Angular.

## Backend (Django 4.x, DRF, Geopy, SQLite)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py test          # tests (la geocodificación se simula con mocks)
python manage.py runserver     # http://127.0.0.1:8000
```

### Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/coordinates/?city=Bogotá` | Coordenadas de la ciudad (Geopy/Nominatim) |
| POST | `/api/favorite-locations/` | Registra `{name, latitude, longitude}` |
| GET | `/api/favorite-locations/` | Lista todas las favoritas |
| GET | `/api/closest-locations/?city=Medellín` | 3 favoritas más cercanas, con `distance_km` |

Errores: `400` sin `city`, `404` ciudad no encontrada, `503` geocodificador no disponible.

### Decisiones de diseño
- `services.py` aísla Geopy (geocodificación) y el cálculo de distancia (`geodesic`), lo que permite probar las vistas sin red.
- La distancia se calcula en Python con `geodesic` y se ordena; suficiente con SQLite y volúmenes pequeños.
- Validación de rangos: latitud ∈ [-90, 90], longitud ∈ [-180, 180].
- Nominatim exige un `user_agent` propio (`GEOCODER_USER_AGENT` en settings) y limita a ~1 petición/segundo.

## Frontend (Angular 17, componentes standalone)

```bash
cd frontend
npm install
npm start        # http://localhost:4200
```
La API debe estar corriendo en `127.0.0.1:8000` (CORS habilitado para `localhost:4200`).

## Registro de decisiones, dificultades y fuentes
- **Validación en dos capas:** formularios de Angular (campos obligatorios, rangos) y serializer de DRF como validación definitiva.
- **Estados de la interfaz:** cada sección muestra cargando, vacío y error; los errores de la API (400/404/503) se traducen a mensajes legibles.
- **Dificultad:** el entorno donde se escribió el código no permitía instalar dependencias, por lo que los tests y la compilación de Angular no se ejecutaron ahí; deben correrse en local.
- **Pendiente (retos opcionales):** mapa interactivo, paginación, Docker y migración a PostgreSQL/PostGIS (índice GiST y consulta KNN con `<->`).
- **Fuentes:** documentación de Django, Django REST Framework, Geopy (Nominatim) y Angular.
