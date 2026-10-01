import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import fs from "fs";

// Load firebase config from some file if possible, or we can just fetch from the live site?
