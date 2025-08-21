// Gambar hadiah (bisa diganti dengan gambar lebih keren di folder assets)
const hadiahList = [
  {img: 'https://imgur.com/00ZWCDS.png', label: 'PANDA', hadiah: 'Rp 120.000', nominal: 120000},
  {img: 'https://imgur.com/aLShjER.png', label: 'KERBAU', hadiah: 'Rp 80.000', nominal: 80000},
  {img: 'https://imgur.com/Os0fSxf.png', label: 'PENAMBANG', hadiah: 'Rp 70.000', nominal: 70000},
  {img: 'https://imgur.com/XsDImXS.png', label: 'ZEUS', hadiah: 'Rp 20.000', nominal: 20000},
  {img: 'https://imgur.com/pRHplsF.png', label: 'PENYIHIR', hadiah: 'Rp 60.000', nominal: 60000},
  {img: 'https://imgur.com/BE1yANw.png', label: 'BANDITO', hadiah: 'Rp 1.500.000', nominal: 1500000},
  {img: 'https://imgur.com/qFkxSgZ.png', label: 'BABI', hadiah: 'Rp 40.000', nominal: 40000},
  {img: 'https://imgur.com/Ml9UQmv.png', label: 'PRINCESS', hadiah: 'Rp 30.000', nominal: 30000}
];
const LOGO_URL = 'https://imgur.com/pmrp0zR.png';

const cardGrid = document.getElementById('cardGrid');
const inputId = document.getElementById('inputId');
const inputToken = document.getElementById('inputToken');
const btnSpin = document.getElementById('btnSpin');
const desc = document.getElementById('desc');
const msg = document.getElementById('msg');
const btnClaim = document.getElementById('btnClaim');
let cards = [];
let sudahSpin = false;
let hasilArr = [];
let currentUid, currentTok;
let selectedIdx = null;
let adminToken = null; // Token admin dari kolom C baris ke-2
let isAdminToken = false; // Flag jika token admin digunakan

// Fungsi helper untuk mengatur status agar tidak tertimpa
function setStatus(text) {
  const desc = document.getElementById('desc');
  if (desc) {
    desc.textContent = text;
    console.log('Status diset ke:', text);
  }
}

function renderCardLogo() {
  cardGrid.innerHTML = '';
  cards = [];
  cardGrid.className = 'card-grid';
  for(let i=0;i<8;i++){
    let outer = document.createElement('div');
    outer.className = 'card-outer';
    let c = document.createElement('div');
    c.className = 'card';
    c.innerHTML = `
      <div class="face"><img src="${LOGO_URL}"></div>
      <div class="back"></div>
    `;
    outer.appendChild(c);
    cardGrid.appendChild(outer);
    cards.push(c);
  }
}
renderCardLogo();

// Ganti endpoint ke Google Apps Script Web App langsung
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdivb2oMhr8JgXUc5ylKajDboZuvpRdGiVwmk7UHXO4mrwvNjx7QsxEYWG5l_ypw5s/exec';

// Ambil token admin dari endpoint Apps Script
async function fetchAdminToken() {
  try {
    // Asumsikan endpoint Apps Script mendukung ?getAdminToken=1 untuk ambil token admin
    const res = await fetch(`${APPS_SCRIPT_URL}?getAdminToken=1`);
    const data = await res.json();
    if (data && data.adminToken) {
      adminToken = data.adminToken;
      console.log('Admin token loaded:', adminToken);
    }
  } catch (e) {
    console.error('Gagal ambil admin token:', e);
  }
}
fetchAdminToken();

