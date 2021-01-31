import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { fabric } from 'fabric';
import { AuthService } from '../../shared/services/auth.service';
import { NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  constructor(
    public authService: AuthService,
    public ngZone: NgZone,
    @Inject(DOCUMENT) public document: Document
  ) {}

  @ViewChild('email') emailInput; // accessing the reference element
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
  public modal: boolean = false; // Whether to show the modal or not
  public mode: number = 1; // The canvas' drawing mode
  public sharedCanvases; // The user's shared canvases
  public sharedIndex = -1; // The selected shared canvas; -1 if none are selected

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

  // Shoq the modal
  public showModal() {
    this.sharedIndex = -1;
    this.modal = true;
  }

  // Hide the modal
  public hideModal() {
    this.modal = false;
  }

  // Change the drawing mode
  public setMode(newMode) {
    this.mode = newMode;
    this.canvas.isDrawingMode = this.mode;
  }

  // Upload an image to Firebase and display on the canvas
  async uploadImage(event) {
    const imageURL = await this.authService.uploadImage(event);
    fabric.Image.fromURL(imageURL, (myImg) => {
      this.canvas.add(myImg).renderAll();
    });
  }

  // Share canvas with another user by email
  async shareCanvas(email) {
    this.startLoading();
    const success = await this.authService.shareCanvas(
      email,
      this.canvas.toSVG()
    );
    if (success) {
      alert('Succesfully shared canvas with ' + email + '!');
    } else {
      alert('Sorry, something went wrong.');
    }
    this.emailInput.nativeElement.value = '';
    this.stopLoading();
  }

  // Load a canvas from SVG
  public loadCanvas(canvas) {
    this.startLoading();
    this.canvas.clear();
    this.canvas.selection = true;
    this.canvas.preserveObjectStacking = true;
    this.canvas.backgroundColor = '#efefef';
    fabric.loadSVGFromString(canvas, (objects, options) => {
      // Deserialize canvas from SVG
      objects.map((obj) => {
        this.canvas.add(obj).renderAll();
      });
    });
    this.stopLoading();
  }

  // Set the selected shared canvas
  public setSharedIndex(index) {
    this.sharedIndex = index;
  }

  // Load the selected shared canvas
  public loadSharedCanvas() {
    this.hideModal();
    this.loadCanvas(this.sharedCanvases[this.sharedIndex].canvas);
  }

  async ngOnInit() {
    // Get the user's data
    await this.authService.getUserData.then((res) => (this.user = res));
    // Get the user's shared canvases
    await this.authService.getSharedCanvases.then((res) => {
      this.sharedCanvases = res;
    });
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
      this.loadCanvas(this.user.canvas);
    }

    // Listen for events and auto-save
    this.canvas.on('object:added', async () => {
      this.startLoading();
      await this.authService.setCanvas(this.canvas.toSVG()); // Store serialized canvas
      this.stopLoading();
    });

    this.canvas.on('object:moving', async () => {
      this.startLoading();
      await this.authService.setCanvas(this.canvas.toSVG()); // Store serialized canvas
      this.stopLoading();
    });

    this.canvas.on('object:scaling', async () => {
      this.startLoading();
      await this.authService.setCanvas(this.canvas.toSVG()); // Store serialized canvas
      this.stopLoading();
    });

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
