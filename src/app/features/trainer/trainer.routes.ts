import { Routes } from '@angular/router';
import { TrainerDashboardComponent } from './pages/trainer-dashboard/trainer-dashboard.component';
import { TrainerVerificationComponent } from './pages/trainer-verification/trainer-verification.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { TrainerProfileComponent } from './pages/trainer-profile/trainer-profile.component';
import { TrainerLayoutComponent } from '../../shared/components/trainer/trainer-layout/trainer-layout.component';
import { TrainerSlotAvailabilityComponent } from './pages/trainer-slot-availability/trainer-slot-availability.component';

export const trainerRoutes: Routes = [
  {
    path: '',
    component: TrainerLayoutComponent,
    canActivate: [RoleGuard()],
    data: { role: 'trainer' },
    children: [
      { path: 'dashboard', component: TrainerDashboardComponent },
      { path: 'trainer-requests', component: TrainerVerificationComponent },
      { path: 'profile', component: TrainerProfileComponent },
      { path: 'availablity', component: TrainerSlotAvailabilityComponent },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
