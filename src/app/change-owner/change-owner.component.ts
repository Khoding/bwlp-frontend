import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource} from '@angular/material';
import {ChangeOwnerData} from '../virtuelle-maschine/virtuelle-maschine.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ImageSummaryRead} from '../vm';

@Component({
  selector: 'app-change-owner',
  templateUrl: './change-owner.component.html',
  styleUrls: ['./change-owner.component.css']
})
export class ChangeOwnerComponent implements OnInit {
  submitted = false;
  changeOwnerForm: FormGroup;
  change = false;
  displayedColumns = ['select', 'name'];
  possibleusers: MatTableDataSource<ImageSummaryRead>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ChangeOwnerData,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ChangeOwnerComponent>
  ) { }

  ngOnInit() {
    this.changeOwnerForm = this.formBuilder.group({
      owner: ['', Validators.required]
    });
    this.possibleusers = new MatTableDataSource<ImageSummaryRead>(this.data.user);
  }

  // Schließt das Pop-Up und liefert den Users zurück.
  submit() {
    this.submitted = true;
    if (this.changeOwnerForm.invalid) {
      return;
    }

    this.dialogRef.close(this.changeOwnerForm.controls.owner.value);
  }

  // Schließt das Pop-Up
  onNoClick() {
    this.dialogRef.close();
  }

  // Überprüft in diesem Fall ob ein User ausgewählt wurde.
  hasChanged() {
    this.change = true;
  }

  // Wendet einen Filter auf die User Tabelle an
  applyFilter(filterValue: string) {
    this.possibleusers.filter = filterValue.trim().toLowerCase();
  }
}
