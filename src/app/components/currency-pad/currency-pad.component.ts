import { Component, OnInit, Inject, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-currency-pad',
  templateUrl: './currency-pad.component.html',
  styleUrls: ['./currency-pad.component.scss'],
})
export class CurrencyPadComponent implements OnInit {

  @ViewChild('p1', { static: true }) p1;



  constructor(
    private dialogRef: MatDialogRef<CurrencyPadComponent>,
  ) { }

  ngOnInit() { }

  scratchbox(number) {
    let x = this.p1.nativeElement.innerHTML;
    if (number === '-1') {
      this.p1.nativeElement.innerHTML = x.substring(0, x.length - 1);
    } else {
      this.p1.nativeElement.innerHTML = x + number;
    }



  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    console.log('key pressed ' + event.keyCode);
    let kpressed = event.keyCode;
    let x = this.p1.nativeElement.innerHTML;

    if (kpressed === 48) {
      this.p1.nativeElement.innerHTML = x + 0;
    } else if (kpressed === 49) {
      this.p1.nativeElement.innerHTML = x + 1;
    } else if (kpressed === 50) {
      this.p1.nativeElement.innerHTML = x + 2;
    } else if (kpressed === 51) {
      this.p1.nativeElement.innerHTML = x + 3;
    } else if (kpressed === 52) {
      this.p1.nativeElement.innerHTML = x + 4;
    } else if (kpressed === 53) {
      this.p1.nativeElement.innerHTML = x + 5;
    } else if (kpressed === 54) {
      this.p1.nativeElement.innerHTML = x + 6;
    } else if (kpressed === 55) {
      this.p1.nativeElement.innerHTML = x + 7;
    } else if (kpressed === 56) {
      this.p1.nativeElement.innerHTML = x + 8;
    } else if (kpressed === 57) {
      this.p1.nativeElement.innerHTML = x + 9;
    } else if (kpressed === 13) {
      this.set();
    } else if (kpressed === 37) {
      this.p1.nativeElement.innerHTML = x.substring(0, x.length - 1);
    }

  }

  cancel() {
    this.dialogRef.close();
  }

  set() {
    this.dialogRef.close(this.p1.nativeElement.innerHTML);
  }

}

