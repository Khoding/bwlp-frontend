import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ImageSummaryRead, OperatingSystems } from '../vm';
import { UserInfo } from './../user';
import { VmsService } from '../vms.service';
import { UserService } from './../user.service';
import { DatePipe } from '@angular/common';
import { VirtuelleMaschinenDialogComponent } from '../virtuelle-maschinen-dialog/virtuelle-maschinen-dialog.component';

export interface VmDialogData {
  vms;
}

@Component({
  selector: 'app-virtuelle-maschinen',
  templateUrl: './virtuelle-maschinen.component.html',
  styleUrls: ['./virtuelle-maschinen.component.css'],
  providers: [DatePipe]
})
export class VirtuelleMaschinenComponent implements OnInit {
  vms: MatTableDataSource<ImageSummaryRead>;
  users: UserInfo[];
  selection = new SelectionModel<ImageSummaryRead>(true, []);
  amountOfVms: number;

  displayedColumns = ['select', 'name', 'betriebssystem', 'besitzer', 'geaendert', 'ablaufdatum', 'groesse', 'verwendbar', 'vorlage',
    'version', 'gesamtgroesse'];

  constructor(
    private vmsService: VmsService,
    private userService: UserService,
    private datePipe: DatePipe,
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
      this.userService.getUserList().then(
        (users: UserInfo[]) => {
          this.users = users;
          this.vmsService.getOsList().subscribe(
            (osList: OperatingSystems[]) => {
              this.vmsService.getVms().then(
                (vms: ImageSummaryRead[]) => {
                  vms.forEach(vm => {
                    // this.vmsService.getOsList().subscribe(
                    // (osList: OperatingSystems[]) => {
                    vm.osId = osList[vm.osId - 1].osName;
                    // });
                    vm.updateTime = this.datePipe.transform(vm.updateTime * 1000, 'dd.MM.yyyy, HH:mm');
                    vm.expireTime = this.datePipe.transform(vm.expireTime * 1000, 'dd.MM.yyyy, HH:mm');
                    vm.createTime = this.datePipe.transform(vm.createTime * 1000, 'dd.MM.yyyy, HH:mm');
                    vm.uploadTime = this.datePipe.transform(vm.uploadTime * 1000, 'dd.MM.yyyy, HH:mm');
                    for (let i = 0; i < users.length; i++) {
                      if (vm.ownerId === users[i].userId) {
                        vm.ownerId = users[i].lastName + ', ' + users[i].firstName;
                        i = users.length;
                      }
                    }
                  });
                  this.vms = new MatTableDataSource<ImageSummaryRead>(vms);
                  this.amountVms();
                });
            });
        },
        error => {
          console.log(error.error.error);
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
          this.vmsService.deleteVms(item.imageBaseId).subscribe(
            (response: string) => {
              console.log(response);
            });
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
