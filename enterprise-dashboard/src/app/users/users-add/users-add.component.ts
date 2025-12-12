import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html'
})
export class UsersAddComponent {
  name = '';
  email = '';
  role = '';
  constructor(private svc: UsersService, private router: Router) {}
  save(){ this.svc.add({name:this.name, email: this.email,role:this.role}).subscribe(()=> this.router.navigate(['/users'])); }
}
