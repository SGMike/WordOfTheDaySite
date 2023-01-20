// 

const users = ['Mike', 'Sophie'];

const usersWords = {
    Mike: ['おきます', 'みち', 'じょせい', 'だんせい'],
    Sophie: ['糖尿病', '炭水化物']
};

let activeWordList = null;

function DisplayWord(word)
{
    const wordElement = document.getElementById('wordOfDay');
    wordElement.innerHTML = word;
}

function GetXMLFile() 
{
    //Get the words.xml file in the root dir
    return fetch("words.xml")
    .then(response => response.text())
    .then(data => {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, "text/xml");
        console.log(xmlDoc);
        return xmlDoc;
    });

    /**
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "words.xml", false);
    //xhttp.responseType = "document";
    xhttp.onload = function() {
        var xmlDoc = xhttp.responseXML;
        console.log(xmlDoc);
    }
    
    xhttp.send();

    return xhttp.responseXML;
     */
}

function GetWordListFromXML(wordListKey)
{

    console.log("SetWordList()");
    const wordListElement = document.getElementById('wordList');
    wordListElement.innerHTML = "WORD LIST";
    
    //Search the xml file for the word list
    let xmlDoc;
    GetXMLFile().then(data => {
        xmlDoc = data;
    });
    console.log(xmlDoc);
    
    //If anything went wrong, exit
    if (xmlDoc == null)
    {
        console.log("NULL XML DOC");
        return;
    }
    
    //Search for the word list given the wordListKey
    const wordList = xmlDoc.getElementsByTagName(wordListKey);
    
    //If the word list doesn't exist, exit
    if (wordList.length == 0)
    {
        //Log error
        console.log("EMPTY WORD LIST");
        return;
    }
    
    //Get the list of all words in the word list
    const wordListWords = wordList[0].getElementsByTagName('word');
    
    wordListElement.innerHTML = wordListKey;
    
    //Create a list of words inside the word list element
    for (let i = 0; i < wordListWords.length; i++)
    {
        const word = wordListWords[i].innerHTML;
        const wordElement = document.createElement('li');
        wordElement.innerHTML = word;
        wordListElement.appendChild(wordElement);
    }
}

function GetWordList(wordListKey)
{
    //Check if the word list exists in userWords
    if (usersWords[wordListKey] != null)
    {
        return usersWords[wordListKey];
    }
    else
    {
        return ["ERROR BIIIIITCH"];
    }

}

let iActiveUser = 0;
let iActiveWord = 0;

function SetActiveUser(user)
{
    activeWordList = GetWordList(user);

    //Get the element currentUser and set the text
    const currentUserElement = document.getElementById('currentUser');
    currentUserElement.innerHTML = user;

    UpdateWord();
}

function UpdateWord()
{
    //Get random word from word list that is not the current iActiveWord

    if (activeWordList == null)
    {
        return;
    }

    if (activeWordList.length == 0 )
    {
        return;
    }

    if (activeWordList.length == 1)
    {
        DisplayWord(activeWordList[0]);
        return;
    }

    let iNewWord = iActiveWord;
    while (iNewWord == iActiveWord)
    {
        iNewWord = Math.floor(Math.random() * activeWordList.length);
    }
    iActiveWord = iNewWord;
    const word = activeWordList[iActiveWord];
    
    DisplayWord(word);
}

function InitButtons()
{
    //Add a button for every user, displayed as a horizontal list of buttons
    const userButtonContainer = document.getElementById('userButtons');
    for (let i = 0; i < users.length; i++)
    {
        const userButton = document.createElement('button');
        userButton.innerHTML = users[i];
        userButton.onclick = () => {
            activeWordList = GetWordList(users[i]);
            UpdateWord();
        };
        userButtonContainer.appendChild(userButton);
    }
}

function InitSite()
{
    InitButtons();

    activeWordList = GetWordList('Mike');

    UpdateWord();
}

window.onload = InitSite;