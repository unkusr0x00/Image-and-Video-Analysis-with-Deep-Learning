import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {VideoDialogComponent} from "../video-dialog/video-dialog.component";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  query: string = '';
  videos = [    //TODO: Placeholder data
    {
      id: '1212451',
      thumbnails: [
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
      thumbnails: [
        { src: 'assets/Placeholder.png', time: '00:03:14' },
        { src: 'assets/Placeholder.png', time: '00:03:21' }
      ]
    }
  ];

  constructor(public  dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openVideoDialog(): void {
    const dialogRef = this.dialog.open(VideoDialogComponent, {
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
}
