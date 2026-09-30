from django.conf import settings
from geopy.distance import geodesic
from geopy.exc import GeopyError
from geopy.geocoders import Nominatim


class CityNotFound(Exception):
    pass


class GeocodingUnavailable(Exception):
    pass


def get_coordinates(city):
    geolocator = Nominatim(user_agent=settings.GEOCODER_USER_AGENT)
    try:
        place = geolocator.geocode(city, timeout=settings.GEOCODER_TIMEOUT)
    except GeopyError:
        raise GeocodingUnavailable()
    if place is None:
        raise CityNotFound()
    return place.latitude, place.longitude


def closest_locations(point, locations, limit=3):
    result = []
    for loc in locations:
        km = geodesic(point, (loc.latitude, loc.longitude)).kilometers
        result.append((km, loc))
    result.sort(key=lambda item: item[0])
    return result[:limit]
