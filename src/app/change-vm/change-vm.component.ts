import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ImageSummaryRead } from '../vm';
import { ChangeVmData } from '../veranstaltung/veranstaltung.component';

@Component({
  selector: 'app-change-vm',
  templateUrl: './change-vm.component.html',
  styleUrls: ['./change-vm.component.css']
})
export class ChangeVmComponent implements OnInit {
  submitted = false;
  changeVmForm: FormGroup;
  change = false;
  displayedColumns = ['select', 'name', 'betriebssystem', 'besitzer', 'geaendert', 'ablaufdatum', 'groesse', 'verwendbar'];
  vms: MatTableDataSource<ImageSummaryRead>;
  constructor(@Inject(MAT_DIALOG_DATA) public data: ChangeVmData,
              private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<ChangeVmComponent>) { }

  ngOnInit() {
    this.changeVmForm = this.formBuilder.group({
      imageVersionId : ['', Validators.required]
    });
    this.vms = new MatTableDataSource<ImageSummaryRead>(this.data.vms);
  }

  // Schließt das Pop-Up und liefert die VM zurück.
  submit() {
    this.submitted = true;
    if (this.changeVmForm.invalid) {
      return;
    }

    this.dialogRef.close(this.changeVmForm.controls.imageVersionId.value);
  }

  // Schließt das Pop-Up
  onNoClick() {
    this.dialogRef.close();
  }

  // Überprüft in diesem Fall ob eine VM ausgewählt wurde.
  hasChanged() {
    this.change = true;
  }

  // Wendet einen Filter auf die VM Tabelle an
  applyFilter(filterValue: string) {
    this.vms.filter = filterValue.trim().toLowerCase();
  }


}
