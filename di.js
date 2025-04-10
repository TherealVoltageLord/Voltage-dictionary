const DICTIONARY_API_URL = "https://voltagelord-volt-dictionary.hf.space";
let currentAudio = null;
let currentWord = "";
let currentLang = "es";

// Language Available
const LANGUAGES = {
    es: { name: "Spanish", emoji: "🇪🇸" },
    fr: { name: "French", emoji: "🇫🇷" },
    de: { name: "German", emoji: "🇩🇪" },
    ja: { name: "Japanese", emoji: "🇯🇵" },
    ru: { name: "Russian", emoji: "🇷🇺" },
    yo: { name: "Yoruba", emoji: "🇳🇬" },
    ar: { name: "Arabic", emoji: "🇸🇦" }
};

particlesJS("particles-js", {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: ["#bc13fe", "#6a0dad", "#0ff0fc"] },
    shape: { type: "circle" },
    opacity: {
      value: 0.5,
      random: true,
      anim: { enable: true, speed: 1, opacity_min: 0.1 }
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: true, speed: 2, size_min: 0.1 }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#6a0dad",
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: true,
      out_mode: "out",
      attract: { enable: true, rotateX: 600, rotateY: 1200 }
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: true, mode: "grab" },
      onclick: { enable: true, mode: "push" },
      resize: true
    },
    modes: {
      grab: { distance: 140, line_linked: { opacity: 1 } },
      push: { particles_nb: 4 }
    }
  },
  retina_detect: true
});
// ================ DOM ELEMENTS ================
const elements = {
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    resultCard: document.getElementById('result-card'),
    errorCard: document.getElementById('error-card'),
    wordElement: document.getElementById('word'),
    definitionElement: document.getElementById('definition'),
    phoneticElement: document.getElementById('phonetic'),
    exampleElement: document.getElementById('example'),
    synonymsElement: document.getElementById('synonyms'),
    antonymsElement: document.getElementById('antonyms'),
    posContainer: document.getElementById('pos-container'),
    audioBtn: document.getElementById('audio-btn'),
    pronounceDefBtn: document.getElementById('pronounce-def-btn'),
    translateBtn: document.getElementById('translate-btn'),
    translationResult: document.getElementById('translation-result'),
    retryBtn: document.getElementById('retry-btn'),
    wotdElement: document.getElementById('wotd'),
    tabs: document.querySelectorAll('.tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    languageBubbles: document.querySelectorAll('.language-bubble'),
    loadingElement: document.getElementById('loading')
};

// ================ EVENT LISTENERS ================
function initEventListeners() {
    elements.searchBtn.addEventListener('click', searchWord);
    elements.searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchWord());
    elements.audioBtn.addEventListener('click', playWordAudio);
    elements.pronounceDefBtn.addEventListener('click', playDefinitionAudio);
    elements.translateBtn.addEventListener('click', translateWord);
    elements.retryBtn.addEventListener('click', resetSearch);
    
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab));
    });
    
    elements.languageBubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            currentLang = bubble.dataset.lang;
            updateActiveLanguageBubble();
        });
    });
}

// ================ CORE FUNCTIONS ================
async function searchWord() {
    const word = elements.searchInput.value.trim();
    if (!word) return;
    
    showLoadingState();
    currentWord = word;
    
    try {
        const [definitionData, detailsData, posData] = await Promise.all([
            fetchAPI(`${DICTIONARY_API_URL}/define/${word}`),
            fetchAPI(`${DICTIONARY_API_URL}/details/${word}`),
            fetchAPI(`${DICTIONARY_API_URL}/pos/${word}`)
        ]);
        
        updateWordUI(definitionData.data);
        updateDetailsUI(detailsData.data);
        updatePOSUI(posData.data);
        showResultCard();
    } catch (error) {
        showError(error.message || "Failed to fetch word data");
    }
}

async function fetchAPI(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    if (data.status === "error") throw new Error(data.message);
    return data;
}

function updateWordUI(data) {
    elements.wordElement.textContent = data.word;
    elements.definitionElement.textContent = data.definition;
}

function updateDetailsUI(data) {
    elements.phoneticElement.textContent = data.phonetic || "No phonetic available";
    
    if (data.meanings && data.meanings.length > 0) {
        const firstMeaning = data.meanings[0].definitions[0];
        elements.exampleElement.textContent = firstMeaning.example || "";
        elements.exampleElement.style.display = firstMeaning.example ? 'block' : 'none';
        
        if (data.lexical) {
            const firstPos = Object.keys(data.lexical)[0];
            elements.synonymsElement.textContent = 
                data.lexical[firstPos]?.synonyms?.join(", ") || "No synonyms found";
            elements.antonymsElement.textContent = 
                data.lexical[firstPos]?.antonyms?.join(", ") || "No antonyms found";
        }
    }
}

