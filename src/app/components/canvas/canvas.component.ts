import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  constructor(public authService: AuthService) {}

  public loggedIn = this.authService.isLoggedIn; // Boolean for whether the user is logged in or not
  public user; // The user's data

  private canvas: any;
  private size: any = {
    width: 800,
    height: 500,
  };

  ngOnInit(): void {
    // Get the user's data
    this.authService.getUserData.then((res) => (this.user = res));

    // Canvas setup
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'crosshair',
      selection: true,
      selectionBorderColor: 'blue',
      backgroundColor: '#efefef',
    });
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    // var canvasSizer = document.getElementById('canvasSizer');
    // var canvasScaleFactor = canvasSizer.offsetWidth / 525;
    // var width = canvasSizer.offsetWidth;
    // var height = canvasSizer.offsetHeight;
    // var ratio = this.canvas.getWidth() / this.canvas.getHeight();
    // if (width / height > ratio) {
    //   width = height * ratio;
    // } else {
    //   height = width / ratio;
    // }
    // var scale = width / this.canvas.getWidth();
    // var zoom = this.canvas.getZoom();
    // zoom *= scale;
    // this.canvas.setDimensions({ width: width, height: height });
    // this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
  }
}
