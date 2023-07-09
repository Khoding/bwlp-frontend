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
import { VirtuelleMaschinenDialogComponent } from '../virtuelle-maschinen-dialog/virtuelle-maschinen-dialog.component';

export interface DialogData {
  veranstaltungen;
}

export interface VmDialogData {
  vms;
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
  displayMode: string;
  filterMode: string;
  displayedColumns = {
    'lectures': ['select', 'lectureName', 'ownerId', 'startTime', 'endTime', 'isEnabled', 'isImageVersionUsable'],
    'vms': ['select', 'imageName', 'osId', 'vmOwnerId', 'updateTime', 'expireTime', 'fileSize', 'isValid', 'isTemplate',
    'versionCount', 'fileSizeSum']
  };
  filterableColumns = {
    'lectures': {'Name': 'lectureName', 'Besitzer': 'ownerId'},
    'vms': {'Name': 'imageName', 'Besitzer': 'ownerId', 'Betriebsystem': 'osId'},
  };
  columnFilter: string;
  defaultFilterPredicate?: (record: any, filter: string) => boolean;

  // allows access to Object.keys in ngfor, circumvents creating a pipe for a single use
  Object = Object;
    
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
  // the idea is that if you toggle the view, pairs of corresponding
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
      this.getEntries();
    }
    this.passedFilter = sessionStorage.getItem('filter');
    this.displayMode = history.state.display ? history.state.display : 'lectures';
    this.filterMode = this.displayMode;
  }

  // custom sorting for case insensitivity and resolving ids
  setSorting() {
    this.entries.sortingDataAccessor = (row: TableEntry, columnName: string) => {
      if (this.displayedColumns.vms.includes(columnName) && !row.vm.imageBaseId ||
          this.displayedColumns.lectures.includes(columnName) && !row.lecture.lectureId) {
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

  // add osId resolution to default filtering behavior, as well as column filters
  // if a column filter is active only the value of that column will be considered for filtering
  setFilter() {
    this.defaultFilterPredicate = this.entries.filterPredicate;
    this.entries.filterPredicate = (record: TableEntry, filter: string) => {
      filter = filter.trim().toLowerCase();

      // filter out empty entries regardless of the filter keyword
      // using filterMode instead of displayMode ensures entries won't get filtered out
      // by toggling the view, meaning the pairing of lectures/vms stays intact
      const objectToFilter = this.filterMode == 'vms' ? record.vm : record.lecture;
      if (objectToFilter instanceof ImageSummaryRead && !objectToFilter.imageBaseId ||
          objectToFilter instanceof LectureSummary && !objectToFilter.lectureId) {
        return false;
      }

      // resolve osid and apply columfilter
      if (objectToFilter instanceof ImageSummaryRead && (this.columnFilter == 'osId' || !this.columnFilter)) {
        const osEntry = this.osList[objectToFilter.osId - 1];
        const osName: string = osEntry ? osEntry.osName.trim().toLowerCase() : 'unknown';
        if (osName.indexOf(filter) != -1) {
          return true
        }
        if (this.columnFilter == 'osId') {
          return false;
        }
      }
      else if (this.columnFilter) {
        return this.defaultFilterPredicate({value: objectToFilter[this.columnFilter]}, filter);
      }

      // if no columnfilter was set, use all fields to filter
      return this.defaultFilterPredicate(objectToFilter, filter);
    }
    // apply filter with delay in case a filter value was passed over
    setTimeout(()=> {
      this.applyFilter(this.passedFilter);
    }, 0);
  }

  // images and lectures are requested from the server and then paired
  getEntries() {
    this.thriftService.getUserList().subscribe(
      (users: UserInfo[]) => {
        this.users = users;
        const lecturesByVmId = {};
        const tableEntries: TableEntry[] = [];

        // get lectures and store them in a list with all lectures that use the same vm
        this.thriftService.getEvents().then(
          (lectures: LectureSummary[]) => {
            lectures.forEach(lecture => {
              if (lecturesByVmId[lecture.imageBaseId]){
                lecturesByVmId[lecture.imageBaseId].push(lecture);
              } else {
                lecturesByVmId[lecture.imageBaseId] = [lecture];
              }
            })

            // now get vms and add all existing pairings of lecture/vm to the table entries
            this.thriftService.getVms().then(
              (vms: ImageSummaryRead[]) => {
                vms.forEach(vm => {
                  // special case unused vm
                  if (!lecturesByVmId[vm.imageBaseId]) {
                    lecturesByVmId[vm.imageBaseId] = [{lectureName: '(nicht verwendet)'}];
                  }
                  lecturesByVmId[vm.imageBaseId].forEach((lecture: LectureSummary) => {
                    tableEntries.push({lecture: lecture, vm: vm});
                  });
                });
                // special case lecture with no assigned vm
                lecturesByVmId['null'].forEach((lecture: LectureSummary) => {
                  const newVm = new ImageSummaryRead();
                  newVm.imageName = '(not set)';
                  tableEntries.push({lecture: lecture, vm: newVm})
                })
             
                this.entries = new MatTableDataSource(tableEntries);
                this.getOsList();
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
      this.getEntries();
    });
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
          this.thriftService.deleteVms(item.vm.imageBaseId).subscribe();
        });
      }
      this.getEntries();
      this.selection = new SelectionModel<TableEntry>(true, []);
    });
  }

  // Filtert die Tabelle nach dem String, welcher in der Suchleiste eingegeben wird
  // TODO: currently gets called BEFORE the change to the search field value is made
  // => missing the last character/change
  applyFilter(filterValue: string) {
    if (filterValue) {
      // remember what entries the user wanted to filter
      this.filterMode = this.displayMode;
      sessionStorage.setItem('filter', filterValue);

      this.entries.filter = filterValue.trim().toLowerCase();
    }
    else {
      sessionStorage.setItem('filter', '');
    }
    this.amountEvents();
  }

  // Setzt die Anzahl der angezigten Veranstaltungen in der Tabelle
  amountEvents() {
    this.amountOfEvents = this.entries.filteredData.length;
  }
}
