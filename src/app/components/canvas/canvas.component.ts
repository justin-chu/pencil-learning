import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { AuthService } from '../../shared/services/auth.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  constructor(public authService: AuthService, public ngZone: NgZone) {}

  public loggedIn = this.authService.isLoggedIn; // Whether the user is logged in or not
  public user; // The user's data
  private canvas: any;
  private size: any = {
    // The canvas' size
    width: 1200,
    height: 600,
  };
  public color: string = '#000'; // The canvas' stroke color
  public banner: boolean = false; // Whether to display the banner or not
  public loading: boolean = true; // Whether to show the loading indicator or not
  public mode: number = 1; // The canvas' drawing mode

  // Change the stroke color
  public changeColor(newColor: string) {
    this.canvas.freeDrawingBrush.color = newColor;
  }

  // Hide the banner
  public hideBanner() {
    this.banner = false;
  }

  // Start the loading indicator
  public startLoading() {
    this.loading = true;
  }

  // Stop the loading indicator
  public stopLoading() {
    this.loading = false;
  }

  // Change the drawing mode
  public setMode(newMode) {
    this.mode = newMode;
    this.canvas.isDrawingMode = this.mode;
  }

  async ngOnInit() {
    // Get the user's data
    await this.authService.getUserData.then((res) => (this.user = res));
    this.stopLoading();

    // Canvas setup
    this.canvas = new fabric.Canvas('canvas', {
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: '#efefef',
    });

    // Set the canvas' dimensions
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    this.canvas.isDrawingMode = this.mode;
    this.canvas.freeDrawingBrush.color = this.color;
    this.canvas.freeDrawingBrush.width = 5;
    this.canvas.renderAll();

    // If the user has a saved canvas
    if ('canvas' in this.user) {
      this.banner = true;
      window.setTimeout(() => this.hideBanner(), 8000); // Hide banner after 8 seconds
      fabric.loadSVGFromString(this.user.canvas, (objects, options) => {
        // Deserialize canvas from SVG
        var obj = fabric.util.groupSVGElements(objects, options);
        this.canvas.add(obj).renderAll();
      });
    }

    // fabric.Image.fromURL(
    //   'http://fabricjs.com/assets/pug_small.jpg',
    //   (myImg) => {
    //     this.canvas.add(myImg);
    //   }
    // );

    // Listen for events
    this.canvas.on('object:added', async () => {
      this.startLoading();
      await this.authService.setCanvas(this.canvas.toSVG()); // Store serialized canvas
      this.stopLoading();
    });

    // this.canvas.on('selection:updated', async () => {
    //   this.canvas.isDrawingMode = 0;
    //   console.log('asd');
    //   var sel = new fabric.ActiveSelection(this.canvas.getObjects(), {
    //     canvas: this.canvas,
    //   });
    //   this.canvas.setActiveObject(this.canvas.item(0));
    //   this.canvas.requestRenderAll();
    // });

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
