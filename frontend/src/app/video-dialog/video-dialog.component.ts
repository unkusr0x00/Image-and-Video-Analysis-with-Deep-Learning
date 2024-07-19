import {Component, ElementRef, HostListener, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatDialog} from '@angular/material/dialog';
import {createKeyboardEvent} from "@angular/cdk/testing/testbed/fake-events";
import {ServerService} from "../services/server/server.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {SubmitDialogComponent} from "../submit-dialog/submit-dialog.component";

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.scss']
})
export class VideoDialogComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  currentTime: number = 0;
  duration: number = 0;
  currentTimeInput: string = '0';
  frameDuration: number = 0;
  framerate:number = this.data.framerate;

  videoUrl: SafeUrl | null = null;
  firstTimeChange: boolean = true;
  firstPlay: boolean = true;

  constructor(public dialogRef: MatDialogRef<VideoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private serverService: ServerService,
              private sanitizer: DomSanitizer,
              public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadVideo(this.data.videoID);
  }

  loadVideo(videoID: string): void {
    this.serverService.getVideo(videoID).subscribe(blob => {
      console.log(blob);
      const url = URL.createObjectURL(blob);
      console.log('Blob URL:', url); // Debugging
      this.videoUrl = this.sanitizer.bypassSecurityTrustUrl(url);

    }, error => {
      console.error('Error loading video:', error);
      error.error.text().then((errorMessage: any) => {
        console.error('Error message:', errorMessage);
      });
    });
  }

  ngAfterViewInit(): void {
  }

  onPlay(event: Event): void {
    //Jump to frame timestamp, if video player is opened from frame inspection
    if(this.firstPlay === true) {
      if (this.data.fromframe === true) {
        const videoElement = event.target as HTMLVideoElement;
        videoElement.currentTime = timeStringToMilliseconds(this.data.starttime) / 1000;
      }
    }
    this.firstPlay = false;
  }

  onTimeChange(): void {
    const frameRate = this.data.framerate;
    const newTime = parseFloat(this.currentTimeInput);
    if (!isNaN(newTime)) {
      // Calculate the time increment for one frame
      const timeIncrementPerFrame = 1 / frameRate;

      // Determine the direction of the time change
      if (newTime > this.videoPlayer.nativeElement.currentTime * 1000) {
        // Increase the time by one frame
        this.videoPlayer.nativeElement.currentTime += timeIncrementPerFrame;
      } else if (newTime < this.videoPlayer.nativeElement.currentTime * 1000) {
        // Decrease the time by one frame
        this.videoPlayer.nativeElement.currentTime -= timeIncrementPerFrame;
      }

      this.updateTime();
    }
  }


  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.videoPlayer.nativeElement.currentTime += 1 / this.framerate;
    } else if (event.key === 'ArrowLeft') {
      this.videoPlayer.nativeElement.currentTime -= 1 / this.framerate;
    }
  }

  updateTime(): void {
    if (this.firstTimeChange === true) {
      this.duration = Math.round(this.videoPlayer.nativeElement.duration * 1000);
      this.videoPlayer.nativeElement.onloadedmetadata = () => {
        this.frameDuration = 1000 / this.framerate;
      };
      this.firstTimeChange = false;
    }
    this.currentTime = Math.round(this.videoPlayer.nativeElement.currentTime * 1000);
    this.currentTimeInput = Math.round(this.videoPlayer.nativeElement.currentTime * 1000).toString();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    let firstTimeStamp = this.currentTime;
    let lastTimeStamp = firstTimeStamp + 10000;
    let videoID = this.data.videoID;
    const dialogReff = this.dialog.open(SubmitDialogComponent, {
      data: { videoID, firstTimeStamp, lastTimeStamp },
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container'
    })
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
