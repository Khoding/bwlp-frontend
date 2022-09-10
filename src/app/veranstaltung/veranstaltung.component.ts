import { VmsService } from './../vms.service';
import { ImageSummaryRead, OperatingSystems } from './../vm';
import { ChangeVmComponent } from './../change-vm/change-vm.component';
import { LecturePermissions } from './../veranstaltung';
import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LectureRead, LectureWrite, Location } from '../veranstaltung';
import { UserInfo } from './../user';
import { Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatDialog, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { VeranstaltungenService } from '../veranstaltungen.service';
import { UserService } from './../user.service';
import { DatePipe } from '@angular/common';
import { ChangeOwnerComponent } from '../change-owner/change-owner.component';
import { AenderungenVerwerfenDialogComponent } from '../aenderungen-verwerfen-dialog/aenderungen-verwerfen-dialog.component';

export interface ChangeVmData {
  vms;
  newvm;
}

//#region Baumstruktur
export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
  id: number;
}

export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  id: number;
}

/* Erstellt aus einem Json Objekt eine Baumstruktur
   Jeder Knoten im Json repräsentiert ein to-do item oder eine Kategorie
   Wenn ein Knoten eine Kategorie ist, hat er Kinder Items */
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor(private veranstaltungenService: VeranstaltungenService) {
    if (sessionStorage.getItem('user') != null) {
      this.initialize();
    }

  }

  initialize() {
    this.veranstaltungenService.getLocations().subscribe((locations: Location[]) => {
      /* Erstellt die Knoten mit Hilfe des Json Objektes
      Als Ergebnis kommt eine Liste mit 'TodoItemNode' */
      const data = this.treeStructure(locations, 0);

      // Notify the change.
      this.dataChange.next(data);
    });
  }

  // Erstellt das Baum Array
  treeStructure(value: any, parentId: number) {
    const data: any[] = [];
    const result = value.filter(room => room.parentLocationId === parentId);

    for (const room of result) {
      const node = new TodoItemNode();
      node.item = room.locationName;
      node.id = room.locationId;
      const cnodes = this.treeStructure(value, room.locationId);
      if (cnodes.length !== 0) {
        node.children = cnodes;
      }
      data.push(node);
    }
    return data;
  }

}
//#endregion Baumstruktur
@Component({
  selector: 'app-veranstaltung',
  templateUrl: './veranstaltung.component.html',
  styleUrls: ['./veranstaltung.component.css'],
  providers: [ChecklistDatabase, DatePipe]
})
export class VeranstaltungComponent implements OnInit {
  // Wird benötigt um anhand der ID aus der URL die richtige Veranstaltung anzuzeigen
  @Input() lecture = new LectureRead();

  /* Variablen, die die vorhandenen Nutzer anzeigen und ggf. filtern
  *  temp erhält alle vorhandenen Nutzer, die in der data.ts enthalten sind
  *  options speichert die Nutzer in einem Array, passt sich an wenn der Nutzer filtert*/
  // temp = Object.assign(USER);
  userControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  // Zum Überprüfen, ob sich ein Input Feld verändert hat
  change = false;
  submitted = false;
  editEventForm: FormGroup;
  editLecture = new LectureWrite();
  users: UserInfo[];
  permissions = [];
  startDate: number;
  endDate: number;
  amountOfDays: number;
  edit = false;
  admin = false;

  // Für das Ändern des Benutzers notwenig
  possibleOwners: any[] = [];
  currentUser;
  currentOwner;
  possibleVms: ImageSummaryRead[] = [];

