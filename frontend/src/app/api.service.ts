import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  url = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getCoordinates(city: string) {
    return this.http.get<any>(this.url + '/coordinates/?city=' + encodeURIComponent(city));
  }

  getFavorites() {
    return this.http.get<any[]>(this.url + '/favorite-locations/');
  }

  saveFavorite(place: any) {
    return this.http.post<any>(this.url + '/favorite-locations/', place);
  }

  getClosest(city: string) {
    return this.http.get<any>(this.url + '/closest-locations/?city=' + encodeURIComponent(city));
  }
}
