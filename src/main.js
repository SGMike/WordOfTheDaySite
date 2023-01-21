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
let g_selectedUserEntry = null;

//==============================================================================
const wordElement_eng = document.getElementById('wordOfDay_eng_input');
const wordElement_jpn = document.getElementById('wordOfDay_jpn_input');
const wordElement_jpn_kanji = document.getElementById('wordOfDay_jpn_kanji_input');

const jishoDiv = document.getElementById('jisho');
const jishoLink = jishoDiv.getElementsByTagName('a')[0];

const tangorinDiv = document.getElementById('tangorin');
const tangorinLink = tangorinDiv.getElementsByTagName('a')[0];

//==============================================================================
function GetCurrentInputText_English()
{
    return wordElement_eng.value;
}

function GetCurrentInputText_Japanese()
{
    return wordElement_jpn.value;
}

function GetCurrentInputText_JapaneseKanji()
{
    return wordElement_jpn_kanji.value;
}

function GetDateID(date)
{
    let formattedDateString = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear();
    return formattedDateString;
}

function GetUserDBPath(userId)
{
    return 'users/' + userId;
}

function GetDBPath_ActiveUser()
{
    return GetUserDBPath(g_selectedUserEntry.userId);
}

function GetPath_Date(date, userId)
{
    let outPath = GetUserDBPath(userId) + '/words/' + GetDateID(date);
    console.log("GetPath_Date: " + outPath);
    return outPath;
}

function GetSelectedDatePath()
{
    return GetPath_Date(g_selectedDate, g_selectedUserEntry.userId);
    //return GetDBPath_ActiveUser() + '/words/' + GetDateID(g_selectedDate);
}

function AddWord(wordEntry)
{
    //type check wordEntry for WordEntry
    const db = getDatabase(app);
    const reference = ref(db, 'words/' + wordEntry.eng);

    set(reference, wordEntry);

    console.log("ADD WORD: " + wordEntry.eng + ": " + wordEntry.jpn);
}

function ClearWords()
{
    wordElement_eng.value = "";
    wordElement_jpn.value = "";
    wordElement_jpn_kanji.value = "";
}

function DisplayWord(wordEntry)
{
    if (wordEntry === null)
    {
        ClearWords();
        return;
    }

    console.log("DisplayWord: " + wordEntry);
    let text_eng = "";
    let text_jpn = "";
    let text_jpn_kanji = "";

    //set the text to be greyed out style
    //style_valueSet = "white";
    //style_valueNotSet = "grey";
    //wordElement_eng.style.color = style_valueNotSet;
    //wordElement_jpn.style.color = style_valueNotSet;
    //wordElement_jpn_kanji.style.color = style_valueNotSet;

    //Set placeholder attribute
    wordElement_eng.placeholder = "English";
    wordElement_jpn.placeholder = "Hiragana";
    wordElement_jpn_kanji.placeholder = "Kanji";

    //Set input field to the word
    if (wordEntry)
    {
        console.log(wordEntry.eng);
        if (wordEntry.eng && wordEntry.eng.length > 0)
        {
            text_eng = wordEntry.eng;
            //wordElement_eng.style.color = style_valueSet;
        }
        
        if (wordEntry.jpn && wordEntry.jpn.length > 0)
        {
            text_jpn = wordEntry.jpn;
            //wordElement_jpn.style.color = style_valueSet;
        }
        
        if (wordEntry.kanji && wordEntry.kanji.length > 0)
        {
            text_jpn_kanji = wordEntry.kanji;
            //wordElement_jpn_kanji.style.color = style_valueSet;
        }
    }

    console.log("Displaying word: " + text_eng + ": " + text_jpn);

    wordElement_eng.value = text_eng;
    wordElement_jpn.value = text_jpn;
    wordElement_jpn_kanji.value = text_jpn_kanji;
    
    RefreshLinks();
}

let g_cachedUserIdKey = "cachedUserId";

