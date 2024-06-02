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
        { src: 'assets/Placeholder.png', time: '6000' },
        { src: 'assets/Placeholder.png', time: '6020' },
        { src: 'assets/Placeholder.png', time: '6040' },
        { src: 'assets/placeholder2.jpg', time: '6060' },
        { src: 'assets/Placeholder.png', time: '6080' },
        { src: 'assets/Placeholder.png', time: '6100' },
        { src: 'assets/Placeholder.png', time: '6120' },
        { src: 'assets/Placeholder.png', time: '6140' },
        { src: 'assets/Placeholder.png', time: '6160' },
        { src: 'assets/Placeholder.png', time: '6180' },
        { src: 'assets/Placeholder.png', time: '6200' },
        { src: 'assets/Placeholder.png', time: '6220' },
        { src: 'assets/Placeholder.png', time: '6240' },
        { src: 'assets/Placeholder.png', time: '6260' },
        { src: 'assets/Placeholder.png', time: '6280' },
        { src: 'assets/Placeholder.png', time: '6300' },
        { src: 'assets/Placeholder.png', time: '6320' },
        { src: 'assets/Placeholder.png', time: '6340' },
        { src: 'assets/Placeholder.png', time: '6360' },
        { src: 'assets/Placeholder.png', time: '6380' }
      ]
    },
    {
      id: '1235413',
      framerate: 30,
      thumbnails: [
        { src: 'assets/Placeholder.png', time: '2128' },
        { src: 'assets/Placeholder.png', time: '2163' }
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

  openSubmitDialogAuto(videoID: string) {
    let video = this.videos.find(video => video.id === videoID);
    let firstTimeStamp = video?.thumbnails[0].time;
    let lastTimeStamp = video?.thumbnails[video.thumbnails.length - 1].time;
    const dialogRef = this.dialog.open(SubmitDialogComponent, {
      data: { videoID, firstTimeStamp, lastTimeStamp },
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw', // Maximale Breite des Dialogs
      maxHeight: '80vh', // Maximale Höhe des Dialogs
      panelClass: 'custom-dialog-container'
    });
  }
}
