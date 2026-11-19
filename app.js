/**
 * QR Voice-to-WhatsApp Ordering Web App
 * Bilingual Tamil / English speech recognition, item parser, and WhatsApp sender
 */

// ==========================================
// 1. STATE & LOCAL STORAGE INITIALIZATION
// ==========================================

const APP_STORAGE_KEY = 'voice_order_app_settings';
const HISTORY_STORAGE_KEY = 'voice_order_history';

let state = {
  storeName: 'Namma Kadai (நம்ம கடை)',
  whatsappNumber: '919876543210',
  spokenLang: 'ta', // 'ta' | 'en' | 'bilingual'
  displayLang: 'both', // 'both' | 'ta' | 'en'
  items: [],
  isRecording: false,
  timerInterval: null,
  recordingSeconds: 0,
  rawTranscript: ''
};

// Common bilingual retail dictionary for Tamil / English matching
const ITEM_DICTIONARY = [
  { ta: 'தக்காளி', en: 'Tomato', aliases: ['thakkali', 'tomato', 'தக்காளி'] },
  { ta: 'வெங்காயம்', en: 'Onion', aliases: ['vengayam', 'onion', 'சின்ன வெங்காயம்', 'பெரிய வெங்காயம்'] },
  { ta: 'உருளைக்கிழங்கு', en: 'Potato', aliases: ['urulai', 'potato', 'உருளை'] },
  { ta: 'பால்', en: 'Milk', aliases: ['paal', 'milk', 'பால் பாக்கெட்'] },
  { ta: 'தயிர்', en: 'Curd / Yogurt', aliases: ['thayir', 'curd', 'yogurt'] },
  { ta: 'அரிசி', en: 'Rice', aliases: ['arisi', 'rice', 'பொன்னி அரிசி', 'பாசுமதி அரிசி'] },
  { ta: 'துவரம் பருப்பு', en: 'Toor Dal', aliases: ['paruppu', 'dal', 'toor dal', 'பருப்பு'] },
  { ta: 'பாசி பருப்பு', en: 'Moong Dal', aliases: ['moong dal', 'pasi paruppu'] },
  { ta: 'சர்க்கரை', en: 'Sugar', aliases: ['sarkkarai', 'sugar', 'சீனி'] },
  { ta: 'நாட்டு சர்க்கரை', en: 'Country Sugar / Jaggery', aliases: ['nattu sarkkarai', 'vellam', 'jaggery'] },
  { ta: 'உப்பு', en: 'Salt', aliases: ['uppu', 'salt', 'தூள் உப்பு', 'கல் உப்பு'] },
  { ta: 'சமையல் எண்ணெய்', en: 'Cooking Oil', aliases: ['ennai', 'oil', 'sunflower oil', 'நல்லெண்ணெய்', 'தேங்காய் எண்ணெய்'] },
  { ta: 'நெய்', en: 'Ghee', aliases: ['ghee', 'nei'] },
  { ta: 'காபி தூள்', en: 'Coffee Powder', aliases: ['coffee', 'coffee powder', 'காபி'] },
  { ta: 'டீ தூள்', en: 'Tea Powder', aliases: ['tea', 'tea powder', 'டீ'] },
  { ta: 'முட்டை', en: 'Eggs', aliases: ['muttai', 'eggs', 'egg'] },
  { ta: 'ரொட்டி', en: 'Bread', aliases: ['bread', 'ரொட்டி', 'பிரெட்'] },
  { ta: 'வாழைப்பழம்', en: 'Banana', aliases: ['banana', 'pazham', 'வாழை'] },
  { ta: 'ஆப்பிள்', en: 'Apple', aliases: ['apple', 'ஆப்பிள்'] },
  { ta: 'கேரட்', en: 'Carrot', aliases: ['carrot', 'கேரட்'] },
  { ta: 'பீன்ஸ்', en: 'Beans', aliases: ['beans', 'பீன்ஸ்'] },
  { ta: 'கோதுமை மாவு', en: 'Atta / Wheat Flour', aliases: ['atta', 'wheat', 'கோதுமை'] },
  { ta: 'மைதா', en: 'Maida', aliases: ['maida', 'மைதா மாவு'] },
  { ta: 'மஞ்சள் தூள்', en: 'Turmeric Powder', aliases: ['turmeric', 'manjal'] },
  { ta: 'மிளகாய் தூள்', en: 'Chilli Powder', aliases: ['chilli powder', 'milagai thool'] },
  { ta: 'மல்லி தூள்', en: 'Coriander Powder', aliases: ['coriander powder', 'malli thool', 'தனியா'] },
  { ta: 'சீரகம்', en: 'Jeera / Cumin', aliases: ['jeera', 'seeragam', 'cumin'] },
  { ta: 'கடுகு', en: 'Mustard Seeds', aliases: ['kadugu', 'mustard'] },
  { ta: 'பூண்டு', en: 'Garlic', aliases: ['poondu', 'garlic'] },
  { ta: 'இஞ்சி', en: 'Ginger', aliases: ['inji', 'ginger'] },
  { ta: 'பச்சை மிளகாய்', en: 'Green Chilli', aliases: ['green chilli', 'pachai milagai'] },
  { ta: 'மல்லித்தழை', en: 'Coriander Leaves', aliases: ['coriander leaves', 'kothamalli'] },
  { ta: 'கருவேப்பிலை', en: 'Curry Leaves', aliases: ['curry leaves', 'karuveppilai'] },
  { ta: 'சோப்பு', en: 'Soap', aliases: ['soap', 'குளியல் சோப்பு', 'துணி சோப்பு'] },
  { ta: 'ஷாம்பு', en: 'Shampoo', aliases: ['shampoo', 'ஷாம்பு'] },
  { ta: 'டிடர்ஜென்ட் பவுடர்', en: 'Detergent Powder', aliases: ['surf excel', 'detergent', 'aerial', 'வாஷிங் பவுடர்'] },
  { ta: 'பிஸ்கட்', en: 'Biscuit', aliases: ['biscuit', 'பிஸ்கோத்து'] },
  { ta: 'குடிநீர் பாட்டில்', en: 'Water Bottle', aliases: ['water', 'water bottle', 'தண்ணீர் பாட்டில்'] }
];

