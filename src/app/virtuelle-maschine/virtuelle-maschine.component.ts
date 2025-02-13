import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfo } from './../user';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { ThriftService } from '../thrift.service';
import { ChangeOwnerComponent } from '../change-owner/change-owner.component';
import { MatDialog } from '@angular/material';
import { AenderungenVerwerfenDialogComponent } from '../aenderungen-verwerfen-dialog/aenderungen-verwerfen-dialog.component';

export interface ChangeOwnerData {
  user;
  newowner;
}

@Component({
  selector: 'app-virtuelle-maschine',
  templateUrl: './virtuelle-maschine.component.html',
  styleUrls: ['./virtuelle-maschine.component.css'],
})
export class VirtuelleMaschineComponent implements OnInit {
  // Wird benötigt um anhand der ID aus der URL die richtige VM anzuzeigen
  @Input() virtuellemaschine = new ImageDetailsRead();

  /* Variablen, die die vorhandenen Nutzer anzeigen und ggf. filtern
     temp erhält alle vorhandenen Nutzer, die in der data.ts enthalten sind
     options speichert die Nutzer in einem Array, passt sich an wenn der Nutzer filtert */
  userControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  osList = [];
  users: UserInfo[];
  permissions = [];
  edit = false;
  download = false;
  admin = false;
  link = false;
  shareModes = ['LOCAL', 'PUBLISH', 'DOWNLOAD', 'FROZEN'];
  change = false;
  submitted = false;
  editVMForm: FormGroup;
  editVM = new ImageBaseWrite();

