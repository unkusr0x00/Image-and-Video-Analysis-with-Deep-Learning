import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {VideoDialogComponent} from "../video-dialog/video-dialog.component";
import {ServerService} from "../services/server/server.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-frame-dialog',
  templateUrl: './frame-dialog.component.html',
  styleUrls: ['./frame-dialog.component.scss']
})
export class FrameDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FrameDialogComponent>,
              public dialog: MatDialog,
              private serverService: ServerService,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  openVideoDialog(frame: any): void {
    let framerate = this.data.framerate;
    let videoID = this.data.videoID;
    let starttime = this.data.frame.Starttime;
    let fromframe = true;
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      data: { videoID, framerate, starttime, fromframe },
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw', // Maximale Breite des Dialogs
      maxHeight: '80vh', // Maximale Höhe des Dialogs
      panelClass: 'custom-dialog-container'
    });
  }
}