  //#region Baumvariablen
  // Map von flachen Knoten zu verschachtelten Knoten.
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  // Abbildung von geschachtelten Knoten auf abgeflachte Knoten.
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
  // Ein ausgewählter übergeordneter Knoten, der eingefügt werden soll
  selectedParent: TodoItemFlatNode | null = null;
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  // Die Auswahl für die Räume
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* mehrfach */);
  getLevel = (node: TodoItemFlatNode) => node.level;
  isExpandable = (node: TodoItemFlatNode) => node.expandable;
  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;
  // tslint:disable-next-line:variable-name
  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;
  // tslint:disable-next-line:variable-name
  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  //#endregion Baumvariablen

  constructor(
    private route: ActivatedRoute, private database: ChecklistDatabase,
    private veranstaltungsService: VeranstaltungenService, private userService: UserService, private datePipe: DatePipe,
    private formBuilder: FormBuilder, private router: Router, public dialog: MatDialog, private vmsService: VmsService
  ) {
    //#region Baum related
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    //#endregion Baum related
  }

  ngOnInit() {
    if (sessionStorage.getItem('user') == null) {
      this.router.navigate([`/`]);
    } else {
      this.currentUser = JSON.parse(sessionStorage.getItem('user')).userInfo.userId;
      this.getLecture();
      // options-Array erhält alle Namen der Benutzer, die in temp enthalten sind
      this.filteredOptions = this.userControl.valueChanges.pipe(startWith(''), map(value => this._filter(value)));
      this.editEventForm = this.formBuilder.group({
        lectureName: [],
        description: [],
        startDay: [],
        startTime: [],
        endDay: [],
        endTime: [],
        isEnabled: [],
        isExam: [],
        autoUpdate: [],
        hasUsbAccess: [],
        limitToLocations: [],
        hasInternetAccess: [],
        edit: [],
        admin: []
      });
    }
  }

  // Liefert alle VMs zurück. Wird benötigt um die Verknüpfte VM ändern zu können.
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
                    vm.osId = osList[vm.osId - 1].osName;
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
                  // tslint:disable-next-line: prefer-for-of
                  for (let i = 0; i < vms.length; i++) {
                    if (vms[i].latestVersionId !== null && (vms[i].userPermissions.link || vms[i].defaultPermissions.link)) {
                      this.possibleVms.push(vms[i]);
                    }
                  }
                });
            });
        },
        error => {
          console.log(error.error.error);
          this.router.navigate([`/`]);
        });
    }
  }

  // Um die richtige Veranstaltung aus der data.ts mittels ID zu suchen & anzuzeigen
  getLecture() {
    const id = this.route.snapshot.paramMap.get('id');
    this.userService.getUserList().then(
      (users: UserInfo[]) => {
        this.users = users;
        if (id != null) {
          this.veranstaltungsService.getEvent(id).then(
            (lecture: LectureRead) => {
              lecture.updateTime = this.datePipe.transform(lecture.updateTime * 1000, 'dd.MM.yyyy, HH:mm');
              lecture.createTime = this.datePipe.transform(lecture.createTime * 1000, 'dd.MM.yyyy, HH:mm');
              lecture.startTime = new Date(lecture.startTime * 1000);
              lecture.endTime = new Date(lecture.endTime * 1000);
              // tslint:disable-next-line: prefer-for-of
              for (let i = 0; i < this.users.length; i++) {
                if (lecture.ownerId === users[i].userId) {
                  lecture.ownerId = users[i].lastName + ', ' + users[i].firstName;
                  this.currentOwner = this.users[i].userId;
                } else {
                  this.possibleOwners.push(this.users[i]);
                }
                if (lecture.updaterId === users[i].userId) {
                  lecture.updaterId = users[i].lastName + ', ' + users[i].firstName;
                }
              }
              this.lecture = lecture;
              this.veranstaltungsService.getPermissions(id).subscribe(
                (permissionMap: Map<any, LecturePermissions>) => {
                  this.users.forEach(user => {
                    if (permissionMap[user.userId] !== undefined) {
                      this.permissions.push({
                        userName: user.lastName + ', ' + user.firstName + ' (' + user.eMail + ')',
                        userId: user.userId,
                        admin: permissionMap[user.userId].admin,
                        edit: permissionMap[user.userId].edit
                      });
                    } else if (user.userId !== this.currentOwner) {
                      this.options.push((user.firstName + ' ' + user.lastName + ' (' + user.eMail + ')'));
                    }
                  });
                }
              );
              this.setStartDate(this.datePipe.transform(lecture.startTime, 'yyyy-MM-dd'));
              this.setEndDate(this.datePipe.transform(lecture.endTime, 'yyyy-MM-dd'));
              this.editEventForm = this.formBuilder.group({
                lectureName: [this.lecture.lectureName, Validators.required],
                description: [this.lecture.description, Validators.required],
                startDay: [this.datePipe.transform(lecture.startTime, 'yyyy-MM-dd'), Validators.required],
                startTime: [this.datePipe.transform(lecture.startTime, 'HH:mm'), Validators.required],
                endDay: [this.datePipe.transform(lecture.endTime, 'yyyy-MM-dd'), Validators.required],
                endTime: [this.datePipe.transform(lecture.endTime, 'HH:mm'), Validators.required],
                isEnabled: [this.lecture.isEnabled],
                isExam: [this.lecture.isExam],
                autoUpdate: [this.lecture.autoUpdate],
                hasUsbAccess: [this.lecture.hasUsbAccess],
                limitToLocations: [this.lecture.limitToLocations, Validators.required],
                hasInternetAccess: [this.lecture.hasInternetAccess],
                edit: [this.lecture.defaultPermissions.edit],
                admin: [this.lecture.defaultPermissions.admin]
              });
              this.getVms();
              if (this.lecture.userPermissions.edit || this.lecture.userPermissions.admin || this.lecture.defaultPermissions.admin ||
                this.lecture.defaultPermissions.edit) {
                this.edit = true;
              }
              if (this.lecture.userPermissions.admin || this.lecture.defaultPermissions.admin) {
                this.admin = true;
              }
              this.nestedNodeMap.forEach((val: TodoItemFlatNode) => {
                if (this.lecture.locationIds.indexOf(val.id) !== -1) {
                  this.checklistSelection.select(val);
                  const descendants = this.treeControl.getDescendants(val);
                  this.checklistSelection.select(...descendants);
                }
              });
            });
        }
      },
      error => {
        console.log(error.error.error);
        this.router.navigate([`/`]);
      });
  }

  /* Fügt den Namen des Benutzers in das Array permissions hinzu.
     Das Input-Feld darf dabei nicht leer sein & der Nutzer darf nicht bereits in der Tabelle stehen & muss in der Liste stehen.
     Der Benutzer, der in users steht wird dann wieder entfernt */
  addUser() {
    if (this.userControl.value !== '' && this.userControl.value !== undefined && this.options.indexOf(this.userControl.value) !== -1) {
      // Wenn ein Benutzer aus der Liste hinzugefügt wurde, soll er nicht mehr in der Liste aufgelistet werden
      const start = this.userControl.value.indexOf('(');
      const end = this.userControl.value.indexOf(')');
      const userMail = this.userControl.value.substring(start + 1, end);
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < this.users.length; index++) {
        if (this.users[index].eMail === userMail) {
          this.permissions.push({
            userName: this.users[index].lastName + ', ' + this.users[index].firstName + ' (' + this.users[index].eMail + ')',
            userId: this.users[index].userId,
            admin: false,
            edit: false
          });
          if (this.options.length > 1) {
            this.options.splice(this.options.indexOf(this.userControl.value), 1);
          } else {
            this.options = [];
          }
        }
      }
      this.userControl.setValue('');
    }
  }

  /* Löscht den Nutzer der entsprechenden Zeile aus dem Array &
     der Nutzer wird dann wieder der Nutzerliste hinzugefügt*/
  deleteUser(i: number) {
    const userId = this.permissions[i].userId;
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.users.length; index++) {
      if (this.users[index].userId === userId) {
        this.options.push((this.users[index].firstName + ' ' + this.users[index].lastName + ' (' + this.users[index].eMail + ')'));
        this.permissions.splice(i, 1);
        return;
      }
    }
  }

  // Setzt die Bearbeitungsrechte für den jeweiligen Benutzer
  setEdit(edit: any, index: number) {
    this.permissions[index].edit = edit.target.checked;
  }

  // Setzt die Adminrechte für den jeweiligen Benutzer
  setAdmin(admin: any, index: number) {
    this.permissions[index].admin = admin.target.checked;
  }

  // Setzt den Filter für die Auswahl des Benutzers
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  // Transformator zur Umwandlung von verschachtelten Knoten in flache Knoten.
  // Speichert die Knoten in Maps zur späteren Verwendung auf
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.id = node.id;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  // Prüft ob alle Nachkommen des Knotens ausgewählt sind
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  // Prüft ob ein Teil der Nachkommenschaft ausgewählt wird
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  // Schalten zwischen den Auswahl-Zuständen der Räume hin un her
  // Selektiert/deselektiert alle Kinder
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Fügt wenn noch nicht vorhanden den aktuellen Knoten in das Array & auch dessen Kinder
    // Löscht wenn noch vorhanden den aktuellen Knoten in das Array & auch dessen Kinder
    if (this.checklistSelection.isSelected(node)) {
      const i = this.lecture.locationIds.find(room => room === node.id);
      if (i === undefined) {
        this.lecture.locationIds.push(node.id);
        for (const child of descendants) {
          const ci = this.lecture.locationIds.findIndex(room => room === child.id);
          if (ci !== -1) {
            this.lecture.locationIds.splice(ci, 1);
          }
        }
      }
    } else {
      const i = this.lecture.locationIds.findIndex(room => room === node.id);
      if (i !== undefined) {
        this.lecture.locationIds.splice(i, 1);
      }
    }
    // Erzwingt die Aktualisierung des Elternteils
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  // Switched zwischen den Zuständen eines Blattes.
  // Überprüft die Eltern, um zu sehen, ob sich diese geändert haben.
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
    if (this.checklistSelection.isSelected(node)) {
      const i = this.lecture.locationIds.find(room => room === node.id);
      if (i === undefined) {
        this.lecture.locationIds.push(node.id);
      }
    } else {
      const ind = this.lecture.locationIds.findIndex(room => room === node.id);
      if (ind !== -1) {
        this.lecture.locationIds.splice(ind, 1);
      }
    }
    this.checkAllParentsSelection(node);
  }

  // Überprüft alle Eltern, wenn ein Blattknoten selektiert/deselektiert wird
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  // Überprüft den checked Zustand des Wurzelknotens und ändert diesen entsprechend
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
      const index = this.lecture.locationIds.findIndex(room => room === node.id);
      if (index !== -1) {
        this.lecture.locationIds.splice(index, 1);
      }
      for (const des of descendants) {
        if (this.checklistSelection.isSelected(des)) {
          const tm = this.lecture.locationIds.findIndex(r => r === des.id);
          if (tm === -1) {
            this.lecture.locationIds.push(des.id);
          }
        }
      }
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
      this.lecture.locationIds.push(node.id);
      for (const des of descendants) {
        const i = this.lecture.locationIds.findIndex(room => room === des.id);
        if (i !== -1) {
          this.lecture.locationIds.splice(i, 1);
        }
      }
    }
  }

  // Liefert den Elternknoten eines Knotens
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  // Gibt ein Datum in Milliskenden zurück
  dateToNumber(date: Date) {
    return date.getTime();
  }

  // Setzt das Sartdatum der Veranstaltung
  setStartDate(date: string) {
    this.startDate = this.dateToNumber((new Date('' + (date) + 'T00:00:00')));
    this.calculateDays();
  }

  // Setzt das Enddatum der Veranstaltung
  setEndDate(date: string) {
    this.endDate = this.dateToNumber((new Date('' + (date) + 'T00:00:00')));
    this.calculateDays();
  }

  // Berechnet wie viele Tage die Veranstaltung läuft
  calculateDays() {
    // tslint:disable-next-line: radix
    this.amountOfDays = parseInt('' + ((this.endDate - this.startDate) / (1000 * 60 * 60 * 24) / 100 * 100)) + 1;
  }

  // legt fest ob sich etwas verändert hat
  hasChanged() {
    this.change = true;
  }

  // Zur vereinfachten Benutzung
  get form() {
    return this.editEventForm.controls;
  }

  // Updated eine Veranstaltung
  editedLecture() {
    this.submitted = true;
    if (this.editEventForm.invalid) {
      return;
    }
    this.editLecture.lectureName = this.form.lectureName.value;
    this.editLecture.description = this.form.description.value;
    this.editLecture.imageVersionId = this.lecture.imageVersionId;
    this.editLecture.autoUpdate = this.form.autoUpdate.value;
    this.editLecture.isEnabled = this.form.isEnabled.value;
    this.editLecture.startTime = (new Date('' + (this.form.startDay.value as string) + 'T' +
      (this.form.startTime.value as string) + ':00').getTime() / 1000);
    this.editLecture.endTime = (new Date('' + (this.form.endDay.value as string) + 'T' +
      (this.form.endTime.value as string) + ':00').getTime() / 1000);
    this.editLecture.isExam = this.form.isExam.value;
    this.editLecture.hasInternetAccess = this.form.hasInternetAccess.value;
    this.editLecture.defaultPermissions.edit = this.form.edit.value;
    this.editLecture.defaultPermissions.admin = this.form.admin.value;
    this.editLecture.limitToLocations = this.form.limitToLocations.value;
    this.editLecture.hasUsbAccess = this.form.hasUsbAccess.value;
    this.editLecture.locationIds = this.lecture.locationIds.sort();
    const id = this.route.snapshot.paramMap.get('id');
    this.veranstaltungsService.updateLecture(this.editLecture, id).subscribe((result: any) => {
      // tslint:disable: no-shadowed-variable
      // tslint:disable: prefer-const
      let map = {};
      this.permissions.forEach(permission => {
        map[permission.userId] = { edit: permission.edit, admin: permission.admin };
      });
      const userPermissions = { lectureId: id, permissions: map };
      this.veranstaltungsService.setPermissions(userPermissions).subscribe((result: any) => {
        console.log(result);
      });
      console.log(result);
      this.router.navigate([`/veranstaltungen`]);
    });
  }

  // Lässt den Besitzer der Veranstaltung vo User ändern
  changeOwner() {
    const dialogRef = this.dialog.open(ChangeOwnerComponent, {
      width: '600px',
      data: {
        user: this.possibleOwners
      }
    });
    dialogRef.afterClosed().subscribe(newOwner => {
      if (newOwner !== undefined) {
        const owner = { lectureId: this.route.snapshot.paramMap.get('id'), newOwnerId: newOwner };
        this.veranstaltungsService.setLectureOwner(owner).subscribe((result: any) => {
          console.log(result);
          this.router.navigate([`/veranstaltungen`]);
        });
      }
    });
  }

  // Die verknüpfte VM-Version kann geändert werden.
  changeVm() {
    const dialogRef = this.dialog.open(ChangeVmComponent, {
      width: '800px',
      data: {
        vms: this.possibleVms
      }
    });
    dialogRef.afterClosed().subscribe(newVm => {
      if (newVm !== undefined) {
        this.lecture.imageVersionId = newVm;
        this.editedLecture();
      }
    });
  }

  // Änderungen verwerfen
  stashChanges() {
    if (this.change) {
      const dialogRef = this.dialog.open(AenderungenVerwerfenDialogComponent, {
        width: '500px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate([`/veranstaltungen`]);
        }
      });
    } else {
      this.router.navigate([`/veranstaltungen`]);
    }

  }
}
