from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .models import FavoriteLocation
from .serializers import FavoriteLocationSerializer


def find_city(request):
    """Devuelve (city, coords, error_response)."""
    city = request.query_params.get("city", "").strip()
    if not city:
        return None, None, Response({"error": "Falta el parámetro city."}, status=400)
    try:
        coords = services.get_coordinates(city)
    except services.CityNotFound:
        return None, None, Response({"error": "No se encontró la ciudad " + city + "."}, status=404)
    except services.GeocodingUnavailable:
        return None, None, Response({"error": "El servicio de ubicación no responde, intenta de nuevo."}, status=503)
    return city, coords, None


class CoordinatesView(APIView):
    def get(self, request):
        city, coords, error = find_city(request)
        if error:
            return error
        return Response({"city": city, "latitude": round(coords[0], 4), "longitude": round(coords[1], 4)})


class FavoriteLocationListCreateView(generics.ListCreateAPIView):
    queryset = FavoriteLocation.objects.all()
    serializer_class = FavoriteLocationSerializer
    pagination_class = None


class ClosestLocationsView(APIView):
    def get(self, request):
        city, coords, error = find_city(request)
        if error:
            return error
        closest = services.closest_locations(coords, FavoriteLocation.objects.all())
        data = []
        for km, loc in closest:
            data.append({
                "id": loc.id,
                "name": loc.name,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "distance_km": round(km, 1),
            })
        return Response({"city": city, "closest_locations": data})
