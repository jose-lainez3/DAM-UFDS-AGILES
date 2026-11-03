
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="logo-container" [class.login]="modo === 'login'">
      <img src="assets/logo.png" alt="Logo del local" />
      @if (mostrarNombre) {
        <span>FoodOrder</span>
      }
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    img {
      width: 38px;
      height: 38px;
      object-fit: contain;
    }

    span {
      color: #10372f;
      font-size: 19px;
      font-weight: 800;
    }

    .login {
      flex-direction: column;
      gap: 14px;
    }

    .login img {
      width: 110px;
      height: 110px;
    }

    .login span {
      font-size: 26px;
    }
  `],
})
export class LogoComponent {
  @Input() modo: 'normal' | 'login' = 'normal';
  @Input() mostrarNombre = true;
}
