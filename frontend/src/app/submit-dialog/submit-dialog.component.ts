import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FrameDialogComponent} from "../frame-dialog/frame-dialog.component";
import {EvaluationService} from "../services/evaluation/evaluation.service";

@Component({
  selector: 'app-submit-dialog',
  templateUrl: './submit-dialog.component.html',
  styleUrls: ['./submit-dialog.component.scss']
})
export class SubmitDialogComponent implements OnInit {

  evaluationId: string = '43a2ad81-1ed9-48f2-a5c2-69046a154db2';
  collection: string = 'V3C100';
  taskName: string = 'IVADL-Test';
  private username: string = 'ivadl01';
  private password: string = 'eZVyy8A4LwSfHca';

  constructor(public dialogRef: MatDialogRef<FrameDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private evaluationService: EvaluationService
  ) { }

  ngOnInit(): void {
    if (this.data != undefined) {

    }
  }

  onLogin(): void {
    this.evaluationService.login(this.username, this.password).subscribe(
      response => {
        console.log('Login erfolgreich', response);
        localStorage.setItem('sessionToken', response.sessionId);
      },
      error => {
        console.error('Fehler beim Login', error);
      }
    );
  }

  onSubmit(): void {
    const submissionData = {
      answerSets: [
        {
          taskId: this.evaluationId,
          taskName: this.taskName,
          answers: [
            {
              text: null,
              mediaItemName: this.data.videoID,
              mediaItemCollectionName: this.collection,
              start: this.data.firstTimeStamp,
              end: this.data.lastTimeStamp
            }
          ]
        }
      ]
    };

    const sessionToken = localStorage.getItem('sessionToken') || '';

    this.evaluationService.submitEvaluation(this.evaluationId, sessionToken, submissionData).subscribe(
      response => {
        console.log('Submission erfolgreich', response);
        this.dialogRef.close();
      },
      error => {
        console.error('Fehler bei der Submission', error);
      }
    );
  }

}
