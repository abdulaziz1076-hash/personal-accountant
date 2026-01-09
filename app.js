/**
 * المحاسب الشخصي المتكامل - التطبيق الرئيسي
 * الإصدار: 2.0.0
 * التاريخ: 2024
 * الرخصة: MIT
 */

// ==================== التهيئة والمتغيرات العامة ====================
let transactions = [];
let categories = ['راتب', 'أكل وشرب', 'مواصلات', 'تسوق', 'ترفيه', 'صحة', 'تعليم', 'منزل'];

// ==================== فئات الإدارة ====================
const appManager = {
    init() {
        this.loadData();
        this.initUI();
        this.setupEventListeners();
        this.updateDashboard();
        console.log('✅ التطبيق جاهز للاستخدام');
    },
    
    initUI() {
        // تعبئة قائمة الفئات
        this.populateCategorySelects();
        
        // تعبئة قائمة التنقل
        this.populateNavigation();
        
        // تعيين التاريخ الحالي
        document.getElementById('dateInput').valueAsDate = new Date();
        if (document.getElementById('editDate')) {
            document.getElementById('editDate').valueAsDate = new Date();
        }
        
        // تهيئة الأقسام
        this.showSection('dashboard');
    },
    
    setupEventListeners() {
        // البحث في السجل
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filterTransactions(e.target.value);
        });
        
        // تحديث الملخص عند تغيير التاريخ
        document.getElementById('dateInput')?.addEventListener('change', () => {
            this.updateDashboard();
        });
        
        // اختصار لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                showSection('transactions');
                document.getElementById('nameInput')?.focus();
            }
            
            if (e.key === 'Escape') {
                const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
                if (modal) modal.hide();
            }
        });
    },
    
    populateCategorySelects() {
        const selects = [
            'categorySelect', 
            'editCategory', 
            'budgetCategorySelect',
            'goalCategorySelect'
        ];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = categories.map(cat => 
                    `<option value="${cat}">${cat}</option>`
                ).join('');
            }
        });
        
        // تحديث قائمة الفئات
        this.updateCategoryList();
    },
    
    populateNavigation() {
        const menuItems = [
            { id: 'dashboard', icon: 'fa-tachometer-alt', text: 'لوحة التحكم' },
            { id: 'transactions', icon: 'fa-exchange-alt', text: 'إدارة المعاملات' },
            { id: 'loanCalculator', icon: 'fa-hand-holding-usd', text: 'حاسبة القروض' },
            { id: 'mortgageCalculator', icon: 'fa-home', text: 'حاسبة العقار' },
            { id: 'savingsCalculator', icon: 'fa-piggy-bank', text: 'حاسبة التوفير' },
            { id: 'budgetPlanner', icon: 'fa-chart-pie', text: 'مخطط الميزانية' },
            { id: 'financialGoals', icon: 'fa-bullseye', text: 'الأهداف المالية' },
            { id: 'reports', icon: 'fa-file-invoice-dollar', text: 'التقارير المتقدمة' },
            { id: 'notifications', icon: 'fa-bell', text: 'التنبيهات' },
            { id: 'settings', icon: 'fa-cog', text: 'الإعدادات' }
        ];
        
        const menuContainer = document.querySelector('.list-group');
        if (menuContainer) {
            menuContainer.innerHTML = menuItems.map(item => `
                <a href="#" class="list-group-item list-group-item-action" 
                   onclick="showSection('${item.id}')">
                    <i class="fas ${item.icon} me-2"></i>${item.text}
                </a>
            `).join('');
        }
    }
};