// ==========================================
// 2. DOM ELEMENTS
// ==========================================

const elements = {
  headerStoreName: document.getElementById('headerStoreName'),
  targetPhoneDisplay: document.getElementById('targetPhoneDisplay'),
  langTaBtn: document.getElementById('langTaBtn'),
  langEnBtn: document.getElementById('langEnBtn'),
  langBiBtn: document.getElementById('langBiBtn'),
  recordBtn: document.getElementById('recordBtn'),
  micIcon: document.getElementById('micIcon'),
  stopIcon: document.getElementById('stopIcon'),
  statusDot: document.getElementById('statusDot'),
  statusLabel: document.getElementById('statusLabel'),
  timerBadge: document.getElementById('timerBadge'),
  visualizerContainer: document.getElementById('visualizerContainer'),
  audioWaveCanvas: document.getElementById('audioWaveCanvas'),
  liveTranscriptBox: document.getElementById('liveTranscriptBox'),
  liveTranscriptText: document.getElementById('liveTranscriptText'),
  itemsList: document.getElementById('itemsList'),
  itemsCountBadge: document.getElementById('itemsCountBadge'),
  emptyItemsPlaceholder: document.getElementById('emptyItemsPlaceholder'),
  clearAllBtn: document.getElementById('clearAllBtn'),
  manualItemInput: document.getElementById('manualItemInput'),
  addManualBtn: document.getElementById('addManualBtn'),
  showBothBtn: document.getElementById('showBothBtn'),
  showTaBtn: document.getElementById('showTaBtn'),
  showEnBtn: document.getElementById('showEnBtn'),
  custNameInput: document.getElementById('custNameInput'),
  custNoteInput: document.getElementById('custNoteInput'),
  sendWhatsappBtn: document.getElementById('sendWhatsappBtn'),
  // Modals
  settingsBtn: document.getElementById('settingsBtn'),
  changeTargetBtn: document.getElementById('changeTargetBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsModal: document.getElementById('closeSettingsModal'),
  settingStoreName: document.getElementById('settingStoreName'),
  settingPhone: document.getElementById('settingPhone'),
  settingDefaultLang: document.getElementById('settingDefaultLang'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  qrBtn: document.getElementById('qrBtn'),
  qrModal: document.getElementById('qrModal'),
  closeQrModal: document.getElementById('closeQrModal'),
  printQrBtn: document.getElementById('printQrBtn'),
  qrcodeCanvas: document.getElementById('qrcodeCanvas'),
  qrModalStoreTitle: document.getElementById('qrModalStoreTitle'),
  qrUrlDisplay: document.getElementById('qrUrlDisplay'),
  historyBtn: document.getElementById('historyBtn'),
  historyModal: document.getElementById('historyModal'),
  closeHistoryModal: document.getElementById('closeHistoryModal'),
  closeHistoryBtn2: document.getElementById('closeHistoryBtn2'),
  historyListContainer: document.getElementById('historyListContainer'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  toast: document.getElementById('toast')
};

// ==========================================
// 3. LIFECYCLE & STORAGE HELPERS
// ==========================================

function loadSettings() {
  try {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.storeName = parsed.storeName || state.storeName;
      state.whatsappNumber = parsed.whatsappNumber || state.whatsappNumber;
      state.spokenLang = parsed.defaultLang || state.spokenLang;
    }
  } catch (e) {
    console.warn('Error loading settings', e);
  }
  updateStoreHeaderUI();
  updateLangPillsUI();
}

function saveSettings() {
  const storeNameVal = elements.settingStoreName.value.trim() || 'Namma Kadai';
  let phoneVal = elements.settingPhone.value.trim().replace(/[^0-9]/g, '');
  if (!phoneVal.startsWith('91') && phoneVal.length === 10) {
    phoneVal = '91' + phoneVal;
  }
  const defaultLangVal = elements.settingDefaultLang.value;

  state.storeName = storeNameVal;
  state.whatsappNumber = phoneVal;
  state.spokenLang = defaultLangVal;

  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
    storeName: state.storeName,
    whatsappNumber: state.whatsappNumber,
    defaultLang: state.spokenLang
  }));

  updateStoreHeaderUI();
  updateLangPillsUI();
  elements.settingsModal.classList.add('hidden');
  showToast('அமைப்புகள் சேமிக்கப்பட்டது! (Settings saved)');
}

