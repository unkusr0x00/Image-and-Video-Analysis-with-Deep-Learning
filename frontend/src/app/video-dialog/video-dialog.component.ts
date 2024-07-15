import {Component, ElementRef, HostListener, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {createKeyboardEvent} from "@angular/cdk/testing/testbed/fake-events";
import {ServerService} from "../services/server/server.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

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

  constructor(public dialogRef: MatDialogRef<VideoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private serverService: ServerService,
              private sanitizer: DomSanitizer) {}

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

  onTimeChange(): void {
    const newTime = parseFloat(this.currentTimeInput);
    if (!isNaN(newTime)) {
      this.videoPlayer.nativeElement.currentTime = newTime / 1000;
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
    this.dialogRef.close(); //TODO: Implement submit logic
  }
}
