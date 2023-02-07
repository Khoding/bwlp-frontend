import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {LoginDialogComponent} from '../login-dialog/login-dialog.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoginService} from '../login.service';
import { ThriftService } from '../thrift.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [ ]
})
export class LoginComponent implements OnInit {
  submitted = false;
  loginForm: FormGroup;
  loginfailed = false;
  satfailed = false;
  constructor(public dialog: MatDialog,
              private formBuilder: FormBuilder,
              private loginservice: LoginService,
              private thriftService: ThriftService,
              private router: Router) { }

  openDialog(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(address => {
      const user = JSON.parse(sessionStorage.getItem('user'));
      this.loginservice.setSat(user, address).then((token: any) => {
          this.router.navigate([`/vms`]);
        }, error => {
          console.log(error.error);
          this.satfailed = true;
        });
    });
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      token: ['', Validators.required]
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  // Methode zum Einloggen eines Testaccounts
  login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    /*this.thriftService.login(this.form.username.value, this.form.password.value).subscribe((clientSessionData: ClientSessionData) => {
      sessionStorage.setItem('user', JSON.stringify(clientSessionData));
      this.loginfailed = false;
      this.satfailed = false;
      this.openDialog();
    }, error => {
      console.log(error.error);
      this.loginfailed = true;
    });*/
    // use temporary solution for login
    sessionStorage.setItem('user', JSON.stringify(new ClientSessionData({ sessionId: '',  authToken: this.form.token.value, satellites: null, userInfo: null })))
    console.log(JSON.parse(sessionStorage.getItem('user')));
    this.router.navigate([`/vms`]);
  }

}
