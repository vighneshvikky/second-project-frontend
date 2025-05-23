import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
import { GetUsersQuery } from '../../../shared/components/sidebar/sidebar.component';
import { Trainer } from '../../trainer/models/trainer.interface';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  id: string;
  email: string;
  name: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'trainer';
  createdAt: string;
  isBlocked: boolean;
  isVerified?: boolean;
  rejectionReason?: string;
  verificationStatus?: 'not_submitted' | 'pending' | 'rejected' | 'approved';
}

export interface GetUsersParams {
  search?: string;
  role?: 'user' | 'trainer';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.api}/admin`;

  constructor(private http: HttpClient) {}

  login(credentials: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    );
  }

  getUsers(params: GetUsersParams): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, {
      params: params as any,
    });
  }

  toggleBlockStatus(
    userId: string,
    role: 'user' | 'trainer'
  ): Observable<User> {
    console.log('userId', userId);
    return this.http.patch<User>(
      `${this.apiUrl}/users/${userId}/toggle-block`,
      null,
      {
        params: { role },
      }
    );
  }

  getUnverifiedTrainers(query: GetUsersQuery): Observable<PaginatedResponse<Trainer>> {
    return this.http.get<PaginatedResponse<Trainer>>(`${this.apiUrl}/listTrainers`, {
      params: query as any,
    });
  }

  getTrainers(): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(`${this.apiUrl}/trainers`);
  }

  acceptTrainer(trainerId: string): Observable<Trainer> {
    return this.http.patch<Trainer>(`${this.apiUrl}/verify-trainer/${trainerId}`, {});
  }

  rejectTrainer(trainerId: string, reason: string): Observable<Trainer> {
    console.log('trainerid', trainerId)
    return this.http.patch<Trainer>(`${this.apiUrl}/reject-trainer/${trainerId}`, { reason });
  }
}
