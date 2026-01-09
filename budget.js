// budget.js - إدارة الميزانية والتخطيط
class BudgetManager {
    constructor() {
        this.budgets = [];
        this.loadBudgets();
    }
    
    // إنشاء ميزانية جديدة
    createBudget(name, amount, period, categories) {
        const budget = {
            id: Date.now(),
            name: name,
            amount: amount,
            period: period, // 'monthly', 'yearly', 'weekly'
            categories: categories,
            startDate: new Date().toISOString(),
            endDate: this.calculateEndDate(period),
            actualSpent: 0,
            remaining: amount,
            status: 'active'
        };
        
        this.budgets.push(budget);
        this.saveBudgets();
        return budget;
    }
    
    // حساب تاريخ الانتهاء
    calculateEndDate(period) {
        const date = new Date();
        switch(period) {
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        return date.toISOString();
    }
    
    // تحديث المصروف الفعلي
    updateActualSpending() {
        this.budgets.forEach(budget => {
            let totalSpent = 0;
            
            // حساب المصروفات ضمن الفئات في الميزانية
            if (typeof transactions !== 'undefined') {
                transactions.forEach(transaction => {
                    if (transaction.type === 'expense' && 
                        budget.categories.includes(transaction.category)) {
                        totalSpent += transaction.amount;
                    }
                });
            }
            
            budget.actualSpent = totalSpent;
            budget.remaining = budget.amount - totalSpent;
            budget.status = this.getBudgetStatus(budget);
        });
        
        this.saveBudgets();
    }
    
    // الحصول على حالة الميزانية
    getBudgetStatus(budget) {
        const percentage = (budget.actualSpent / budget.amount) * 100;
        
        if (percentage >= 100) {
            return 'exceeded';
        } else if (percentage >= 80) {
            return 'warning';
        } else if (percentage >= 50) {
            return 'moderate';
        } else {
            return 'good';
        }
    }
    
    // عرض الميزانيات
    displayBudgets() {
        const container = document.getElementById('budgetsContainer');
        if (!container) return;
        
        this.updateActualSpending();
        
        let html = '';
        
        if (this.budgets.length === 0) {
            html = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-chart-pie fa-3x mb-3"></i>
                    <h5>لا توجد ميزانيات</h5>
                    <p>أنشئ ميزانيتك الأولى لتبدأ بالتخطيط</p>
                    <button class="btn btn-primary" onclick="showAddBudgetModal()">
                        <i class="fas fa-plus"></i> إنشاء ميزانية
                    </button>
                </div>
            `;
        } else {
            this.budgets.forEach(budget => {
                const percentage = (budget.actualSpent / budget.amount) * 100;
                const statusClass = this.getStatusClass(budget.status);
                
                html += `
                    <div class="card budget-card mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h5 class="card-title mb-1">${budget.name}</h5>
                                    <small class="text-muted">
                                        <i class="fas fa-calendar"></i> ${this.formatPeriod(budget.period)}
                                    </small>
                                </div>
                                <span class="badge ${statusClass}">${this.getStatusText(budget.status)}</span>
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <small>${budget.actualSpent.toFixed(2)} ر.س / ${budget.amount.toFixed(2)} ر.س</small>
                                    <small>${percentage.toFixed(1)}%</small>
                                </div>
                                <div class="progress" style="height: 10px;">
                                    <div class="progress-bar ${this.getProgressBarClass(budget.status)}" 
                                         style="width: ${Math.min(percentage, 100)}%">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-between">
                                <div>
                                    <small class="text-muted d-block">المتبقي</small>
                                    <strong class="text-success">${budget.remaining.toFixed(2)} ر.س</strong>
                                </div>
                                <div>
                                    <small class="text-muted d-block">المصروف</small>
                                    <strong class="text-danger">${budget.actualSpent.toFixed(2)} ر.س</strong>
                                </div>
                                <div>
                                    <small class="text-muted d-block">الفئات</small>
                                    <small>${budget.categories.length} فئة</small>
                                </div>
                            </div>
                            
                            <div class="mt-3">
                                <button class="btn btn-sm btn-outline-primary" onclick="editBudget(${budget.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteBudget(${budget.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // إضافة زر إنشاء ميزانية جديدة
            html += `
                <div class="text-center mt-4">
                    <button class="btn btn-primary" onclick="showAddBudgetModal()">
                        <i class="fas fa-plus"></i> إضافة ميزانية جديدة
                    </button>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    // فئات CSS للحالة
    getStatusClass(status) {
        switch(status) {
            case 'exceeded': return 'bg-danger';
            case 'warning': return 'bg-warning';
            case 'moderate': return 'bg-info';
            case 'good': return 'bg-success';
            default: return 'bg-secondary';
        }
    }
    
    // نص الحالة
    getStatusText(status) {
        const texts = {
            'exceeded': 'تجاوز',
            'warning': 'تحذير',
            'moderate': 'متوسط',
            'good': 'جيد'
        };
        return texts[status] || status;
    }
    
    // فئة شريط التقدم
    getProgressBarClass(status) {
        switch(status) {
            case 'exceeded': return 'bg-danger';
            case 'warning': return 'bg-warning';
            case 'moderate': return 'bg-info';
            case 'good': return 'bg-success';
            default: return 'bg-primary';
        }
    }
    
    // تنسيق الفترة
    formatPeriod(period) {
        const periods = {
            'weekly': 'أسبوعي',
            'monthly': 'شهري',
            'yearly': 'سنوي'
        };
        return periods[period] || period;
    }
    
    // تحميل الميزانيات
    loadBudgets() {
        const saved = localStorage.getItem('userBudgets');
        if (saved) {
            this.budgets = JSON.parse(saved);
        }
    }
    
    // حفظ الميزانيات
    saveBudgets() {
        localStorage.setItem('userBudgets', JSON.stringify(this.budgets));
    }
    
    // حذف ميزانية
    deleteBudget(id) {
        if (confirm('هل أنت متأكد من حذف هذه الميزانية؟')) {
            this.budgets = this.budgets.filter(b => b.id !== id);
            this.saveBudgets();
            this.displayBudgets();
        }
    }
}

// تهيئة مدير الميزانية
const budgetManager = new BudgetManager();

// الدوال العامة للاستخدام
function showBudgetSection() {
    showSection('budgetPlanner');
    budgetManager.displayBudgets();
}

function showAddBudgetModal() {
    // ... (كود لعرض نموذج إضافة ميزانية)
    alert('سيتم إضافة نموذج إضافة الميزانية هنا');
}

function editBudget(id) {
    // ... (كود لتعديل الميزانية)
    alert('تعديل الميزانية: ' + id);
}

// تحديث الميزانيات عند إضافة معاملة جديدة
if (typeof addTransaction === 'function') {
    const originalAddTransaction = addTransaction;
    window.addTransaction = function(...args) {
        const result = originalAddTransaction.apply(this, args);
        budgetManager.updateActualSpending();
        return result;
    };
}
