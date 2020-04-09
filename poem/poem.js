const osmosis = require("osmosis");
const sbd = require("sbd");
const syllable = require("syllable");
const pos = require("pos");
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();
const rhyme = require("rhyme");


function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function scramble(array){
    for(let i=0; i<array.length; i++){
        const randomIndex = Math.floor(Math.random() * array.length);
        const temp = array[randomIndex];
        array.randomIndex = array[i];
        array[i] = temp;
    }
}

function cleanText(text){
    return text.replace(/\[[0-9]+\]/g, "");
}

async function loadRhymingDictionary () {
    return new Promise((resolve) => {
        rhyme((rhymingDictionary) => {
            resolve(rhymingDictionary);
        })
    })
    
}
async function getText()  {
    
    return new Promise((resolve, reject) => {
        let text = [];
        osmosis.get("https://en.wikipedia.org/wiki/Justin_Bieber")
        .find("p")
        .set("paragraph")
        .data((item) => text.push(item.paragraph))
        .done(() => resolve(text))
        .error((e) => rejects(e));
    });
}
async function firstWordPoem () {
    const paragraphs = await getText();
    let firstWords = []
    paragraphs.forEach(paragraph => {
        const firstWord = paragraph.split(" ")[0];
        firstWords.push(firstWord);
    });
    return firstWords.join(" ");
}

async function haikuPoem() {
    const paragraphs = await getText();
    let fragments = [];
    paragraphs.forEach(pg => {
        let cleanpg = cleanText(pg);
        const sentences = sbd.sentences(cleanpg);
        sentences.forEach(sentence => {
            const chunks = sentence.split(",");
            fragments = fragments.concat(chunks);
        });
    });

    const fiveSyllableFragments = fragments.filter(fragment => {
        return syllable(fragment) === 5;
    });
    const sevenSyllableFragments = fragments.filter(fragment => {
        return syllable(fragment) === 7;
    })
    scramble(fiveSyllableFragments);
    scramble(sevenSyllableFragments);
    return [
        fiveSyllableFragments[0],
        sevenSyllableFragments[0],
        fiveSyllableFragments[1]
    ]
}

async function posPoem() {
    const paragraphs = await getText();
    const posTypes = ["JJR"];
    const tokens = [];
    paragraphs.forEach(pg => {
        const cleanpg = cleanText(pg);
        const sentences = sbd.sentences(cleanpg);
        sentences.forEach(sentence => {
            const lexes = lexer.lex(sentence);
            const tags = tagger.tag(lexes);
            tags.forEach(tag => {
                if(posTypes.includes(tag[1])) {
                    if(!tokens.includes(tag[0])) {
                        tokens.push(tag[0]);
                    }
                }
            });
        });
    });
    return tokens;
}

async function rhymePoem() {
    const paragraphs = await getText();
    const rhymeGroups = {};
    const rd = await loadRhymingDictionary();
    paragraphs.forEach(pg => {
        const cleanpg = cleanText(pg);
        const sentences = sbd.sentences(cleanpg);
        sentences.forEach(sentence => {
            const lexes = lexer.lex(sentence);
            for (let i = 0; i < lexes.length - 5; i++) {
                const fragment = lexes.slice(i, i + 5);
                const lastWord = fragment.slice(-1)[0];
                const pronunciations = rd.pronounce(lastWord);
                if(pronunciations) {
                    const pronunciation = pronunciations[0];
                    const rhymeClass = pronunciation.slice(-3).join("-");
                    if (!rhymeGroups[rhymeClass]) rhymeGroups[rhymeClass] = [];
                    rhymeGroups[rhymeClass].push(fragment);
                }
            }
        })
    });

    let goodKeys = Object.keys(rhymeGroups);
    goodKeys = goodKeys.filter(key => {
        const fragments = rhymeGroups[key];
        return !fragments.every(fragment => {
            return fragment.slice(-1)[0].toLowerCase() === fragments[0].slice(-1)[0].toLowerCase();
        })
    });

    function getRhymingPair() {
        scramble(goodKeys);
        const rhymeClass = goodKeys[0];
        const rhymingFragments = rhymeGroups[rhymeClass];
        scramble(rhymingFragments);
        const frag1 = rhymingFragments[0];

        const lastWord = frag1.slice(-1)[0];
        const otherValidFragments = rhymingFragments.filter(otherFragment => {
            const otherLastWord = otherFragment.slice(-1)[0];
            return otherLastWord !== lastWord;
        });
        const frag2 = otherValidFragments[0];
        return [ frag1.join(" "), frag2.join(" ") ];
    }
    let lines = [];
    for (let i = 0; i< 3; i++) {
        const pair1 = getRhymingPair();
        const pair2 = getRhymingPair();
        lines.push(pair1[0]);
        lines.push(pair2[0]);
        lines.push(pair1[1]);
        lines.push(pair2[1]);
    }
    lines = lines.concat(getRhymingPair());
    return lines;
}

async function makePoem() {
    return rhymePoem();
}


if (require.main === module) {
    //getText().then(text => console.log(text));
    makePoem().then(res => console.log(res));
}

module.exports = {
    makePoem
};
