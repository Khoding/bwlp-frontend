import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { VeranstaltungenService } from '../veranstaltungen.service';
import { LectureSummary } from '../veranstaltung';
import { UserService } from './../user.service';
import { UserInfo } from './../user';
import { DatePipe } from '@angular/common';
import { MatDialog, } from '@angular/material/dialog';
import { VeranstaltungenDialogComponent } from '../veranstaltungen-dialog/veranstaltungen-dialog.component';

export interface DialogData {
  veranstaltungen;
}
@Component({
  selector: 'app-veranstaltungen',
  templateUrl: './veranstaltungen.component.html',
  styleUrls: ['./veranstaltungen.component.css'],
  providers: [DatePipe]
})
export class VeranstaltungenComponent implements OnInit {
  lectures: MatTableDataSource<LectureSummary>;
  users: UserInfo[];
  selection = new SelectionModel<LectureSummary>(true, []);
  amountOfEvents: number;
  displayedColumns = ['select', 'name', 'besitzer', 'startdatum', 'ablaufdatum', 'aktiviert', 'vmgueltig'];

  constructor(
    private veranstaltungsService: VeranstaltungenService,
    private userService: UserService,
    private datePipe: DatePipe,
    private router: Router,
    public dialog: MatDialog
  ) { }

  // Prüft ob die Anzahl der ausgewählten Elemente mit der Gesamtanzahl der Zeilen übereinstimmt.
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.lectures.data.length;
    return numSelected === numRows;
  }

  // Selektiert alle Zeilen, wenn sie nicht alle selektiert sind, sonst wird Auswahl aufgehoben.
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.lectures.data.forEach(row => this.selection.select(row));
  }

  ngOnInit() {
    if (sessionStorage.getItem('user') == null) {
      this.router.navigate([`/`]);
    } else {
      this.getLectures();
    }
  }

  // Die Veranstaltungen werden vom NodeJS abgerufen
  // Alle Veranstaltungen werden in die Tabelle geladen
  getLectures() {
    this.userService.getUserList().then(
      (users: UserInfo[]) => {
        this.users = users;
        this.veranstaltungsService.getEvents().then(
          (lectures: LectureSummary[]) => {
            lectures.forEach(lecture => {
              lecture.startTime = this.datePipe.transform(lecture.startTime * 1000, 'dd.MM.yyyy, HH:mm');
              lecture.endTime = this.datePipe.transform(lecture.endTime * 1000, 'dd.MM.yyyy, HH:mm');
              lecture.lastUsed = this.datePipe.transform(lecture.lastUsed * 1000, 'dd.MM.yyyy, HH:mm');
              for (let i = 0; i < users.length; i++) {
                if (lecture.ownerId === users[i].userId) {
                  lecture.ownerId = users[i].lastName + ', ' + users[i].firstName;
                  i = users.length;
                }
              }
            });
            this.lectures = new MatTableDataSource<LectureSummary>(lectures);
            this.amountEvents();
          });
      },
      error => {
        console.log(error.error.error);
        this.router.navigate([`/`]);
      });
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
          this.veranstaltungsService.deleteEvent(item.lectureId).subscribe(
            (response: string) => {
              console.log(response);
            });
        });
      }
      this.selection = new SelectionModel<LectureSummary>(true, []);
      this.getLectures();
    });
  }

  // Filtert die Tabelle nach dem String, welcher in der Suchleiste eingegeben wird
  applyFilter(filterValue: string) {
    this.lectures.filter = filterValue.trim().toLowerCase();
    this.amountEvents();
  }

  // Setzt die Anzahl der angezigten Veranstaltungen in der Tabelle
  amountEvents() {
    this.amountOfEvents = this.lectures.filteredData.length;
  }
}