  possibleOwners: any[] = [];
  currentUser;
  currentOwner;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private thriftService: ThriftService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    if (sessionStorage.getItem('user') == null) {
      this.router.navigate([`/`]);
    } else {
      this.currentUser = JSON.parse(sessionStorage.getItem('user')).userInfo.userId;
      this.getVm();
      this.filteredOptions = this.userControl.valueChanges.pipe(startWith(''), map(value => this._filter(value)));
      this.editVMForm = this.formBuilder.group({
        imageName: [],
        description: [],
        osId: [],
        admin: [],
        link: [],
        download: [],
        edit: []
      });
    }
  }

  // Holt die Daten einer einzelnen VM vom Server
  getVm() {
    const id = this.route.snapshot.paramMap.get('id');
    this.thriftService.getUserList().subscribe(
      (users: UserInfo[]) => {
        this.users = users;
        if (id != null) {
          this.thriftService.getVm(id).then(
            (vm: ImageDetailsRead) => {
              this.thriftService.getOsList().subscribe(
                (osList: OperatingSystem[]) => {
                  osList.forEach(os => {
                    this.osList.push(os.osName);
                  });
                });

              this.virtuellemaschine = vm;
              this.thriftService.getVmPermissions(id).subscribe(
                (permissionMap: Map<string, ImagePermissions>) => {
                  this.users.forEach(user => {
                    if (permissionMap.get(user.userId) !== undefined) {
                      this.permissions.push({
                        userName: user.lastName + ', ' + user.firstName + ' (' + user.eMail + ', ' + user.userId + ')',
                        userId: user.userId,
                        download: permissionMap.get(user.userId).download,
                        link: permissionMap.get(user.userId).link,
                        admin: permissionMap.get(user.userId).admin,
                        edit: permissionMap.get(user.userId).edit
                      });
                    } else if (user.userId !== this.virtuellemaschine.ownerId) {
                      this.options.push((user.firstName + ' ' + user.lastName + ' (' + user.eMail + ', ' + user.userId + ')'));
                    } else {
                      this.possibleOwners = this.users;
                      this.currentOwner = this.possibleOwners.splice(this.users.indexOf(user), 1);
                    }
                  });
                }
              );
              this.editVMForm = this.formBuilder.group({
                imageName: [this.virtuellemaschine.imageName, Validators.required],
                description: [this.virtuellemaschine.description, Validators.required],
                admin: [this.virtuellemaschine.defaultPermissions.admin],
                link: [this.virtuellemaschine.defaultPermissions.link],
                download: [this.virtuellemaschine.defaultPermissions.download],
                edit: [this.virtuellemaschine.defaultPermissions.edit],
                osId: [this.virtuellemaschine.osId]
              });
              if (this.virtuellemaschine.userPermissions.edit || this.virtuellemaschine.userPermissions.admin ||
                this.virtuellemaschine.defaultPermissions.admin ||
                this.virtuellemaschine.defaultPermissions.edit) {
                this.edit = true;
              }
              if (this.virtuellemaschine.userPermissions.admin || this.virtuellemaschine.defaultPermissions.admin) {
                this.admin = true;
              }
              if (this.virtuellemaschine.userPermissions.download || this.virtuellemaschine.userPermissions.admin ||
                this.virtuellemaschine.defaultPermissions.admin ||
                this.virtuellemaschine.defaultPermissions.download) {
                this.download = true;
              }
              if (this.virtuellemaschine.userPermissions.link || this.virtuellemaschine.userPermissions.admin ||
                this.virtuellemaschine.defaultPermissions.admin ||
                this.virtuellemaschine.defaultPermissions.link) {
                this.link = true;
              }

            });
        }
      },
      error => {
        console.log(error.error.error);
        this.router.navigate([`/`]);
      });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  /* Fügt den Namen des Benutzers in das Array permissions hinzu.
     Das Input-Feld darf dabei nicht leer sein & der Nutzer darf nicht bereits in der Tabelle stehen & muss in der Liste stehen.
     Der Benutzer, der in users steht wird dann wieder entfernt */
  addUser() {
    if (this.userControl.value !== '' && this.userControl.value !== undefined && this.options.indexOf(this.userControl.value) !== -1) {
      // Wenn ein Benutzer aus der Liste hinzugefügt wurde, soll er nicht mehr in der Liste aufgelistet werden
      const start = this.userControl.value.indexOf('(');
      const end = this.userControl.value.indexOf(')');
      const startId = this.userControl.value.substring(start + 1, end).indexOf(',');
      const userId = this.userControl.value.substring(start + startId + 3, end)
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < this.users.length; index++) {
        if (this.users[index].userId === userId) {
          this.permissions.push({
            userName: this.users[index].lastName + ', ' + this.users[index].firstName + ' (' + this.users[index].eMail + ', ' + this.users[index].userId + ')',
            userId: this.users[index].userId,
            admin: false,
            edit: false,
            link: false,
            download: false
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
     der Nutzer wird dann wieder der Nutzerliste hinzugefügt */
  deleteUser(i: number) {
    const userId = this.permissions[i].userId;
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.users.length; index++) {
      if (this.users[index].userId === userId) {
        this.options.push((this.users[index].firstName + ' ' + this.users[index].lastName + ' (' + this.users[index].eMail + ', ' + this.users[index].userId + ')'));
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

  // Setzt die Linkrechte für den jeweiligen Benutzer
  setLink(edit: any, index: number) {
    this.permissions[index].link = edit.target.checked;
  }

  // Setzt die Downloadrechte für den jeweiligen Benutzer
  setDownload(admin: any, index: number) {
    this.permissions[index].download = admin.target.checked;
  }

  // Überprüft ob Veränderungen an der VM gemacht wurden.
  hasChanged() {
    this.change = true;
  }

  // Zur vereinfachten Benutzung
  get form() {
    return this.editVMForm.controls;
  }

  // VM-Version kann gelöscht werden
  deleteImageVersion(id: string) {
    this.thriftService.deleteVmVersion(id).subscribe();
    this.getVm();
  }

  // Sendet das veränderte VM-Objekt zum Server
  editedVM() {
    this.submitted = true;

    if (this.editVMForm.invalid) {
      return;
    }

    this.editVM.imageName = this.form.imageName.value;
    this.editVM.description = this.form.description.value;
    this.editVM.defaultPermissions = new ImagePermissions({
      link: this.form.link.value,
      download: this.form.download.value,
      edit: this.form.edit.value,
      admin: this.form.admin.value})
    this.editVM.isTemplate = this.virtuellemaschine.isTemplate;
    this.editVM.shareMode = this.virtuellemaschine.shareMode;
    this.editVM.virtId = this.virtuellemaschine.virtId;
    this.editVM.osId = this.form.osId.value;
    const id = this.route.snapshot.paramMap.get('id');
    this.thriftService.updateImageBase(this.editVM, id).subscribe(() => {
      // tslint:disable: no-shadowed-variable
      // tslint:disable: prefer-const
      let map = {};
      this.permissions.forEach(permission => {
        map[permission.userId] = { link: permission.link, download: permission.download, edit: permission.edit, admin: permission.admin };
      });
      this.thriftService.setVmPermissions(id, map).subscribe((result: any) => {
        console.log(result);
      });
      this.router.navigate([`/tb`],{state:{display:`vms`}});
    });
  }

  // Ändert den Besitzer der VM
  changeOwner() {
    const dialogRef = this.dialog.open(ChangeOwnerComponent, {
      width: '600px',
      data: {
        user: this.possibleOwners
      }
    });
    dialogRef.afterClosed().subscribe(newOwner => {
      if (newOwner !== undefined) {
        const imageBaseId = this.route.snapshot.paramMap.get('id');
        this.thriftService.setImageOwner(imageBaseId, newOwner).subscribe(() => {
          this.router.navigate([`/tb`],{state:{display:`vms`}});
        });
      }
    });
  }

  // return to vm list while passing a value to use as a filter
  setFilterValue(filterValue: string, targetList: string = 'vms') {
    sessionStorage.setItem('filter', filterValue);
    this.router.navigate([`/tb`],{state:{display:`${targetList}`}});
  }

  // Änderungen verwerfen
  stashChanges() {
    if (this.change) {
      const dialogRef = this.dialog.open(AenderungenVerwerfenDialogComponent, {
        width: '500px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate([`/tb`],{state:{display:`vms`}});
        }
      });
    } else {
      this.router.navigate([`/tb`],{state:{display:`vms`}});
    }

  }

    // converts the time properties of the lecture (no. of seconds)
  // to a proper unix timestamp (no. of milliseconds)
  convertTime(time: Int64) {
    return Number(time) * 1000;
  }
}
