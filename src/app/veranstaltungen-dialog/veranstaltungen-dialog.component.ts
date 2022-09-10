import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DialogData} from '../veranstaltungen/veranstaltungen.component';

@Component({
  selector: 'app-veranstaltungen-dialog',
  templateUrl: './veranstaltungen-dialog.component.html',
  styleUrls: ['./veranstaltungen-dialog.component.css']
})
export class VeranstaltungenDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<VeranstaltungenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {

  }

}
