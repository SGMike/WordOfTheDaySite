//==============================================================================
//FIREBASE CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js';
import { getDatabase, get, ref, set } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdh6WdcQZ4JNnDoQK49FH_0tFpTqTF-P8",
  authDomain: "wordofthedaysite.firebaseapp.com",
  databaseURL: "https://wordofthedaysite-default-rtdb.firebaseio.com",
  projectId: "wordofthedaysite",
  storageBucket: "wordofthedaysite.appspot.com",
  messagingSenderId: "814604332676",
  appId: "1:814604332676:web:53e7866526fe1acc5edcd1",
  measurementId: "G-2FXQ2RL5Y3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

onAuthStateChanged(auth, user => {
    if (user) {
        console.log("Logged in!");

        
    }
    else {
        console.log("No user!");
    }
}
);

//==============================================================================
import * as ClassDefs from "./ClassDefs.js";

//==============================================================================


let g_monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

let g_selectedDate = null;
let g_currentUser = null;

//==============================================================================

function writeUserData(userId, name) 
{
    const db = getDatabase(app);
    const reference = ref(db, 'users/' + userId);

    set(reference, {
        username: name
    });

    console.log("INIT USER DATA FOR: " + name);
}

function AddWord(wordEntry)
{
    //type check wordEntry for WordEntry
    const db = getDatabase(app);
    const reference = ref(db, 'words/' + wordEntry.eng);

    set(reference, wordEntry);

    console.log("ADD WORD: " + wordEntry.eng + ": " + wordEntry.jpn);
}

function DisplayWord(wordEntry)
{
    const wordElement_eng = document.getElementById('wordOfDay_eng_input');
    const wordElement_jpn = document.getElementById('wordOfDay_jpn_input');
    const wordElement_jpn_kanji = document.getElementById('wordOfDay_jpn_kanji_input');

    //Set input field to the word
    wordElement_eng.value = wordEntry.eng;
    wordElement_jpn.value = wordEntry.jpn;
    wordElement_jpn_kanji.value = wordEntry.kanji;

    //Create link to jisho
    const jishoDiv = document.getElementById('jisho');
    //Get the link element from within the div
    const jishoLink = jishoDiv.getElementsByTagName('a')[0];
    jishoLink.href = "https://jisho.org/search/" + wordEntry.eng;

    //Link to tangorin
    const tangorinDiv = document.getElementById('tangorin');
    const tangorinLink = tangorinDiv.getElementsByTagName('a')[0];
    tangorinLink.href = "https://tangorin.com/words?search=" + wordEntry.eng;
}

function SetActiveUser(user)
{
    g_currentUser = user;
    RefreshPage();
}