// Validasi token ke endpoint Google Apps Script langsung
async function cekInput() {
  if (sudahSpin) {
    console.log('Sudah spin, tidak perlu cek input lagi');
    return; // Jangan cek token lagi setelah spin
  }
  const idVal = inputId.value.trim();
  const tokVal = inputToken.value.trim();
  btnSpin.disabled = true;
  btnSpin.classList.remove('active');
  setStatus('Isi ID dan Token, lalu tekan SPIN!');
  msg.textContent = '';

  isAdminToken = false; // Reset flag setiap input
  if (adminToken && tokVal === adminToken) {
    isAdminToken = true;
    btnSpin.disabled = false;
    btnSpin.classList.add('active');
    setStatus('Token admin terdeteksi! Tekan SPIN untuk dapat hadiah spesial!');
    msg.textContent = 'Token admin terdeteksi!';
    return;
  }
  
  if (idVal && tokVal) {
    setStatus('Cek token ke server...');
    console.log('Memulai validasi token...');
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?token=${encodeURIComponent(tokVal)}`);
      const valid = await res.json();
      if (valid === true) {
        btnSpin.disabled = false;
        btnSpin.classList.add('active');
        setStatus('Tekan SPIN untuk mengacak kartu!');
        console.log('Token valid, tombol SPIN aktif');
      } else {
        setStatus('Token tidak valid atau sudah digunakan!');
        msg.textContent = 'Token tidak valid atau sudah digunakan!';
        console.log('Token tidak valid');
      }
    } catch(e) {
      setStatus('Gagal koneksi ke server.');
      msg.textContent = 'Gagal koneksi ke server.';
      console.error('Error koneksi:', e);
    }
  }
}
inputId.oninput = cekInput;
inputToken.oninput = cekInput;

btnSpin.onclick = () => {
  if (sudahSpin) return;
  sudahSpin = true;
  currentUid = inputId.value.trim();
  currentTok = inputToken.value.trim();
  btnSpin.disabled = true;
  btnSpin.classList.remove('active');
  btnSpin.classList.add('spinning');
  inputId.disabled = true;
  inputToken.disabled = true;
  inputId.oninput = null;
  inputToken.oninput = null;
  msg.textContent = '';
  // Play spin sound
  if (window.playSpinSound) window.playSpinSound();
  setTimeout(() => {
    btnSpin.classList.remove('spinning');
    enhancedShuffleAnimation();
  }, 1000);
};

function shuffleAnim() {
  // Use enhanced version instead
  enhancedShuffleAnimation();
}
function enablePilihKartu(arr) {
  // Use enhanced version instead
  enhancedEnablePilihKartu(arr);
}

// Kirim data ke endpoint Google Apps Script langsung
async function simpanLogSpin(userId, token, pilihan, hasil, gambarDipilih) {
  try {
    const params = new URLSearchParams({
      log: '1',
      userId,
      token,
      pilihan,
      hasil,
      gambarDipilih
    });
    await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
  } catch(e) {
    alert('Gagal simpan log: '+e.message);
  }
}

btnClaim.onclick = ()=>{
  btnClaim.disabled = true;
  btnClaim.classList.add('claim-success');
  btnClaim.textContent = 'Skor Tersimpan! ✅';
  setStatus('Terima kasih sudah bermain! Game ini hanya untuk hiburan.');
};

// Fungsi untuk menampilkan popup hadiah
function showHadiahPopup(hadiah, nominal) {
  const popup = document.getElementById('hadiahPopup');
  const amountEl = document.getElementById('popupAmount');
  const subtitleEl = document.getElementById('popupSubtitle');
  
  // Format rupiah dengan titik pemisah
  const formattedAmount = `Rp ${nominal.toLocaleString('id-ID')}`;
  
  amountEl.textContent = formattedAmount;
  subtitleEl.textContent = `Hadiah simulasi dari ${hadiah.split(' ')[1] || 'kartu'} yang Anda pilih!`;
  
  // Show popup
  popup.classList.add('show');
  
  // Create fireworks effect
  createFireworks();
  
  // Play celebration sound
  if (window.playWinSound) window.playWinSound();
}

function closeHadiahPopup() {
  const popup = document.getElementById('hadiahPopup');
  popup.classList.remove('show');
}

function createFireworks() {
  const container = document.getElementById('fireworksContainer');
  container.innerHTML = ''; // Clear previous fireworks
  
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const firework = document.createElement('div');
      firework.className = 'firework';
      firework.style.left = Math.random() * 100 + '%';
      firework.style.top = Math.random() * 100 + '%';
      firework.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
      
      container.appendChild(firework);
      
      // Remove firework after animation
      setTimeout(() => {
        if (firework.parentNode) {
          firework.parentNode.removeChild(firework);
        }
      }, 1000);
    }, i * 100);
  }
}

// Professional animation enhancements
function addProfessionalEffects() {
  // Add staggered entry animations to cards
  cards.forEach((card, index) => {
    card.parentElement.style.animationDelay = `${index * 0.1}s`;
    card.parentElement.classList.add('card-entry');
  });
  
  // Add hover sound effect simulation
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
}

// Enhanced card flip animation
function enhancedFlipCard(card, hasil) {
  card.classList.add('flipping');
  
  setTimeout(() => {
    card.classList.remove('flipping');
    card.classList.add('flipped');
    
    // Add winning glow effect if it's a winning card
    if (hasil.hadiah !== 'ZONK') {
      card.classList.add('winning');
      
      // Add particle effect
      setTimeout(() => {
        card.classList.remove('winning');
      }, 3000);
    }
  }, 400);
}

// Enhanced spin button animation
function enhanceSpinButton() {
  const spinBtn = document.querySelector('.spin-btn');
  if (spinBtn) {
    spinBtn.addEventListener('click', () => {
      if (!spinBtn.disabled) {
        spinBtn.classList.add('spinning');
        
        setTimeout(() => {
          spinBtn.classList.remove('spinning');
        }, 1000);
      }
    });
  }
}

// Enhanced professional effects
function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('show');
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

function addCardHoverSounds() {
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Visual feedback for hover
      card.style.transform = 'scale(1.05) translateY(-8px)';
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
}

function enhancedShuffleAnimation() {
  showLoadingOverlay();
  
  // Enhanced shuffle with better timing
  let duration = 4.5;
  let totalFrames = Math.round(duration * 1000 / 60);
  let currentFrame = 0;
  
  setStatus('Mengacak kartu...');
  
  const shuffleInterval = setInterval(() => {
    if (currentFrame < totalFrames * 0.6) {
      // Shuffle phase with more dynamic movement
      cards.forEach((card, i) => {
        card.classList.add('card-shuffle');
        
        const randomX = (Math.random() - 0.5) * 120;
        const randomY = (Math.random() - 0.5) * 60;
        const randomRotate = (Math.random() - 0.5) * 720;
        const randomScale = 0.7 + Math.random() * 0.6;
        
        card.style.transform = `
          translate(${randomX}px, ${randomY}px) 
          rotate(${randomRotate}deg) 
          scale(${randomScale})
        `;
        card.style.zIndex = Math.floor(Math.random() * 10);
        
        // Add random glow effects
        if (Math.random() > 0.8) {
          card.style.boxShadow = `
            0 0 30px rgba(255, 0, 51, 0.8),
            0 0 60px rgba(56, 182, 255, 0.6)
          `;
        }
      });
    } else {
      clearInterval(shuffleInterval);
      startEnhancedFlipAnimation();
    }
    currentFrame++;
  }, 60);
}

function startEnhancedFlipAnimation() {
  let flipFrame = 0;
  const flipDuration = 60;
  
  const flipInterval = setInterval(() => {
    const arr = hadiahList.slice().sort(() => Math.random() - 0.5);
    
    cards.forEach((card, i) => {
      card.classList.remove('card-shuffle');
      card.classList.add('card-flip-anim');
      
      const flipAngle = (flipFrame * 15) % 360;
      card.style.transform = `rotateY(${flipAngle}deg)`;
      
      // Enhanced image switching with blur effect
      if (flipAngle % 180 < 90) {
        card.querySelector('.face').innerHTML = `
          <img src="${arr[i % arr.length].img}" 
               style="filter: brightness(0.8) blur(1px) hue-rotate(${Math.random() * 360}deg);">
        `;
      } else {
        card.querySelector('.face').innerHTML = `
          <img src="${LOGO_URL}" 
               style="filter: brightness(1.2) contrast(1.3) drop-shadow(0 0 10px #ff0033);">
        `;
      }
      
      // Dynamic glow effects
      const colors = ['#ff0033', '#38b6ff', '#ffdc00', '#ff7b00'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      card.style.boxShadow = `
        0 0 25px ${randomColor}66,
        0 0 50px ${randomColor}33
      `;
    });
    
    flipFrame++;
    
    if (flipFrame >= flipDuration) {
      clearInterval(flipInterval);
      finishEnhancedAnimation();
    }
  }, 60);
}

function finishEnhancedAnimation() {
  hideLoadingOverlay();
  // Stop any ongoing sounds - no longer needed with Web Audio API
  
  // Reset all cards with staggered reveal
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.remove('card-flip-anim', 'card-shuffle');
      card.style.transform = '';
      card.style.zIndex = '';
      card.style.boxShadow = '';
      card.querySelector('.face').innerHTML = `<img src="${LOGO_URL}">`;
      card.querySelector('.back').innerHTML = '';
      
      // Add reveal animation
      card.classList.add('card-reveal');
      card.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        card.style.transform = '';
        card.classList.remove('card-reveal');
      }, 300);
    }, i * 150);
  });
  
  // Generate results dan enable selection
  setTimeout(() => {
    // Filter BANDITO dari hasil acak
    const hadiahTanpaBandito = hadiahList.filter(h => h.label !== 'BANDITO');
    hasilArr = hadiahTanpaBandito.slice().sort(() => Math.random() - 0.5).slice(0, 8);
    console.log('Hasil shuffle:', hasilArr);
    enhancedEnablePilihKartu(hasilArr);
  }, 1200);
}

function enhancedEnablePilihKartu(arr) {
  setTimeout(() => {
    setStatus('Pilih salah satu kartu untuk melihat hadiah!');
    // Add hover highlights
    cards.forEach(card => {
      card.classList.add('card-highlight');
    });
    setTimeout(() => {
      cards.forEach(card => {
        card.classList.remove('card-highlight');
      });
    }, 3000);
  }, 300);

  cards.forEach((card, idx) => {
    card.onclick = () => {
      if (selectedIdx !== null) return;
      selectedIdx = idx;
      card.classList.add('card-selected');
      let h;
      if (isAdminToken) {
        // Paksa hadiah BANDITO jika token admin
        h = hadiahList.find(x => x.label === 'BANDITO');
      } else {
        h = arr[idx];
      }
      card.classList.add('flipping');
      setTimeout(() => {
        card.querySelector('.back').innerHTML = `
          <img src="${h.img}" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
          <div class="hadiah-title">${h.hadiah}</div>
        `;
        card.querySelector('.face').innerHTML = `<img src="${h.img}">`;
        card.classList.add('flipped', 'selected');
        card.classList.remove('flipping');
        if (!h.hadiah.includes('ZONK')) {
          card.classList.add('winning');
          card.parentElement.classList.add('win-celebration');
        }
        // Play hadiah sound
        if (window.playWinSound) window.playWinSound();
      }, 400);
      cards.forEach(c => c.onclick = null);
      
      // Show popup instead of inline message
      setTimeout(() => {
        showHadiahPopup(h.label, h.nominal);
      }, 800);
      
      const msgElement = document.getElementById('msg');
      msgElement.classList.add('msg-fade-in');
      msgElement.innerHTML = `🎉 <span style="color:#ffdc00;">Klik di atas untuk melihat hadiah!</span>`;
      setStatus('Popup hadiah telah muncul! Lihat hadiah simulasi Anda.');
      
      // Hide claim button since we use popup now
      const claimBtn = document.getElementById('btnClaim');
      claimBtn.style.display = 'none';
      simpanLogSpin(currentUid, currentTok, `Kartu ${String.fromCharCode(65 + idx)}`, h.hadiah, h.label);
    };
  });
}

// Enhanced claim button functionality
const originalClaimClick = btnClaim.onclick;
btnClaim.onclick = () => {
  btnClaim.disabled = true;
  btnClaim.classList.add('claim-success');
  btnClaim.textContent = 'Berhasil Diklaim! ✅';
  setStatus('Terima kasih! Hadiah akan segera diproses.');
  
  // Add particles effect around claim button
  setTimeout(() => {
    btnClaim.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
    btnClaim.style.color = '#fff';
  }, 500);
};

// Initialize enhanced effects
document.addEventListener('DOMContentLoaded', () => {
  addCardHoverSounds();
  
  // Replace original shuffle with enhanced version
  const originalBtnSpinClick = btnSpin.onclick;
  btnSpin.onclick = () => {
    if (sudahSpin) return;
    sudahSpin = true;
    currentUid = inputId.value.trim();
    currentTok = inputToken.value.trim();
    btnSpin.disabled = true;
    btnSpin.classList.remove('active');
    btnSpin.classList.add('spinning');
    inputId.disabled = true;
    inputToken.disabled = true;
    inputId.oninput = null;
    inputToken.oninput = null;
    msg.textContent = '';
    
    setTimeout(() => {
      btnSpin.classList.remove('spinning');
      enhancedShuffleAnimation();
    }, 1000);
  };
});