// ==================== إدارة المعاملات ====================
const transactionManager = {
    addTransaction() {
        const nameInput = document.getElementById('nameInput');
        const amountInput = document.getElementById('amountInput');
        const dateInput = document.getElementById('dateInput');
        const typeSelect = document.getElementById('typeSelect');
        const categorySelect = document.getElementById('categorySelect');
        
        // التحقق من المدخلات
        if (!nameInput.value.trim()) {
            this.showAlert('الرجاء إدخال وصف للمعاملة', 'warning');
            nameInput.focus();
            return;
        }
        
        if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
            this.showAlert('الرجاء إدخال مبلغ صحيح', 'warning');
            amountInput.focus();
            return;
        }
        
        // إنشاء المعاملة
        const transaction = {
            id: Date.now(),
            name: nameInput.value.trim(),
            amount: parseFloat(amountInput.value),
            date: dateInput.value,
            type: typeSelect.value,
            category: categorySelect.value,
            timestamp: new Date().toISOString()
        };
        
        transactions.unshift(transaction);
        this.saveData();
        this.displayTransactions();
        
        // تفريغ الحقول
        nameInput.value = '';
        amountInput.value = '';
        nameInput.focus();
        
        // تحديث لوحة التحكم
        appManager.updateDashboard();
        
        // إظهار رسالة نجاح
        this.showAlert('تم إضافة المعاملة بنجاح', 'success');
        
        // تحديث الميزانية إذا كانت موجودة
        if (typeof budgetManager !== 'undefined') {
            budgetManager.updateActualSpending();
        }
        
        // تحديث الأهداف إذا كانت موجودة
        if (typeof goalsManager !== 'undefined') {
            // يمكن ربط المعاملة بالهدف هنا
        }
        
        return transaction;
    },
    
    editTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        
        // تعبئة النموذج
        document.getElementById('editId').value = transaction.id;
        document.getElementById('editName').value = transaction.name;
        document.getElementById('editAmount').value = transaction.amount;
        document.getElementById('editDate').value = transaction.date;
        document.getElementById('editType').value = transaction.type;
        document.getElementById('editCategory').value = transaction.category;
        
        // إظهار النافذة
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    },
    
    saveEdit() {
        const id = parseInt(document.getElementById('editId').value);
        const transaction = transactions.find(t => t.id === id);
        
        if (transaction) {
            transaction.name = document.getElementById('editName').value;
            transaction.amount = parseFloat(document.getElementById('editAmount').value);
            transaction.date = document.getElementById('editDate').value;
            transaction.type = document.getElementById('editType').value;
            transaction.category = document.getElementById('editCategory').value;
            
            this.saveData();
            this.displayTransactions();
            appManager.updateDashboard();
            
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();
            
            this.showAlert('تم تعديل المعاملة بنجاح', 'success');
        }
    },
    
    deleteTransaction(id) {
        if (!confirm('هل أنت متأكد من حذف هذه المعاملة؟')) return;
        
        transactions = transactions.filter(t => t.id !== id);
        this.saveData();
        this.displayTransactions();
        appManager.updateDashboard();
        
        this.showAlert('تم حذف المعاملة بنجاح', 'info');
    },
    
    displayTransactions(filterText = '') {
        const container = document.getElementById('transactionTable');
        if (!container) return;
        
        let filtered = transactions;
        
        if (filterText) {
            const searchTerm = filterText.toLowerCase();
            filtered = transactions.filter(t => 
                t.name.toLowerCase().includes(searchTerm) ||
                t.category.toLowerCase().includes(searchTerm) ||
                t.type.toLowerCase().includes(searchTerm) ||
                t.amount.toString().includes(searchTerm)
            );
        }
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-search fa-2x mb-3"></i>
                        <p>${filterText ? 'لا توجد نتائج للبحث' : 'لا توجد معاملات'}</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = filtered.map(transaction => `
            <tr class="transaction-${transaction.type}">
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.name}</td>
                <td>
                    <span class="badge bg-secondary">${transaction.category}</span>
                </td>
                <td>
                    <span class="badge ${transaction.type === 'income' ? 'income-badge' : 'expense-badge'}">
                        ${transaction.type === 'income' ? 'دخل' : 'مصروف'}
                    </span>
                </td>
                <td class="fw-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${transaction.amount.toFixed(2)} ر.س
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" 
                            onclick="transactionManager.editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" 
                            onclick="transactionManager.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    filterTransactions(searchText) {
        this.displayTransactions(searchText);
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
};

// ==================== إدارة الفئات ====================
const categoryManager = {
    addCategory() {
        const input = document.getElementById('newCategory');
        const categoryName = input.value.trim();
        
        if (!categoryName) {
            this.showAlert('الرجاء إدخال اسم الفئة', 'warning');
            return;
        }
        
        if (categories.includes(categoryName)) {
            this.showAlert('هذه الفئة موجودة مسبقاً', 'warning');
            return;
        }
        
        categories.push(categoryName);
        this.saveCategories();
        appManager.populateCategorySelects();
        
        input.value = '';
        this.showAlert('تم إضافة الفئة بنجاح', 'success');
    },
    
    deleteCategory(categoryName) {
        if (!confirm(`هل أنت متأكد من حذف فئة "${categoryName}"؟`)) return;
        
        // التأكد من وجود فئات بديلة
        if (categories.length <= 1) {
            this.showAlert('يجب أن تبقى فئة واحدة على الأقل', 'danger');
            return;
        }
        
        categories = categories.filter(cat => cat !== categoryName);
        this.saveCategories();
        appManager.populateCategorySelects();
        
        this.showAlert('تم حذف الفئة بنجاح', 'info');
    },
    
    updateCategoryList() {
        const container = document.getElementById('categoryList');
        if (!container) return;
        
        container.innerHTML = categories.map(category => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                <span>${category}</span>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="categoryManager.deleteCategory('${category}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    },
    
    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(categories));
    }
};

// ==================== لوحة التحكم ====================
const dashboardManager = {
    updateDashboard() {
        this.updateStats();
        this.updateRecentTransactions();
        this.updateQuickSummary();
        this.updateChartsIfAvailable();
    },
    
    updateStats() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const balance = totalIncome - totalExpense;
        
        // تحديث الإحصائيات
        document.getElementById('totalIncome')?.textContent = `${totalIncome.toFixed(2)} ر.س`;
        document.getElementById('totalExpense')?.textContent = `${totalExpense.toFixed(2)} ر.س`;
        document.getElementById('currentBalance')?.textContent = `${balance.toFixed(2)} ر.س`;
        document.getElementById('totalTransactions')?.textContent = transactions.length;
    },
    
    updateRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) return;
        
        const recent = transactions.slice(0, 5);
        
        if (recent.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="fas fa-exchange-alt fa-2x mb-3"></i>
                        <p>لا توجد معاملات حديثة</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = recent.map(transaction => `
            <tr>
                <td>${transactionManager.formatDate(transaction.date)}</td>
                <td>${transaction.name}</td>
                <td>${transaction.category}</td>
                <td>
                    <span class="badge ${transaction.type === 'income' ? 'income-badge' : 'expense-badge'}">
                        ${transaction.type === 'income' ? 'دخل' : 'مصروف'}
                    </span>
                </td>
                <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${transaction.amount.toFixed(2)} ر.س
                </td>
            </tr>
        `).join('');
    },
    
    updateQuickSummary() {
        const container = document.getElementById('quickSummary');
        if (!container) return;
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
        
        container.innerHTML = `
            <div class="text-center">
                <div class="mb-3">
                    <i class="fas fa-chart-line fa-2x text-primary mb-2"></i>
                    <h6 class="mb-1">ملخص المالية</h6>
                </div>
                
                <div class="row text-center g-2">
                    <div class="col-6">
                        <div class="p-2 bg-success bg-opacity-10 rounded">
                            <small class="text-muted d-block">الدخل</small>
                            <strong class="text-success">${totalIncome.toFixed(2)} ر.س</strong>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-2 bg-danger bg-opacity-10 rounded">
                            <small class="text-muted d-block">المصروف</small>
                            <strong class="text-danger">${totalExpense.toFixed(2)} ر.س</strong>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-2 bg-primary bg-opacity-10 rounded">
                            <small class="text-muted d-block">المدخرات</small>
                            <strong class="text-primary">${(totalIncome - totalExpense).toFixed(2)} ر.س</strong>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-2 bg-warning bg-opacity-10 rounded">
                            <small class="text-muted d-block">نسبة التوفير</small>
                            <strong class="text-warning">${savingsRate.toFixed(1)}%</strong>
                        </div>
                    </div>
                </div>
                
                <div class="mt-3">
                    <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        ${this.getFinancialAdvice(savingsRate)}
                    </small>
                </div>
            </div>
        `;
    },
    
    getFinancialAdvice(savingsRate) {
        if (savingsRate >= 20) return 'أداء ممتاز! استمر في هذا النمط';
        if (savingsRate >= 10) return 'جيد، يمكنك تحسين نسبة التوفير';
        if (savingsRate >= 0) return 'انتبه، حاول زيادة المدخرات';
        return 'ميزانيتك سلبية، تحتاج مراجعة عاجلة';
    },
    
    updateChartsIfAvailable() {
        if (typeof updateCharts === 'function') {
            setTimeout(updateCharts, 100);
        }
    }
};

// ==================== الوظائف المساعدة ====================
const utils = {
    showAlert(message, type = 'info', duration = 3000) {
        // إنشاء عنصر التنبيه
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // إضافة إلى الصفحة
        const container = document.getElementById('alertContainer') || this.createAlertContainer();
        container.appendChild(alertDiv);
        
        // إزالة تلقائية
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, duration);
    },
    
    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    },
    
    exportData() {
        const data = {
            transactions: transactions,
            categories: categories,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `المحاسب_الشخصي_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showAlert('تم تصدير البيانات بنجاح', 'success');
    },
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.transactions && Array.isArray(data.transactions)) {
                    transactions = data.transactions;
                    transactionManager.saveData();
                    transactionManager.displayTransactions();
                    appManager.updateDashboard();
                    
                    if (data.categories && Array.isArray(data.categories)) {
                        categories = data.categories;
                        categoryManager.saveCategories();
                        appManager.populateCategorySelects();
                    }
                    
                    this.showAlert('تم استيراد البيانات بنجاح', 'success');
                } else {
                    this.showAlert('ملف غير صالح', 'danger');
                }
            } catch (error) {
                this.showAlert('خطأ في قراءة الملف', 'danger');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        
        // إعادة تعيين حقل الملف
        event.target.value = '';
    },
    
    loadData() {
        // تحميل المعاملات
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
        }
        
        // تحميل الفئات
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            categories = JSON.parse(savedCategories);
        }
    },
    
    saveData() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
};

