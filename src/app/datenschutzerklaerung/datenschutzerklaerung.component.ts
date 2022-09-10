import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-datenschutzerklaerung',
  templateUrl: './datenschutzerklaerung.component.html',
  styleUrls: ['./datenschutzerklaerung.component.css']
})
export class DatenschutzerklaerungComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    if (sessionStorage.getItem('user') == null) {
      this.router.navigate([`/`]);
    }
  }

}
