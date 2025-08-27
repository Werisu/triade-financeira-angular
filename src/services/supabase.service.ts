import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Configuração do Supabase usando variáveis de ambiente
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // Detecta tokens na URL
        flowType: 'pkce', // Usa PKCE para melhor segurança
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Método para verificar se o usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Método para obter a sessão atual
  async getSession() {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();
    return { session, error };
  }

  // Método para verificar se há uma sessão válida
  async hasValidSession(): Promise<boolean> {
    const { session } = await this.getSession();
    return session !== null && session.user !== null;
  }
}
