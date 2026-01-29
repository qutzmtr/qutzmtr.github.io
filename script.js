// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加一些交互效果
    
    // 1. 播放按钮点击效果
    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', function() {
            // 模拟视频播放效果
            this.innerHTML = '<i class="fas fa-pause"></i>';
            this.style.background = 'rgba(255, 215, 0, 0.9)';
            this.querySelector('i').style.color = '#1E90FF';
            
            // 3秒后恢复原状（模拟视频播放）
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-play"></i>';
                this.style.background = 'rgba(255, 255, 255, 0.9)';
            }, 3000);
            
            // 显示提示
            showNotification('视频播放功能将在正式版中实现');
        });
    }
    
    // 2. 建设进度条动画
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        // 延迟启动进度条动画
        setTimeout(() => {
            progressFill.style.width = '85%';
            document.querySelector('.progress-text').textContent = '建设进度: 85%';
        }, 1000);
    }
    
    // 3. 历史项目悬停效果增强
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            // 添加一个微妙的放大效果
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
        
        // 点击历史项目显示详细信息
        item.addEventListener('click', function() {
            const date = this.querySelector('.history-date').textContent;
            const desc = this.querySelector('.history-desc').textContent;
            showNotification(`查看详情: ${date} - ${desc}`);
        });
    });
    
    // 4. 柠檬装饰元素悬停效果
    const lemons = document.querySelectorAll('.lemon, .bg-lemon');
    lemons.forEach(lemon => {
        lemon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        lemon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // 5. 社交媒体图标悬停效果
    const socialIcons = document.querySelectorAll('.social-icons a');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) rotate(10deg)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotate(0)';
        });
    });
    
    // 6. 页面滚动时更新进度条（模拟动态进度）
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        
        // 将滚动百分比转换为建设进度（65%-95%之间）
        if (progressFill) {
            const baseProgress = 65;
            const additionalProgress = scrollPercent * 30;
            const totalProgress = Math.min(baseProgress + additionalProgress, 95);
            
            progressFill.style.width = `${totalProgress}%`;
            document.querySelector('.progress-text').textContent = 
                `建设进度: ${Math.round(totalProgress)}%`;
        }
    });
    
    // 7. 显示通知函数
    function showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(30, 144, 255, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 600;
            transform: translateX(150%);
            transition: transform 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 3秒后隐藏并移除通知
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    
    // 8. 初始化页面时显示欢迎消息
    setTimeout(() => {
        showNotification('欢迎来到柠檬资源站！网站正在建设中...');
    }, 1000);
    
    // 9. 为logo添加点击效果
    const logo = document.querySelector('.logo-placeholder');
    if (logo) {
        logo.addEventListener('click', function() {
            this.style.transform = 'scale(1.1) rotate(10deg)';
            showNotification('柠檬资源站 - 清新创意，分享快乐');
            
            setTimeout(() => {
                this.style.transform = 'scale(1) rotate(0)';
            }, 500);
        });
    }
    
    // 10. 页面加载动画
    const elementsToAnimate = document.querySelectorAll('.content-box, .video-container, .footer');
    elementsToAnimate.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});