function updateStoreHeaderUI() {
  elements.headerStoreName.textContent = state.storeName;
  elements.targetPhoneDisplay.textContent = '+' + state.whatsappNumber;
}

function updateLangPillsUI() {
  const activeClass = ['border-brand-500', 'text-brand-700', 'font-bold'];
  const inactiveClass = ['text-slate-600'];

  [elements.langTaBtn, elements.langEnBtn, elements.langBiBtn].forEach(btn => {
    btn.classList.remove(...activeClass);
    btn.classList.add(...inactiveClass);
  });

  if (state.spokenLang === 'ta') {
    elements.langTaBtn.classList.add(...activeClass);
    elements.langTaBtn.classList.remove(...inactiveClass);
  } else if (state.spokenLang === 'en') {
    elements.langEnBtn.classList.add(...activeClass);
    elements.langEnBtn.classList.remove(...inactiveClass);
  } else {
    elements.langBiBtn.classList.add(...activeClass);
    elements.langBiBtn.classList.remove(...inactiveClass);
  }
}

function showToast(msg) {
  elements.toast.textContent = msg;
  elements.toast.classList.remove('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    elements.toast.classList.add('opacity-0', 'pointer-events-none');
  }, 2600);
}

// ==========================================
// 4. SPEECH RECOGNITION & AUDIO VISUALIZER
// ==========================================

