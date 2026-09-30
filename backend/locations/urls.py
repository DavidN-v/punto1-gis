from django.urls import path

from .views import ClosestLocationsView, CoordinatesView, FavoriteLocationListCreateView

urlpatterns = [
    path("coordinates/", CoordinatesView.as_view(), name="coordinates"),
    path("favorite-locations/", FavoriteLocationListCreateView.as_view(), name="favorite-locations"),
    path("closest-locations/", ClosestLocationsView.as_view(), name="closest-locations"),
]
