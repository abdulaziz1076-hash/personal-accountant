// notifications.js - نظام التنبيهات والتذكيرات
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.loadNotifications();
    }
    
    // إضافة تنبيه جديد
    addNotification(type, title, message, priority = 'normal', action = null) {
        const notification = {
            id: Date.now(),
            type: type, // 'info', 'warning', 'success', 'danger'
            title: title,
            message: message,
            priority: priority, // 'low', 'normal', 'high', 'urgent'
            timestamp: new Date().toISOString(),
            read: false,
            action: action
        };
        
        this.notifications.unshift(notification); // إضافة في البداية
        this.saveNotifications();
        this.showToastNotification(notification);
        
        return notification;
    }
    
    // إشعارات تلقائية بناءً على البيانات
    generateAutomaticNotifications() {
        this.clearOldNotifications();
        
        // تنبيهات الميزانية
        if (typeof budgetManager !== 'undefined') {
            budgetManager.budgets.forEach(budget => {
                if (budget.status === 'warning' || budget.status === 'exceeded') {
                    this.addNotification(
                        'warning',
                        'تنبيه الميزانية',
                        `ميزانية "${budget.name}" قاربت على الإنتهاء (${((budget.actualSpent / budget.amount) * 100).toFixed(1)}%)`,
                        'high'
                    );
                }
            });
        }
        
        // تنبيهات الأهداف
        if (typeof goalsManager !== 'undefined') {
            goalsManager.goals.forEach(goal => {
                if (goal.status === 'urgent') {
                    this.addNotification(
                        'danger',
                        'هدف عاجل',
                        `الهدف "${goal.title}" يحتاج اهتماماً عاجلاً!`,
                        'urgent'
                    );
                } else if (goal.status === 'near') {
                    this.addNotification(
                        'info',
                        'هدف قريب',
                        `الهدف "${goal.title}" قارب على التحقق (${goal.progress.toFixed(1)}%)`,
                        'normal'
                    );
                }
            });
        }
        
        // تنبيهات الفواتير المتكررة (يمكن إضافتها لاحقاً)
        this.checkBillReminders();
    }
    
    // التحقق من تذكيرات الفواتير
    checkBillReminders() {
        const today = new Date();
        const upcomingBills = this.getUpcomingBills();
        
        upcomingBills.forEach(bill => {
            const daysUntilDue = Math.ceil((new Date(bill.dueDate) - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue === 1) {
                this.addNotification(
                    'danger',
                    'فاتورة مستحقة غداً',
                    `فاتورة ${bill.name} مستحقة الدفع غداً: ${bill.amount} ر.س`,
                    'urgent'
                );
            } else if (daysUntilDue === 3) {
                this.addNotification(
                    'warning',
                    'فاتورة مستحقة قريباً',
                    `فاتورة ${bill.name} مستحقة بعد 3 أيام: ${bill.amount} ر.س`,
                    'high'
                );
            } else if (daysUntilDue === 7) {
                this.addNotification(
                    'info',
                    'تذكير بالفواتير',
                    `فاتورة ${bill.name} مستحقة بعد أسبوع: ${bill.amount} ر.س`,
                    'normal'
                );
            }
        });
    }
    
    // الحصول على الفواتير القادمة (بيانات وهمية للتوضيح)
    getUpcomingBills() {
        // يمكن استبدال هذا بمصدر بيانات حقيقي
        return [
            { name: 'كهرباء', amount: 350, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
            { name: 'مياه', amount: 150, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
            { name: 'إنترنت', amount: 300, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }
        ];
    }
    
    // عرض التنبيهات
    displayNotifications() {
        const container = document.getElementById('notificationsContainer');
        const badge = document.getElementById('notificationBadge');
        
        if (!container) return;
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // تحديث العداد
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
        
        let html = '';
        
        if (this.notifications.length === 0) {
            html = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-bell-slash fa-3x mb-3"></i>
                    <h5>لا توجد تنبيهات</h5>
                    <p>كل شيء تحت السيطرة!</p>
                </div>
            `;
        } else {
            this.notifications.forEach(notification => {
                const typeClass = this.getTypeClass(notification.type);
                const priorityClass = this.getPriorityClass(notification.priority);
                const timeAgo = this.getTimeAgo(notification.timestamp);
                
                html += `
                    <div class="notification-item ${!notification.read ? 'unread' : ''} ${priorityClass}">
                        <div class="d-flex align-items-start">
                            <div class="notification-icon ${typeClass} me-3">
                                <i class="fas ${this.getTypeIcon(notification.type)}"></i>
                            </div>
                            <div class="flex-grow-1">
                                <div class="d-flex justify-content-between align-items-start mb-1">
                                    <h6 class="mb-0">${notification.title}</h6>
                                    <small class="text-muted">${timeAgo}</small>
                                </div>
                                <p class="mb-2">${notification.message}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="badge ${typeClass}">${this.getTypeText(notification.type)}</small>
                                    <div>
                                        <button class="btn btn-sm btn-outline-secondary" onclick="markAsRead(${notification.id})">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteNotification(${notification.id})">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // أزرار التحكم
            html += `
                <div class="mt-3 text-center">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="markAllAsRead()">
                        <i class="fas fa-check-double"></i> تعليم الكل كمقروء
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="clearAllNotifications()">
                        <i class="fas fa-trash"></i> حذف الكل
                    </button>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    // عرض تنبيه عائم
    showToastNotification(notification) {
        // إنشاء عنصر التنبيه
        const toast = document.createElement('div');
        toast.className = `toast-notification ${this.getTypeClass(notification.type)}`;
        toast.innerHTML = `
            <div class="toast-header">
                <i class="fas ${this.getTypeIcon(notification.type)} me-2"></i>
                <strong>${notification.title}</strong>
                <small class="ms-auto">الآن</small>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
            <div class="toast-body">
                ${notification.message}
            </div>
        `;
        
        // إضافة إلى الصفحة
        const container = document.getElementById('toastContainer') || this.createToastContainer();
        container.appendChild(toast);
        
        // إزالة تلقائية بعد 5 ثواني
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
    
    // إنشاء حاوية التنبيهات العائمة
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    // تصنيف النوع
    getTypeClass(type) {
        const classes = {
            'info': 'bg-info text-white',
            'warning': 'bg-warning text-dark',
            'success': 'bg-success text-white',
            'danger': 'bg-danger text-white'
        };
        return classes[type] || 'bg-secondary text-white';
    }
    
    // نص النوع
    getTypeText(type) {
        const texts = {
            'info': 'معلومة',
            'warning': 'تحذير',
            'success': 'نجاح',
            'danger': 'مهم'
        };
        return texts[type] || type;
    }
    
    // أيقونة النوع
    getTypeIcon(type) {
        const icons = {
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle',
            'success': 'fa-check-circle',
            'danger': 'fa-exclamation-circle'
        };
        return icons[type] || 'fa-bell';
    }
    
    // تصنيف الأولوية
    getPriorityClass(priority) {
        return `priority-${priority}`;
    }
    
    // حساب الوقت المنقضي
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
    
    // تعليم كمقروء
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.displayNotifications();
        }
    }
    
    // تعليم الكل كمقروء
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.displayNotifications();
    }
    
    // حذف تنبيه
    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.displayNotifications();
    }
    
    // حذف جميع التنبيهات
    clearAllNotifications() {
        if (confirm('هل أنت متأكد من حذف جميع التنبيهات؟')) {
            this.notifications = [];
            this.saveNotifications();
            this.displayNotifications();
        }
    }
    
    // حذف التنبيهات القديمة
    clearOldNotifications() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        this.notifications = this.notifications.filter(n => 
            new Date(n.timestamp) > sevenDaysAgo
        );
        this.saveNotifications();
    }
    
    // تحميل التنبيهات
    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    }
    
    // حفظ التنبيهات
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
}

// تهيئة مدير التنبيهات
const notificationManager = new NotificationManager();

// الدوال العامة للاستخدام
function showNotifications() {
    showSection('notifications');
    notificationManager.displayNotifications();
}

// إنشاء تنبيهات تلقائية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // انتظر قليلاً ثم أنشئ تنبيهات تلقائية
    setTimeout(() => {
        notificationManager.generateAutomaticNotifications();
    }, 2000);
    
    // تحديث التنبيهات كل 5 دقائق
    setInterval(() => {
        notificationManager.generateAutomaticNotifications();
    }, 5 * 60 * 1000);
});

// CSS إضافي للتنبيهات
const notificationStyles = `
<style>
.notification-item {
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    background-color: white;
    border-left: 4px solid #dee2e6;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.notification-item.unread {
    border-left-color: #4361ee;
    background-color: #f8f9ff;
}

.notification-item:hover {
    transform: translateX(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.priority-urgent {
    border-left-color: #dc3545 !important;
}

.priority-high {
    border-left-color: #fd7e14 !important;
}

.priority-normal {
    border-left-color: #0dcaf0 !important;
}

.priority-low {
    border-left-color: #6c757d !important;
}

.toast-notification {
    margin-bottom: 1rem;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
</style>
`;

// إضافة الأنماط إلى الصفحة
document.head.insertAdjacentHTML('beforeend', notificationStyles);