let recognition = null;
let audioContext = null;
let analyser = null;
let micStream = null;
let animFrameId = null;

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }
  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    state.isRecording = true;
    startTimer();
    updateRecordingUI(true);
    startVisualizer();
  };

  rec.onresult = (event) => {
    let interim = '';
    let finalSpeech = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalSpeech += event.results[i][0].transcript + ' ';
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    elements.liveTranscriptBox.classList.remove('hidden');
    elements.liveTranscriptText.textContent = interim || finalSpeech || 'கேட்கிறது...';

    if (finalSpeech.trim().length > 0) {
      state.rawTranscript += ' ' + finalSpeech;
      parseAndAddSpokenItems(finalSpeech);
    }
  };

  rec.onerror = (event) => {
    console.error('Speech error:', event.error);
    if (event.error === 'not-allowed') {
      showToast('மைக் அனுமதி மறுக்கப்பட்டது. Settings-ல் மைக் அனுமதிக்கவும்.');
    } else if (event.error !== 'no-speech') {
      showToast('பிழை: ' + event.error);
    }
    stopRecording();
  };

  rec.onend = () => {
    if (state.isRecording) {
      // If stopped naturally without manual button click, wrap up
      stopRecording();
    }
  };

  return rec;
}

function startRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('உங்கள் பிரவுசரில் Speech Recognition வசதி இல்லை. கீழே தட்டச்சு செய்யவும்.');
    return;
  }

  if (!recognition) {
    recognition = initSpeechRecognition();
  }

  // Set appropriate language model
  if (state.spokenLang === 'ta') {
    recognition.lang = 'ta-IN';
  } else if (state.spokenLang === 'en') {
    recognition.lang = 'en-IN';
  } else {
    // For bilingual/Tanglish, ta-IN or en-IN captures both script & phonetic
    recognition.lang = 'ta-IN';
  }

  try {
    elements.liveTranscriptText.textContent = 'பேசுங்கள் (Speak now)...';
    elements.liveTranscriptBox.classList.remove('hidden');
    recognition.start();
  } catch (err) {
    console.warn('Speech recognition start err:', err);
  }
}

function stopRecording() {
  state.isRecording = false;
  stopTimer();
  updateRecordingUI(false);
  stopVisualizer();

  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {}
  }

  setTimeout(() => {
    elements.liveTranscriptBox.classList.add('hidden');
  }, 1800);
}

function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startTimer() {
  state.recordingSeconds = 0;
  elements.timerBadge.textContent = '00:00';
  elements.timerBadge.classList.remove('hidden');
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.recordingSeconds++;
    const mins = String(Math.floor(state.recordingSeconds / 60)).padStart(2, '0');
    const secs = String(state.recordingSeconds % 60).padStart(2, '0');
    elements.timerBadge.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  elements.timerBadge.classList.add('hidden');
}

function updateRecordingUI(isRec) {
  if (isRec) {
    elements.recordBtn.classList.add('mic-recording-pulse', 'from-red-600', 'to-rose-500');
    elements.recordBtn.classList.remove('from-brand-600', 'to-emerald-400');
    elements.micIcon.classList.add('hidden');
    elements.stopIcon.classList.remove('hidden');
    elements.statusDot.className = 'w-2.5 h-2.5 rounded-full bg-red-500 animate-ping';
    elements.statusLabel.textContent = 'பதிவாகிறது... முடித்ததும் அழுத்தவும் (Recording...)';
    elements.statusLabel.className = 'text-xs font-bold text-red-600 uppercase tracking-wider';
    elements.visualizerContainer.classList.remove('hidden');
  } else {
    elements.recordBtn.classList.remove('mic-recording-pulse', 'from-red-600', 'to-rose-500');
    elements.recordBtn.classList.add('from-brand-600', 'to-emerald-400');
    elements.micIcon.classList.remove('hidden');
    elements.stopIcon.classList.add('hidden');
    elements.statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
    elements.statusLabel.textContent = 'மைக் தயாராக உள்ளது (Tap to Speak)';
    elements.statusLabel.className = 'text-xs font-semibold text-slate-500 uppercase tracking-wider';
    elements.visualizerContainer.classList.add('hidden');
  }
}

// Live Canvas Waveform Visualization
async function startVisualizer() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    const source = audioContext.createMediaStreamSource(micStream);
    source.connect(analyser);

    const canvas = elements.audioWaveCanvas;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        canvasCtx.fillStyle = '#10b981';
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
        canvasCtx.fill();
        x += barWidth;
      }
    }
    draw();
  } catch (err) {
    console.warn('Microphone stream for visualizer unavailable:', err);
  }
}

function stopVisualizer() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }
}

// ==========================================
// 5. NATURAL LANGUAGE ITEM PARSER & MATCHER
// ==========================================

