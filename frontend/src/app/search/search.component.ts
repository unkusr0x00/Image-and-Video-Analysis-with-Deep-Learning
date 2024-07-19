import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {VideoDialogComponent} from "../video-dialog/video-dialog.component";
import {FrameDialogComponent} from "../frame-dialog/frame-dialog.component";
import {SubmitDialogComponent} from "../submit-dialog/submit-dialog.component";
import {ServerService} from "../services/server/server.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  query: string = '';
  zoomedIndex: number | null = null;
  videoID: string = '';
  videoData: any = null;
  searchMethod = 'CLIP';
  selectedFile: File | null = null;
  result: any;

  constructor(public dialog: MatDialog, private serverService: ServerService) { }

  ngOnInit(): void {
  }

  openVideoDialog(video: any): void {
    let framerate = video.OriginalFramerate;
    let videoID = video.VideoID;
    let fromframe = false;
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      data: { videoID, framerate, fromframe },
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container'
    });
  }

  //Perform search according to selected search-method
  doSearch() {
    if(this.searchMethod === 'CLIP') {
      this.clipSearch();
    } else if (this.searchMethod === 'videoID') {
      this.searchID();
    } else {
      this.searchCNN();
    }
  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (this.selectedFile) {
      this.serverService.uploadImage(this.selectedFile).subscribe(
        response => {
          console.log('Suchanfrage erfolgreich', response);
          this.videoData = response;
        }, err => {
          console.error('Fehler bei der Suchanfrage', err);
        });
    } else {
      console.error('No file selected.');
    }
  }

  searchCNN() {
    this.serverService.searchCNN(this.query).subscribe( response => {
      console.log('Suchanfrage erfolgreich', response);
      this.videoData = response;
    });
  }

  searchID() {
    this.serverService.searchID(this.query).subscribe( response => {
      this.videoData = [response];
      console.log('Suchanfrage erfolgreich', this.videoData);
    }, err => {
      console.error('Fehler bei der Suchanfrage', err);
    });
  }

  clipSearch() {
    this.serverService.clipSearch(this.query).subscribe(response => {
      console.log('Suchanfrage erfolgreich', response);
      this.videoData = response;
    }, err => {
      console.error('Fehler bei der Suchanfrage', err);
    });
  }

  markAsSolutionItem(frame: any) {
    frame.isMatch = !frame.isMatch;
  }

  openFrameDialog(event: any, video: any, frame: any,) {
    event.stopPropagation();
    event.preventDefault();
    const videoID = video.VideoID;
    const framerate = video.OriginalFramerate;
    const dialogRef = this.dialog.open(FrameDialogComponent, {
      data: { videoID, frame, framerate },
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw',
      maxHeight: '80vh',
      panelClass: 'frame-container'
    });
    };

  openSubmitDialogManual() {
    const dialogRef = this.dialog.open(SubmitDialogComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container'
    });
  }

  openSubmitDialogAuto(video: any) {
    let videoID = video.VideoID;
    const matchedFrames = video.Frames.filter((frame: { isMatch: any; }) => frame.isMatch);
    let firstTimeStamp = timeStringToMilliseconds(matchedFrames[0].Starttime);
    let lastTimeStamp = timeStringToMilliseconds(matchedFrames[matchedFrames.length - 1].Endtime);
    console.log(`First matched frame start time: ${firstTimeStamp}`);
    console.log(`Last matched frame end time: ${lastTimeStamp}`);

    const dialogRef = this.dialog.open(SubmitDialogComponent, {
      data: { videoID, firstTimeStamp, lastTimeStamp },
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container'
    });
  }
}


// Utility function to convert time string to milliseconds
function timeStringToMilliseconds(timeString: string): number {
  const parts = timeString.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid time format');
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split('.');
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = secondsParts.length > 1 ? parseInt(secondsParts[1], 10) : 0;

  return ((hours * 60 * 60) + (minutes * 60) + seconds) * 1000 + milliseconds;
}
