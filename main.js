import {arrayOfWords as words} from './keyWord.js';

const main = document.querySelector('main');
const settingBtn = document.querySelector('.fa-gear');
const closeBtn = document.querySelector('.fa-xmark');
const settingMenu = document.querySelector('#setting-menu');
const keyLetters = document.querySelectorAll('.letter');
const keyModifs = document.getElementsByClassName('modif');
const guessingRows = document.getElementsByClassName('row');
const colors = ['#1fdb70', '#e6d432', 'rgb(76 76 75)'];
const message = ['You Win !!!', 'So Close !!!', 'Try Again !!!'];
const themeBtn = document.querySelector('#setting-menu .game-theme label');
const resetBtn = document.querySelector('.result-box .reset-btn');
const result = document.getElementById('result');
const resultInfo = document.querySelectorAll('.result-info .info h3');
const resultHeader = document.querySelector('#result .header .heading');
const closeResultBtn = document.querySelector('#result .close-btn');
const openResultBtn = document.querySelector('#header .result-button');
const helpBtn = document.querySelector('#header .help-button');
const closeHelpBtn = document.querySelector('#help .close-btn');
const helpBox = document.querySelector('#help');
const totalResult = [];
let currentRow, currentColumn, letterBoxs, playedTurn = 1, keyWord;

init();
//change theme
resetBtn.addEventListener('click', () => {
    init();
    result.classList.toggle('d-none');
})

themeBtn.onclick = () => {
    main.classList.toggle('light-mode');
    result.classList.toggle('light-mode');
}

closeResultBtn.onclick = openResultBtn.onclick = getResult;

helpBtn.onclick = closeHelpBtn.onclick = () => {
    helpBox.classList.toggle('d-none');
}

//set up keyboard to get letter 
for (let i = 0; i < keyLetters.length; i++) {
    keyLetters[i].onclick = function(event) {
        getNewLetter(event.target.innerHTML);
    }
}

//set up keyboard to get modifier
for (let i = 0; i < keyModifs.length; i++) {
    keyModifs[i].onclick = function(event) {
        let type = event.target.getAttribute('type');
        type === 'Enter' ? submitWord() : deleteWord();
    }
}

//open setting menu
settingBtn.addEventListener('click', () => {
    settingMenu.classList.remove('d-none');
})

//close setting menu
closeBtn.addEventListener('click', () => {
    settingMenu.classList.add('d-none');
});

// init/reset the game
function init() {
    for (let row of guessingRows) {
        for (let box of row.querySelectorAll('.box')) {
            box.innerHTML = '';
        }
    }

    currentRow = 0;
    currentColumn = 0; 
    letterBoxs = guessingRows[currentRow].querySelectorAll('.box');
    keyWord = words[Math.round(Math.random() * 53)];
    console.log(keyWord);
    setDefaultKey();
}

function setDefaultKey() {
    keyLetters.forEach((value) => {
        value.style.backgroundColor = 'var(--keyboard-color)';
    })
}


//show letter on box
function getNewLetter(letter) {
    if (currentColumn == 5)
        return;

    let currentBox = letterBoxs[currentColumn];
    // set letter
    currentBox.innerHTML = letter;
    // set border
    currentBox.classList.add('b-light');
    // add effect 
    setTimeout(() => {
        currentBox.style.animation = 'zoomIn 0.1s linear';
        currentBox.style.fontSize = '30px';
    }, 100);
    currentColumn++;
}

function deleteWord() {
    currentColumn--;
    if (currentColumn < 0) {
        currentColumn = 0;
        return;
    }
    let currentBox = letterBoxs[currentColumn];
    // delete letter
    currentBox.innerHTML = '';
    Object.assign(currentBox.style, {
        fontSize: "",
        animation: ""
    });
    //  delete border
    currentBox.classList.remove('b-light');
}

async function submitWord() {
    if (currentRow == 6)
        return;
    if (currentColumn < 5) {
        addVibrateEffect();
        return;
    }
        
    let word = getCurrentWord().toLowerCase();
    //check word is exist or not
    let result = await checkWord(word);

    if (result.title) {
        addVibrateEffect();
    }
    else {
        await checkSubmitWord(word);
    }
}

async function checkWord(word) {
    return fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word)
            .then(res => res.json())
            .then(data => data);
}

function getCurrentWord() {
    let word = '';
    for (let i = 0; i < letterBoxs.length; i++)
        word += '' + letterBoxs[i].innerHTML;
    
    return word;
}

async function checkSubmitWord(word) {
    let isTrue = [];

    // if equal side by side => 1;
    // if character not contain => -1;
    // if character is in the word but not in right index => 0
    for (let i = 0; i < word.length ; i++) {
        if (keyWord.includes(word.charAt(i))) {
            if (word.charAt(i) === keyWord.charAt(i))
                isTrue[i] = 0;
            else
                isTrue[i] = 1;
        }
        else 
            isTrue[i] = 2;
    }

    totalResult.push(isTrue);
    if ( isTrue.reduce((prev, value) => prev + value, 0) == 0 ) {
        playedTurn++;
        resultHeader.innerHTML = message[0]; 
        setTimeout(getResult, 1500);
    }
    
    addFlipEffect(isTrue);
    addColorLetter(word, isTrue);
    if (++currentRow !== 6) {
        letterBoxs = guessingRows[currentRow].querySelectorAll('.box');
        currentColumn = 0;
    }
    else { 
        playedTurn++;
        setTitle();               
        setTimeout(getResult, 1500);
    }
        
}

async function addFlipEffect(isTrue) {
    let time = 300;
    letterBoxs.forEach((value, key) => {
        let letter = value.textContent;
        value.innerHTML = `<div class="inner-box flip">
                            <div class="front">
                                <p>${letter}</p>
                            </div>
                            <div class="back">
                                <p>${letter}</p>
                            </div>
                            </div>`
        // shade color for box
        value.querySelector('.back').style.backgroundColor = colors[isTrue[key]];
        setTimeout(() => {
            value.querySelector('.inner-box').style.transform = 'rotateX(-180deg)';
            value.classList.remove('b-light');
            value.style.border = 'none !important';

        }, time);
        time += 100;
    })
}

function addColorLetter(word, isTrue) {
    
    for (let index in word) {
        keyLetters.forEach((value) => {
            if (value.textContent.toLowerCase() === word.charAt(index)) {
                value.style.backgroundColor = colors[isTrue[index]];
            }    
        })
    }
}

function addVibrateEffect() {
    setTimeout(() => {
        letterBoxs.forEach((value) => {
            value.style.animation = '';
        })
    }, 500);
    letterBoxs.forEach((value) => {
        value.style.animation = 'vibrate 0.25s ease-out';
    })
}

function getResult() {
    resultInfo.forEach((value) => value.innerHTML = playedTurn);

    result.classList.toggle('d-none');
}

function setTitle() {
    let sum = 0;

    totalResult.forEach(value => {
        sum += value.reduce((prev, cur) => prev + cur, 0);
    });

    sum < 40 ? resultHeader.innerHTML = message[1] : resultHeader.innerHTML = message[2];
}







