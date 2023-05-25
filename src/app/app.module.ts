import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationsleisteComponent } from './navigationsleiste/navigationsleiste.component';
import { LoginComponent } from './login/login.component';
import { NutzungsvereinbarungComponent } from './nutzungsvereinbarung/nutzungsvereinbarung.component';
import { DatenschutzerklaerungComponent } from './datenschutzerklaerung/datenschutzerklaerung.component';
import { VeranstaltungComponent} from './veranstaltung/veranstaltung.component';
import { VirtuelleMaschineComponent} from './virtuelle-maschine/virtuelle-maschine.component';
import { CreateVmComponent } from './create-vm/create-vm.component';
import { CreateVeranstaltungComponent } from './create-veranstaltung/create-veranstaltung.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatAutocompleteModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatTreeModule} from '@angular/material';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import {HttpClientModule} from '@angular/common/http';
import {MatRadioModule} from '@angular/material/radio';
import { VeranstaltungenDialogComponent } from './veranstaltungen-dialog/veranstaltungen-dialog.component';
import { VirtuelleMaschinenDialogComponent } from './virtuelle-maschinen-dialog/virtuelle-maschinen-dialog.component';
import { ChangeOwnerComponent } from './change-owner/change-owner.component';
import { AenderungenVerwerfenDialogComponent } from './aenderungen-verwerfen-dialog/aenderungen-verwerfen-dialog.component';
import { ChangeVmComponent } from './change-vm/change-vm.component';
import { MatchIdPipe } from './match-id-pipe/match-id.pipe';
import { SizePipe } from './size-pipe/size.pipe';
import { MatSortModule } from '@angular/material';
import { CombinedTableComponent } from './combined-table/combined-table.component';

const myRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'nutzungsvereinbarung', component: NutzungsvereinbarungComponent},
  {path: 'datenschutzerklaerung', component: DatenschutzerklaerungComponent},
  {path: 'vms/newvm', component: CreateVmComponent},
  {path: 'vms/:id', component: VirtuelleMaschineComponent},
  {path: 'veranstaltungen/newveranstaltung', component: CreateVeranstaltungComponent},
  {path: 'veranstaltungen/:id', component: VeranstaltungComponent },
  {path: 'tb', component: CombinedTableComponent}
];
@NgModule({
   declarations: [
      AppComponent,
      NavigationsleisteComponent,
      LoginComponent,
      NutzungsvereinbarungComponent,
      DatenschutzerklaerungComponent,
      VeranstaltungComponent,
      VirtuelleMaschineComponent,
      CreateVmComponent,
      CreateVeranstaltungComponent,
      LoginDialogComponent,
      VeranstaltungenDialogComponent,
      VirtuelleMaschinenDialogComponent,
      ChangeOwnerComponent,
      AenderungenVerwerfenDialogComponent,
      ChangeVmComponent,
      MatchIdPipe,
      SizePipe,
      CombinedTableComponent
   ],
   entryComponents: [
      LoginDialogComponent,
      VeranstaltungenDialogComponent,
      VirtuelleMaschinenDialogComponent,
      ChangeOwnerComponent,
      AenderungenVerwerfenDialogComponent,
      ChangeVmComponent
   ],
   imports: [
      RouterModule.forRoot(myRoutes),
      BrowserModule,
      HttpClientModule,
      AppRoutingModule,
      FormsModule,
      BrowserAnimationsModule,
      MatDialogModule,
      MatFormFieldModule,
      MatTableModule,
      MatCheckboxModule,
      ReactiveFormsModule,
      MatAutocompleteModule,
      MatTreeModule,
      MatIconModule,
      MatRadioModule,
      MatSortModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
