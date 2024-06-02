import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {VideoDialogComponent} from "../video-dialog/video-dialog.component";
import {FrameDialogComponent} from "../frame-dialog/frame-dialog.component";
import {SubmitDialogComponent} from "../submit-dialog/submit-dialog.component";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  query: string = '';
  zoomedIndex: number | null = null;
  videoID: string = '';
  videos = [    //TODO: Placeholder data
    {
      id: '1212451',
      framerate: 25,
      thumbnails: [
        { src: 'assets/Placeholder.png', time: '12:32:12' },
        { src: 'assets/Placeholder.png', time: '12:32:15' },
        { src: 'assets/Placeholder.png', time: '12:32:18' },
        { src: 'assets/placeholder2.jpg', time: '12:32:21' },
        { src: 'assets/Placeholder.png', time: '12:32:24' },
        { src: 'assets/Placeholder.png', time: '12:32:12' },
        { src: 'assets/Placeholder.png', time: '12:32:15' },
        { src: 'assets/Placeholder.png', time: '12:32:18' },
        { src: 'assets/Placeholder.png', time: '12:32:21' },
        { src: 'assets/Placeholder.png', time: '12:32:24' },
        { src: 'assets/Placeholder.png', time: '12:32:12' },
        { src: 'assets/Placeholder.png', time: '12:32:15' },
        { src: 'assets/Placeholder.png', time: '12:32:18' },
        { src: 'assets/Placeholder.png', time: '12:32:21' },
        { src: 'assets/Placeholder.png', time: '12:32:24' },
        { src: 'assets/Placeholder.png', time: '12:32:12' },
        { src: 'assets/Placeholder.png', time: '12:32:15' },
        { src: 'assets/Placeholder.png', time: '12:32:18' },
        { src: 'assets/Placeholder.png', time: '12:32:21' },
        { src: 'assets/Placeholder.png', time: '12:32:24' }
      ]
    },
    {
      id: '1235413',
      framerate: 30,
      thumbnails: [
        { src: 'assets/Placeholder.png', time: '00:03:14' },
        { src: 'assets/Placeholder.png', time: '00:03:21' }
      ]
    }
  ];

  constructor(public  dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openVideoDialog(videoID: any): void {
    let video = this.videos.find(video => video.id === videoID);
    let framerate = video?.framerate;
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      data: { framerate },
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw', // Maximale Breite des Dialogs
      maxHeight: '80vh', // Maximale Höhe des Dialogs
      panelClass: 'custom-dialog-container'
    });
  }

  search() {
    // Hier wird die Logik zur Verarbeitung der Suchanfrage eingefügt.
    console.log(this.query);
  }

  openFrameDialog(videoID: string, index: number) {
    let video = this.videos.find(video => video.id === videoID);
    let frameData = video?.thumbnails[index];
    const dialogRef = this.dialog.open(FrameDialogComponent, {
      data: { videoID, frameData, index },
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw', // Maximale Breite des Dialogs
      maxHeight: '80vh', // Maximale Höhe des Dialogs
      panelClass: 'frame-container'
    });
    };

  openSubmitDialogManual() {
    const dialogRef = this.dialog.open(SubmitDialogComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw', // Maximale Breite des Dialogs
      maxHeight: '80vh', // Maximale Höhe des Dialogs
      panelClass: 'custom-dialog-container'
    });
  }

  openSubmitDialogAuto() {
    const dialogRef = this.dialog.open(SubmitDialogComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw', // Maximale Breite des Dialogs
      maxHeight: '80vh', // Maximale Höhe des Dialogs
      panelClass: 'custom-dialog-container'
    });
  }
}
