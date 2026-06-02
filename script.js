let audioPlayer = null;

function copyToClipboard() {
  const num = document.querySelector('[data-bind="bankNumber"]').textContent;
  navigator.clipboard.writeText(num).catch(() => {});
}

function hideLoading() {
  const screen = document.getElementById('loading-screen');
  if (screen) screen.classList.add('hide');
}

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('btn-buka-undangan').addEventListener('click', () => {
    window.scrollTo(0, 0);
    document.getElementById('overlay').classList.add('slide-up');
    document.getElementById('wrapper').classList.add('show');
    if (audioPlayer) {
      audioPlayer.play().catch(() => {});
      document.getElementById('music-btn').classList.add('playing');
      const icon = document.querySelector('#music-btn i');
      icon.className = 'fa-solid fa-pause';
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.1 });

  document.querySelectorAll('.fade-up, .slide-left, .slide-right').forEach(el => {
    observer.observe(el);
  });

  fetch('data.json')
    .then(res => res.json())
    .then(data => {

      document.querySelectorAll('[data-bind]').forEach(el => {
        const key = el.getAttribute('data-bind');
        const val = data[key];
        if (val !== undefined && val !== null) {
          el.textContent = val;
        }
      });

      const guestEl = document.querySelector('[data-bind="guestName"]');
      if (guestEl) {
        const params = new URLSearchParams(window.location.search);
        const names = [];
        for (const [key, val] of params) {
          names.push(val || key);
        }
        if (names.length) guestEl.textContent = names.join(' & ');
      }

      const mapEmbed = document.getElementById('map-embed');
      if (mapEmbed && data.mapEmbedUrl) {
        mapEmbed.src = data.mapEmbedUrl;
      }

      const container = document.getElementById('events-container');
      if (container) {
        data.events.forEach((ev, i) => {
          const card = document.createElement('div');
          card.className = 'fade-up';
          card.style.transitionDelay = `${i * 0.1}s`;
          const iconHtml = ev.icon === 'fa-ring'
            ? '<div class="double-ring"><i class="fa-solid fa-ring"></i><i class="fa-solid fa-ring"></i></div>'
            : `<i class="fa-solid ${ev.icon} event-icon"></i>`;
          card.innerHTML = `
            <div class="event-card">
              ${iconHtml}
              <h3 class="event-type">${ev.type}</h3>
              <p class="event-detail"><i class="fa-regular fa-calendar"></i>${ev.date}</p>
              <p class="event-detail"><i class="fa-regular fa-clock"></i>${ev.time}</p>
              <p class="event-address"><i class="fa-solid fa-location-dot"></i>${ev.address}</p>
              ${ev.mapLink ? '<button class="btn-event">Lihat Lokasi</button>' : ''}
            </div>
          `;
          container.appendChild(card);
          observer.observe(card);
        });
      }

      const gallery = document.getElementById('gallery-container');
      if (gallery && data.galleryImages) {
        const sizes = ['big', 'normal', 'vertical', 'normal', 'horizontal'];
        data.galleryImages.forEach((src, i) => {
          const wrapper = document.createElement('div');
          const cls = sizes[i % sizes.length];
          wrapper.className = `gallery-item ${cls !== 'normal' ? cls : ''} fade-up`;
          wrapper.style.transitionDelay = `${i * 0.08}s`;
          const img = document.createElement('img');
          img.src = src;
          img.alt = 'Gallery ' + (i + 1);
          wrapper.appendChild(img);
          gallery.appendChild(wrapper);
          observer.observe(wrapper);
        });
      }

      if (data.musicUrl) {
        audioPlayer = new Audio(data.musicUrl);
        audioPlayer.loop = true;
      }

    })
    .catch(err => console.warn('Gagal load data.json:', err))
    .finally(() => hideLoading());

  const target = new Date('2026-07-04T09:00:00').getTime();
  setInterval(() => {
    const diff = target - Date.now();
    if (diff <= 0) return;
    document.getElementById('days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    document.getElementById('hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    document.getElementById('minutes').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    document.getElementById('seconds').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  }, 1000);

  const btnGift = document.getElementById('btn-gift');
  if (btnGift) {
    btnGift.addEventListener('click', () => {
      const details = document.getElementById('gift-details');
      details.classList.toggle('hidden');
      btnGift.textContent = details.classList.contains('hidden') ? 'Kirim Kado' : 'Tutup';
    });
  }

  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = document.getElementById('namaTamu').value;
      const hadir = document.getElementById('kehadiranTamu').value;
      const pesan = document.getElementById('pesanTamu').value;
      const area = document.getElementById('wishesArea');
      const item = document.createElement('div');
      item.className = 'wish-item';
      item.innerHTML = `<h4>${nama} (${hadir})</h4><p>${pesan}</p>`;
      area.insertBefore(item, area.firstChild);
      rsvpForm.reset();
    });
  }

});

function toggleMusic() {
  const btn = document.getElementById('music-btn');
  const icon = btn.querySelector('i');
  if (!audioPlayer) return;
  if (audioPlayer.paused) {
    audioPlayer.play();
    btn.classList.add('playing');
    icon.className = 'fa-solid fa-pause';
  } else {
    audioPlayer.pause();
    btn.classList.remove('playing');
    icon.className = 'fa-solid fa-music';
  }
}
