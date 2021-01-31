import { Injectable, NgZone } from '@angular/core';
import { User } from '../services/user';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    // Inject services
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage,
    public router: Router,
    public ngZone: NgZone
  ) {}

  // Login with Google
  async googleLogin() {
    return this.afAuth
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['canvas']);
        });
        this.setUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Login user with email and password
  async login(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['canvas']);
        });
        console.log(result.user);
        this.setUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  // Sign up user with email and password
  async signup(
    // username: string,
    email: string,
    password: string
    // confirmPassword: string
  ) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['canvas']);
        });
        this.setUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  // Check if a user is logged in
  get isLoggedIn(): boolean {
    var user = firebase.auth().currentUser;
    return user !== null;
  }

  // Set current user's data
  async setUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      username: 'temp',
      // username: user.username,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  // Set current user's canvas
  async setCanvas(canvas) {
    var user = firebase.auth().currentUser;
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    return userRef.update({ canvas });
  }

  // Upload image to Firebase
  async uploadImage(event) {
    var user = firebase.auth().currentUser;
    const randomId = Math.random().toString(36).substring(2); // Generate random ID
    this.afStorage.ref(`users/${user.uid}/images/${randomId}`);
    await this.afStorage.upload(
      `users/${user.uid}/images/${randomId}`,
      event.target.files[0]
    );
    return `https://firebasestorage.googleapis.com/v0/b/pencil-learning-25ad6.appspot.com/o/users%2F${user.uid}%2Fimages%2F${randomId}?alt=media`;
  }

  // Get current user's data
  get getUserData() {
    var user = firebase.auth().currentUser;
    return new Promise((resolve, reject) =>
      this.afs
        .collection('users')
        .doc(user.uid)
        .ref.get()
        .then((doc) => {
          if (doc.exists) {
            resolve(doc.data());
          }
          resolve({});
        })
        .catch((error) => {
          reject(error);
          console.log('Error getting user!');
        })
    );
  }

  // Logout current user
  async logout() {
    return this.afAuth.signOut().then(() => {
      this.router.navigate(['login']);
    });
  }
}