function parseAndAddSpokenItems(spokenText) {
  if (!spokenText || !spokenText.trim()) return;

  // Split transcript by common speech delimiters (and, comma, உம், மற்றும், pause markers)
  const segments = spokenText
    .replace(/மற்றும்|அப்புறம்|பிறகு|and|then|\+/gi, ',')
    .split(/[,.\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  segments.forEach(segment => {
    const parsedItem = extractItemDetails(segment);
    if (parsedItem && parsedItem.name) {
      addItemToList(parsedItem);
    }
  });

  renderItemsList();
}

function extractItemDetails(text) {
  let cleaned = text.trim();
  let quantity = 1;
  let unit = 'nos';

  // 1. Quantities & Tamil Fractions
  if (/அரை|half|1\/2|0\.5/i.test(cleaned)) {
    quantity = '1/2';
    cleaned = cleaned.replace(/அரை|half|1\/2|0\.5/gi, '').trim();
  } else if (/கால்|quarter|1\/4|0\.25/i.test(cleaned)) {
    quantity = '1/4';
    cleaned = cleaned.replace(/கால்|quarter|1\/4|0\.25/gi, '').trim();
  } else if (/முக்கால்|3\/4|0\.75/i.test(cleaned)) {
    quantity = '3/4';
    cleaned = cleaned.replace(/முக்கால்|3\/4|0\.75/gi, '').trim();
  } else {
    // Match numeric quantities (e.g. 1, 2, 5, 2.5)
    const numMatch = cleaned.match(/(\d+(\.\d+)?)/);
    if (numMatch) {
      quantity = parseFloat(numMatch[1]);
      cleaned = cleaned.replace(numMatch[0], '').trim();
    } else {
      // Check for spoken Tamil numbers
      const tamilNumbers = [
        { word: 'ஒன்று', num: 1 }, { word: 'ஒன்னு', num: 1 }, { word: 'one', num: 1 },
        { word: 'இரண்டு', num: 2 }, { word: 'ரெண்டு', num: 2 }, { word: 'two', num: 2 },
        { word: 'மூன்று', num: 3 }, { word: 'மூணு', num: 3 }, { word: 'three', num: 3 },
        { word: 'நான்கு', num: 4 }, { word: 'நாலு', num: 4 }, { word: 'four', num: 4 },
        { word: 'ஐந்து', num: 5 }, { word: 'அஞ்சு', num: 5 }, { word: 'five', num: 5 },
        { word: 'பத்து', num: 10 }, { word: 'ten', num: 10 }
      ];
      for (const tNum of tamilNumbers) {
        const regex = new RegExp(`\\b${tNum.word}\\b`, 'gi');
        if (regex.test(cleaned)) {
          quantity = tNum.num;
          cleaned = cleaned.replace(regex, '').trim();
          break;
        }
      }
    }
  }

  // 2. Units extraction
  const unitsMap = [
    { regex: /கிலோ|kilo|kg/i, unit: 'kg' },
    { regex: /கிராம்|gram|grams|g\b/i, unit: 'g' },
    { regex: /பாக்கெட்|packet|packets|pkt/i, unit: 'pkt' },
    { regex: /லிட்டர்|litre|liter|ltr/i, unit: 'L' },
    { regex: /பாட்டில்|bottle|bottles/i, unit: 'btl' },
    { regex: /கட்டு|bunch/i, unit: 'bunch' },
    { regex: /டஜன்|dozen/i, unit: 'dozen' },
    { regex: /எண்ணிக்கை|pieces|piece|nos|no/i, unit: 'nos' }
  ];

  for (const u of unitsMap) {
    if (u.regex.test(cleaned)) {
      unit = u.unit;
      cleaned = cleaned.replace(u.regex, '').trim();
      break;
    }
  }

  // Clean trailing punctuation or filler words
  cleaned = cleaned.replace(/[-–:;]/g, '').trim();
  if (!cleaned) return null;

  // 3. Match against Bilingual Dictionary
  let matchedTamil = cleaned;
  let matchedEnglish = cleaned;

  const found = ITEM_DICTIONARY.find(dict => {
    return dict.aliases.some(alias => cleaned.toLowerCase().includes(alias.toLowerCase()));
  });

  if (found) {
    matchedTamil = found.ta;
    matchedEnglish = found.en;
  }

  return {
    id: Date.now() + Math.random().toString(36).substring(2, 6),
    rawName: cleaned,
    tamilName: matchedTamil,
    englishName: matchedEnglish,
    quantity: quantity,
    unit: unit
  };
}

function addItemToList(item) {
  // Check if item already exists in the list to increment quantity
  const existing = state.items.find(i => 
    i.tamilName === item.tamilName || 
    i.englishName.toLowerCase() === item.englishName.toLowerCase()
  );

  if (existing && typeof existing.quantity === 'number' && typeof item.quantity === 'number' && existing.unit === item.unit) {
    existing.quantity += item.quantity;
  } else {
    state.items.push(item);
  }
}

// ==========================================
// 6. UI RENDERING & ITEM MANAGEMENT
// ==========================================

function renderItemsList() {
  elements.itemsList.innerHTML = '';
  const count = state.items.length;
  elements.itemsCountBadge.textContent = `${count} ${count === 1 ? 'பொருள்' : 'பொருட்கள்'}`;

  if (count === 0) {
    elements.emptyItemsPlaceholder.classList.remove('hidden');
    return;
  }
  elements.emptyItemsPlaceholder.classList.add('hidden');

  state.items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between p-3 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-xs';

    // Title representation based on display filter
    let displayNameHtml = '';
    if (state.displayLang === 'ta') {
      displayNameHtml = `<span class="tamil-font font-bold text-slate-900 text-sm">${item.tamilName}</span>`;
    } else if (state.displayLang === 'en') {
      displayNameHtml = `<span class="font-bold text-slate-900 text-sm">${item.englishName}</span>`;
    } else {
      displayNameHtml = `
        <div class="flex flex-col">
          <span class="tamil-font font-bold text-slate-900 text-sm leading-snug">${item.tamilName}</span>
          <span class="text-xs text-slate-500 font-medium">${item.englishName}</span>
        </div>
      `;
    }

    li.innerHTML = `
      <div class="flex items-center gap-3 flex-1 min-w-0 pr-2">
        <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-bold shrink-0">
          ${index + 1}
        </span>
        <div class="min-w-0">
          ${displayNameHtml}
        </div>
      </div>

      <!-- Quantity Controls & Unit -->
      <div class="flex items-center gap-2 shrink-0">
        <div class="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
          <button data-action="dec" data-id="${item.id}" class="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 text-base font-bold rounded-lg hover:bg-white transition">-</button>
          <span class="px-2 font-mono font-bold text-xs text-slate-800">${item.quantity} <span class="text-[10px] text-slate-500 font-medium">${item.unit}</span></span>
          <button data-action="inc" data-id="${item.id}" class="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 text-base font-bold rounded-lg hover:bg-white transition">+</button>
        </div>
        
        <!-- Delete item button -->
        <button data-action="delete" data-id="${item.id}" class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition" title="Delete">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    `;

    elements.itemsList.appendChild(li);
  });
}

