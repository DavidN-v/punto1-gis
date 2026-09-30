import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <main>
    <h1>Aplicación GIS</h1>

    <section>
      <h2>Coordenadas de una ciudad</h2>
      <form #form1="ngForm" (ngSubmit)="searchCoords()">
        <input name="city" [(ngModel)]="city" required placeholder="Ej: Bogotá">
        <button type="submit" [disabled]="form1.invalid || loading1">Buscar</button>
      </form>
      <p *ngIf="loading1">Buscando...</p>
      <p class="error" *ngIf="error1">{{ error1 }}</p>
      <p *ngIf="coords">{{ coords.city }}: latitud {{ coords.latitude }}, longitud {{ coords.longitude }}</p>
    </section>

    <section>
      <h2>Ubicaciones favoritas</h2>
      <form #form2="ngForm" (ngSubmit)="save()">
        <input name="name" [(ngModel)]="name" required placeholder="Nombre">
        <input name="lat" type="number" step="any" [(ngModel)]="lat" required min="-90" max="90" placeholder="Latitud">
        <input name="lon" type="number" step="any" [(ngModel)]="lon" required min="-180" max="180" placeholder="Longitud">
        <button type="submit" [disabled]="form2.invalid || saving">Guardar</button>
        <small class="error" *ngIf="form2.submitted && form2.invalid">Revisa los campos: latitud de -90 a 90 y longitud de -180 a 180.</small>
      </form>
      <p class="error" *ngIf="error2">{{ error2 }}</p>
      <p *ngIf="loading2">Cargando...</p>
      <p *ngIf="!loading2 && !error3 && favorites.length == 0">Todavía no hay ubicaciones guardadas.</p>
      <p class="error" *ngIf="error3">{{ error3 }}</p>
      <table *ngIf="favorites.length > 0">
        <tr><th>ID</th><th>Nombre</th><th>Latitud</th><th>Longitud</th></tr>
        <tr *ngFor="let f of favorites"><td>{{ f.id }}</td><td>{{ f.name }}</td><td>{{ f.latitude }}</td><td>{{ f.longitude }}</td></tr>
      </table>
    </section>

    <section>
      <h2>3 ubicaciones más cercanas</h2>
      <form #form3="ngForm" (ngSubmit)="searchClosest()">
        <input name="city2" [(ngModel)]="city2" required placeholder="Ej: Medellín">
        <button type="submit" [disabled]="form3.invalid || loading3">Consultar</button>
      </form>
      <p *ngIf="loading3">Consultando...</p>
      <p class="error" *ngIf="error4">{{ error4 }}</p>
      <p *ngIf="searched && !loading3 && !error4 && closest.length == 0">No hay ubicaciones guardadas para comparar.</p>
      <table *ngIf="closest.length > 0">
        <tr><th>Nombre</th><th>Latitud</th><th>Longitud</th><th>Distancia (km)</th></tr>
        <tr *ngFor="let c of closest"><td>{{ c.name }}</td><td>{{ c.latitude }}</td><td>{{ c.longitude }}</td><td>{{ c.distance_km }}</td></tr>
      </table>
    </section>
  </main>`,
  styles: [`
    main { max-width: 800px; margin: 0 auto; padding: 20px; }
    section { background: white; padding: 15px 20px; margin-bottom: 15px; border-radius: 6px; }
    input { padding: 5px; margin-right: 5px; }
    table { width: 100%; margin-top: 10px; text-align: left; }
    .error { color: #b00020; }
  `]
})
export class AppComponent implements OnInit {
  city = '';
  coords: any = null;
  loading1 = false;
  error1 = '';

  name = '';
  lat: number | null = null;
  lon: number | null = null;
  favorites: any[] = [];
  loading2 = false;
  saving = false;
  error2 = '';
  error3 = '';

  city2 = '';
  closest: any[] = [];
  searched = false;
  loading3 = false;
  error4 = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadFavorites();
  }

  searchCoords() {
    this.loading1 = true;
    this.error1 = '';
    this.coords = null;
    this.api.getCoordinates(this.city).subscribe({
      next: (data) => { this.coords = data; this.loading1 = false; },
      error: (err) => { this.error1 = this.getError(err); this.loading1 = false; }
    });
  }

  loadFavorites() {
    this.loading2 = true;
    this.error3 = '';
    this.api.getFavorites().subscribe({
      next: (data) => { this.favorites = data; this.loading2 = false; },
      error: (err) => { this.error3 = this.getError(err); this.loading2 = false; }
    });
  }

  save() {
    this.saving = true;
    this.error2 = '';
    const place = { name: this.name, latitude: this.lat, longitude: this.lon };
    this.api.saveFavorite(place).subscribe({
      next: () => {
        this.name = '';
        this.lat = null;
        this.lon = null;
        this.saving = false;
        this.loadFavorites();
      },
      error: (err) => { this.error2 = this.getError(err); this.saving = false; }
    });
  }

  searchClosest() {
    this.loading3 = true;
    this.error4 = '';
    this.closest = [];
    this.searched = true;
    this.api.getClosest(this.city2).subscribe({
      next: (data) => { this.closest = data.closest_locations; this.loading3 = false; },
      error: (err) => { this.error4 = this.getError(err); this.loading3 = false; }
    });
  }

  getError(err: any) {
    if (err.status == 0) {
      return 'No se pudo conectar con la API. Revisa que Django esté corriendo.';
    }
    if (err.error && err.error.error) {
      return err.error.error;
    }
    if (err.status == 400) {
      return 'Datos inválidos, revisa los campos.';
    }
    return 'Ocurrió un error.';
  }
}
