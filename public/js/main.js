document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
  });

  fetchProfile();
  fetchProjects();
  setupObserver();
  setupContactForm();
});

async function fetchProfile() {
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    document.getElementById('heroName').textContent = data.nama;
    document.getElementById('heroRole').textContent = `${data.jabatan} - ${data.kampus}`;
    document.getElementById('heroSummary').textContent = data.ringkasan;
    if (data.foto) document.getElementById('heroAvatar').src = data.foto;
    document.getElementById('aboutText').textContent = data.tentang;

    document.getElementById('skillsGrid').innerHTML = data.keahlian
      .map(s => `<div class="skill-badge">${s}</div>`).join('');

    document.getElementById('timelineList').innerHTML = data.riwayat
      .map(r => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <span class="timeline-period">${r.periode}</span>
          <h4 class="timeline-title">${r.judul}</h4>
          <p class="timeline-desc">${r.deskripsi}</p>
        </div>
      `).join('');

    if (data.kontak) {
      document.getElementById('emailText').textContent = data.kontak.email;
      document.getElementById('emailLink').href = `mailto:${data.kontak.email}`;
      document.getElementById('githubLink').href = data.kontak.github;
      if (data.kontak.linkedin) document.getElementById('linkedinLink').href = data.kontak.linkedin;
    }
  } catch (e) {
    console.error('Error memuat profil:', e);
  }
}

async function fetchProjects() {
  try {
    const res = await fetch('/api/projects');
    const list = await res.json();
    document.getElementById('projectsGrid').innerHTML = list.map(p => `
      <div class="project-card">
        <img src="${p.gambar}" alt="${p.judul}" class="project-img">
        <div class="project-body">
          <h3 class="project-title">${p.judul}</h3>
          <p class="project-desc">${p.deskripsi}</p>
          <div class="project-tags">
            ${p.teknologi.map(t => `<span class="project-tag">${t}</span>`).join('')}
          </div>
          <a href="${p.tautan}" target="_blank" rel="noopener" class="btn btn-primary" style="text-align: center;">Buka Repositori ↗</a>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error memuat proyek:', e);
  }
}

function setupObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  const alertBox = document.getElementById('formAlert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = document.getElementById('nama').value.trim();
    const email = document.getElementById('email').value.trim();
    const pesan = document.getElementById('pesan').value.trim();

    document.getElementById('namaError').textContent = !nama ? 'Wajib diisi' : '';
    document.getElementById('emailError').textContent = !email.includes('@') ? 'Email tidak valid' : '';
    document.getElementById('pesanError').textContent = pesan.length < 10 ? 'Minimal 10 karakter' : '';

    if (!nama || !email.includes('@') || pesan.length < 10) return;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, pesan })
      });
      const out = await res.json();
      alertBox.className = res.ok ? 'alert-box alert-success' : 'alert-box alert-error';
      alertBox.textContent = out.pesan;
      alertBox.style.display = 'block';
      if (res.ok) form.reset();
    } catch (err) {
      alertBox.className = 'alert-box alert-error';
      alertBox.textContent = 'Gagal menghubungi server.';
      alertBox.style.display = 'block';
    }
  });
}