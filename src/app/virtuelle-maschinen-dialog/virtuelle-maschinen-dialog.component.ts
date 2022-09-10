import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {VmDialogData} from '../virtuelle-maschinen/virtuelle-maschinen.component';


@Component({
  selector: 'app-virtuelle-maschinen-dialog',
  templateUrl: './virtuelle-maschinen-dialog.component.html',
  styleUrls: ['./virtuelle-maschinen-dialog.component.css']
})
export class VirtuelleMaschinenDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: VmDialogData
  ) { }

  ngOnInit() {
  }

}
