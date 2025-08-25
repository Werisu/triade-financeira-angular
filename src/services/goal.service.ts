import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Goal } from '../types';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public goals$ = this.goalsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  async loadGoals(userId: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true });

      if (error) throw error;
      this.goalsSubject.next(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      this.goalsSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async addGoal(
    goal: Omit<Goal, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('goals')
        .insert([goal])
        .select()
        .single();

      if (error) throw error;

      const currentGoals = this.goalsSubject.value;
      this.goalsSubject.next([...currentGoals, data]);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateGoal(
    id: string,
    updates: Partial<Goal>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const currentGoals = this.goalsSubject.value;
      const updatedGoals = currentGoals.map((g) => (g.id === id ? data : g));
      this.goalsSubject.next(updatedGoals);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteGoal(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabaseService.getClient().from('goals').delete().eq('id', id);

      if (error) throw error;

      const currentGoals = this.goalsSubject.value;
      this.goalsSubject.next(currentGoals.filter((g) => g.id !== id));

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getGoals(): Goal[] {
    return this.goalsSubject.value;
  }
}
