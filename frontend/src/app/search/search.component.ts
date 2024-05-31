import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }



  search() {
    // Hier wird die Logik zur Verarbeitung der Suchanfrage eingefügt.
    console.log(this.query);
  }
}
