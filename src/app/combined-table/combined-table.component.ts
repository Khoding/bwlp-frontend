import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { UserInfo } from './../user';
import { MatDialog, } from '@angular/material/dialog';
import { VeranstaltungenDialogComponent } from '../veranstaltungen-dialog/veranstaltungen-dialog.component';
import { ThriftService } from '../thrift.service';
import { MatSort } from '@angular/material';
import { TableEntry } from '../table-entry';

export interface DialogData {
  veranstaltungen;
}

@Component({
  selector: 'app-combined-table',
  templateUrl: './combined-table.component.html',
  styleUrls: ['./combined-table.component.css']
})

export class CombinedTableComponent implements OnInit {
  entries: MatTableDataSource<TableEntry>;
  users: UserInfo[];
  osList: OperatingSystem[];
  selection = new SelectionModel<TableEntry>(true, []);
  amountOfEvents: number;
  passedFilter: string;
  displayMode: string = 'vms';
  filterMode: string = 'vms';
  displayedColumns = {
    'lectures': ['select', 'lectureName', 'ownerId', 'startTime', 'endTime', 'isEnabled', 'isImageVersionUsable'],
    'vms': ['select', 'imageName', 'osId', 'vmOwnerId', 'updateTime', 'expireTime', 'fileSize', 'isValid', 'isTemplate',
    'versionCount', 'fileSizeSum']
  };
  defaultFilterPredicate?: (record: any, filter: string) => boolean;
    
  @ViewChild(MatSort, {static:false}) set matSort(sort: MatSort) {
    this.entries.sort = sort;
  }

  constructor(
    private thriftService: ThriftService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  // Prüft ob die Anzahl der ausgewählten Elemente mit der Gesamtanzahl der Zeilen übereinstimmt.
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.entries.data.length;
    return numSelected === numRows;
  }

  // Selektiert alle Zeilen, wenn sie nicht alle selektiert sind, sonst wird Auswahl aufgehoben.
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.entries.data.forEach(row => this.selection.select(row));
  }

  // toggles between displaying virtual machines and lectures
  // the idea is that if you toggle the view pairs of corresponding
  // vm/lecture will always share the same spot on the list
  toggleDisplay() {
    switch (this.displayMode) {
      case 'vms':
        this.displayMode = 'lectures';
        break;
      case 'lectures':
      default:
        this.displayMode = 'vms';
        break;
    }
  }

  ngOnInit() {
    if (sessionStorage.getItem('user') == null) {
      this.router.navigate([`/`]);
    } else {
      this.getLectures();
    }
    this.passedFilter = history.state.data;
  }

  // custom sorting for case insensitivity and resolving ids
  setSorting() {
    this.entries.sortingDataAccessor = (row: TableEntry, columnName: string) => {
      if (this.displayedColumns.vms.includes(columnName) && !row.vm ||
          this.displayedColumns.lectures.includes(columnName) && !row.lecture) {
        return null;
      }
      // resolve individually by column name to allow sorting by hidden columns
      switch (columnName) {
        case 'ownerId':
        case 'lectureName':
          return row.lecture[columnName].toLowerCase();
        case 'startTime':
        case 'endTime':
        case 'isEnabled':
        case 'isImageVersionUsable':
          return row.lecture[columnName];
        case 'vmOwnerId':   // column was renamed in the html file to avoid duplicate definition
          return row.vm.ownerId.toLowerCase();
        case 'osId':
          return this.osList[row.vm.osId - 1].osName.toLowerCase();
        case 'imageName':
          return row.vm.imageName.toLowerCase();
      
        default:
          return row.vm[columnName];
      }
    }
  }

  // add osId resolution to default filtering behavior
  setFilter() {
    this.defaultFilterPredicate = this.entries.filterPredicate;
    this.entries.filterPredicate = (record: TableEntry, filter: string) => {
      filter = filter.trim().toLowerCase();

      // filter out empty entries regardless of the filter keyword
      // using filterMode instead of displayMode ensures entries won't get filtered out
      // by toggling the view, meaning the pairing of lectures/vms stays intact
      const objectToFilter = this.filterMode == 'vms' ? record.vm : record.lecture;
      if (!objectToFilter) {
        return false;
      }

      // check for undefined to get rid of console error
      const osEntry = this.osList[(record.vm ? record.vm.osId : -1) - 1];
      const osName: string = osEntry ? osEntry.osName.trim().toLowerCase() : 'unknown';
      
      return this.defaultFilterPredicate(objectToFilter, filter) || osName.indexOf(filter) != -1;
    }
    // apply filter with delay in case a filter value was passed over
    setTimeout(()=> {
      this.applyFilter(this.passedFilter);
    }, 0);
  }

  // images and lectures are requested from the server and then paired
  getLectures() {
    this.thriftService.getUserList().subscribe(
      (users: UserInfo[]) => {
        this.users = users;
        const vmsById = {};
        const tableEntries: TableEntry[] = [];

        // get vms and store them with their id as key
        this.thriftService.getVms().then(
        (vms: ImageSummaryRead[]) => {
          vms.forEach(vm => {
              vmsById[vm.imageBaseId] = vm;
            });

            // get lectures and pair them with their corresponding vm
            this.thriftService.getEvents().then(
              (lectures: LectureSummary[]) => {
                lectures.forEach(lecture => {
                  tableEntries.push({lecture: lecture, vm: vmsById[lecture.imageBaseId]})                  
                });

                this.entries = new MatTableDataSource(tableEntries);
                this.getOsList();
                this.amountEvents();
                this.setSorting();
                this.setFilter();
  
                // apply filter with delay in case a filter value was passed over
                setTimeout(()=> {
                  this.applyFilter(this.passedFilter);
                }, 0);
              }
            );
          });
      },
      error => {
        console.log(error.error.error);
        this.router.navigate([`/`]);
      });
  }

  getOsList(){
    this.thriftService.getOsList().subscribe(
      (osList: OperatingSystem[]) => {
        this.osList = osList;
      }
    )
  }

  // Löscht jede Veranstaltung die vom Benutzer ausgewählt wurde
  // Wenn der Benutzer nicht ausreichende Rechte zum Löschen besitzt, wird die Veranstaltung auch nicht gelöscht.
  deleteEvent() {
    const dialogRef = this.dialog.open(VeranstaltungenDialogComponent, {
      width: '500px',
      data: {
        veranstaltungen: this.selection.selected,
        msg: false,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.selection.selected.forEach(item => {
          this.thriftService.deleteEvent(item.lecture.lectureId).subscribe();
        });
      }
      this.selection = new SelectionModel<TableEntry>(true, []);
      this.getLectures();
    });
  }

  // Filtert die Tabelle nach dem String, welcher in der Suchleiste eingegeben wird
  applyFilter(filterValue: string) {
    if (filterValue) {
      // remember what entries the user wanted to filter
      this.filterMode = this.displayMode;

      this.entries.filter = filterValue.trim().toLowerCase();
      this.amountEvents();
    }
  }

  // Setzt die Anzahl der angezigten Veranstaltungen in der Tabelle
  amountEvents() {
    this.amountOfEvents = this.entries.filteredData.length;
  }
}