function updatePOSUI(data) {
    elements.posContainer.innerHTML = "";
    if (data.parts_of_speech && data.parts_of_speech.length > 0) {
        data.parts_of_speech.forEach(pos => {
            const tag = document.createElement('span');
            tag.className = 'pos-tag';
            tag.textContent = pos;
            elements.posContainer.appendChild(tag);
        });
    } else {
        elements.posContainer.innerHTML = "<p>No parts of speech data available</p>";
    }
}

async function playWordAudio() {
    const word = elements.wordElement.textContent;
    if (!word) return;
    
    stopCurrentAudio();
    
    try {
        const response = await fetch(`${DICTIONARY_API_URL}/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: word, lang: 'en' })
        });
        
        if (!response.ok) throw new Error('Failed to generate speech');
        
        const audioData = await response.json();
        currentAudio = new Audio(audioData.data.audio);
        currentAudio.play().catch(handleAudioError);
    } catch (error) {
        handleAudioError(error);
    }
}

async function playDefinitionAudio() {
    const word = elements.wordElement.textContent;
    const definition = elements.definitionElement.textContent;
    if (!word || !definition) return;
    
    stopCurrentAudio();
    
    try {
        const response = await fetch(`${DICTIONARY_API_URL}/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: `${word}. ${definition}`, lang: 'en' })
        });
        
        if (!response.ok) throw new Error('Failed to generate speech');
        
        const audioData = await response.json();
        currentAudio = new Audio(audioData.data.audio);
        currentAudio.play().catch(handleAudioError);
    } catch (error) {
        handleAudioError(error);
    }
}

async function translateWord() {
    if (!currentWord) return;
    
    showTranslatingState();
    
    try {
        const response = await fetch(`${DICTIONARY_API_URL}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: currentWord,
                target_lang: currentLang
            })
        });
        
        if (!response.ok) throw new Error(response.statusText);
        
        const data = await response.json();
        if (data.status === "error") throw new Error(data.message);
        
        showTranslationResult(data.data.translation);
    } catch (error) {
        showTranslationError(error.message);
    }
}

// ================ UI HELPERS ================
function showLoadingState() {
    elements.loadingElement.classList.remove('hidden');
    elements.resultCard.classList.add('hidden');
    elements.errorCard.classList.add('hidden');
}

function showResultCard() {
    elements.loadingElement.classList.add('hidden');
    elements.resultCard.classList.remove('hidden');
    elements.errorCard.classList.add('hidden');
}

function showError(message) {
    elements.loadingElement.classList.add('hidden');
    elements.resultCard.classList.add('hidden');
    elements.errorCard.classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

function resetSearch() {
    elements.errorCard.classList.add('hidden');
    elements.searchInput.value = '';
    elements.searchInput.focus();
}

function switchTab(selectedTab) {
    elements.tabs.forEach(tab => tab.classList.remove('active'));
    selectedTab.classList.add('active');
    
    const targetPane = document.getElementById(`${selectedTab.dataset.tab}-tab`);
    elements.tabPanes.forEach(pane => pane.classList.remove('active'));
    targetPane.classList.add('active');
}

function updateActiveLanguageBubble() {
    elements.languageBubbles.forEach(bubble => {
        bubble.classList.toggle('active', bubble.dataset.lang === currentLang);
    });
}

function showTranslatingState() {
    elements.translationResult.innerHTML = `
        <div class="translating-text">
            <i class="fas fa-sync-alt fa-spin"></i> Translating...
        </div>
    `;
}

function showTranslationResult(translation) {
    const langInfo = LANGUAGES[currentLang];
    elements.translationResult.innerHTML = `
        <div class="translation-text">${translation}</div>
        <div class="language-label">${langInfo.emoji} ${langInfo.name} translation</div>
    `;
}

function showTranslationError(message) {
    elements.translationResult.innerHTML = `
        <div class="error-text">Translation failed: ${message}</div>
    `;
}

function stopCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

function handleAudioError(error) {
    console.error("Audio playback failed:", error);
    showError("Audio playback failed. Please try again.");
}

// ================ INITIALIZATION ================
async function fetchWordOfTheDay() {
    try {
        const data = await fetchAPI(`${DICTIONARY_API_URL}/word-of-the-day`);
        elements.wotdElement.textContent = data.data.word;
    } catch (error) {
        console.error("Failed to fetch word of the day:", error);
        elements.wotdElement.textContent = "dictionary";
    }
}

function init() {
    initEventListeners();
    fetchWordOfTheDay();
    updateActiveLanguageBubble();
}

document.addEventListener('DOMContentLoaded', init);
