;(function () {
    var PER_PAGE_DEFAULT = 24
    var LOCATION_DELAY_MS = 250
    var OVERLAY_MAX_DIM = 3000
    var resizeTimer
    var overlayEl = null
    var overlayFrame = null
    var overlayImg = null
    var overlayBar = null
    var overlayBarText = null
    var overlayBarSkeleton = null
    var hoverCapable = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    // The list endpoint omits location, so it's fetched per photo via GET /photos/:id on hover.
    var locationCache = {}
    var locationTimer = null
    var currentPhotoId = null
    var currentAspect = 1
    // Tracks which photos' viewport-sized hi-res URL has already decoded, so re-hovers skip the swap.
    var hiResLoaded = {}

    function text(str) {
        if (str == null) return ''
        return String(str)
    }

    function getOverlay() {
        if (overlayEl) return overlayEl
        overlayEl = document.createElement('div')
        overlayEl.className = 'photo-overlay'
        overlayEl.setAttribute('aria-hidden', 'true')
        // The frame shrink-wraps to the rendered photo, so the chip inside it can be anchored
        // to the photo's real corner in pure CSS.
        overlayFrame = document.createElement('div')
        overlayFrame.className = 'photo-overlay__frame'
        overlayImg = document.createElement('img')
        overlayImg.className = 'photo-overlay__img'
        overlayImg.alt = ''
        overlayImg.decoding = 'async'
        overlayFrame.appendChild(overlayImg)
        overlayBar = document.createElement('div')
        overlayBar.className = 'photo-overlay__bar'
        overlayBarSkeleton = document.createElement('span')
        overlayBarSkeleton.className = 'photo-overlay__bar-skeleton'
        overlayBar.appendChild(overlayBarSkeleton)
        overlayBarText = document.createElement('span')
        overlayBarText.className = 'photo-overlay__bar-text'
        overlayBar.appendChild(overlayBarText)
        overlayFrame.appendChild(overlayBar)
        overlayEl.appendChild(overlayFrame)
        document.body.appendChild(overlayEl)
        return overlayEl
    }

    function showOverlay(photo, accessKey) {
        var urls = photo.urls || {}
        var lowSrc = urls.regular || urls.small || ''
        if (!lowSrc) return
        var photoId = photo.id
        var hi = overlaySrc(photo)
        var el = getOverlay()
        // Size the frame to the photo's contain box so the takeover size depends only on aspect
        // ratio, not the loaded resolution (cached preview and hi-res swap render identically).
        currentAspect = photo.width && photo.height ? photo.width / photo.height : 1
        sizeFrame()
        // Show the (already grid-cached) regular image instantly, then swap to the crisp one once
        // it decodes — unless we've loaded that hi-res before, in which case use it straight away.
        overlayImg.src = hi && hiResLoaded[photoId] === hi ? hi : lowSrc
        currentPhotoId = photoId
        loadLocation(photoId, accessKey)
        el.classList.add('is-visible')
        if (hi && overlayImg.src !== hi) upgradeToHiRes(photoId, hi)
    }

    /** Size the frame to the largest box of the current photo's aspect ratio that fits the viewport
     *  minus a margin. Computed in JS for cross-browser reliability (Safari mishandles the equivalent
     *  nested calc()/var() in CSS). Pure layout reads + two writes; only runs on show and resize. */
    function sizeFrame() {
        if (!overlayFrame) return
        var margin = 2 * remPx()
        var bw = (window.innerWidth || document.documentElement.clientWidth) - 2 * margin
        var bh = (window.innerHeight || document.documentElement.clientHeight) - 2 * margin
        overlayFrame.style.width = Math.max(0, Math.min(bw, bh * currentAspect)) + 'px'
        overlayFrame.style.height = Math.max(0, Math.min(bw / currentAspect, bh)) + 'px'
    }

    var remCache = null
    function remPx() {
        if (remCache == null) remCache = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        return remCache
    }

    /** A viewport-sized, DPR-aware image URL via Unsplash's raw (Imgix) endpoint, for the takeover. */
    function overlaySrc(photo) {
        var urls = photo.urls || {}
        if (!urls.raw) return urls.full || urls.regular || urls.small || ''
        var dpr = Math.min(window.devicePixelRatio || 1, 2)
        var vw = window.innerWidth || document.documentElement.clientWidth
        var vh = window.innerHeight || document.documentElement.clientHeight
        var w = Math.min(Math.round(vw * dpr), OVERLAY_MAX_DIM)
        var h = Math.min(Math.round(vh * dpr), OVERLAY_MAX_DIM)
        var sep = urls.raw.indexOf('?') >= 0 ? '&' : '?'
        // fit=max scales to fit within w×h preserving aspect, never upscaling beyond the original.
        return urls.raw + sep + 'w=' + w + '&h=' + h + '&fit=max&auto=format&q=85'
    }

    function upgradeToHiRes(photoId, hi) {
        // Build the hi-res as a detached element and fully DECODE it before it touches the DOM.
        // Swapping `src` on the visible <img> would re-decode in place, blanking it for a frame
        // (the flash); replacing it with an already-decoded node paints with no gap.
        var next = new Image()
        next.className = 'photo-overlay__img'
        next.alt = ''
        next.decoding = 'async'
        next.src = hi
        var apply = function () {
            hiResLoaded[photoId] = hi
            // Only swap if the user is still hovering this same photo.
            if (currentPhotoId === photoId && isOverlayVisible() && overlayImg) {
                overlayImg.replaceWith(next)
                overlayImg = next
            }
        }
        if (next.decode) next.decode().then(apply, function () {})
        else next.onload = apply
    }

    function hideOverlay() {
        clearTimeout(locationTimer)
        currentPhotoId = null
        if (overlayEl) overlayEl.classList.remove('is-visible')
    }

    function isOverlayVisible() {
        return overlayEl && overlayEl.classList.contains('is-visible')
    }

    /** Show the cached location if known, otherwise the skeleton bar + fetch after a hover delay. */
    function loadLocation(photoId, accessKey) {
        clearTimeout(locationTimer)
        if (Object.prototype.hasOwnProperty.call(locationCache, photoId)) {
            setLocation(locationCache[photoId])
            return
        }
        setLocation(null)
        locationTimer = setTimeout(function () {
            fetchLocation(photoId, accessKey)
        }, LOCATION_DELAY_MS)
    }

    /** Pass a location string to show it (empty string hides the bar), or null for the loading skeleton. */
    function setLocation(str) {
        var loading = str == null
        overlayBar.classList.toggle('is-skeleton', loading)
        overlayBarText.textContent = loading ? '' : text(str)
        overlayBar.style.display = loading || str ? '' : 'none'
    }

    function fetchLocation(photoId, accessKey) {
        if (!photoId || !accessKey) return
        fetch('https://api.unsplash.com/photos/' + encodeURIComponent(photoId), {
            headers: { Authorization: 'Client-ID ' + accessKey },
        })
            .then(function (res) {
                return res.ok ? res.json() : null
            })
            .then(function (data) {
                var loc = data ? formatPhotoLocation(data.location) : ''
                locationCache[photoId] = loc
                // Only apply if the user is still hovering this same photo.
                if (currentPhotoId === photoId && isOverlayVisible()) setLocation(loc)
            })
            .catch(function () {})
    }

    /** Matches breakpoints in _sass/_photos.scss: 1 / 2 / 3 columns. */
    function getColumnCount() {
        if (window.matchMedia('(max-aspect-ratio: 3/2) and (max-width: 40rem)').matches) return 1
        if (window.matchMedia('(min-width: 50rem)').matches) return 3
        return 2
    }

    function triggerDownload(downloadLocation, accessKey) {
        if (!downloadLocation || !accessKey) return
        var url = downloadLocation + (downloadLocation.indexOf('?') >= 0 ? '&' : '?') + 'client_id=' + encodeURIComponent(accessKey)
        fetch(url).catch(function () {})
    }

    function formatPhotoLocation(loc) {
        // Unsplash's `name` is already a composed, human-readable label that includes the
        // city and country — e.g. "Montreal, Quebec, Canada" — so it's all we need.
        if (!loc || typeof loc !== 'object' || !loc.name) return ''
        return String(loc.name).trim()
    }

    function renderPhoto(photo, accessKey) {
        var author = photo.user && photo.user.name ? photo.user.name : 'Photographer'
        var photoPage = photo.links && photo.links.html ? photo.links.html : '#'
        var downloadLoc = photo.links && photo.links.download_location ? photo.links.download_location : ''
        var src =
            photo.urls && photo.urls.regular
                ? photo.urls.regular
                : photo.urls && photo.urls.small
                  ? photo.urls.small
                  : ''

        var article = document.createElement('article')
        article.className = 'photo-item'

        var link = document.createElement('a')
        link.className = 'photo-item__link'
        link.href = photoPage
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.setAttribute(
            'aria-label',
            text(photo.alt_description || photo.description || 'Photo on Unsplash') + ' — opens in new tab'
        )

        link.addEventListener('click', function () {
            triggerDownload(downloadLoc, accessKey)
        })

        if (hoverCapable) {
            link.addEventListener('mouseenter', function () {
                showOverlay(photo, accessKey)
            })
            link.addEventListener('mouseleave', function () {
                hideOverlay()
            })
        }

        var img = document.createElement('img')
        img.className = 'photo-item__img'
        img.src = src
        img.alt = text(photo.alt_description || photo.description || 'Photo by ' + author)
        img.loading = 'lazy'
        img.decoding = 'async'
        img.sizes =
            '(max-aspect-ratio: 3/2) and (max-width: 40rem) calc(100vw - 2.25rem), (max-width: 49.99rem) calc(50vw - 1rem), calc(33.333vw - 1.25rem)'
        if (photo.width && photo.height) {
            img.width = photo.width
            img.height = photo.height
        }

        link.appendChild(img)

        article.appendChild(link)
        return article
    }

    function showSetup(root) {
        root.innerHTML = ''
        delete root.__unsplashPhotos
        var username = root.dataset.unsplashUsername || 'matlokam'
        var p = document.createElement('p')
        p.className = 'photos-setup'
        p.appendChild(document.createTextNode('Set '))
        var cEnv = document.createElement('code')
        cEnv.textContent = 'UNSPLASH_ACCESS_KEY'
        p.appendChild(cEnv)
        p.appendChild(document.createTextNode(' when building the site so Jekyll can inject your Unsplash access key (CI uses this too). Create a free app at '))
        var apiLink = document.createElement('a')
        apiLink.href = 'https://unsplash.com/oauth/applications'
        apiLink.target = '_blank'
        apiLink.rel = 'noopener noreferrer'
        apiLink.textContent = 'unsplash.com/oauth/applications'
        p.appendChild(apiLink)
        p.appendChild(document.createTextNode('. Until then, browse the full set on '))
        var profileLink = document.createElement('a')
        profileLink.href = 'https://unsplash.com/@' + encodeURIComponent(username)
        profileLink.target = '_blank'
        profileLink.rel = 'noopener noreferrer'
        profileLink.textContent = 'Unsplash'
        p.appendChild(profileLink)
        p.appendChild(document.createTextNode('.'))
        root.appendChild(p)
    }

    function showError(root, message) {
        root.innerHTML = ''
        delete root.__unsplashPhotos
        var p = document.createElement('p')
        p.className = 'photos-error'
        p.textContent = message
        root.appendChild(p)
    }

    function ensureMasonry(root) {
        var masonry = root.querySelector('.photo-masonry')
        if (!masonry) {
            masonry = document.createElement('div')
            masonry.className = 'photo-masonry'
            var sentinel = root.querySelector('.photos-sentinel')
            if (sentinel) root.insertBefore(masonry, sentinel)
            else root.appendChild(masonry)
        }
        return masonry
    }

    function rebuildColumns(masonry, k) {
        masonry.innerHTML = ''
        for (var i = 0; i < k; i++) {
            var col = document.createElement('div')
            col.className = 'photo-column'
            masonry.appendChild(col)
        }
    }

    /** Greedy shortest-column packing using native aspect ratio (same column widths ⇒ proportional height). */
    function renderGallery(root, photos, accessKey) {
        if (!photos.length) return

        var k = getColumnCount()
        var masonry = ensureMasonry(root)
        var cols = masonry.querySelectorAll('.photo-column')
        if (cols.length !== k) rebuildColumns(masonry, k)

        cols = Array.from(masonry.querySelectorAll('.photo-column'))
        cols.forEach(function (col) {
            col.innerHTML = ''
        })

        var heights = cols.map(function () {
            return 0
        })

        for (var i = 0; i < photos.length; i++) {
            var photo = photos[i]
            var el = renderPhoto(photo, accessKey)
            var ratio = (photo.height || 1) / (photo.width || 1)
            var idx = 0
            for (var j = 1; j < heights.length; j++) {
                if (heights[j] < heights[idx]) idx = j
            }
            cols[idx].appendChild(el)
            heights[idx] += ratio
        }
    }

    function teardownInfiniteScroll(root) {
        if (root.__photosObserver) {
            root.__photosObserver.disconnect()
            root.__photosObserver = null
        }
        var sentinel = root.querySelector('.photos-sentinel')
        if (sentinel) sentinel.remove()
    }

    /** Watch a sentinel at the end of the grid and pull the next page as it nears the viewport. */
    function setupInfiniteScroll(root, accessKey, username, perPage) {
        if (typeof IntersectionObserver === 'undefined') return
        if (root.__photosObserver) return
        var sentinel = document.createElement('div')
        sentinel.className = 'photos-sentinel'
        sentinel.setAttribute('aria-hidden', 'true')
        root.appendChild(sentinel)
        var observer = new IntersectionObserver(
            function (entries) {
                if (entries[0].isIntersecting) loadNextPage(root, accessKey, username, perPage)
            },
            { rootMargin: '800px 0px' }
        )
        observer.observe(sentinel)
        root.__photosObserver = observer
    }

    function loadNextPage(root, accessKey, username, perPage) {
        if (root.__loadingMore || !root.__hasMore) return
        root.__loadingMore = true
        fetchPage(root, accessKey, username, perPage, root.__nextPage, true)
            .then(function () {
                root.__loadingMore = false
                // Re-arm so a still-visible sentinel (tall viewport) keeps loading until it scrolls off.
                if (root.__hasMore && root.__photosObserver) {
                    var s = root.querySelector('.photos-sentinel')
                    if (s) {
                        root.__photosObserver.unobserve(s)
                        root.__photosObserver.observe(s)
                    }
                }
            })
            .catch(function () {
                root.__loadingMore = false
            })
    }

    function fetchPage(root, accessKey, username, perPage, page, append) {
        var url =
            'https://api.unsplash.com/users/' +
            encodeURIComponent(username) +
            '/photos?per_page=' +
            perPage +
            '&page=' +
            page +
            '&order_by=latest'

        return fetch(url, {
            headers: { Authorization: 'Client-ID ' + accessKey },
        }).then(function (res) {
            if (!res.ok) {
                return res.text().then(function (raw) {
                    var msg = 'Unsplash returned ' + res.status
                    try {
                        var body = JSON.parse(raw)
                        if (body && body.errors && body.errors.length) msg = body.errors[0]
                    } catch (_) {}
                    throw new Error(msg)
                })
            }
            return res.json()
        }).then(function (photos) {
            if (!append) {
                teardownInfiniteScroll(root)
                root.innerHTML = ''
                root.__unsplashPhotos = []
            }

            if (!photos || !photos.length) {
                root.__hasMore = false
                teardownInfiniteScroll(root)
                if (!append) {
                    showError(root, 'No public photos found for this Unsplash user.')
                }
                return
            }

            if (!append) {
                root.__unsplashPhotos = photos.slice()
            } else {
                for (var i = 0; i < photos.length; i++) root.__unsplashPhotos.push(photos[i])
            }

            renderGallery(root, root.__unsplashPhotos, accessKey)

            root.__nextPage = page + 1
            root.__hasMore = photos.length >= perPage
            if (root.__hasMore) setupInfiniteScroll(root, accessKey, username, perPage)
            else teardownInfiniteScroll(root)
        })
    }

    function scheduleReflowFromResize() {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(function () {
            var root = document.getElementById('photos-root')
            var list = root && root.__unsplashPhotos
            if (!list || !list.length) return
            var key = (root.dataset.unsplashAccessKey || '').trim()
            if (!key) return
            renderGallery(root, list, key)
        }, 120)
    }

    window.addEventListener('resize', function () {
        if (isOverlayVisible()) sizeFrame()
        scheduleReflowFromResize()
    })

    function loadPhotos() {
        var root = document.getElementById('photos-root')
        if (!root) return
        if (root.dataset.unsplashGalleryInit === '1') return
        if (root.querySelector('.photo-masonry, .photos-error, .photos-setup')) return

        root.dataset.unsplashGalleryInit = '1'

        var accessKey = (root.dataset.unsplashAccessKey || '').trim()
        var username = (root.dataset.unsplashUsername || 'matlokam').trim()
        var perPage = parseInt(root.dataset.perPage || PER_PAGE_DEFAULT, 10)
        if (!perPage || perPage < 1) perPage = PER_PAGE_DEFAULT

        if (!accessKey) {
            showSetup(root)
            return
        }

        fetchPage(root, accessKey, username, perPage, 1, false).catch(function (err) {
            showError(root, 'Could not load photos: ' + (err && err.message ? err.message : 'Unknown error'))
        })
    }

    document.addEventListener('DOMContentLoaded', loadPhotos)
    if (typeof htmx !== 'undefined') {
        htmx.onLoad(function () {
            loadPhotos()
        })
    }
})()
