import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { VideoDialogComponent } from './video-dialog/video-dialog.component';
import { FrameDialogComponent } from './frame-dialog/frame-dialog.component';
import { SubmitDialogComponent } from './submit-dialog/submit-dialog.component';
import { HttpClientModule } from "@angular/common/http";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule} from "@angular/material/form-field";
import { MatOptionModule } from "@angular/material/core";
import { BidiModule} from "@angular/cdk/bidi";
import { PlatformModule } from "@angular/cdk/platform";
import { ScrollingModule } from "@angular/cdk/scrolling";

const routes: Routes = [
  { path: 'search', component: SearchComponent },
  { path: '', redirectTo: '/search', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    VideoDialogComponent,
    FrameDialogComponent,
    SubmitDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    FormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    HttpClientModule,
    MatSelectModule,
    MatOptionModule,
    BidiModule,
    PlatformModule,
    ScrollingModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [VideoDialogComponent, FrameDialogComponent, SubmitDialogComponent]
})
export class AppModule { }
