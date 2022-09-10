import { ImagePermissions } from './../vm';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageBaseWrite, ImageDetailsRead, OperatingSystems } from '../vm';
import { UserInfo } from './../user';
import { VmsService } from '../vms.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { UserService } from './../user.service';
import { DatePipe } from '@angular/common';
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
  providers: [DatePipe]
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
    private vmsService: VmsService,
    private userService: UserService,
    private datePipe: DatePipe,
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
    this.userService.getUserList().then(
      (users: UserInfo[]) => {
        this.users = users;
        if (id != null) {
          this.vmsService.getVm(id).then(
            (vm: ImageDetailsRead) => {
              this.vmsService.getOsList().subscribe(
                (osList: OperatingSystems[]) => {
                  vm.osId = osList[vm.osId - 1].osName;
                  osList.forEach(os => {
                    this.osList.push(os.osName);
                  });
                });
              vm.updateTime = this.datePipe.transform(vm.updateTime * 1000, 'dd.MM.yyyy, HH:mm');
              vm.createTime = this.datePipe.transform(vm.createTime * 1000, 'dd.MM.yyyy, HH:mm');
              // tslint:disable-next-line: prefer-for-of
              for (let i = 0; i < this.users.length; i++) {
                if (vm.ownerId === this.users[i].userId) {
                  this.currentOwner = this.users[i].userId;
                  vm.ownerId = this.users[i].lastName + ', ' + this.users[i].firstName;
                } else {
                  this.possibleOwners.push(this.users[i]);
                }
                if (vm.updaterId === this.users[i].userId) {
                  vm.updaterId = this.users[i].lastName + ', ' + this.users[i].firstName;
                }
              }
              vm.versions.forEach(version => {
                version.createTime = this.datePipe.transform(version.createTime * 1000, 'dd.MM.yyyy, HH:mm');
                version.expireTime = this.datePipe.transform(version.expireTime * 1000, 'dd.MM.yyyy, HH:mm');
                for (let i = 0; i < this.users.length; i++) {
                  if (version.uploaderId === this.users[i].userId) {
                    version.uploaderId = this.users[i].lastName + ', ' + this.users[i].firstName;
                    i = this.users.length;
                  }
                }
              });
              this.virtuellemaschine = vm;
              this.vmsService.getPermissions(id).subscribe(
                (permissionMap: Map<any, ImagePermissions>) => {
                  this.users.forEach(user => {
                    if (permissionMap[user.userId] !== undefined) {
                      this.permissions.push({
                        userName: user.lastName + ', ' + user.firstName + ' (' + user.eMail + ')',
                        userId: user.userId,
                        download: permissionMap[user.userId].download,
                        link: permissionMap[user.userId].link,
                        admin: permissionMap[user.userId].admin,
                        edit: permissionMap[user.userId].edit
                      });
                    } else if (user.userId !== this.currentOwner) {
                      this.options.push((user.firstName + ' ' + user.lastName + ' (' + user.eMail + ')'));
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
      const userMail = this.userControl.value.substring(start + 1, end);
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < this.users.length; index++) {
        if (this.users[index].eMail === userMail) {
          this.permissions.push({
            userName: this.users[index].lastName + ', ' + this.users[index].firstName + ' (' + this.users[index].eMail + ')',
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
    this.vmsService.deleteVmVersion(id).subscribe(
      (response: string) => {
        console.log(response);
      });
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
    this.editVM.defaultPermissions.edit = this.form.edit.value;
    this.editVM.defaultPermissions.admin = this.form.admin.value;
    this.editVM.defaultPermissions.download = this.form.download.value;
    this.editVM.defaultPermissions.link = this.form.link.value;
    this.editVM.isTemplate = this.virtuellemaschine.isTemplate;
    this.editVM.shareMode = this.virtuellemaschine.shareMode;
    this.editVM.virtId = this.virtuellemaschine.virtId;
    this.editVM.osId = this.form.osId.value;
    const id = this.route.snapshot.paramMap.get('id');
    this.vmsService.updateImageBase(this.editVM, id).subscribe((result: any) => {
      // tslint:disable: no-shadowed-variable
      // tslint:disable: prefer-const
      let map = {};
      this.permissions.forEach(permission => {
        map[permission.userId] = { link: permission.link, download: permission.download, edit: permission.edit, admin: permission.admin };
      });
      const userPermissions = { imageBaseId: id, permissions: map };
      this.vmsService.setPermissions(userPermissions).subscribe((result: any) => {
        console.log(result);
      });
      console.log(result);
      this.router.navigate([`/vms`]);
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
        const owner = { imageBaseId: this.route.snapshot.paramMap.get('id'), newOwnerId: newOwner };
        this.vmsService.setImageOwner(owner).subscribe((result: any) => {
          console.log(result);
          this.router.navigate([`/vms`]);
        });
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
          this.router.navigate([`/vms`]);
        }
      });
    } else {
      this.router.navigate([`/vms`]);
    }

  }
}
