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
    ) { }

  ngOnInit() {
  }

  loggedIn() {
    return this.router.url != '/';
  }


  logout() {
    sessionStorage.removeItem('user');
    this.router.navigate(['/']);
  }

}
