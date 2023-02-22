import { UserData, Satellite } from './../user';
import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent implements OnInit {
  sat1: Satellite;
  sat2: Satellite;
  user: UserData;
  setSatelliteAddress: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private formBuilder: FormBuilder,
    ) { }

  // return thrift interface of selected sat server
  onClick(): void {
    if (this.setSatelliteAddress.controls.sattelite.value === 'testaccount') {
      this.dialogRef.close(this.setSatelliteAddress.controls.address.value);
    } else {
      this.dialogRef.close(`https://${this.setSatelliteAddress.controls.sattelite.value}/thrift/`);
    }
  }

  // Schließt den Dialog und man wird nicht angemeldet
  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.user = JSON.parse(sessionStorage.getItem('user'));
    this.setSatelliteAddress = this.formBuilder.group({
      address: [''],
      sattelite: ['testaccount']
    });
  }

}
