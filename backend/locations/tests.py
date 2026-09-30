from unittest.mock import patch

from rest_framework.test import APITestCase

from . import services
from .models import FavoriteLocation

BOGOTA = (4.711, -74.0721)
MEDELLIN = (6.2442, -75.5812)


class ApiTests(APITestCase):
    @patch("locations.services.get_coordinates", return_value=BOGOTA)
    def test_coordinates(self, mock):
        r = self.client.get("/api/coordinates/?city=Bogotá")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json(), {"city": "Bogotá", "latitude": 4.711, "longitude": -74.0721})

    def test_coordinates_requires_city(self):
        self.assertEqual(self.client.get("/api/coordinates/").status_code, 400)

    @patch("locations.services.get_coordinates", side_effect=services.CityNotFound())
    def test_city_not_found(self, _):
        self.assertEqual(self.client.get("/api/coordinates/?city=zzz").status_code, 404)

    @patch("locations.services.get_coordinates", side_effect=services.GeocodingUnavailable())
    def test_geocoder_down(self, _):
        self.assertEqual(self.client.get("/api/closest-locations/?city=x").status_code, 503)

    def test_create_and_list_favorites(self):
        body = {"name": "Museo del Oro", "latitude": 4.5981, "longitude": -74.0760}
        r = self.client.post("/api/favorite-locations/", body, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json(), {"id": 1, **body})
        self.assertEqual(len(self.client.get("/api/favorite-locations/").json()), 1)

    def test_invalid_latitude_rejected(self):
        r = self.client.post(
            "/api/favorite-locations/", {"name": "X", "latitude": 99, "longitude": 0}, format="json"
        )
        self.assertEqual(r.status_code, 400)

    @patch("locations.services.get_coordinates", return_value=MEDELLIN)
    def test_closest_three_sorted(self, _):
        for name, lat, lon in [
            ("Museo del Oro", 4.5981, -74.0760),   # Bogotá (~240 km)
            ("Parque Arví", 6.2907, -75.4905),      # ~11 km
            ("Cartagena", 10.3910, -75.4794),       # ~ 400 km
            ("Parque Explora", 6.2706, -75.5656),   # ~ 3 km
            ("Cali", 3.4516, -76.5320),             # ~ 340 km
        ]:
            FavoriteLocation.objects.create(name=name, latitude=lat, longitude=lon)
        r = self.client.get("/api/closest-locations/?city=Medellín").json()
        names = [x["name"] for x in r["closest_locations"]]
        self.assertEqual(names, ["Parque Explora", "Parque Arví", "Museo del Oro"])
        dists = [x["distance_km"] for x in r["closest_locations"]]
        self.assertEqual(dists, sorted(dists))

    @patch("locations.services.get_coordinates", return_value=MEDELLIN)
    def test_closest_with_fewer_than_three(self, _):
        FavoriteLocation.objects.create(name="A", latitude=6.25, longitude=-75.56)
        r = self.client.get("/api/closest-locations/?city=Medellín").json()
        self.assertEqual(len(r["closest_locations"]), 1)
