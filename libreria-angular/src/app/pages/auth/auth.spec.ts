import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from './auth';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { of, throwError } from 'rxjs';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  const mockAuthService = {
    login: jasmine.createSpy('login').and.returnValue(of({ token: '123', role: 'user' })),
    register: jasmine.createSpy('register').and.returnValue(of({ message: 'ok' })),
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ role: 'user' })
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, Auth],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call register and reset form on success', () => {
    component.registerForm.setValue({
      name: 'Usuario',
      email: 'user@test.com',
      password: '123456',
      role: 'user'
    });

    component.onRegister();

    expect(mockAuthService.register).toHaveBeenCalled();
    expect(component.registerError).toBeNull();
  });

  it('should call login and navigate on success', () => {
    component.loginForm.setValue({
      email: 'user@test.com',
      password: '123456'
    });

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/user']);
  });
});