// ==================== واجهة المستخدم ====================
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        
        // تحديث العنوان
        const sectionTitles = {
            'dashboard': 'لوحة التحكم',
            'transactions': 'إدارة المعاملات',
            'loanCalculator': 'حاسبة القروض',
            'budgetPlanner': 'مخطط الميزانية',
            'financialGoals': 'الأهداف المالية',
            'reports': 'التقارير المتقدمة',
            'notifications': 'التنبيهات',
            'settings': 'الإعدادات'
        };
        
        // تحديث القائمة النشطة
        document.querySelectorAll('.list-group-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[onclick="showSection('${sectionId}')"]`)?.classList.add('active');
        
        // تحديث محتوى القسم إذا لزم
        switch(sectionId) {
            case 'dashboard':
                dashboardManager.updateDashboard();
                break;
            case 'transactions':
                transactionManager.displayTransactions();
                break;
            case 'budgetPlanner':
                if (typeof budgetManager !== 'undefined') {
                    setTimeout(() => budgetManager.displayBudgets(), 100);
                }
                break;
            case 'financialGoals':
                if (typeof goalsManager !== 'undefined') {
                    setTimeout(() => goalsManager.displayGoals(), 100);
                }
                break;
            case 'notifications':
                if (typeof notificationManager !== 'undefined') {
                    setTimeout(() => notificationManager.displayNotifications(), 100);
                }
                break;
        }
    }
    
    // إغلاق القائمة المتنقلة على الأجهزة الصغيرة
    if (window.innerWidth < 992) {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            new bootstrap.Collapse(navbarCollapse);
        }
    }
}

// ==================== الوظائف العامة ====================
window.addTransaction = () => transactionManager.addTransaction();
window.saveEdit = () => transactionManager.saveEdit();
window.addCategory = () => categoryManager.addCategory();
window.exportData = () => utils.exportData();
window.importData = (event) => utils.importData(event);

// دالة تهيئة التطبيق
window.initializeApp = () => {
    utils.loadData();
    appManager.init();
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeApp);

// دعم الطباعة
window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.btn, .navbar, .footer').forEach(el => {
        el.style.display = 'none';
    });
});

window.addEventListener('afterprint', () => {
    document.querySelectorAll('.btn, .navbar, .footer').forEach(el => {
        el.style.display = '';
    });
});
