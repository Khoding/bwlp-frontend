import { UserData, Satellite } from './../user';
import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import { LoginService } from '../login.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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
    private loginservice: LoginService,
    private formBuilder: FormBuilder,
    ) { }

  // Trägt auf den NodeJS Server den User in die Liste der angemeldeten User ein
  // Enthält zudem auf welchem Satellite-Server sich der User verbindet
  // Momentan noch Hardgecoded wegen der Testumgebung
  onClick(): void {
    if (this.setSatelliteAddress.controls.sattelite.value === 'testaccount') {
      this.dialogRef.close(this.setSatelliteAddress.controls.address.value);
    } else {
      this.dialogRef.close(this.setSatelliteAddress.controls.sattelite.value);
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
