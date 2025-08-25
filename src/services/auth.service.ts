import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../types';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  public currentUser$ = this.currentUserSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const user = await this.supabaseService.getCurrentUser();
    if (user) {
      this.currentUserSubject.next({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
      });
    }
    this.loadingSubject.next(false);

    this.supabaseService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUserSubject.next({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at,
        });
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
      }
    });
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseService.signIn(email, password);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseService.signUp(email, password);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signOut(): Promise<void> {
    await this.supabaseService.signOut();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
