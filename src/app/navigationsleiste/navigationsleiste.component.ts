import { LoginService } from './../login.service';
import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';



@Component({
  selector: 'app-navigationsleiste',
  templateUrl: './navigationsleiste.component.html',
  styleUrls: ['./navigationsleiste.component.css']
})
export class NavigationsleisteComponent implements OnInit {


  constructor(
    private router: Router,
    private log: LoginService
    ) { }

  ngOnInit() {
  }

  // In beiden Fällen ausloggen, da die Meldung zum erfolgreichen Ausloggen als Error zurückgesendet wird
  logout() {
    this.log.logout().then(
      result => {
      sessionStorage.removeItem('user');
      this.router.navigate(['/']);
    },
    error => {
      sessionStorage.removeItem('user');
      this.router.navigate(['/']);
    });
  }

}
