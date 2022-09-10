import { Router } from '@angular/router';
import { UserService } from './../user.service';
import { VmsService } from './../vms.service';
import { ImageBaseWrite, OperatingSystems } from './../vm';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserInfo } from '../user';
import { AenderungenVerwerfenDialogComponent } from './../aenderungen-verwerfen-dialog/aenderungen-verwerfen-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-create-vm',
  templateUrl: './create-vm.component.html',
  styleUrls: ['./create-vm.component.css']
})
export class CreateVmComponent implements OnInit {
  userControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  permissions = [];

  submitted = false;
  newImage = new ImageBaseWrite();
  createVmForm: FormGroup;
  users: UserInfo[];
  osList = [];
  fileSize: number;

  // um den Dateinamen anzuzeigen
  url = '';

  change = false;

  constructor(
    private formBuilder: FormBuilder,
    private vmService: VmsService,
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    if (sessionStorage.getItem('user') == null) {
      this.router.navigate([`/`]);
    } else {
      this.getInformations();
      this.filteredOptions = this.userControl.valueChanges.pipe(startWith(''), map(value => this._filter(value)));
      this.createVmForm = this.formBuilder.group({
        imageName: ['', Validators.required],
        description: ['', Validators.required],
        admin: [false],
        link: [false],
        download: [false],
        edit: [false],
        osId: [1]
      });
    }
  }

  // Ruft Informationen für Benutzer und Betriebssysteme ab
  getInformations() {
    this.userService.getUserList().then(
      (users: UserInfo[]) => {
        this.users = users;
        this.users.forEach(user => {
          if (user.userId !== JSON.parse(sessionStorage.getItem('user')).userInfo.userId) {
            this.options.push((user.firstName + ' ' + user.lastName + ' (' + user.eMail + ')'));
          }
        });
        this.vmService.getOsList().subscribe(
          (osList: OperatingSystems[]) => {
            osList.forEach(os => {
              this.osList.push(os.osName);
            });
          });
      },
      error => {
        console.log(error.error.error);
        this.router.navigate([`/`]);
      });
  }

  // Wendet einen Filter auf die vorgeschlagenen User an
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
            userName: this.users[index].lastName + ', ' + this.users[index].firstName  + ' (' + this.users[index].eMail + ')',
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

  // Setzt die Linkrechte für den jeweiligen Benutzer
  setLink(edit: any, index: number) {
    this.permissions[index].link = edit.target.checked;
  }

  // Setzt die Downloadrechte für den jeweiligen Benutzer
  setDownload(admin: any, index: number) {
    this.permissions[index].download = admin.target.checked;
  }

  // Methode sobald eine Datei ausgewählt wird
  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      let reader;
      reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      this.fileSize = event.target.files[0].size;
      // tslint:disable-next-line:no-shadowed-variable
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.url = event.target.result;
      };
    }
  }

  // Zur verinfachten Benutzung
  get form() {
    return this.createVmForm.controls;
  }

  // Erzeugt eine VM (bis  dato ohne eine VM-Version)
  createVm() {
    this.submitted = true;
    if (this.createVmForm.invalid) {
      return;
    }

    this.newImage.imageName = this.form.imageName.value;
    this.newImage.description = this.form.description.value;
    this.newImage.defaultPermissions.edit = this.form.edit.value;
    this.newImage.defaultPermissions.admin = this.form.admin.value;
    this.newImage.defaultPermissions.download = this.form.download.value;
    this.newImage.defaultPermissions.link = this.form.link.value;
    this.newImage.isTemplate = false;
    this.newImage.shareMode = 0;
    this.newImage.virtId = 'vmware';
    this.newImage.osId = this.form.osId.value;
    this.vmService.postVm(this.newImage.imageName).then((imageId: string) => {
      this.vmService.requestImageVersionUpload({ imageBaseId: imageId, fileSize: this.fileSize }).subscribe((result: any) => {
        console.log(result);
      });
      this.vmService.updateImageBase(this.newImage, imageId).subscribe((result: any) => {
        // tslint:disable: no-shadowed-variable
        // tslint:disable: prefer-const
        let map = {};
        this.permissions.forEach(permission => {
          map[permission.userId] = { link: permission.link, download: permission.download, edit: permission.edit, admin: permission.admin };
        });
        const userPermissions = { imageBaseId: imageId, permissions: map };
        this.vmService.setPermissions(userPermissions).subscribe((result: any) => {
          console.log(result);
        });
        console.log(result);
        this.router.navigate([`/vms/${imageId}`]);
      });
    });
  }

  // Prüft ob sich etwas im Formular verändert hat
  // Die entsprechenden html Elemente wurden mit dieser Methode versehen
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
          this.router.navigate([`/vms`]);
        }
      });
    } else {
      this.router.navigate([`/vms`]);
    }
  }
}
