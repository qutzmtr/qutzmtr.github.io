/* ============================================================
   一起过圣诞 · 2026
   纯静态页面脚本：星空、雪、倒计时、点亮圣诞星、背景音乐
   ------------------------------------------------------------
   音乐说明：
   默认由 Web Audio 实时合成（0 额外流量）。
   如果想把音乐换成自己的 MP3，把文件放到
   specialpages/christmas26/audio/bgm.mp3 即可，页面会自动优先使用它。
   ============================================================ */
(function() {
    'use strict';

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- 雪 ---------------- */
    (function initSnow() {
        var canvas = document.getElementById('snowfall');
        if (!canvas || !canvas.getContext) {
            return;
        }
        var ctx = canvas.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var flakes = [];
        var width = 0;
        var height = 0;
        var rafId = 0;
        var lastTime = 0;

        function makeFlake(initial) {
            return {
                x: Math.random() * width,
                y: initial ? Math.random() * height : -12,
                r: 0.7 + Math.random() * 1.9,
                speed: 14 + Math.random() * 30,
                sway: 6 + Math.random() * 14,
                phase: Math.random() * Math.PI * 2,
                alpha: 0.22 + Math.random() * 0.55
            };
        }

        function build() {
            var count = Math.round(Math.min(110, Math.max(40, width / 13)));
            flakes = [];
            for (var i = 0; i < count; i++) {
                flakes.push(makeFlake(true));
            }
        }

        function resize() {
            width = canvas.clientWidth || window.innerWidth;
            height = canvas.clientHeight || window.innerHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            build();
        }

        function frame(time) {
            if (!lastTime) {
                lastTime = time;
            }
            var delta = Math.min((time - lastTime) / 1000, 0.05);
            lastTime = time;

            ctx.clearRect(0, 0, width, height);

            for (var i = 0; i < flakes.length; i++) {
                var f = flakes[i];
                f.y += f.speed * delta;
                f.x += Math.sin(f.y * 0.012 + f.phase) * f.sway * delta;

                if (f.y > height + 12 || f.x < -24 || f.x > width + 24) {
                    flakes[i] = makeFlake(false);
                    continue;
                }

                ctx.beginPath();
                ctx.fillStyle = 'rgba(255, 255, 255, ' + f.alpha.toFixed(3) + ')';
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();
            }

            rafId = window.requestAnimationFrame(frame);
        }

        function start() {
            if (rafId) {
                return;
            }
            lastTime = 0;
            rafId = window.requestAnimationFrame(frame);
        }

        function stop() {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
        }

        if (reduceMotion) {
            canvas.style.display = 'none';
            return;
        }

        resize();
        start();

        var resizeTimer = 0;
        window.addEventListener('resize', function() {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(function() {
                resize();
                lastTime = 0;
            }, 180);
        });

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });
    })();

    /* ---------------- 倒计时 ---------------- */
    (function initCountdown() {
        var target = new Date('2026-12-25T00:00:00+08:00').getTime();
        var daysEl = document.getElementById('cdDays');
        var hoursEl = document.getElementById('cdHours');
        var minsEl = document.getElementById('cdMins');
        var secsEl = document.getElementById('cdSecs');
        var labelEl = document.querySelector('.countdown-label');

        if (!daysEl || !hoursEl || !minsEl || !secsEl) {
            return;
        }

        function pad(value) {
            return value < 10 ? '0' + value : String(value);
        }

        function update() {
            var diff = target - Date.now();

            if (diff <= 0) {
                daysEl.textContent = '00';
                hoursEl.textContent = '00';
                minsEl.textContent = '00';
                secsEl.textContent = '00';
                if (labelEl) {
                    labelEl.textContent = '圣诞快乐';
                }
                window.clearInterval(timer);
                return;
            }

            var totalSeconds = Math.floor(diff / 1000);
            daysEl.textContent = pad(Math.floor(totalSeconds / 86400));
            hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
            minsEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
            secsEl.textContent = pad(totalSeconds % 60);
        }

        update();
        var timer = window.setInterval(update, 1000);
    })();

    /* ---------------- 点亮圣诞星 ---------------- */
    (function initWish() {
        var stage = document.getElementById('wishStage');
        var counter = document.getElementById('starCount');
        var resetBtn = document.getElementById('starReset');

        if (!stage || !counter) {
            return;
        }

        var total = 0;
        var live = 0;
        var limit = 26;

        function setCount() {
            counter.textContent = String(total);
        }

        function spawn(event) {
            if (live >= limit) {
                return;
            }

            var rect = stage.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;

            if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
                return;
            }

            var star = document.createElement('span');
            star.className = 'wish-star';
            star.style.left = x + 'px';
            star.style.top = y + 'px';
            star.style.width = (10 + Math.random() * 12).toFixed(1) + 'px';
            star.style.height = star.style.width;

            live += 1;
            total += 1;
            setCount();

            star.addEventListener('animationend', function() {
                if (star.parentNode) {
                    star.parentNode.removeChild(star);
                }
                live = Math.max(0, live - 1);
            });

            stage.appendChild(star);
        }

        stage.addEventListener('pointerdown', function(event) {
            if (event.pointerType === 'mouse' && event.button !== 0) {
                return;
            }
            spawn(event);
        });

        stage.addEventListener('keydown', function(event) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }
            event.preventDefault();
            var rect = stage.getBoundingClientRect();
            spawn({
                clientX: rect.left + rect.width * (0.32 + Math.random() * 0.36),
                clientY: rect.top + rect.height * (0.24 + Math.random() * 0.36)
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                var stars = stage.querySelectorAll('.wish-star');
                for (var i = 0; i < stars.length; i++) {
                    stars[i].parentNode.removeChild(stars[i]);
                }
                live = 0;
                total = 0;
                setCount();
            });
        }
    })();

    /* ---------------- 背景音乐 ---------------- */
    (function initMusic() {
        var button = document.getElementById('musicBtn');
        var label = button ? button.querySelector('.music-label') : null;
        var hint = document.getElementById('musicHint');
        var AudioCtx = window.AudioContext || window.webkitAudioContext;

        if (hint) {
            window.setTimeout(function() {
                hint.classList.add('is-hidden');
            }, 8000);
        }

        if (!button || !AudioCtx) {
            if (button) {
                button.classList.add('is-failed');
                if (label) {
                    label.textContent = '无法播放';
                }
            }
            return;
        }

        var ctx = null;
        var master = null;
        var timer = 0;
        var step = 0;
        var nextTime = 0;
        var playing = false;
        var noise = null;
        var audioEl = null;
        var customTried = false;

        var BPM = 84;
        var BEAT = 60 / BPM;
        var STEP = 0.5;
        var STEPS_PER_LOOP = 64;

        var CHORDS = [
            ['C3', ['C4', 'E4', 'G4', 'C5']],
            ['A2', ['A3', 'C4', 'E4', 'A4']],
            ['F2', ['F3', 'A3', 'C4', 'F4']],
            ['G2', ['G3', 'B3', 'D4', 'G4']],
            ['C3', ['C4', 'E4', 'G4', 'C5']],
            ['A2', ['A3', 'C4', 'E4', 'A4']],
            ['D3', ['D4', 'F4', 'A4', 'D5']],
            ['G2', ['G3', 'B3', 'D4', 'G4']]
        ];

        var MELODY = [
            ['E5', 'G5', 'A5', 'G5'],
            ['E5', 'D5', 'C5', null],
            ['A4', 'C5', 'D5', 'C5'],
            ['D5', 'E5', 'D5', null],
            ['E5', 'G5', 'A5', 'C6'],
            ['B5', 'A5', 'G5', null],
            ['F5', 'E5', 'D5', 'E5'],
            ['C5', null, null, null]
        ];

        var ARP_PATTERN = [0, 1, 2, 3, 2, 1, 2, 1];

        var NOTE_INDEX = {
            C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
            'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11
        };

        function noteFreq(name) {
            var match = /^([A-G]#?)(\d)$/.exec(name);
            if (!match) {
                return 440;
            }
            var midi = 12 * (parseInt(match[2], 10) + 1) + NOTE_INDEX[match[1]];
            return 440 * Math.pow(2, (midi - 69) / 12);
        }

        /* 预先把事件铺到 8 小节的时间网格上 */
        var stepMap = {};

        function addEvent(beat, kind, freq, gain, dur) {
            var index = Math.round(beat / STEP) % STEPS_PER_LOOP;
            if (!stepMap[index]) {
                stepMap[index] = [];
            }
            stepMap[index].push({ kind: kind, freq: freq, gain: gain, dur: dur });
        }

        (function buildScore() {
            for (var bar = 0; bar < 8; bar++) {
                var base = bar * 4;
                var chord = CHORDS[bar];

                addEvent(base, 'pad', noteFreq(chord[0]), 0.06, BEAT * 4.2);

                for (var eighth = 0; eighth < 8; eighth++) {
                    var tone = chord[1][ARP_PATTERN[eighth]];
                    addEvent(base + eighth * 0.5, 'bell', noteFreq(tone), 0.05, 0.78);
                }

                for (var q = 0; q < 4; q++) {
                    var melody = MELODY[bar][q];
                    if (melody) {
                        addEvent(base + q, 'bell', noteFreq(melody), 0.15, 1.5);
                    }
                }

                addEvent(base + 1.5, 'sleigh', 0, 0.05, 0.18);
                addEvent(base + 3.5, 'sleigh', 0, 0.04, 0.18);
            }
        })();

        function ensureContext() {
            if (ctx) {
                return ctx;
            }
            try {
                ctx = new AudioCtx();
            } catch (error) {
                ctx = null;
                return null;
            }
            master = ctx.createGain();
            master.gain.value = 0;
            master.connect(ctx.destination);

            var delay = ctx.createDelay(1);
            delay.delayTime.value = 0.34;
            var feedback = ctx.createGain();
            feedback.gain.value = 0.24;
            var wet = ctx.createGain();
            wet.gain.value = 0.3;

            master.connect(delay);
            delay.connect(feedback);
            feedback.connect(delay);
            delay.connect(wet);
            wet.connect(ctx.destination);

            return ctx;
        }

        function noiseBuffer() {
            if (noise) {
                return noise;
            }
            var length = Math.floor(ctx.sampleRate * 0.2);
            noise = ctx.createBuffer(1, length, ctx.sampleRate);
            var data = noise.getChannelData(0);
            for (var i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / length);
            }
            return noise;
        }

        function playBell(time, frequency, gain, dur) {
            var osc = ctx.createOscillator();
            var osc2 = ctx.createOscillator();
            var amp = ctx.createGain();
            var amp2 = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = frequency;
            osc2.type = 'sine';
            osc2.frequency.value = frequency * 2.005;

            amp2.gain.value = 0.24;
            osc.connect(amp);
            osc2.connect(amp2);
            amp2.connect(amp);

            amp.gain.setValueAtTime(0.0001, time);
            amp.gain.linearRampToValueAtTime(gain, time + 0.012);
            amp.gain.exponentialRampToValueAtTime(0.0001, time + dur);
            amp.connect(master);

            osc.start(time);
            osc2.start(time);
            osc.stop(time + dur + 0.05);
            osc2.stop(time + dur + 0.05);
        }

        function playPad(time, frequency, gain, dur) {
            var osc = ctx.createOscillator();
            var amp = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = frequency;
            amp.gain.setValueAtTime(0.0001, time);
            amp.gain.linearRampToValueAtTime(gain, time + 0.9);
            amp.gain.linearRampToValueAtTime(0.0001, time + dur);

            osc.connect(amp);
            amp.connect(master);
            osc.start(time);
            osc.stop(time + dur + 0.1);
        }

        function playSleigh(time, gain) {
            var source = ctx.createBufferSource();
            var filter = ctx.createBiquadFilter();
            var amp = ctx.createGain();

            source.buffer = noiseBuffer();
            filter.type = 'highpass';
            filter.frequency.value = 6400;

            amp.gain.setValueAtTime(gain, time);
            amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

            source.connect(filter);
            filter.connect(amp);
            amp.connect(master);
            source.start(time);
            source.stop(time + 0.2);
        }

        function playStep(events, time) {
            for (var i = 0; i < events.length; i++) {
                var item = events[i];
                if (item.kind === 'bell') {
                    playBell(time, item.freq, item.gain, item.dur);
                } else if (item.kind === 'pad') {
                    playPad(time, item.freq, item.gain, item.dur);
                } else {
                    playSleigh(time, item.gain);
                }
            }
        }

        function tick() {
            if (!playing || !ctx) {
                return;
            }
            while (nextTime < ctx.currentTime + 0.22) {
                var events = stepMap[step];
                if (events && events.length) {
                    playStep(events, nextTime);
                }
                nextTime += BEAT * STEP;
                step = (step + 1) % STEPS_PER_LOOP;
            }
        }

        function setUi(on) {
            button.classList.toggle('is-playing', on);
            button.setAttribute('aria-pressed', String(on));
            button.setAttribute('aria-label', on ? '暂停圣诞背景音乐' : '播放圣诞背景音乐');
            if (label) {
                label.textContent = on ? '暂停音乐' : '圣诞音乐';
            }
        }

        function startSynth() {
            if (!ensureContext()) {
                button.classList.add('is-failed');
                if (label) {
                    label.textContent = '无法播放';
                }
                return;
            }
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            playing = true;
            master.gain.cancelScheduledValues(ctx.currentTime);
            master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
            master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.6);

            step = 0;
            nextTime = ctx.currentTime + 0.08;
            window.clearInterval(timer);
            timer = window.setInterval(tick, 60);
            tick();
        }

        function stopSynth() {
            playing = false;
            window.clearInterval(timer);
            timer = 0;
            if (ctx && master) {
                master.gain.cancelScheduledValues(ctx.currentTime);
                master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
                master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
                window.setTimeout(function() {
                    if (!playing && ctx && ctx.state === 'running') {
                        ctx.suspend();
                    }
                }, 1400);
            }
        }

        function tryCustomAudio() {
            return new Promise(function(resolve) {
                if (customTried) {
                    resolve(null);
                    return;
                }
                customTried = true;
                if (!window.fetch) {
                    resolve(null);
                    return;
                }
                fetch('./audio/bgm.mp3', { method: 'HEAD' }).then(function(response) {
                    if (!response.ok) {
                        resolve(null);
                        return;
                    }
                    audioEl = new Audio('./audio/bgm.mp3');
                    audioEl.loop = true;
                    audioEl.preload = 'none';
                    resolve(audioEl);
                }).catch(function() {
                    resolve(null);
                });
            });
        }

        function start() {
            if (audioEl) {
                audioEl.play().then(function() {
                    playing = true;
                    setUi(true);
                }).catch(function() {
                    audioEl = null;
                    startSynth();
                    setUi(true);
                });
                return;
            }

            if (!customTried) {
                setUi(true);
                tryCustomAudio().then(function(el) {
                    if (playing) {
                        return null;
                    }
                    if (el) {
                        return el.play().then(function() {
                            playing = true;
                        });
                    }
                    startSynth();
                    return null;
                }).catch(function() {
                    if (!playing) {
                        startSynth();
                    }
                });
                return;
            }

            startSynth();
            setUi(true);
        }

        function stop() {
            if (audioEl) {
                audioEl.pause();
            }
            if (ctx) {
                stopSynth();
            }
            playing = false;
            setUi(false);
        }

        button.addEventListener('click', function() {
            if (hint) {
                hint.classList.add('is-hidden');
            }
            if (playing) {
                stop();
            } else {
                start();
            }
        });
    })();

    /* ---------------- 滚动入场的轻量动效 ---------------- */
    (function initReveal() {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            return;
        }

        var targets = document.querySelectorAll('.info-card, .wish-panel');
        if (!targets.length) {
            return;
        }

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.remove('reveal-pending');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        Array.prototype.forEach.call(targets, function(el) {
            el.classList.add('reveal-pending');
            observer.observe(el);
        });
    })();
})();
