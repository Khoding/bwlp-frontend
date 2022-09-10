import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nutzungsvereinbarung',
  templateUrl: './nutzungsvereinbarung.component.html',
  styleUrls: ['./nutzungsvereinbarung.component.css']
})
export class NutzungsvereinbarungComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    if (sessionStorage.getItem('user') == null) {
      this.router.navigate([`/`]);
    }
  }

}
