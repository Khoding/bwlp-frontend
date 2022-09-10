import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatDialog, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LectureWrite, Location } from '../veranstaltung';
import { ImageSummaryRead, OperatingSystems } from '../vm';
import { UserInfo } from './../user';
import { ActivatedRoute, Router } from '@angular/router';
import { VmsService } from '../vms.service';
import { UserService } from './../user.service';
import { MatTableDataSource } from '@angular/material/table';
import { VeranstaltungenService } from '../veranstaltungen.service';
import { DatePipe } from '@angular/common';
import { AenderungenVerwerfenDialogComponent } from './../aenderungen-verwerfen-dialog/aenderungen-verwerfen-dialog.component';

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

      // Benachrichtigt über die Veränderung
      this.dataChange.next(data);
    });
  }

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
  selector: 'app-create-veranstaltung',
  templateUrl: './create-veranstaltung.component.html',
  styleUrls: ['./create-veranstaltung.component.css'],
  providers: [ChecklistDatabase, DatePipe]
})
export class CreateVeranstaltungComponent implements OnInit {
  date: Date;
  startDate: number;
  endDate: number;
  currentDate: string;
  amountOfDays: number;
  newLecture = new LectureWrite();
  permissions = [];
  selectedRooms = [];
  submitted = false;
  vms: MatTableDataSource<ImageSummaryRead>;
  users: UserInfo[];
  amountOfVms: number;
  selection = new SelectionModel<ImageSummaryRead>(true, []);
  createEventForm: FormGroup;
  displayedColumns = ['select', 'name', 'betriebssystem', 'besitzer', 'geaendert', 'ablaufdatum', 'groesse', 'verwendbar'];
  // Variablen, die die vorhandenen Nutzer anzeigen und ggf. filtern
  userControl = new FormControl();
  // options speichert die Nutzer in einem Array, passt sich an wenn der Nutzer filtert
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  change = false;

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
    private database: ChecklistDatabase, private route: ActivatedRoute, private router: Router,
    private vmsService: VmsService, private formBuilder: FormBuilder, private veranstaltungsServive: VeranstaltungenService,
    private datePipe: DatePipe, private userService: UserService, public dialog: MatDialog
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
      this.router.navigate(['/']);
    } else {
      this.date = new Date();
      this.today();
      this.startDate = this.dateOfToday();
      this.endDate = this.dateOfToday();
      this.amountOfDays = 1;
      this.createEventForm = this.formBuilder.group({
        lectureName: ['', Validators.required],
        description: ['', Validators.required],
        imageVersionId: ['', Validators.required],
        autoUpdate: [true],
        isEnabled: [true],
        startTime: ['00:00', Validators.required],
        startDay: [this.currentDate, Validators.required],
        endTime: ['23:59', Validators.required],
        endDay: [this.currentDate, Validators.required],
        isExam: [false],
        hasInternetAccess: [true],
        edit: [false],
        admin: [false],
        limitToLocations: [true, Validators.required],
        hasUsbAccess: [true]
      });
      this.getVms();
      this.filteredOptions = this.userControl.valueChanges.pipe(startWith(''), map(value => this._filter(value)));
    }
  }

  // Liefert alle VMs für die Tabelle zurück.
  // Ebenfalls werden die Benutzer abgerufen, da diese für die Anzeige der VMs und der Benutzerrechte
  // unverzichtbar sind. Außerdem wird die OS Listee vom Server abgerufen.
  getVms() {
    this.userService.getUserList().then(
      (users: UserInfo[]) => {
        this.users = users;
        this.users.forEach(user => {
          if (user.userId !== JSON.parse(sessionStorage.getItem('user')).userInfo.userId) {
            this.options.push((user.firstName + ' ' + user.lastName + ' (' + user.eMail + ')'));
          }
        });
        // tslint:disable-next-line: prefer-const
        let validVms: ImageSummaryRead[] = [];
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
                  if (vm.latestVersionId !== null && (vm.defaultPermissions.link || vm.userPermissions.link)) {
                    validVms.push(vm);
                  }
                });
                this.vms = new MatTableDataSource<ImageSummaryRead>(validVms);
                this.amountVms();
              });
          });
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

  //#region Baummethoden
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
      const i = this.selectedRooms.find(room => room === node.id);
      if (i === undefined) {
        this.selectedRooms.push(node.id);
        for (const child of descendants) {
          const ci = this.selectedRooms.findIndex(room => room === child.id);
          if (ci !== -1) {
            this.selectedRooms.splice(ci, 1);
          }
        }
      }
    } else {
      const i = this.selectedRooms.findIndex(room => room === node.id);
      if (i !== undefined) {
        this.selectedRooms.splice(i, 1);
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
      const i = this.selectedRooms.find(room => room === node.id);
      if (i === undefined) {
        this.selectedRooms.push(node.id);
      }
    } else {
      const ind = this.selectedRooms.findIndex(room => room === node.id);
      if (ind !== -1) {
        this.selectedRooms.splice(ind, 1);
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
      const index = this.selectedRooms.findIndex(room => room === node.id);
      if (index !== -1) {
        this.selectedRooms.splice(index, 1);
      }
      for (const des of descendants) {
        if (this.checklistSelection.isSelected(des)) {
          const tm = this.selectedRooms.findIndex(r => r === des.id);
          if (tm === -1) {
            this.selectedRooms.push(des.id);
          }
        }
      }
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
      this.selectedRooms.push(node.id);
      for (const des of descendants) {
        const i = this.selectedRooms.findIndex(room => room === des.id);
        if (i !== -1) {
          this.selectedRooms.splice(i, 1);
        }
      }
    }
  }
  //#endregion Baummethoden

  // Anzahl der Veranstaltungen in der Tabelle
  amountVms() {
    this.amountOfVms = this.vms.filteredData.length;
  }

  // Gibt ein Datum in Milliskenden zurück
  dateToNumber(date: Date) {
    return date.getTime();
  }

  // Liefert das heutige Datum als String im Format yyyy-MM-dd
  today() {
    const today = '' + (new Date());
    this.currentDate = '' + this.datePipe.transform(today, 'yyyy-MM-dd');
  }

  // Gibt das aktuelle Datum in Millisekunden zurück
  dateOfToday() {
    const today = '' + (new Date());
    const tmp = '' + this.datePipe.transform(today, 'yyyy-MM-dd');
    return this.dateToNumber((new Date('' + (tmp) + 'T00:00:00')));
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

  // Wendet einen Filter auf die VM Tabelle an
  applyFilter(filterValue: string) {
    this.vms.filter = filterValue.trim().toLowerCase();
    this.amountVms();
  }

  // Ruft den übergeordneten Knoten eines Knotens ab
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

  // Zur verinfachten Benutzung
  get form() {
    return this.createEventForm.controls;
  }

  // Erzeugt eine Veranstaltung und leitet im Anschluss daran auf die Seite um
  createLecture() {
    this.submitted = true;
    if (this.createEventForm.invalid) {
      return;
    }
    this.newLecture.lectureName = this.form.lectureName.value;
    this.newLecture.description = this.form.description.value;
    this.newLecture.imageVersionId = this.form.imageVersionId.value;
    this.newLecture.autoUpdate = this.form.autoUpdate.value;
    this.newLecture.isEnabled = this.form.isEnabled.value;
    this.newLecture.locationIds = this.selectedRooms.sort();
    this.newLecture.startTime = (new Date('' + (this.form.startDay.value as string) + 'T' +
      (this.form.startTime.value as string) + ':00').getTime() / 1000);
    this.newLecture.endTime = (new Date('' + (this.form.endDay.value as string) + 'T' +
      (this.form.endTime.value as string) + ':00').getTime() / 1000);
    this.newLecture.isExam = this.form.isExam.value;
    this.newLecture.hasInternetAccess = this.form.hasInternetAccess.value;
    this.newLecture.defaultPermissions.edit = this.form.edit.value;
    this.newLecture.defaultPermissions.admin = this.form.admin.value;
    this.newLecture.limitToLocations = this.form.limitToLocations.value;
    this.newLecture.hasUsbAccess = this.form.hasUsbAccess.value;
    this.veranstaltungsServive.postEvent(this.newLecture).then((lecture: any) => {
      if (this.permissions.length > 0) {
        // tslint:disable: prefer-const
        // tslint:disable-next-line: no-shadowed-variable
        let map = {};
        this.permissions.forEach(permission => {
          map[permission.userId] = { edit: permission.edit, admin: permission.admin };
        });
        const userPermissions = { lectureId: lecture, permissions: map };
        this.veranstaltungsServive.setPermissions(userPermissions).subscribe((result: any) => {
          console.log(result);
          this.router.navigate([`/veranstaltungen/${lecture}`]);
        });
      } else {
        this.router.navigate([`/veranstaltungen/${lecture}`]);
      }
    });
  }

  // Prüft ob sich etwas im Fromular verändert hat
  // Ist den jeweiligen Elementen in der html Datei zugewiesen
  hasChanged() {
    this.change = true;
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
