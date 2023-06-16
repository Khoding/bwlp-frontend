import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MAT_DIALOG_DATA, MatDialogRef, MatSort } from '@angular/material';
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
  displayedColumns = ['select', 'imageName', 'osId', 'ownerId', 'updateTime', 'expireTime', 'fileSize', 'isValid'];
  vms: MatTableDataSource<ImageSummaryRead>;
  users: UserInfo[];
  osList: OperatingSystem[];
  defaultFilterPredicate?: (record: any, filter: string) => boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ChangeVmData,
              private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<ChangeVmComponent>) { }

  @ViewChild(MatSort, {static:false}) set matSort(sort: MatSort) {
    this.vms.sort = sort;
  }

  ngOnInit() {
    this.changeVmForm = this.formBuilder.group({
      imageVersionId : ['', Validators.required]
    });
    this.vms = new MatTableDataSource<ImageSummaryRead>(this.data.vms);
    this.users = this.data.users;
    this.osList = this.data.osList;

    this.setFilter();
    this.setSorting();
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

  setFilter() {
    this.defaultFilterPredicate = this.vms.filterPredicate;

    this.vms.filterPredicate = (record: ImageSummaryRead, filter: string) => {
      filter = filter.trim().toLowerCase();

      const osName = this.osList[record.osId - 1].osName.trim().toLowerCase();
      
      return this.defaultFilterPredicate(record, filter) || osName.indexOf(filter) != -1;
    }
  }

  setSorting() {
    this.vms.sortingDataAccessor = (row: ImageSummaryRead, columnName: string) => {
      // resolve osId, else get column normally
      var sortValue = columnName == 'osId' ? this.osList[row.osId - 1].osName : row[columnName];

      if (typeof sortValue === 'string') {
        sortValue = sortValue.toLowerCase();
      }

      return sortValue;
    }
  }

}
