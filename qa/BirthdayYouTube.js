(() => {
  let pendingApi;

  function getPlayerApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (pendingApi) return pendingApi;
    pendingApi = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const previousReady = window.onYouTubeIframeAPIReady;
      function restoreCallback() {
        clearTimeout(deadline);
        window.onYouTubeIframeAPIReady = previousReady;
      }
      function fail() {
        restoreCallback();
        script.remove();
        reject(new Error('Could not load the YouTube IFrame API'));
      }
      const deadline = setTimeout(fail, 12000);
      window.onYouTubeIframeAPIReady = () => {
        restoreCallback();
        resolve(window.YT);
        if (typeof previousReady === 'function') previousReady();
      };
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = fail;
      document.head.append(script);
    }).catch(error => {
      pendingApi = undefined;
      throw error;
    });
    return pendingApi;
  }

  let preloadedDrive;

  function cancelDrivePreload() {
    if (preloadedDrive) preloadedDrive.controller.close();
    preloadedDrive = undefined;
  }

  function createPlayer(canvas, videoId, drive, preload = false) {
    if (!canvas?.parentElement || !/^https?:$/.test(location.protocol)) return null;
    const idPattern = drive ? /^[A-Za-z0-9_-]{10,}$/ : /^[A-Za-z0-9_-]{11}$/;
    if (!idPattern.test(videoId)) return null;

    const frame = canvas.parentElement;
    const layer = document.createElement('div');
    layer.className = 'birthday-youtube';
    layer.hidden = !preload;
    if (preload) {
      layer.classList.add('preloading');
      layer.inert = true;
      layer.setAttribute('aria-hidden', 'true');
    }

    const card = document.createElement('div');
    card.className = 'birthday-youtube-card';
    layer.append(card);
    const playerBox = document.createElement('div');
    playerBox.className = 'birthday-youtube-player';
    const iframe = document.createElement('iframe');
    iframe.title = drive ? 'Google Drive 影片播放器' : 'YouTube 影片播放器';
    iframe.loading = 'eager';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    playerBox.append(iframe);
    card.append(playerBox);

    const continueButton = document.createElement('button');
    continueButton.className = 'birthday-youtube-continue';
    continueButton.type = 'button';
    continueButton.textContent = '繼續';
    continueButton.addEventListener('click', () => { controller.status = 2; });
    card.append(continueButton);
    let size, player, closed = false;
    const observer = new ResizeObserver(updateLayout);
    observer.observe(frame);
    function updateLayout() {
      if (!size) return;
      const box = frame.getBoundingClientRect();
      const compact = box.width * size.width < 200 || box.height * size.height < 200;
      layer.classList.toggle('compact', compact);
      continueButton.hidden = !compact;
    }

    const controller = {
      status: 0,
      resize(left, top, width, height) {
        size = { width, height };
        layer.style.setProperty('--video-left', (left * 100) + '%');
        layer.style.setProperty('--video-top', (top * 100) + '%');
        layer.style.setProperty('--video-width', (width * 100) + '%');
        layer.style.setProperty('--video-height', (height * 100) + '%');
        updateLayout();
        layer.classList.remove('preloading');
        layer.inert = false;
        layer.removeAttribute('aria-hidden');
        layer.hidden = false;
      },
      close() {
        closed = true;
        observer.disconnect();
        const restoreFocus = layer.contains(document.activeElement);
        if (player?.destroy) player.destroy();
        layer.remove();
        if (restoreFocus) canvas.focus({ preventScroll: true });
      },
    };

    if (drive) {
      iframe.addEventListener('load', () => {
        if (controller.status === 0) controller.status = 1;
      });
      iframe.src = 'https://drive.google.com/file/d/' + videoId + '/preview';
      frame.append(layer);
      return controller;
    }

    const params = new URLSearchParams({ enablejsapi: '1', playsinline: '1', origin: location.origin });
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + params;
    frame.append(layer);
    getPlayerApi().then(api => {
      if (closed) return;
      player = new api.Player(iframe, {
        events: {
          onReady: () => { if (controller.status === 0) controller.status = 1; },
          onError: event => {
            if (controller.status !== 2)
              controller.status = event.data === 101 || event.data === 150 ? -2 : -1;
          },
        },
      });
    }).catch(() => { if (!closed && controller.status !== 2) controller.status = -1; });

    return controller;
  }

  window.BirthdayYouTube = {
    preloadDrive(canvas, videoId) {
      if (preloadedDrive?.canvas === canvas && preloadedDrive.videoId === videoId) return;
      cancelDrivePreload();
      const controller = createPlayer(canvas, videoId, true, true);
      if (controller) preloadedDrive = { canvas, videoId, controller };
    },
    cancelDrivePreload,
    open(canvas, videoId, drive) {
      if (drive && preloadedDrive?.canvas === canvas && preloadedDrive.videoId === videoId) {
        const { controller } = preloadedDrive;
        preloadedDrive = undefined;
        return controller;
      }
      cancelDrivePreload();
      return createPlayer(canvas, videoId, drive);
    },
  };
})();
