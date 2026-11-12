/* JavaScript følger HTML-rækkefølgen.
   1. Navigation: mobilmenu.
   2. Forside: showreel i stor størrelse.
   3. Projektside: semesterfiltre.
   4. CV: vis en side i stor størrelse.
   Resten af indholdet er almindelig HTML og CSS. */

// 1. HEADER / NAVIGATION
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
    // Først aktiveres mobilmenuen. Uden JS er navigationen stadig synlig.
    document.documentElement.classList.add('js');
    menuButton.hidden = false;

    function closeMenu() {
        menuButton.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
        menuButton.querySelector('.sr-only').textContent = 'Open menu';
    }

    menuButton.addEventListener('click', () => {
        const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isOpen));
        navLinks.classList.toggle('is-open', !isOpen);
        menuButton.querySelector('.sr-only').textContent = isOpen ? 'Open menu' : 'Close menu';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            closeMenu();
            menuButton.focus();
        }
    });

    // Nulstil menuen, hvis vinduet gøres større end mobilbredden.
    window.matchMedia('(min-width: 701px)').addEventListener('change', (event) => {
        if (event.matches) closeMenu();
    });
}


// 2. FORSIDE / SHOWREEL — flyt afspilleren, så tid og lydindstilling følger med.
const showreelDialog = document.querySelector('.showreel-dialog');
const showreelEnlarge = document.querySelector('.showreel-enlarge');
const showreelPlayer = document.querySelector('.showreel-player');

if (showreelDialog && showreelEnlarge && showreelPlayer && typeof showreelDialog.showModal === 'function') {
    const video = showreelPlayer.querySelector('video');
    const largePlayer = showreelDialog.querySelector('.showreel-dialog-player');
    const soundButtons = document.querySelectorAll('.showreel-sound');
    showreelEnlarge.hidden = false;

    function updateSoundButtons() {
        soundButtons.forEach((button) => {
            button.textContent = video.muted ? 'Unmute' : 'Mute';
        });
    }

    soundButtons.forEach((button) => {
        button.hidden = false;
        button.addEventListener('click', () => { video.muted = !video.muted; });
    });
    video.addEventListener('volumechange', updateSoundButtons);
    updateSoundButtons();

    showreelEnlarge.addEventListener('click', () => {
        showreelDialog.showModal();
        largePlayer.append(video);
    });

    showreelDialog.addEventListener('close', () => {
        video.pause();
        showreelPlayer.append(video);
    });
}

// 3. PROJEKTSIDE / SEMESTERFILTRE — samme rækkefølge som projects.html
const filterGroup = document.querySelector('.semester-filters[role="group"]');
const workCards = document.querySelectorAll('.work-card');
const filterStatus = document.querySelector('#filter-status');
const emptyProjects = document.querySelector('.empty-projects');

if (filterGroup && workCards.length && filterStatus && emptyProjects) {
    const filterButtons = filterGroup.querySelectorAll('[data-filter]');
    filterGroup.hidden = false;

    function filterProjects(semester, updateUrl = true) {
        let visibleCount = 0;

        workCards.forEach((card) => {
            const matches = semester === 'all' || card.dataset.semester === semester;
            card.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        filterButtons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.filter === semester));
        });

        emptyProjects.hidden = visibleCount !== 0;
        filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'} shown.`;

        // Filteret kan deles som et link, og tilbage-knappen husker valget.
        if (updateUrl) {
            const url = new URL(window.location.href);
            if (semester === 'all') url.searchParams.delete('semester');
            else url.searchParams.set('semester', semester);
            window.history.pushState(null, '', url);
        }
    }

    function readSemesterFromUrl() {
        const semester = new URLSearchParams(window.location.search).get('semester');
        return ['1', '2', '3', '4'].includes(semester) ? semester : 'all';
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => filterProjects(button.dataset.filter));
    });

    window.addEventListener('popstate', () => filterProjects(readSemesterFromUrl(), false));
    filterProjects(readSemesterFromUrl(), false);
}

// 4. CV — forstør forhåndsvisningen. Uden JS åbnes billedlinket direkte.
const cvDialog = document.querySelector('.cv-dialog');

if (cvDialog && typeof cvDialog.showModal === 'function') {
    const cvImage = cvDialog.querySelector('img');
    const cvTitle = cvDialog.querySelector('h2');

    document.querySelectorAll('.cv-preview').forEach((preview) => {
        preview.setAttribute('aria-haspopup', 'dialog');
        preview.addEventListener('click', (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            cvTitle.textContent = `CV — ${preview.querySelector('span').textContent}`;
            cvImage.src = preview.href;
            cvImage.alt = cvTitle.textContent;
            cvDialog.showModal();
            cvDialog.scrollTop = 0;
        });
    });
}
