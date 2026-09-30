# Punto 1 - Aplicación base de Sistema de Información Geográfica

API en Django con una pantalla básica en Angular. Permite buscar las coordenadas
de una ciudad, guardar ubicaciones favoritas y ver las 3 más cercanas a una ciudad.

## Cómo funciona

Backend (Django + Django REST Framework + Geopy + SQLite):

- GET /api/coordinates/?city=Bogotá
  Busca la ciudad con Geopy y devuelve su latitud y longitud.
- POST /api/favorite-locations/
  Guarda una ubicación con name, latitude y longitude.
  La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180.
- GET /api/favorite-locations/
  Devuelve todas las ubicaciones guardadas.
- GET /api/closest-locations/?city=Medellín
  Calcula la distancia en km desde la ciudad a cada ubicación guardada
  y devuelve las 3 más cercanas.

Errores: 400 si falta la ciudad, 404 si no se encuentra, 503 si el servicio
de Geopy no responde.

Frontend (Angular):
Una sola pantalla con tres secciones: buscar coordenadas, guardar y listar
favoritas, y consultar las 3 más cercanas. Muestra mensajes de carga,
lista vacía y error, y valida los campos antes de enviar.

## Cómo ejecutarlo

Backend:

cd backend
python -m venv .venv
.venv\Scripts\activate      (en Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

La API queda en http://127.0.0.1:8000

Frontend (en otra terminal):

cd frontend
npm install
npm start

La pantalla queda en http://localhost:4200. El backend debe estar corriendo.

Tests del backend:

python manage.py test

## Pendiente
Mapa interactivo, paginación, Docker y migración a PostgreSQL/PostGIS.