function SetSelectedUser(userId)
{
    console.log("Setting selected user with ID: " + userId);

    //Get the user entry from the database
    const db = getDatabase(app);
    const reference = ref(db, 'users/' + userId);
    get(reference).then((snapshot) => {
        console.log("Setting selected user...");
        if (snapshot.exists())
        {
            console.log("snapshot val: " + snapshot.key);
            const userEntry = new ClassDefs.UserEntry(snapshot.key, snapshot.key);
            
            g_selectedUserEntry = userEntry;
            console.log("Set active user: " + userEntry.userId);

            localStorage.setItem(g_cachedUserIdKey, userEntry.userId);

            RefreshPage();
        }
        else
        {
            console.log("No user data available!");
        }
    }).catch((error) => {
        console.error(error);
    });
    
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
        let userId = users[i].id;
        console.log("USER: id:" + users[i].userId + ", name:" + users[i].displayName);
        let userButton = document.createElement('button');
        userButton.innerHTML = users[i].displayName;

        //Set the onclick function to set the selected user
        userButton.addEventListener('click', function() {
            SetSelectedUser(userButton.textContent);
        });

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

    

    //Listen for jisho pressed
    jishoLink.onclick = () => {
        console.log("Jisho link pressed!");

        //Open new tab to jisho
        let engTextContent = wordElement_eng.value;
        if (engTextContent.length > 0)
        {
            let url = "https://jisho.org/search/" + engTextContent;
            window.open(url, '_blank').focus();
        }

        return false;//Don't do default behavior
    };

    //Listen for tangorin pressed
    tangorinLink.onclick = () => {
        console.log("Tangorin link pressed!");

        //Open new tab to tangorin
        let engTextContent = wordElement_eng.value;
        if (engTextContent.length > 0)
        {
            let url = "https://tangorin.com/words?search=" + engTextContent;
            window.open(url, '_blank').focus();
        }

        return false;//Don't do default behavior
    }
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
    return new Promise((resolve, reject) => {
        if (date == null)
        {
            //Error
            console.log("ERROR: Date is null");
            reject(undefined);
        }

        if (user == null)
        {
            //Error
            console.log("ERROR: User is null");
            reject(undefined);
        }
        
        //Query the database for the word for the given date
        const db = getDatabase(app);
        const wordPath = GetPath_Date(date, user.userId);
        const reference = ref(db, wordPath);
        console.log("WORD PATH: " + wordPath);
        get(reference).then((snapshot) => {
            if (snapshot.exists())
            {
                console.log("WORD EXISTS: " + snapshot.key);
                
                //Get the word from the database
                const wordData = snapshot.val();

                let word_eng = snapshot.child("eng").val();
                let word_jpn = snapshot.child("jpn").val();
                let word_kanji = snapshot.child("kanji").val();

                console.log("WORD ENG: " + word_eng);

                let word = new ClassDefs.WordEntry(word_eng, word_jpn, word_kanji);
                resolve(word);
            }
            else
            {
                console.log("No data available for set date");
                resolve(undefined);
            }
        }).catch((error) => {
            console.error(error);
            reject(error);
        });
    });
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
    console.log("RefreshPage");

    const currentUserElement = document.getElementById('currentUser');
    
    if (g_selectedUserEntry)
    {
        console.log(g_selectedUserEntry);
        //Get currentUser element and add a label with the display name
        currentUserElement.innerHTML = g_selectedUserEntry.displayName;
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
     
        console.log("Nulling word");

        DisplayWord(null);

        const wordOfTheDayDiv = document.getElementById('wordOfDay');

        if (g_selectedUserEntry)
        {
            //Get the word for the selected date for the current user
            // wait for promise

            GetWordForDate(g_selectedDate, g_selectedUserEntry).then((wordForDate) => {
                console.log("WORD FOR DATE: " + wordForDate);

                //Display the word
                DisplayWord(wordForDate);
            });

            wordOfTheDayDiv.style.visibility = "visible";
            wordOfTheDayDiv.style.display = "block";
        }
        else
        {
            console.log("No user selected");
            
            wordOfTheDayDiv.style.visibility = "hidden";
            wordOfTheDayDiv.style.display = "none";
        }
    }
}

function SetDate(date)
{
    g_selectedDate = date;

    RefreshPage();
}

function RefreshLinks()
{
    let anyTextIsSet = (wordElement_eng.value.length > 0 || 
        wordElement_jpn.value.length > 0 || 
        wordElement_jpn_kanji.value.length > 0
        );

    if (anyTextIsSet)
    {
        //Create links
        jishoLink.style.visibility = "visible";
        tangorinLink.style.visibility = "visible";
    }
    else
    {
        //Hide links
        jishoLink.style.visibility = "hidden";
        tangorinLink.style.visibility = "hidden";
    }
}

function OnTextInput()
{
    //Update DB Entry
    if (g_selectedUserEntry == null)
    {
        return null;
    }
    console.log("OnTextInput");
    const db = getDatabase(app);
    const reference = ref(db, GetSelectedDatePath());

    let word = new ClassDefs.WordEntry(wordElement_eng.value, wordElement_jpn.value, wordElement_jpn_kanji.value);
    
    set(reference, word);

    //Refresh links
    RefreshLinks();
}

//===============================================================
function InitSite()
{
    //See if there is a cached user id
    let cachedUserId = localStorage.getItem(g_cachedUserIdKey);
    if (cachedUserId)
    {
        SetSelectedUser(cachedUserId);
    }

    InitButtons();

    //Init input fields

    //Get on submit for word input
    wordElement_eng.oninput = function() {
        OnTextInput();
    }
    wordElement_jpn.oninput = function() {
        OnTextInput();
    }
    wordElement_jpn_kanji.oninput = function() {
        OnTextInput();
    }

    //Default to today's date
    const date = new Date();
    SetDate(date);

    //RefreshPage();

}

window.onload = InitSite;