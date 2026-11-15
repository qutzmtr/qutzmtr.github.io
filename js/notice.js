/* ============================================================
   团队公告详情页
   ------------------------------------------------------------
   新增一条公告的做法：
   1. 在下面的 NOTICES 里加一个条目（键名即 URL 里的 id）；
   2. 在 index.html 的「团队公告」板块里加一个链接：
      notice.html?id=你的键名
   ============================================================ */
(function() {
    'use strict';

    var NOTICES = {
        recruit: {
            title: '我们正在招募',
            badge: '公告',
            date: '2026-08',
            pinned: true,
            lead: '如果你感兴趣，欢迎加入我们！',
            blocks: [
                {
                    heading: '关于这次招募',
                    list: [
                        '柠影浮光 Lightdrift 是一个一起做内容的创作团队，目前开放招募，欢迎有想法的朋友联系我们。',
                        '不限经验，只要愿意一起把作品做出来，都欢迎来聊聊。'
                    ]
                },
                {
                    heading: '联系方式',
                }
            ],
            contacts: [
                { label: '官方邮箱', value: 'lightdrift@163.com' }
            ]
        }
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getId() {
        var search = window.location.search || '';
        var match = /[?&]id=([^&]+)/.exec(search);
        if (!match) {
            return '';
        }
        try {
            return decodeURIComponent(match[1]).replace(/\/+$/, '');
        } catch (error) {
            return match[1];
        }
    }

    var id = getId();
    var keys = Object.keys(NOTICES);
    if (!NOTICES[id]) {
        id = keys.length ? keys[0] : '';
    }

    var notice = NOTICES[id];
    var titleEl = document.getElementById('noticeTitle');
    var metaEl = document.getElementById('noticeMeta');
    var badgeEl = document.getElementById('noticeBadge');
    var dateEl = document.getElementById('noticeDate');
    var bodyEl = document.getElementById('noticeBody');

    if (!notice) {
        if (titleEl) {
            titleEl.textContent = '公告不存在';
        }
        if (bodyEl) {
            bodyEl.innerHTML = '<p class="notice-lead">这条公告可能已经被移除，请返回 <a href="./index.html#notices">团队公告</a> 查看最新内容。</p>';
        }
        return;
    }

    document.title = notice.title + ' || 柠影浮光 Lightdrift';

    if (titleEl) {
        titleEl.textContent = notice.title;
    }
    if (metaEl) {
        metaEl.hidden = false;
    }
    if (badgeEl) {
        badgeEl.textContent = notice.pinned ? notice.badge + ' · 置顶' : notice.badge;
    }
    if (dateEl) {
        dateEl.textContent = notice.date;
    }

    if (bodyEl) {
        var html = '';
        if (notice.lead) {
            html += '<p class="notice-lead">' + escapeHtml(notice.lead) + '</p>';
        }

        (notice.blocks || []).forEach(function(block) {
            html += '<div class="notice-block">';
            if (block.heading) {
                html += '<h3>' + escapeHtml(block.heading) + '</h3>';
            }
            if (block.list && block.list.length) {
                html += '<ul>';
                block.list.forEach(function(item) {
                    html += '<li>' + escapeHtml(item) + '</li>';
                });
                html += '</ul>';
            }
            html += '</div>';
        });

        if (notice.contacts && notice.contacts.length) {
            html += '<div class="notice-contact">';
            notice.contacts.forEach(function(contact) {
                html += '<div class="contact-item">' +
                    '<span>' + escapeHtml(contact.label) + '</span>' +
                    '<strong>' + escapeHtml(contact.value) + '</strong>' +
                    '</div>';
            });
            html += '</div>';
        }

        bodyEl.innerHTML = html;
    }
})();
