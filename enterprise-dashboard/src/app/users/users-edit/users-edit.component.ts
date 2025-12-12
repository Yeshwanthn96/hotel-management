import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html'
})
export class UsersEditComponent implements OnInit {

  id: number = 0;
  model: any = {};

  constructor(
    private route: ActivatedRoute,
    private svc: UsersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.svc.list().subscribe((users: any[]) => {
      this.model = users.find(u => u.id === this.id) || {};
    });
  }

  save() {
    this.svc.update(this.id, this.model).subscribe(() => {
      this.router.navigate(['/users']);
    });
  }
}
