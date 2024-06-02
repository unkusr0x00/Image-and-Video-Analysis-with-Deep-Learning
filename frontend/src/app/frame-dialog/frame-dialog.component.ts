import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-frame-dialog',
  templateUrl: './frame-dialog.component.html',
  styleUrls: ['./frame-dialog.component.scss']
})
export class FrameDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FrameDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
