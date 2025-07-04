import { Routes } from '@angular/router';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserLayoutComponent } from '../../shared/components/user/user-layout/user-layout.component';
import { UserTrainerListComponent } from './pages/user-trainer-list/user-trainer-list.component';
import { TrainerInfoComponent } from './pages/trainer-info/trainer-info.component';
import { AllTraninersComponent } from './pages/all-traniners/all-traniners.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [RoleGuard()],
    data: {role: 'user'},
    children: [
      {path: 'dashboard', component: UserDashboardComponent},
      {path: 'trainers', component: UserTrainerListComponent},
      {path: 'trainer-info/:id', component: TrainerInfoComponent},
      {path: 'all-trainers', component: AllTraninersComponent},
      {path: 'profile', component: UserProfileComponent}
    ]
  }
];
