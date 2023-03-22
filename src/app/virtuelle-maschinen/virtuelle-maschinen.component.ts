import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { UserInfo } from './../user';
import { ThriftService } from '../thrift.service';
import { VirtuelleMaschinenDialogComponent } from '../virtuelle-maschinen-dialog/virtuelle-maschinen-dialog.component';
import { MatSort, Sort } from '@angular/material/sort';

export interface VmDialogData {
  vms;
}

@Component({
  selector: 'app-virtuelle-maschinen',
  templateUrl: './virtuelle-maschinen.component.html',
  styleUrls: ['./virtuelle-maschinen.component.css'],
})
export class VirtuelleMaschinenComponent implements OnInit {
  vms: MatTableDataSource<ImageSummaryRead>;
  users: UserInfo[];
  osList: OperatingSystem[];
  selection = new SelectionModel<ImageSummaryRead>(true, []);
  amountOfVms: number;

  displayedColumns = ['select', 'imageName', 'osId', 'ownerId', 'updateTime', 'expireTime', 'fileSize', 'isValid', 'isTemplate',
    'versionCount', 'fileSizeSum'];

    @ViewChild(MatSort, {static:false}) set matSort(sort: MatSort) {
      this.vms.sort = sort;
    }

  constructor(
    private thriftService: ThriftService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  // Prüft ob die Anzahl der ausgewählten Elemente mit der Gesamtanzahl der Zeilen übereinstimmt.
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.vms.data.length;
    return numSelected === numRows;
  }

  // Selektiert alle Zeilen, wenn sie nicht alle selektiert sind, sonst wird Auswahl aufgehoben.
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.vms.data.forEach(row => this.selection.select(row));
  }

  // Die VMs werden vom NodeJS abgerufen
  // Alle VMs werden in die Tabelle geladen
  ngOnInit() {
    this.getVms();
  }

  // Liefert eine Liste mit allen VMs auf dem Server zurück
  getVms() {
    if (sessionStorage.getItem('user') == null) {
      this.router.navigate([`/`]);
    } else {
      this.thriftService.getUserList().subscribe(
        (users: UserInfo[]) => {
          this.users = users;
          this.thriftService.getOsList().subscribe(
            (osList: OperatingSystem[]) => {
              this.osList = osList;
              this.thriftService.getVms().then(
                (vms: ImageSummaryRead[]) => {
                  this.vms = new MatTableDataSource(vms);
                  this.amountVms();
                });
            });
        },
        error => {
          console.log(error.error);
          this.router.navigate([`/`]);
        });
    }
  }

  // Löscht jede VM die vom Benutzer ausgewählt wurde
  // Wenn der Benutzer nicht ausreichende Rechte zum Löschen besitzt, wird die VM auch nicht gelöscht.
  deleteVm() {

    const dialogRef = this.dialog.open(VirtuelleMaschinenDialogComponent, {
      width: '500px',
      data: {
        vms: this.selection.selected
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.selection.selected.forEach(item => {
          this.thriftService.deleteVms(item.imageBaseId).subscribe();
        });
      }
      this.getVms();
      this.selection = new SelectionModel<ImageSummaryRead>(true, []);
    });
  }

  // Filtert die Tabelle nach dem String, welcher in der Suchleiste eingegeben wird
  applyFilter(filterValue: string) {
    this.vms.filter = filterValue.trim().toLowerCase();
    this.amountVms();
  }

  // Setzt die Anzahl der angezigten VMs in der Tabelle
  amountVms() {
    this.amountOfVms = this.vms.filteredData.length;
  }

}
