
//==============================================================================
//Word entry class definition
class WordEntry
{
    constructor(eng, jpn, kanji)
    {
        this.eng = eng;
        this.jpn = jpn;
        this.kanji = kanji;
    }
}
//==============================================================================
class UserEntry
{
    constructor(userId, displayName)
    {
        this.userId = userId;

        if (displayName == null)
        {
            displayName = userId;
        }

        this.displayName = displayName;
    }
}

export {WordEntry, UserEntry};