function handleItemAction(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (!action || !id) return;

  const itemIndex = state.items.findIndex(i => i.id === id);
  if (itemIndex === -1) return;

  if (action === 'delete') {
    state.items.splice(itemIndex, 1);
  } else if (action === 'inc') {
    if (typeof state.items[itemIndex].quantity === 'number') {
      state.items[itemIndex].quantity += 1;
    } else {
      state.items[itemIndex].quantity = 1;
    }
  } else if (action === 'dec') {
    if (typeof state.items[itemIndex].quantity === 'number') {
      if (state.items[itemIndex].quantity > 1) {
        state.items[itemIndex].quantity -= 1;
      } else {
        state.items.splice(itemIndex, 1);
      }
    } else {
      state.items.splice(itemIndex, 1);
    }
  }

  renderItemsList();
}

function handleAddManualItem() {
  const val = elements.manualItemInput.value.trim();
  if (!val) return;
  const parsed = extractItemDetails(val);
  if (parsed) {
    addItemToList(parsed);
    elements.manualItemInput.value = '';
    renderItemsList();
    showToast('பொருள் சேர்க்கப்பட்டது (+ Added)');
  }
}

// Display toggle handlers
function setDisplayLang(mode) {
  state.displayLang = mode;
  [elements.showBothBtn, elements.showTaBtn, elements.showEnBtn].forEach(b => {
    b.className = 'px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800';
  });
  if (mode === 'both') {
    elements.showBothBtn.className = 'px-2 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-800 shadow-sm border border-slate-200';
  } else if (mode === 'ta') {
    elements.showTaBtn.className = 'px-2 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-800 shadow-sm border border-slate-200';
  } else {
    elements.showEnBtn.className = 'px-2 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-800 shadow-sm border border-slate-200';
  }
  renderItemsList();
}

