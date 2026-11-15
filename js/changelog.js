/* ============================================================
   更新日志页：读取 changelog/ 目录下的 Markdown 渲染
   ------------------------------------------------------------
   changelog/manifest.json 里按顺序列出要展示的文件，
   每个 .md 文件用最简单的 front matter 描述标题信息：

   ---
   version: v1.3.0
   date: 2026-11-15
   summary: 一句话概括本次更新
   ---
   ## 新增
   - 条目

   支持的语法：# 标题、- 列表、1. 有序列表、**加粗**、*斜体*、
   `行内代码`、[链接](https://…)、> 引用、--- 分隔线、``` 代码块。
   ============================================================ */
(function() {
    'use strict';

    var BASE = './changelog/';
    var MANIFEST_URL = BASE + 'manifest.json';

    var listEl = document.getElementById('changelogList');
    var stateEl = document.getElementById('changelogState');

    if (!listEl) {
        return;
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ---------- 行内语法 ---------- */
    function inline(text) {
        var codes = [];
        var out = String(text).replace(/`([^`]+)`/g, function(match, code) {
            codes.push(code);
            return '\u0000' + (codes.length - 1) + '\u0000';
        });

        out = escapeHtml(out);
        out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
        out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function(match, label, url) {
            var safe = /^(https?:\/\/|\.{0,2}\/|#)/i.test(url) ? url : '#';
            var target = /^https?:\/\//i.test(safe) ? ' target="_blank" rel="noopener noreferrer"' : '';
            return '<a href="' + safe + '"' + target + '>' + label + '</a>';
        });

        out = out.replace(/\u0000(\d+)\u0000/g, function(match, index) {
            return '<code>' + escapeHtml(codes[Number(index)]) + '</code>';
        });

        return out;
    }

    var BLOCK_START = /^(#{1,4}\s|>\s?|```|\s*[-*+]\s+|\s*\d+\.\s+|-{3,}\s*$|\*{3,}\s*$|_{3,}\s*$)/;

    /* ---------- 块级语法 ---------- */
    function mdToHtml(markdown) {
        var lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
        var html = [];
        var listType = null;
        var i = 0;
        var total = lines.length;

        function closeList() {
            if (listType) {
                html.push('</' + listType + '>');
                listType = null;
            }
        }

        while (i < total) {
            var line = lines[i];

            /* 代码块 */
            if (/^```/.test(line)) {
                closeList();
                i += 1;
                var buffer = [];
                while (i < total && !/^```/.test(lines[i])) {
                    buffer.push(lines[i]);
                    i += 1;
                }
                i += 1;
                html.push('<pre><code>' + escapeHtml(buffer.join('\n')) + '</code></pre>');
                continue;
            }

            /* 空行 */
            if (!line.trim()) {
                closeList();
                i += 1;
                continue;
            }

            /* 标题 */
            var heading = /^(#{1,4})\s+(.*)$/.exec(line);
            if (heading) {
                closeList();
                var level = Math.min(heading[1].length + 1, 4);
                html.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
                i += 1;
                continue;
            }

            /* 分隔线 */
            if (/^([-*_])\1{2,}\s*$/.test(line)) {
                closeList();
                html.push('<hr />');
                i += 1;
                continue;
            }

            /* 引用 */
            if (/^>\s?/.test(line)) {
                closeList();
                var quote = [];
                while (i < total && /^>\s?/.test(lines[i])) {
                    quote.push(lines[i].replace(/^>\s?/, ''));
                    i += 1;
                }
                html.push('<blockquote>' + inline(quote.join(' ')) + '</blockquote>');
                continue;
            }

            /* 列表 */
            var bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
            var ordered = /^\s*\d+\.\s+(.*)$/.exec(line);
            if (bullet || ordered) {
                var want = bullet ? 'ul' : 'ol';
                if (listType !== want) {
                    closeList();
                    listType = want;
                    html.push('<' + want + '>');
                }
                html.push('<li>' + inline((bullet || ordered)[1]) + '</li>');
                i += 1;
                continue;
            }

            /* 段落 */
            closeList();
            var paragraph = [line];
            i += 1;
            while (i < total && lines[i].trim() && !BLOCK_START.test(lines[i])) {
                paragraph.push(lines[i]);
                i += 1;
            }
            html.push('<p>' + inline(paragraph.join(' ')) + '</p>');
        }

        closeList();
        return html.join('\n');
    }

    /* ---------- front matter ---------- */
    function parseDocument(raw) {
        var text = String(raw).replace(/^\uFEFF/, '');
        var meta = {};
        var match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(text);

        if (match) {
            match[1].split('\n').forEach(function(line) {
                var pair = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
                if (!pair) {
                    return;
                }
                var value = pair[2].trim();
                var quoted = /^(['"])([\s\S]*)\1$/.exec(value);
                meta[pair[1]] = quoted ? quoted[2] : value;
            });
            text = text.slice(match[0].length);
        }

        return { meta: meta, body: text };
    }

    function slug(text) {
        return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function loadText(url) {
        return fetch(url, { cache: 'no-cache' }).then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ' · ' + url);
            }
            return response.text();
        });
    }

    function render(entries) {
        if (!entries.length) {
            return false;
        }

        var html = entries.map(function(entry, index) {
            var meta = entry.meta;
            var version = meta.version || entry.file.replace(/\.md$/i, '');
            var badge = index === 0 ? (meta.badge || '当前版本') : '历史版本';
            var summary = meta.summary ? '<p class="changelog-summary">' + inline(meta.summary) + '</p>' : '';
            var date = meta.date ? '<div class="changelog-date">' + escapeHtml(meta.date) + '</div>' : '';

            return '<article class="changelog-item" id="version-' + slug(version) + '">' +
                '<div class="changelog-head">' +
                    '<div>' +
                        '<h2 class="changelog-version">' + inline(version) + '</h2>' +
                        date +
                    '</div>' +
                    '<span class="badge">' + escapeHtml(badge) + '</span>' +
                '</div>' +
                summary +
                '<div class="md-body">' + mdToHtml(entry.body) + '</div>' +
            '</article>';
        }).join('');

        listEl.innerHTML = html;
        return true;
    }

    function showState(html) {
        listEl.innerHTML = '<div class="changelog-state">' + html + '</div>';
    }

    /* ---------- 启动 ---------- */
    loadText(MANIFEST_URL).then(function(raw) {
        var manifest = JSON.parse(raw);
        var files = Array.isArray(manifest) ? manifest : (manifest.files || []);

        if (!files.length) {
            throw new Error('EMPTY_MANIFEST');
        }

        return Promise.all(files.map(function(file) {
            return loadText(BASE + file).then(function(text) {
                var parsed = parseDocument(text);
                return {
                    file: file,
                    meta: parsed.meta,
                    body: parsed.body,
                    date: parsed.meta.date || ''
                };
            }).catch(function(error) {
                if (window.console && console.warn) {
                    console.warn('[changelog] 读取失败，已跳过：' + file, error);
                }
                return null;
            });
        }));
    }).then(function(entries) {
        var valid = (entries || []).filter(Boolean).sort(function(a, b) {
            return String(b.date).localeCompare(String(a.date));
        });

        if (!render(valid)) {
            showState('更新日志暂时是空的。在 <code>changelog/</code> 目录里新增一个 Markdown 文件，' +
                '再把它写进 <code>changelog/manifest.json</code> 就会出现在这里。');
        }
    }).catch(function(error) {
        if (window.console && console.warn) {
            console.warn('[changelog] 加载失败', error);
        }
        showState(
            '没能读取到 <code>changelog/manifest.json</code>。请确认：<br />' +
            '1. 站点根目录下存在 <code>changelog/</code> 文件夹，里面有 <code>manifest.json</code> 和日志文件；<br />' +
            '2. 通过 http(s) 访问（GitHub Pages 正常访问即可）。用 <code>file://</code> 直接打开本地文件时，' +
            '浏览器会拦截读取本地文件的请求，这是浏览器的安全限制，不是页面出错。'
        );
    });
})();
