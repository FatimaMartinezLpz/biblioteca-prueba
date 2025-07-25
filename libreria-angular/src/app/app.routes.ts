import { Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { HomeComponent } from './pages/home/home';
import { AuthGuard } from './pages/auth/guards/auth-guard';
import { AdminGuard } from './pages/auth/guards/admin-guard';
import { HomeAdmin } from './pages/home-admin/home-admin';
import { CarritoComponent } from './pages/carrito/carrito';



export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: Auth },
  { path: 'home', component: HomeComponent },
  { path: 'user', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: HomeAdmin, canActivate: [AdminGuard] },
  { path: 'carrito', component: CarritoComponent },
    { path: '**', redirectTo: 'auth' },


];