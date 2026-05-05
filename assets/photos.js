;(function () {
    var PER_PAGE_DEFAULT = 24
    var resizeTimer

    function text(str) {
        if (str == null) return ''
        return String(str)
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
        if (!loc || typeof loc !== 'object') return ''
        if (loc.title) return String(loc.title).trim()
        var bits = []
        if (loc.name) bits.push(String(loc.name).trim())
        if (loc.city) bits.push(String(loc.city).trim())
        if (loc.country) bits.push(String(loc.country).trim())
        var seen = {}
        var out = []
        bits.forEach(function (b) {
            if (!b) return
            var k = b.toLowerCase()
            if (!seen[k]) {
                seen[k] = true
                out.push(b)
            }
        })
        return out.join(', ')
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

        var locationStr = formatPhotoLocation(photo.location)
        if (locationStr) {
            var meta = document.createElement('span')
            meta.className = 'photo-item__meta'
            meta.setAttribute('aria-hidden', 'true')
            var locEl = document.createElement('span')
            locEl.className = 'photo-item__meta-line'
            locEl.textContent = locationStr
            meta.appendChild(locEl)
            link.appendChild(meta)
        }

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
            var more = root.querySelector('.photos-more')
            if (more) root.insertBefore(masonry, more)
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

    function removeLoadMore(root) {
        var prev = root.querySelector('.photos-more')
        if (prev) prev.remove()
    }

    function attachLoadMore(root, accessKey, username, perPage, nextPage) {
        removeLoadMore(root)
        var wrap = document.createElement('div')
        wrap.className = 'photos-more'
        var btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = 'Load more'
        btn.addEventListener('click', function () {
            btn.disabled = true
            fetchPage(root, accessKey, username, perPage, nextPage, true)
                .then(function () {
                    btn.disabled = false
                })
                .catch(function () {
                    btn.disabled = false
                })
        })
        wrap.appendChild(btn)
        root.appendChild(wrap)
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
                root.innerHTML = ''
                root.__unsplashPhotos = []
            } else {
                removeLoadMore(root)
            }

            if (!photos || !photos.length) {
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

            if (photos.length >= perPage) {
                attachLoadMore(root, accessKey, username, perPage, page + 1)
            }
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

    window.addEventListener('resize', scheduleReflowFromResize)

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
