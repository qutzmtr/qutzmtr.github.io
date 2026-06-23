(function() {
    'use strict';

    // 内容区域淡入 —— 使用 Intersection Observer
    const contentEl = document.getElementById('logContent');

    if (contentEl && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        contentEl.classList.add('visible');
                        // 若希望只触发一次，可取消下一行注释
                        // observer.unobserve(contentEl);
                    }
                });
            }, {
                threshold: 0.10,
                rootMargin: '0px 0px -40px 0px',
            }
        );
        observer.observe(contentEl);
    } else {
        // 降级方案：直接显示
        contentEl.classList.add('visible');
    }

    // 页面加载完成后再次检查（应对初始在视口内的情况）
    window.addEventListener('load', function() {
        if (contentEl) {
            const rect = contentEl.getBoundingClientRect();
            const winHeight = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top < winHeight * 0.9) {
                contentEl.classList.add('visible');
            }
        }
    });

    // 点击滚动提示，平滑滚动到日志区域
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById('logContent');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

})();