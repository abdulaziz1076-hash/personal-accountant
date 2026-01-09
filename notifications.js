/**
 * المحاسب الشخصي - نظام التنبيهات والتذكيرات الذكي
 * الإصدار: 2.0.0
 * المميزات: تنبيهات ذكية، تذكيرات، إشعارات
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.settings = {
            enabled: true,
            sound: true,
            desktop: false,
            email: false,
            push: false,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '07:00'
            },
            categories: {
                budget: true,
                goal: true,
                bill: true,
                transaction: true,
                system: true
            }
        };
        
        this.loadData();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupPeriodicChecks();
        this.createNotificationContainer();
        this.registerServiceWorker();
    }
    
    setupEventListeners() {
        // تحديث عند تغيير المعاملات
        if (typeof window.transactions !== 'undefined') {
            window.addEventListener('transactionAdded', () => {
                setTimeout(() => this.checkTransactionAlerts(), 1000);
            });
        }
        
        // تحديث عند تغيير الميزانية
        if (typeof budgetManager !== 'undefined') {
            window.addEventListener('budgetUpdated', () => {
                setTimeout(() => this.checkBudgetAlerts(), 1000);
            });
        }
        
        // تحديث عند تغيير الأهداف
        if (typeof goalsManager !== 'undefined') {
            window.addEventListener('goalUpdated', () => {
                setTimeout(() => this.checkGoalAlerts(), 1000);
            });
        }
        
        // الاستماع لأحداث الإشعارات
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                const notificationId = e.target.closest('.notification-item').dataset.id;
                this.markAsRead(notificationId);
            }
        });
    }
    
    setupPeriodicChecks() {
        // فحص يومي
        setInterval(() => {
            this.checkDailyAlerts();
        }, 24 * 60 * 60 * 1000);
        
        // فحص كل ساعة
        setInterval(() => {
            this.checkHourlyAlerts();
        }, 60 * 60 * 1000);
        
        // فحص كل 15 دقيقة للتنبيهات العاجلة
        setInterval(() => {
            this.checkUrgentAlerts();
        }, 15 * 60 * 1000);
    }
    
    createNotificationContainer() {
        if (!document.getElementById('notificationPanel')) {
            const panel = document.createElement('div');
            panel.id = 'notificationPanel';
            panel.className = 'notification-panel';
            panel.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                width: 350px;
                max-height: 500px;
                overflow-y: auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 9999;
                display: none;
                border: 1px solid #dee2e6;
            `;
            document.body.appendChild(panel);
        }
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registered');
            }).catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
        }
    }
    
    // ==================== إدارة الإشعارات ====================
    addNotification(type, title, message, options = {}) {
        if (!this.settings.enabled) return null;
        
        // التحقق من ساعات الهدوء
        if (this.isQuietHours() && options.priority !== 'urgent') {
            return null;
        }
        
        // التحقق من تفعيل الفئة
        if (!this.isCategoryEnabled(type)) {
            return null;
        }
        
        const notification = {
            id: Date.now() + Math.random(),
            type: type,
            title: title,
            message: message,
            priority: options.priority || 'normal',
            category: options.category || 'general',
            icon: options.icon || this.getTypeIcon(type),
            color: options.color || this.getTypeColor(type),
            action: options.action || null,
            data: options.data || {},
            read: false,
            timestamp: new Date().toISOString(),
            expiresAt: options.expiresAt || this.calculateExpiry(options.priority),
            source: options.source || 'system'
        };
        
        this.notifications.unshift(notification);
        this.saveData();
        
        // عرض الإشعار
        this.displayNotification(notification);
        
        // تشغيل الصوت
        if (this.settings.sound && options.playSound !== false) {
            this.playNotificationSound(notification.priority);
        }
        
        // إرسال إشعار سطح المكتب
        if (this.settings.desktop && this.checkDesktopPermission()) {
            this.showDesktopNotification(notification);
        }
        
        // تحديث العداد
        this.updateBadgeCount();
        
        return notification;
    }
    
    getTypeIcon(type) {
        const icons = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'danger': 'fas fa-exclamation-circle',
            'budget': 'fas fa-chart-pie',
            'goal': 'fas fa-bullseye',
            'bill': 'fas fa-file-invoice',
            'transaction': 'fas fa-exchange-alt',
            'reminder': 'fas fa-bell',
            'system': 'fas fa-cog'
        };
        return icons[type] || 'fas fa-bell';
    }
    
    getTypeColor(type) {
        const colors = {
            'info': '#4cc9f0',
            'success': '#2ec4b6',
            'warning': '#ff9f1c',
            'danger': '#e71d36',
            'budget': '#4361ee',
            'goal': '#7209b7',
            'bill': '#f72585',
            'transaction': '#3a0ca3',
            'reminder': '#ff9f1c',
            'system': '#6c757d'
        };
        return colors[type] || '#4361ee';
    }
    
    calculateExpiry(priority) {
        const now = new Date();
        switch(priority) {
            case 'urgent':
                now.setHours(now.getHours() + 24); // 24 ساعة
                break;
            case 'high':
                now.setHours(now.getHours() + 72); // 3 أيام
                break;
            case 'normal':
                now.setDate(now.getDate() + 7); // أسبوع
                break;
            default:
                now.setDate(now.getDate() + 3); // 3 أيام
        }
        return now.toISOString();
    }
    
    isQuietHours() {
        if (!this.settings.quietHours.enabled) return false;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMinute] = this.settings.quietHours.start.split(':').map(Number);
        const [endHour, endMinute] = this.settings.quietHours.end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        if (startTime < endTime) {
            return currentTime >= startTime && currentTime < endTime;
        } else {
            return currentTime >= startTime || currentTime < endTime;
        }
    }
    
    isCategoryEnabled(type) {
        const categoryMap = {
            'budget': 'budget',
            'goal': 'goal',
            'bill': 'bill',
            'transaction': 'transaction',
            'system': 'system'
        };
        
        const category = categoryMap[type] || 'system';
        return this.settings.categories[category] !== false;
    }
    
    // ==================== التنبيهات التلقائية ====================
    checkDailyAlerts() {
        this.generateBudgetAlerts();
        this.generateGoalAlerts();
        this.checkBillReminders();
        this.generateFinancialInsights();
        this.cleanupOldNotifications();
    }
    
    checkHourlyAlerts() {
        this.checkUrgentTransactions();
        this.checkSystemHealth();
    }
    
    checkUrgentAlerts() {
        // التحقق من التنبيهات العاجلة فقط
        const urgentNotifications = this.notifications.filter(n => 
            n.priority === 'urgent' && !n.read
        );
        
        if (urgentNotifications.length > 0) {
            // تحديث العرض للتنبيهات العاجلة
            this.updateNotificationPanel();
        }
    }
    
    generateBudgetAlerts() {
        if (typeof budgetManager === 'undefined') return;
        
        budgetManager.budgets.forEach(budget => {
            const percentage = (budget.actualSpent / budget.amount) * 100;
            
            if (percentage >= 100) {
                this.addNotification(
                    'danger',
                    'تجاوز الميزانية',
                    `ميزانية "${budget.name}" تم تجاوزها بالكامل`,
                    {
                        priority: 'high',
                        category: 'budget',
                        data: { budgetId: budget.id },
                        action: { type: 'view_budget', id: budget.id }
                    }
                );
            } else if (percentage >= 90) {
                this.addNotification(
                    'warning',
                    'اقتراب من نهاية الميزانية',
                    `ميزانية "${budget.name}" وصلت إلى ${percentage.toFixed(1)}%`,
                    {
                        priority: 'normal',
                        category: 'budget',
                        data: { budgetId: budget.id }
                    }
                );
            } else if (percentage >= 80) {
                this.addNotification(
                    'warning',
                    'تنبيه الميزانية',
                    `ميزانية "${budget.name}" اقتربت من النهاية`,
                    {
                        priority: 'low',
                        category: 'budget'
                    }
                );
            }
            
            // تنبيه اقتراب نهاية الفترة
            const daysRemaining = budget.daysRemaining;
            if (daysRemaining <= 3) {
                this.addNotification(
                    'info',
                    'ميزانية تنتهي قريباً',
                    `ميزانية "${budget.name}" تنتهي بعد ${daysRemaining} أيام`,
                    {
                        priority: 'normal',
                        category: 'budget'
                    }
                );
            }
        });
    }
    
    generateGoalAlerts() {
        if (typeof goalsManager === 'undefined') return;
        
        goalsManager.goals.forEach(goal => {
            if (goal.status === 'urgent') {
                this.addNotification(
                    'danger',
                    'هدف عاجل',
                    `الهدف "${goal.title}" يحتاج اهتماماً عاجلاً`,
                    {
                        priority: 'urgent',
                        category: 'goal',
                        data: { goalId: goal.id },
                        action: { type: 'view_goal', id: goal.id }
                    }
                );
            } else if (goal.status === 'behind') {
                this.addNotification(
                    'warning',
                    'هدف متأخر',
                    `الهدف "${goal.title}" متأخر عن الجدول`,
                    {
                        priority: 'high',
                        category: 'goal'
                    }
                );
            } else if (goal.status === 'near_completion') {
                this.addNotification(
                    'success',
                    'هدف على وشك الإنجاز',
                    `الهدف "${goal.title}" اقترب من التحقق`,
                    {
                        priority: 'normal',
                        category: 'goal'
                    }
                );
            }
            
            // تنبيه المعالم
            goal.milestones.forEach(milestone => {
                if (milestone.achieved && !milestone.notified) {
                    this.addNotification(
                        'success',
                        'معلم تم إنجازه',
                        `وصلت إلى ${milestone.percentage}% في هدف "${goal.title}"`,
                        {
                            priority: 'normal',
                            category: 'goal'
                        }
                    );
                    milestone.notified = true;
                }
            });
        });
    }
    
    checkBillReminders() {
        const upcomingBills = this.getUpcomingBills();
        
        upcomingBills.forEach(bill => {
            const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue === 0) {
                this.addNotification(
                    'danger',
                    'فاتورة مستحقة اليوم',
                    `فاتورة ${bill.name} مستحقة الدفع اليوم: ${bill.amount} ر.س`,
                    {
                        priority: 'urgent',
                        category: 'bill',
                        data: { billId: bill.id }
                    }
                );
            } else if (daysUntilDue === 1) {
                this.addNotification(
                    'danger',
                    'فاتورة مستحقة غداً',
                    `فاتورة ${bill.name} مستحقة الدفع غداً: ${bill.amount} ر.س`,
                    {
                        priority: 'high',
                        category: 'bill'
                    }
                );
            } else if (daysUntilDue === 3) {
                this.addNotification(
                    'warning',
                    'فاتورة مستحقة قريباً',
                    `فاتورة ${bill.name} مستحقة بعد 3 أيام: ${bill.amount} ر.س`,
                    {
                        priority: 'normal',
                        category: 'bill'
                    }
                );
            } else if (daysUntilDue === 7) {
                this.addNotification(
                    'info',
                    'تذكير بالفواتير',
                    `فاتورة ${bill.name} مستحقة بعد أسبوع: ${bill.amount} ر.س`,
                    {
                        priority: 'low',
                        category: 'bill'
                    }
                );
            }
        });
    }
    
    getUpcomingBills() {
        // هذه بيانات وهمية للتوضيح، يمكن استبدالها بمصدر بيانات حقيقي
        return [
            { 
                id: 1, 
                name: 'كهرباء', 
                amount: 350, 
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'فواتير',
                recurring: true,
                frequency: 'monthly'
            },
            { 
                id: 2, 
                name: 'مياه', 
                amount: 150, 
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'فواتير',
                recurring: true
            },
            { 
                id: 3, 
                name: 'إنترنت', 
                amount: 300, 
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'فواتير',
                recurring: true
            }
        ];
    }
    
    generateFinancialInsights() {
        if (typeof window.transactions === 'undefined' || window.transactions.length === 0) return;
        
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const monthlyExpenses = window.transactions
            .filter(t => t.type === 'expense' && new Date(t.date) >= firstDayOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const averageMonthlyExpense = this.getAverageMonthlyExpense();
        
        if (monthlyExpenses > averageMonthlyExpense * 1.5) {
            this.addNotification(
                'warning',
                'إنفاق مرتفع',
                `إنفاقك هذا الشهر أعلى من المتوسط بنسبة ${((monthlyExpenses / averageMonthlyExpense - 1) * 100).toFixed(1)}%`,
                {
                    priority: 'normal',
                    category: 'transaction'
                }
            );
        }
        
        // تنبيه بوجود معاملات كبيرة
        const largeTransactions = window.transactions
            .filter(t => t.amount > 1000)
            .slice(0, 3);
        
        largeTransactions.forEach(transaction => {
            this.addNotification(
                'info',
                'معاملة كبيرة',
                `معاملة كبيرة: ${transaction.name} - ${transaction.amount} ر.س`,
                {
                    priority: 'low',
                    category: 'transaction'
                }
            );
        });
    }
    
    getAverageMonthlyExpense() {
        if (typeof window.transactions === 'undefined') return 0;
        
        const expensesByMonth = {};
        window.transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                const date = new Date(transaction.date);
                const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + transaction.amount;
            }
        });
        
        const monthlyExpenses = Object.values(expensesByMonth);
        if (monthlyExpenses.length === 0) return 0;
        
        return monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length;
    }
    
    checkTransactionAlerts() {
        // التحقق من المعاملات المشبوهة
        const recentTransactions = window.transactions?.slice(0, 10) || [];
        
        recentTransactions.forEach(transaction => {
            if (transaction.amount < 0) {
                this.addNotification(
                    'danger',
                    'معاملة غير صالحة',
                    `مبلغ سلبي في معاملة: ${transaction.name}`,
                    {
                        priority: 'high',
                        category: 'transaction'
                    }
                );
            }
        });
    }
    
    checkSystemHealth() {
        // التحقق من سعة التخزين
        const storageUsed = this.getStorageUsage();
        if (storageUsed > 80) {
            this.addNotification(
                'warning',
                'سعة التخزين',
                `سعة التخزين قاربت على الامتلاء: ${storageUsed.toFixed(1)}%`,
                {
                    priority: 'normal',
                    category: 'system'
                }
            );
        }
        
        // التحقق من آخر نسخة احتياطية
        const lastBackup = localStorage.getItem('lastBackup');
        if (lastBackup) {
            const daysSinceBackup = Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceBackup > 7) {
                this.addNotification(
                    'info',
                    'تذكير النسخ الاحتياطي',
                    `آخر نسخة احتياطية كانت قبل ${daysSinceBackup} أيام`,
                    {
                        priority: 'low',
                        category: 'system'
                    }
                );
            }
        }
    }
    
    getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // كل حرف = 2 بايت في UTF-16
            }
        }
        return (total / (5 * 1024 * 1024)) * 100; // نسبة من 5MB
    }
    
    // ==================== عرض الإشعارات ====================
    displayNotification(notification) {
        // إنشاء عنصر الإشعار
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-toast ${notification.priority}`;
        notificationElement.dataset.id = notification.id;
        notificationElement.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon" style="color: ${notification.color};">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-title">
                    <strong>${notification.title}</strong>
                    <small>${this.getTimeAgo(notification.timestamp)}</small>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">
                ${notification.message}
            </div>
            ${notification.action ? `
                <div class="notification-footer">
                    <button class="btn btn-sm btn-primary" onclick="handleNotificationAction('${notification.id}')">
                        عرض التفاصيل
                    </button>
                </div>
            ` : ''}
        `;
        
        // إضافة إلى الحاوية
        const container = document.getElementById('toastContainer') || this.createToastContainer();
        container.appendChild(notificationElement);
        
        // إزالة تلقائية بعد الوقت المحدد
        setTimeout(() => {
            if (notificationElement.parentElement) {
                notificationElement.remove();
            }
        }, notification.priority === 'urgent' ? 10000 : 5000);
    }
    
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    showDesktopNotification(notification) {
        if (!('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
            const desktopNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.png',
                tag: notification.id,
                requireInteraction: notification.priority === 'urgent'
            });
            
            desktopNotification.onclick = () => {
                window.focus();
                this.markAsRead(notification.id);
                this.handleNotificationAction(notification.id);
            };
            
            setTimeout(() => desktopNotification.close(), 5000);
        }
    }
    
    checkDesktopPermission() {
        if (!('Notification' in window)) return false;
        
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        return Notification.permission === 'granted';
    }
    
    playNotificationSound(priority) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        let frequency = 800;
        let duration = 0.3;
        
        switch(priority) {
            case 'urgent':
                frequency = 1000;
                duration = 0.5;
                break;
            case 'high':
                frequency = 900;
                duration = 0.4;
                break;
            case 'normal':
                frequency = 800;
                duration = 0.3;
                break;
            default:
                frequency = 700;
                duration = 0.2;
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // ==================== لوحة الإشعارات ====================
    showNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.style.display = 'block';
            this.updateNotificationPanel();
            this.markAllAsRead();
        }
    }
    
    hideNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    updateNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (!panel) return;
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        let html = `
            <div class="notification-panel-header">
                <h6>الإشعارات ${unreadCount > 0 ? `<span class="badge bg-danger">${unreadCount}</span>` : ''}</h6>
                <button class="btn btn-sm btn-link" onclick="notificationManager.markAllAsRead()">
                    تعليم الكل كمقروء
                </button>
            </div>
            <div class="notification-panel-body">
        `;
        
        if (this.notifications.length === 0) {
            html += `
                <div class="text-center py-4">
                    <i class="fas fa-bell-slash fa-2x text-muted mb-3"></i>
                    <p class="text-muted">لا توجد إشعارات</p>
                </div>
            `;
        } else {
            const recentNotifications = this.notifications.slice(0, 20);
            
            html += recentNotifications.map(notification => `
                <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                    <div class="notification-item-icon" style="color: ${notification.color};">
                        <i class="${notification.icon}"></i>
                    </div>
                    <div class="notification-item-content">
                        <div class="notification-item-title">
                            <strong>${notification.title}</strong>
                            <small>${this.getTimeAgo(notification.timestamp)}</small>
                        </div>
                        <div class="notification-item-message">
                            ${notification.message}
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        html += `
            </div>
            <div class="notification-panel-footer">
                <button class="btn btn-sm btn-outline-danger w-100" onclick="notificationManager.clearAllNotifications()">
                    <i class="fas fa-trash me-1"></i>حذف جميع الإشعارات
                </button>
            </div>
        `;
        
        panel.innerHTML = html;
    }
    
    // ==================== إدارة الإشعارات ====================
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id == id);
        if (notification) {
            notification.read = true;
            this.saveData();
            this.updateBadgeCount();
            return true;
        }
        return false;
    }
    
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveData();
        this.updateBadgeCount();
        this.updateNotificationPanel();
    }
    
    deleteNotification(id) {
        const index = this.notifications.findIndex(n => n.id == id);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.saveData();
            this.updateBadgeCount();
            return true;
        }
        return false;
    }
    
    clearAllNotifications() {
        if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
            this.notifications = [];
            this.saveData();
            this.updateBadgeCount();
            this.updateNotificationPanel();
        }
    }
    
    cleanupOldNotifications() {
        const now = new Date();
        this.notifications = this.notifications.filter(notification => {
            if (notification.expiresAt) {
                return new Date(notification.expiresAt) > now;
            }
            return true;
        });
        this.saveData();
    }
    
    updateBadgeCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadge');
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    // ==================== معالجة الإجراءات ====================
    handleNotificationAction(notificationId) {
        const notification = this.notifications.find(n => n.id == notificationId);
        if (!notification || !notification.action) return;
        
        switch(notification.action.type) {
            case 'view_budget':
                showSection('budgetPlanner');
                if (typeof budgetManager !== 'undefined') {
                    setTimeout(() => {
                        // يمكن إضافة منطق للتركيز على الميزانية المحددة
                    }, 100);
                }
                break;
                
            case 'view_goal':
                showSection('financialGoals');
                if (typeof goalsManager !== 'undefined') {
                    setTimeout(() => {
                        // يمكن إضافة منطق للتركيز على الهدف المحدد
                    }, 100);
                }
                break;
                
            case 'view_transaction':
                showSection('transactions');
                break;
                
            default:
                console.log('Action not implemented:', notification.action.type);
        }
        
        this.markAsRead(notificationId);
    }
    
    // ==================== دوال مساعدة ====================
    getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
        if (diffHours < 24) return `قبل ${diffHours} ساعة`;
        if (diffDays < 7) return `قبل ${diffDays} يوم`;
        return past.toLocaleDateString('ar-SA');
    }
    
    // ==================== إدارة البيانات ====================
    loadData() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            try {
                this.notifications = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading notifications:', error);
                this.notifications = [];
            }
        }
        
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                console.error('Error loading notification settings:', error);
            }
        }
    }
    
    saveData() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    }
    
    // ==================== الإعدادات ====================
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveData();
        return this.settings;
    }
    
    getSettings() {
        return this.settings;
    }
    
    // ==================== التقارير ====================
    getNotificationStats() {
        const total = this.notifications.length;
        const read = this.notifications.filter(n => n.read).length;
        const unread = total - read;
        
        const byType = {};
        const byPriority = {};
        const byDay = {};
        
        this.notifications.forEach(notification => {
            // حسب النوع
            byType[notification.type] = (byType[notification.type] || 0) + 1;
            
            // حسب الأولوية
            byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
            
            // حسب اليوم
            const date = new Date(notification.timestamp).toISOString().split('T')[0];
            byDay[date] = (byDay[date] || 0) + 1;
        });
        
        return {
            total,
            read,
            unread,
            readPercentage: total > 0 ? (read / total * 100).toFixed(1) : 0,
            byType,
            byPriority,
            byDay,
            recentActivity: this.notifications.slice(0, 10)
        };
    }
}

// ==================== التهيئة العالمية ====================
const notificationManager = new NotificationManager();

// الدوال العامة
window.showNotifications = function() {
    showSection('notifications');
    setTimeout(() => {
        if (typeof notificationManager !== 'undefined') {
            notificationManager.updateNotificationPanel();
        }
    }, 100);
};

window.handleNotificationAction = function(notificationId) {
    notificationManager.handleNotificationAction(notificationId);
};

window.toggleNotificationPanel = function() {
    const panel = document.getElementById('notificationPanel');
    if (panel && panel.style.display === 'block') {
        notificationManager.hideNotificationPanel();
    } else {
        notificationManager.showNotificationPanel();
    }
};

// التصدير
window.notificationManager = notificationManager;

// إضافة الأنماط
const notificationStyles = `
<style>
.notification-toast {
    background: white;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    border-left: 4px solid;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
}

.notification-toast.urgent {
    border-left-color: #e71d36;
    background: linear-gradient(135deg, #fff, #ffeaea);
}

.notification-toast.high {
    border-left-color: #ff9f1c;
    background: linear-gradient(135deg, #fff, #fff4e6);
}

.notification-toast.normal {
    border-left-color: #4cc9f0;
    background: linear-gradient(135deg, #fff, #f0f9ff);
}

.notification-toast.low {
    border-left-color: #6c757d;
    background: linear-gradient(135deg, #fff, #f8f9fa);
}

.notification-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.notification-icon {
    font-size: 1.2rem;
    margin-left: 10px;
}

.notification-title {
    flex-grow: 1;
}

.notification-title strong {
    display: block;
    font-size: 0.95rem;
}

.notification-title small {
    color: #6c757d;
    font-size: 0.8rem;
}

.notification-close {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    font-size: 0.9rem;
}

.notification-body {
    font-size: 0.9rem;
    color: #495057;
    margin-bottom: 10px;
}

.notification-footer {
    text-align: left;
}

.notification-panel {
    font-family: 'Tajawal', sans-serif;
}

.notification-panel-header {
    padding: 15px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    border-radius: 10px 10px 0 0;
}

.notification-panel-header h6 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification-panel-body {
    padding: 10px;
    max-height: 400px;
    overflow-y: auto;
}

.notification-item {
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: flex-start;
    border: 1px solid transparent;
}

.notification-item:hover {
    background: #f8f9fa;
    border-color: #dee2e6;
}

.notification-item.unread {
    background: #f0f7ff;
    border-left: 3px solid #4361ee;
}

.notification-item-icon {
    margin-left: 10px;
    font-size: 1.2rem;
    margin-top: 2px;
}

.notification-item-content {
    flex-grow: 1;
}

.notification-item-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 5px;
}

.notification-item-title strong {
    font-size: 0.9rem;
}

.notification-item-title small {
    color: #6c757d;
    font-size: 0.8rem;
    white-space: nowrap;
}

.notification-item-message {
    font-size: 0.85rem;
    color: #495057;
    line-height: 1.4;
}

.notification-panel-footer {
    padding: 15px;
    border-top: 1px solid #dee2e6;
    background: #f8f9fa;
    border-radius: 0 0 10px 10px;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .notification-toast {
        max-width: calc(100vw - 40px);
    }
    
    .notification-panel {
        width: calc(100vw - 40px);
        right: 10px;
    }
}
</style>
`;

// إضافة الأنماط إلى الصفحة
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// إنشاء تنبيهات تلقائية عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        notificationManager.checkDailyAlerts();
        notificationManager.updateBadgeCount();
    }, 3000);
});

console.log('✅ Notification Manager loaded successfully');