function GetDBUsers()
{
    //return promise
    return new Promise((resolve, reject) => {
        let userList = [];

        //Get the list of users from the database
        const db = getDatabase(app);
        const reference = ref(db, 'users/');
        get(reference).then((snapshot) => {
            if (snapshot.exists()) 
            {
                //iterate through all user entries in snapshot
                snapshot.forEach((childSnapshot) => {
                    const childKey = childSnapshot.key;
                    const childData = childSnapshot.val();

                    //Create UserEntry from DB data
                    const userEntry = new ClassDefs.UserEntry(childKey, childData.username);

                    userList.push(userEntry);
                    console.log("SNAPSHOT:" + childKey);
                });

                resolve(userList);
            } 
            else 
            {
                console.log("No data available");
                reject("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    });
}

function UpdateUserList(users)
{
    console.log("INIT BUTTONS, users.length: " + users.length);

    //Add a button for every user, displayed as a horizontal list of buttons
    const userButtonContainer = document.getElementById('userButtons');
    for (let i = 0; i < users.length; i++)
    {
        const userId = users[i].id;
        console.log("USER: " + users[i].displayName);
        const userButton = document.createElement('button');
        userButton.innerHTML = users[i].displayName;
        userButton.onclick = (uid) => {
            SetActiveUser(uid);
        };
        userButtonContainer.appendChild(userButton);
    }
}

function StartUpdateUserList()
{
    const userList = GetDBUsers().then(
        (userList) => {
            UpdateUserList(userList);
        }
    )
}

function InitButtons()
{
    StartUpdateUserList();
    
    //Listen for when submitUserBtn is pressed
    const submitUserBtn = document.getElementById('submitUserBtn');
    submitUserBtn.onclick = SubmitUser;

    //Listen for arrow buttons
    const arrowLeftBtn = document.getElementById('leftArrowBtn');
    arrowLeftBtn.onclick = () => {
        IterateDate(-1);
    };
    const arrowRightBtn = document.getElementById('rightArrowBtn');
    arrowRightBtn.onclick = () => {
        IterateDate(1);
    };
}

//===============================================================
function AssignWordToUser(wordId, user)
{
    //Add the word to the user's word list
    const db = getDatabase(app);
    const reference = ref(db, 'users/' + user.userId + '/wordList/' + wordId);

    set(reference, wordId);
}

//===============================================================
function AddUser(user)
{
    console.log("Adding user: " + user.displayName);

    //Add the user to the database
    const db = getDatabase(app);
    const reference = ref(db, 'users/' + user.userId);
    set(reference, user);
}

//===============================================================
//Listen for when submitWordBtn is pressed
function SubmitWord()
{
    console.log("SubmitWord(");
    //Get the values inside word-eng and word-jpn
    const wordEng = document.getElementById('word-eng').value;
    const wordJpn = document.getElementById('word-jpn').value;
    const wordKanji = document.getElementById('word-jpn').value;
    
    //If both fields are filled out, add the word to the word list
    if (wordEng != "" && wordJpn != "")
    {
        let wordEntry = new WordEntry(wordEng, wordJpn);
        
        AddWord(wordEntry);
    }
    else
    {
        console.log("ERROR: Both fields must be filled out");
    }
}

//===============================================================
function SubmitUser()
{
    console.log("SubmitUser");
    //Get the value inside newUserInput
    const newUserName = document.getElementById('userNameInput').value;
    
    //If the field is filled out, add the user to the user list
    if (newUserName != "")
    {
        let newUser = new UserEntry(newUserName);
        AddUser(newUser);
    }
    else
    {
        console.log("ERROR: Field must be filled out");
    }
}

//===============================================================

function GetWordForDate(date, user)
{
    let word = new ClassDefs.WordEntry("thunder", "かみなり", "雷");

    return word;
}

function IterateDate(delta)
{
    if (g_selectedDate)
    {
        g_selectedDate = new Date(g_selectedDate);
        g_selectedDate.setDate(g_selectedDate.getDate() + delta);
    }
    else
    {
        g_selectedDate = new Date();
    }
    RefreshPage();
}

//===============================================================
function RefreshPage()
{
    const currentUserElement = document.getElementById('currentUser');
    //if current user is valid
    if (g_currentUser)
    {
        console.log(g_currentUser);
        //Get currentUser element and add a label with the display name
        currentUserElement.innerHTML = g_currentUser.displayName;
    }
    else
    {
        //Get currentUser element and add a label with the display name
        currentUserElement.innerHTML = "No user selected";
    }

    if (g_selectedDate)
    {
        const selectedDateElement = document.getElementById('selectedDate');
        let dayString = g_selectedDate.getDate();
        let monthIndex = g_selectedDate.getMonth();
        let monthString = g_monthNames[monthIndex];
        let yearString = g_selectedDate.getFullYear();
        let formattedDateString = monthString + " " + dayString + ", " + yearString;
        selectedDateElement.innerHTML = formattedDateString;
        
        //Get the word for the selected date for the current user
        
        let wordForDate = GetWordForDate(g_selectedDate, g_currentUser);
        DisplayWord(wordForDate);
        
    }
}

function SetDate(date)
{
    g_selectedDate = date;

    RefreshPage();
}

//===============================================================
function InitSite()
{
    InitButtons();

    //Init input fields


    //Default to today's date
    const date = new Date();
    SetDate(date);

    RefreshPage();

    //activeWordList = GetWordList('Mike');
}

window.onload = InitSite;