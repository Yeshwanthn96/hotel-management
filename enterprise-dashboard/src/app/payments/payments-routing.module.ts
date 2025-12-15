import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsListComponent } from './payments-list/payments-list.component';
import { PaymentsAddComponent } from './payments-add/payments-add.component';
import { UserPaymentsComponent } from './user-payments/user-payments.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';

const routes: Routes = [
  { path: '', component: UserPaymentsComponent }, // User's own payments
  { path: 'history', component: UserPaymentsComponent },
  { path: 'add', component: PaymentsAddComponent },
  { path: 'details/:id', component: PaymentDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsRoutingModule {}
