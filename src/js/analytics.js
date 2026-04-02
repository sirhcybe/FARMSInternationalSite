/**
 * FARMS International — Centralized Analytics (GA4)
 *
 * Tracks events via gtag() using data attributes. No inline onclick handlers.
 *
 * Supported data attributes:
 *   data-track="donation"          — donation button clicks (Aplos, Engiven)
 *   data-track="pdf"               — PDF download link clicks
 *   data-track="outbound"          — curated external link clicks (complements GA4
 *                                    Enhanced Measurement; auto-detection removed to
 *                                    avoid duplicate outbound events)
 *   data-track="newsletter-signup" — newsletter form submissions (Mailchimp)
 *   data-track-label="..."         — optional label override
 *
 * Video tracking uses the Vimeo Player API for Vimeo iframes and YouTube
 * iframe API for YouTube embeds — click handlers on wrapper divs cannot
 * capture interactions inside cross-origin iframes.
 *
 * Form submissions (contact + mailing list) are fired from farms.js after
 * successful AJAX response, using fireEvent() exported on window.FARMS.
 */

(function () {
  'use strict';

  function fireEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }

  // Expose for use in farms.js
  window.FARMS = window.FARMS || {};
  window.FARMS.fireEvent = fireEvent;

  document.addEventListener('DOMContentLoaded', function () {

    // ------------------------------------------------------------------
    // Clicks on elements with data-track attribute
    // ------------------------------------------------------------------
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-track]');
      if (!el) return;

      var type  = el.getAttribute('data-track');
      var label = el.getAttribute('data-track-label') ||
                  el.textContent.trim() ||
                  el.getAttribute('href') || '';
      var href  = el.getAttribute('href') || '';

      switch (type) {

        case 'donation':
          fireEvent('donation_click', {
            link_text: label,
            link_url: href
          });
          break;

        case 'pdf':
          var fileName = href.split('/').pop();
          var ext = fileName.indexOf('.') !== -1 ? fileName.split('.').pop() : '';
          fireEvent('file_download', {
            file_name: fileName,
            file_extension: ext,
            link_url: href,
            link_text: label
          });
          break;

        case 'outbound':
          fireEvent('outbound_click', {
            link_url: href,
            link_domain: el.hostname || '',
            link_text: label,
            outbound: true
          });
          break;

        case 'newsletter-signup':
          fireEvent('sign_up', {
            method: 'Mailchimp'
          });
          break;
      }
    });

    // ------------------------------------------------------------------
    // Vimeo video tracking via Player API
    // ------------------------------------------------------------------
    var vimeoIframes = document.querySelectorAll('iframe[src*="player.vimeo.com"]');
    if (vimeoIframes.length > 0) {
      var script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = function () {
        vimeoIframes.forEach(function (iframe) {
          var player = new Vimeo.Player(iframe);
          var videoLabel = '';
          var wrapper = iframe.closest('[data-track-label]');
          if (wrapper) {
            videoLabel = wrapper.getAttribute('data-track-label');
          }
          player.getVideoTitle().then(function (title) {
            if (!videoLabel) videoLabel = title;
          }).catch(function () {});
          player.on('play', function () {
            fireEvent('video_play', {
              video_provider: 'vimeo',
              video_title: videoLabel,
              video_url: iframe.src
            });
          });
        });
      };
      document.head.appendChild(script);
    }

    // ------------------------------------------------------------------
    // YouTube video tracking via iframe API
    // ------------------------------------------------------------------
    var ytIframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');
    if (ytIframes.length > 0) {
      // YouTube API requires each iframe to have an id and enablejsapi=1
      ytIframes.forEach(function (iframe, i) {
        if (!iframe.id) iframe.id = 'yt-player-' + i;
        var src = iframe.src;
        if (src.indexOf('enablejsapi=1') === -1) {
          iframe.src = src + (src.indexOf('?') === -1 ? '?' : '&') + 'enablejsapi=1';
        }
      });
      window.onYouTubeIframeAPIReady = function () {
        ytIframes.forEach(function (iframe) {
          var videoLabel = '';
          var wrapper = iframe.closest('[data-track-label]');
          if (wrapper) {
            videoLabel = wrapper.getAttribute('data-track-label');
          }
          new YT.Player(iframe.id, {
            events: {
              onStateChange: function (event) {
                if (event.data === YT.PlayerState.PLAYING) {
                  if (!videoLabel) {
                    try { videoLabel = event.target.getVideoData().title; } catch (e) {}
                  }
                  fireEvent('video_play', {
                    video_provider: 'youtube',
                    video_title: videoLabel || '',
                    video_url: iframe.src
                  });
                }
              }
            }
          });
        });
      };
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

  });
})();
