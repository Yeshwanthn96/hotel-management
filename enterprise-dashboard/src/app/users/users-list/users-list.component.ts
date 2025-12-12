import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  items:any[] = [];
  constructor(private svc: UsersService) {}
  ngOnInit() { this.load(); }
  load(){ this.svc.list().subscribe((r:any)=> this.items = r || []); }
  delete(id: number) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    this.svc.delete(id).subscribe(() => {
      this.load(); // refresh the list
    });
  }
}
