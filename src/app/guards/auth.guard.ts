import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.loading$.pipe(
      filter((loading) => !loading), // Aguarda até não estar mais carregando
      take(1),
      switchMap(() => this.authService.currentUser$), // Depois verifica o usuário
      take(1),
      map((user) => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['/auth']);
          return false;
        }
      })
    );
  }
}
