import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { TrainerService } from '../../services/trainer.service';
import { map, Observable, take } from 'rxjs';
import {
  AuthenticatedUser,
  updateCurrentUser,
} from '../../../auth/store/actions/auth.actions';
import { selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';
import { CommonModule } from '@angular/common';
import { isTrainer, isUser } from '../../../../core/guards/user-type-guards';
import { Trainer } from '../../models/trainer.interface';
import { NotyService } from '../../../../core/services/noty.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trainer-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trainer-profile.component.html',
  styleUrl: './trainer-profile.component.scss',
})
export class TrainerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentTrainer$!: Observable<Trainer | null>;
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private trainerService = inject(TrainerService);
  private notify = inject(NotyService);
  private router = inject(Router);
  private http = inject(HttpClient);

  readonly S3_BASE_URL =
    'https://vortexfit-app-upload.s3.ap-south-1.amazonaws.com/';
  certPreviewUrl?: string;
  imagePreviewUrl?: string;

  ngOnInit(): void {

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      specialization: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0)]],
      bio: ['', Validators.maxLength(1000)],
      certificationUrl: [''],
      image: [''],
    });



  this.currentTrainer$ = this.store.select(selectCurrentUser).pipe(
    map((user) => (isTrainer(user) ? {
      ...user,
      certificationUrl: this.formatKey(user.certificationUrl)
    } : null))
  );

  // Patch the form only once, on first value
  this.currentTrainer$.pipe(take(1)).subscribe((trainer) => {
    if (trainer) {
      this.profileForm.patchValue(trainer);
    }
  });
  }

  onFileSelect(event: Event, field: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const contentType = file.type;
    const fileName = file.name;

    this.trainerService
      .getSignedUploadUrl(fileName, contentType, field)
      .subscribe({
        next: ({ url, key }) => {
          // Upload directly to S3 using signed URL
          this.http
            .put(url, file, {
              headers: { 'Content-Type': contentType },
            })
            .subscribe({
              next: () => {
                const fullUrl = `https://vortexfit-app-upload.s3.ap-south-1.amazonaws.com/${key}`;
                console.log('Full URL:', fullUrl);
                this.profileForm.patchValue({ [field]: fullUrl });

               
                if (field === 'image') this.imagePreviewUrl = fullUrl;
                if (field === 'certificationUrl') this.certPreviewUrl = fullUrl;
              },
              error: (err) => console.error('Upload to S3 failed', err),
            });
        },
        error: (err) => console.error('Failed to get signed URL', err),
      });
  }

  private formatKey(key?: string | null): string | undefined {
  return key ? this.S3_BASE_URL + encodeURIComponent(key).replace(/%2F/g, '/') : undefined;
}


  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const profileData = this.profileForm.value;

    this.trainerService.updateProfile(profileData).subscribe({
      next: (updatedTrainer: Trainer) => {
        this.store.dispatch(updateCurrentUser({ user: updatedTrainer }));
        this.notify.showSuccess('Profile updated successfully');
        this.router.navigate(['/trainer/profile']);
      },
      error: (err) => {
        console.error(err);
        this.notify.showError('Profile updation failed');
        this.router.navigate(['/trainer/profile']);
      },
    });
  }
}
