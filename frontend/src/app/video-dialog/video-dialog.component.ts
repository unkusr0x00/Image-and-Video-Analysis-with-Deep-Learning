import {Component, ElementRef, HostListener, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {createKeyboardEvent} from "@angular/cdk/testing/testbed/fake-events";

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

  constructor(public dialogRef: MatDialogRef<VideoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngAfterViewInit(): void {
    this.videoPlayer.nativeElement.onloadedmetadata = () => {
      this.duration = Math.round(this.videoPlayer.nativeElement.duration * 1000);
      this.frameDuration = 1000 / this.framerate;
    };
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