// ==========================================
// 7. WHATSAPP CLICK-TO-CHAT REDIRECTION
// ==========================================

function sendOrderViaWhatsApp() {
  if (state.items.length === 0) {
    showToast('ஆர்டர் அனுப்ப குறைந்தபட்சம் ஒரு பொருள் சேர்க்கவும்!');
    return;
  }

  const custName = elements.custNameInput.value.trim();
  const custNote = elements.custNoteInput.value.trim();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  let message = `🛍️ *புதிய குரல் ஆர்டர் / NEW VOICE ORDER*\n`;
  message += `🏪 *கடை:* ${state.storeName}\n`;
  message += `📅 *தேதி:* ${dateStr}, ${timeStr}\n`;
  message += `--------------------------------\n`;
  message += `🛒 *பொருட்கள் பட்டியல் (Item List):*\n`;

  state.items.forEach((item, idx) => {
    if (state.displayLang === 'ta') {
      message += `${idx + 1}. *${item.tamilName}* - ${item.quantity} ${item.unit}\n`;
    } else if (state.displayLang === 'en') {
      message += `${idx + 1}. *${item.englishName}* - ${item.quantity} ${item.unit}\n`;
    } else {
      message += `${idx + 1}. *${item.tamilName}* (${item.englishName}) - ${item.quantity} ${item.unit}\n`;
    }
  });

  message += `--------------------------------\n`;
  message += `📦 *மொத்த பொருட்கள்:* ${state.items.length}\n`;

  if (custName) {
    message += `👤 *வாடிக்கையாளர் பெயர்:* ${custName}\n`;
  }
  if (custNote) {
    message += `📍 *முகவரி / குறிப்பு:* ${custNote}\n`;
  }

  message += `--------------------------------\n`;
  message += `_குரல் வழி ஆர்டர் (Voice-to-WhatsApp App)_`;

  // Save order to history
  saveOrderToHistory({
    id: Date.now(),
    dateStr: `${dateStr} ${timeStr}`,
    itemsCount: state.items.length,
    custName: custName || 'Customer',
    preview: state.items.map(i => `${i.tamilName} (${i.quantity} ${i.unit})`).join(', ')
  });

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${state.whatsappNumber}?text=${encodedMsg}`;

  // Open WhatsApp
  window.open(waUrl, '_blank');
}

// ==========================================
// 8. ORDER HISTORY MANAGEMENT
// ==========================================

function saveOrderToHistory(order) {
  try {
    const list = getOrderHistory();
    list.unshift(order);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {
    console.warn('History save error', e);
  }
}

function getOrderHistory() {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function renderOrderHistory() {
  const history = getOrderHistory();
  elements.historyListContainer.innerHTML = '';

  if (history.length === 0) {
    elements.historyListContainer.innerHTML = `
      <div class="py-8 text-center text-slate-400 text-xs">
        எந்த முந்தைய ஆர்டர்களும் இல்லை (No orders yet).
      </div>
    `;
    return;
  }

  history.forEach(ord => {
    const itemEl = document.createElement('div');
    itemEl.className = 'p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs';
    itemEl.innerHTML = `
      <div class="flex items-center justify-between font-bold text-slate-800">
        <span>${ord.custName}</span>
        <span class="text-[10px] text-slate-400 font-mono">${ord.dateStr}</span>
      </div>
      <p class="text-slate-600 text-[11px] line-clamp-2">${ord.preview}</p>
      <div class="text-[10px] font-semibold text-emerald-600 pt-0.5">
        📦 ${ord.itemsCount} பொருட்கள்
      </div>
    `;
    elements.historyListContainer.appendChild(itemEl);
  });
}

// ==========================================
// 9. QR CODE MODAL GENERATOR
// ==========================================

let qrInstance = null;

function showQrModal() {
  elements.qrModalStoreTitle.textContent = state.storeName;
  const currentUrl = window.location.href.split('#')[0];
  elements.qrUrlDisplay.textContent = currentUrl;

  elements.qrcodeCanvas.innerHTML = '';
  qrInstance = new QRCode(elements.qrcodeCanvas, {
    text: currentUrl,
    width: 180,
    height: 180,
    colorDark: '#0f172a',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  elements.qrModal.classList.remove('hidden');
}

// ==========================================
// 10. EVENT LISTENERS
// ==========================================

function initEventListeners() {
  // Mic Recording
  elements.recordBtn.addEventListener('click', toggleRecording);

  // Spoken Language Pills
  elements.langTaBtn.addEventListener('click', () => { state.spokenLang = 'ta'; updateLangPillsUI(); showToast('மொழி: தமிழ் தேர்ந்தெடுக்கப்பட்டது'); });
  elements.langEnBtn.addEventListener('click', () => { state.spokenLang = 'en'; updateLangPillsUI(); showToast('Language: English selected'); });
  elements.langBiBtn.addEventListener('click', () => { state.spokenLang = 'bilingual'; updateLangPillsUI(); showToast('மொழி: தமிழ் + English'); });

  // Items List Display Language Filters
  elements.showBothBtn.addEventListener('click', () => setDisplayLang('both'));
  elements.showTaBtn.addEventListener('click', () => setDisplayLang('ta'));
  elements.showEnBtn.addEventListener('click', () => setDisplayLang('en'));

  // Items Actions (increment, decrement, delete)
  elements.itemsList.addEventListener('click', handleItemAction);

  // Clear all items
  elements.clearAllBtn.addEventListener('click', () => {
    if (state.items.length === 0) return;
    if (confirm('அனைத்து பொருட்களையும் நீக்க விரும்புகிறீர்களா? (Clear list?)')) {
      state.items = [];
      renderItemsList();
      showToast('பட்டியல் அழிக்கப்பட்டது (Cleared)');
    }
  });

  // Manual item add
  elements.addManualBtn.addEventListener('click', handleAddManualItem);
  elements.manualItemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddManualItem();
  });

  // Send WhatsApp
  elements.sendWhatsappBtn.addEventListener('click', sendOrderViaWhatsApp);

  // Settings Modal
  const openSettings = () => {
    elements.settingStoreName.value = state.storeName;
    elements.settingPhone.value = state.whatsappNumber;
    elements.settingDefaultLang.value = state.spokenLang;
    elements.settingsModal.classList.remove('hidden');
  };
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.changeTargetBtn.addEventListener('click', openSettings);
  elements.closeSettingsModal.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));
  elements.saveSettingsBtn.addEventListener('click', saveSettings);

  // QR Modal
  elements.qrBtn.addEventListener('click', showQrModal);
  elements.closeQrModal.addEventListener('click', () => elements.qrModal.classList.add('hidden'));
  elements.printQrBtn.addEventListener('click', () => window.print());

  // History Modal
  elements.historyBtn.addEventListener('click', () => {
    renderOrderHistory();
    elements.historyModal.classList.remove('hidden');
  });
  elements.closeHistoryModal.addEventListener('click', () => elements.historyModal.classList.add('hidden'));
  elements.closeHistoryBtn2.addEventListener('click', () => elements.historyModal.classList.add('hidden'));
  elements.clearHistoryBtn.addEventListener('click', () => {
    if (confirm('ஆர்டர் வரலாற்றை அழிக்கவா? (Clear history?)')) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      renderOrderHistory();
      showToast('வரலாறு அழிக்கப்பட்டது');
    }
  });

  // Keyboard escape for modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      elements.settingsModal.classList.add('hidden');
      elements.qrModal.classList.add('hidden');
      elements.historyModal.classList.add('hidden');
    }
  });
}

// ==========================================
// 11. BOOTSTRAP APP
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  renderItemsList();
  initEventListeners();
});
