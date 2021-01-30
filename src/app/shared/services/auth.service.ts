import { Injectable, NgZone } from '@angular/core';
import { User } from '../services/user';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    // Inject services
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  ) {}

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
