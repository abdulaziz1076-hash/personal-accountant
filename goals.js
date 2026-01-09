// goals.js - إدارة الأهداف المالية
class GoalsManager {
    constructor() {
        this.goals = [];
        this.loadGoals();
    }
    
    // إنشاء هدف جديد
    createGoal(title, targetAmount, deadline, category, initialAmount = 0) {
        const goal = {
            id: Date.now(),
            title: title,
            targetAmount: targetAmount,
            currentAmount: initialAmount,
            deadline: deadline,
            category: category,
            createdDate: new Date().toISOString(),
            progress: (initialAmount / targetAmount) * 100,
            status: this.getGoalStatus(deadline, initialAmount, targetAmount)
        };
        
        this.goals.push(goal);
        this.saveGoals();
        return goal;
    }
    
    // تحديث التقدم
    updateProgress(goalId, amount) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.currentAmount += amount;
            goal.progress = (goal.currentAmount / goal.targetAmount) * 100;
            goal.status = this.getGoalStatus(goal.deadline, goal.currentAmount, goal.targetAmount);
            this.saveGoals();
            return goal;
        }
        return null;
    }
    
    // الحصول على حالة الهدف
    getGoalStatus(deadline, current, target) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        const percentage = (current / target) * 100;
        
        if (percentage >= 100) {
            return 'achieved';
        } else if (daysLeft < 0) {
            return 'expired';
        } else if (daysLeft < 7 && percentage < 100) {
            return 'urgent';
        } else if (percentage >= 80) {
            return 'near';
        } else if (percentage >= 50) {
            return 'moderate';
        } else {
            return 'new';
        }
    }
    
    // عرض الأهداف
    displayGoals() {
        const container = document.getElementById('goalsContainer');
        if (!container) return;
        
        let html = '';
        
        if (this.goals.length === 0) {
            html = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-bullseye fa-3x mb-3"></i>
                    <h5>لا توجد أهداف مالية</h5>
                    <p>أنشئ هدفك الأول لتبدأ بالتخطيط للمستقبل</p>
                    <button class="btn btn-primary" onclick="showAddGoalModal()">
                        <i class="fas fa-plus"></i> إضافة هدف جديد
                    </button>
                </div>
            `;
        } else {
            // ترتيب الأهداف حسب الأولوية
            const sortedGoals = [...this.goals].sort((a, b) => {
                const priority = { 'urgent': 0, 'near': 1, 'moderate': 2, 'new': 3, 'achieved': 4, 'expired': 5 };
                return priority[a.status] - priority[b.status];
            });
            
            sortedGoals.forEach(goal => {
                const statusClass = this.getStatusClass(goal.status);
                const statusText = this.getStatusText(goal.status);
                const daysLeft = this.calculateDaysLeft(goal.deadline);
                
                html += `
                    <div class="card goal-card mb-3 border-start border-5 ${statusClass.replace('bg-', 'border-')}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 class="card-title mb-1">${goal.title}</h5>
                                    <div class="d-flex flex-wrap gap-2 mt-2">
                                        <span class="badge bg-secondary">
                                            <i class="fas fa-tag"></i> ${goal.category}
                                        </span>
                                        <span class="badge bg-info">
                                            <i class="fas fa-calendar"></i> ${this.formatDate(goal.deadline)}
                                        </span>
                                        <span class="badge ${statusClass}">${statusText}</span>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <div class="h4 text-primary">${goal.currentAmount.toFixed(2)} ر.س</div>
                                    <small class="text-muted">من ${goal.targetAmount.toFixed(2)} ر.س</small>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <small>${goal.progress.toFixed(1)}% مكتمل</small>
                                    <small>${daysLeft} يوم متبقي</small>
                                </div>
                                <div class="progress" style="height: 12px;">
                                    <div class="progress-bar ${this.getProgressBarClass(goal.status)}" 
                                         style="width: ${Math.min(goal.progress, 100)}%">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <small class="text-muted d-block">المبلغ المتبقي</small>
                                    <strong class="text-success">
                                        ${(goal.targetAmount - goal.currentAmount).toFixed(2)} ر.س
                                    </strong>
                                </div>
                                
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-success" onclick="addToGoal(${goal.id})">
                                        <i class="fas fa-plus"></i> إضافة
                                    </button>
                                    <button class="btn btn-sm btn-outline-primary" onclick="editGoal(${goal.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGoal(${goal.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // إضافة زر إنشاء هدف جديد
            html += `
                <div class="text-center mt-4">
                    <button class="btn btn-primary" onclick="showAddGoalModal()">
                        <i class="fas fa-plus"></i> إضافة هدف جديد
                    </button>
                </div>
            `;
            
            // ملخص الأهداف
            const summary = this.getGoalsSummary();
            const summaryHTML = `
                <div class="card bg-light mb-4">
                    <div class="card-body">
                        <h6 class="card-title"><i class="fas fa-chart-line"></i> ملخص الأهداف</h6>
                        <div class="row text-center">
                            <div class="col">
                                <div class="h4 text-success">${summary.achieved}</div>
                                <small class="text-muted">متحقق</small>
                            </div>
                            <div class="col">
                                <div class="h4 text-primary">${summary.inProgress}</div>
                                <small class="text-muted">قيد التنفيذ</small>
                            </div>
                            <div class="col">
                                <div class="h4 text-warning">${summary.totalValue.toFixed(2)} ر.س</div>
                                <small class="text-muted">القيمة الإجمالية</small>
                            </div>
                            <div class="col">
                                <div class="h4 text-info">${summary.averageProgress.toFixed(1)}%</div>
                                <small class="text-muted">متوسط التقدم</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = summaryHTML + html;
        }
    }
    
    // حساب الأيام المتبقية
    calculateDaysLeft(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // الحصول على ملخص الأهداف
    getGoalsSummary() {
        const achieved = this.goals.filter(g => g.status === 'achieved').length;
        const inProgress = this.goals.filter(g => g.status !== 'achieved' && g.status !== 'expired').length;
        const totalValue = this.goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const averageProgress = this.goals.length > 0 
            ? this.goals.reduce((sum, g) => sum + g.progress, 0) / this.goals.length 
            : 0;
        
        return { achieved, inProgress, totalValue, averageProgress };
    }
    
    // فئات CSS للحالة
    getStatusClass(status) {
        switch(status) {
            case 'achieved': return 'bg-success';
            case 'urgent': return 'bg-danger';
            case 'near': return 'bg-warning';
            case 'moderate': return 'bg-info';
            case 'new': return 'bg-primary';
            case 'expired': return 'bg-secondary';
            default: return 'bg-light';
        }
    }
    
    // نص الحالة
    getStatusText(status) {
        const texts = {
            'achieved': 'متحقق',
            'urgent': 'عاجل',
            'near': 'قريب',
            'moderate': 'متوسط',
            'new': 'جديد',
            'expired': 'منتهي'
        };
        return texts[status] || status;
    }
    
    // فئة شريط التقدم
    getProgressBarClass(status) {
        switch(status) {
            case 'achieved': return 'bg-success';
            case 'urgent': return 'bg-danger';
            case 'near': return 'bg-warning';
            case 'moderate': return 'bg-info';
            default: return 'bg-primary';
        }
    }
    
    // تنسيق التاريخ
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }
    
    // تحميل الأهداف
    loadGoals() {
        const saved = localStorage.getItem('financialGoals');
        if (saved) {
            this.goals = JSON.parse(saved);
        }
    }
    
    // حفظ الأهداف
    saveGoals() {
        localStorage.setItem('financialGoals', JSON.stringify(this.goals));
    }
    
    // حذف هدف
    deleteGoal(id) {
        if (confirm('هل أنت متأكد من حذف هذا الهدف؟')) {
            this.goals = this.goals.filter(g => g.id !== id);
            this.saveGoals();
            this.displayGoals();
        }
    }
}

// تهيئة مدير الأهداف
const goalsManager = new GoalsManager();

// الدوال العامة للاستخدام
function showGoalsSection() {
    showSection('financialGoals');
    goalsManager.displayGoals();
}

function showAddGoalModal() {
    // ... (كود لعرض نموذج إضافة هدف)
    alert('سيتم إضافة نموذج إضافة الهدف هنا');
}

function addToGoal(goalId) {
    const amount = prompt('أدخل المبلغ الذي تريد إضافته للهدف:', '100');
    if (amount && !isNaN(amount)) {
        goalsManager.updateProgress(goalId, parseFloat(amount));
        goalsManager.displayGoals();
    }
}

function editGoal(id) {
    // ... (كود لتعديل الهدف)
    alert('تعديل الهدف: ' + id);
}
