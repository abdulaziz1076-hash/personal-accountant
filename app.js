<!-- نافذة تعديل المعاملة -->
<div class="modal fade" id="editModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">تعديل البند المالي</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="editId">
                
                <div class="mb-3">
                    <label class="form-label">النوع</label>
                    <select class="form-select" id="editType">
                        <option value="income">دخل (راتب، إيرادات)</option>
                        <option value="expense">مصروف (فاتورة، شراء)</option>
                    </select>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">الاسم / الوصف</label>
                    <input type="text" class="form-control" id="editName" placeholder="مثال: راتب شهر مارس">
                </div>
                
                <div class="mb-3">
                    <label class="form-label">المبلغ (ريال سعودي)</label>
                    <input type="number" class="form-control" id="editAmount" placeholder="مثال: 5000">
                </div>
                
                <div class="mb-3">
                    <label class="form-label">التاريخ</label>
                    <input type="date" class="form-control" id="editDate">
                </div>
                
                <div class="mb-3">
                    <label class="form-label">الفئة</label>
                    <select class="form-select" id="editCategory">
                        <!-- سيتم تعبئته تلقائياً -->
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                <button type="button" class="btn btn-primary" onclick="saveEdit()">حفظ التعديلات</button>
            </div>
        </div>
    </div>
</div>

<!-- قسم إدارة المعاملات -->
<div id="transactions" class="content-section" style="display: none;">
    <div class="row">
        <!-- قسم الإضافة -->
        <div class="col-md-4">
            <div class="card shadow">
                <div class="card-header bg-success text-white">
                    <h5><i class="fas fa-plus-circle"></i> إضافة معاملة جديدة</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">النوع</label>
                        <select class="form-select" id="typeSelect">
                            <option value="income">دخل (راتب، إيرادات)</option>
                            <option value="expense">مصروف (فاتورة، شراء)</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">الاسم / الوصف</label>
                        <input type="text" class="form-control" id="nameInput" placeholder="مثال: راتب شهر مارس">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">المبلغ (ريال سعودي)</label>
                        <input type="number" class="form-control" id="amountInput" placeholder="مثال: 5000">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">التاريخ</label>
                        <input type="date" class="form-control" id="dateInput">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">الفئة</label>
                        <select class="form-select" id="categorySelect">
                            <!-- سيتم تعبئته تلقائياً -->
                        </select>
                    </div>
                    <button class="btn btn-success w-100" onclick="addTransaction()">
                        <i class="fas fa-save"></i> حفظ البند المالي
                    </button>
                </div>
            </div>

            <!-- إدارة الفئات -->
            <div class="card shadow mt-4">
                <div class="card-header bg-info text-white">
                    <h5><i class="fas fa-cogs"></i> إعدادات الفئات</h5>
                </div>
                <div class="card-body">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" id="newCategory" placeholder="أدخل فئة جديدة">
                        <button class="btn btn-info" onclick="addCategory()">إضافة</button>
                    </div>
                    <div id="categoryList" class="small">
                        <!-- تظهر الفئات هنا -->
                    </div>
                </div>
            </div>
        </div>

        <!-- قسم العرض -->
        <div class="col-md-8">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h5><i class="fas fa-list"></i> السجل المالي</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <input type="text" class="form-control" id="searchInput" placeholder="ابحث في السجل...">
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>الوصف</th>
                                    <th>الفئة</th>
                                    <th>النوع</th>
                                    <th>المبلغ</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="transactionTable">
                                <!-- تظهر البيانات هنا -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- أضف هذه الأقسام أيضاً -->
<div id="dashboard" class="content-section">
    <!-- محتوى لوحة التحكم -->
</div>

<div id="loanCalculator" class="content-section" style="display: none;">
    <!-- محتوى حاسبة القروض -->
</div>

<div id="budgetPlanner" class="content-section" style="display: none;">
    <!-- محتوى الميزانية -->
</div>
    // دالة عرض الأقسام
function showSection(sectionId) {
    console.log('عرض القسم:', sectionId);
    
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // إزالة النشط من جميع العناصر
    const menuItems = document.querySelectorAll('.list-group-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // تفعيل العنصر في القائمة
        const activeMenuItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        // تحديث المحتوى بناءً على القسم
        switch(sectionId) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'transactions':
                updateDisplay();
                break;
            case 'loanCalculator':
                if (typeof updateCalculatorFields === 'function') {
                    updateCalculatorFields();
                }
                break;
        }
    }
}

<div id="financialGoals" class="content-section" style="display: none;">
    <!-- محتوى الأهداف -->
</div>
// وظيفة للتحويل بين الأقسام - الهام جداً
function setupNavigation() {
    console.log('تهيئة التنقل...');
    
    // إعداد مستمعي الأحداث للقائمة الجانبية
    const menuItems = document.querySelectorAll('.list-group-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('onclick').match(/showSection\('([^']+)'\)/)[1];
            console.log('نقر على:', sectionId);
            showSection(sectionId);
        });
    });
    
    // إظهار قسم لوحة التحكم افتراضياً
    showSection('dashboard');
    
    // إعداد مستمعات الأزرار في شريط التنقل
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').replace('#', '');
            console.log('نقر على شريط التنقل:', target);
            showSection(target);
        });
    });
}

// دالة محسنة لعرض الأقسام
function showSection(sectionId) {
    console.log('عرض القسم:', sectionId);
    
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // إزالة النشط من جميع عناصر القائمة
    const menuItems = document.querySelectorAll('.list-group-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        
        // تفعيل العنصر في القائمة الجانبية
        const activeMenuItem = document.querySelector(`[onclick*="showSection('${sectionId}')"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        // تفعيل العنصر في شريط التنقل العلوي
        const activeNavLink = document.querySelector(`.navbar-nav a[href="#${sectionId}"]`);
        if (activeNavLink) {
            // إزالة النشط من جميع روابط التنقل
            document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
                link.classList.remove('active');
            });
            activeNavLink.classList.add('active');
        }
        
        // تحديث المحتوى بناءً على القسم
        switch(sectionId) {
            case 'dashboard':
                updateDashboard();
                if (typeof updateCharts === 'function') updateCharts();
                break;
            case 'transactions':
                updateDisplay();
                break;
            case 'loanCalculator':
                // يمكن تفعيل حاسبة القروض هنا
                break;
            case 'budgetPlanner':
                if (typeof budgetManager !== 'undefined' && typeof budgetManager.displayBudgets === 'function') {
                    budgetManager.displayBudgets();
                }
                break;
            case 'financialGoals':
                if (typeof goalsManager !== 'undefined' && typeof goalsManager.displayGoals === 'function') {
                    goalsManager.displayGoals();
                }
                break;
            case 'reports':
                if (typeof updateReport === 'function') updateReport();
                break;
        }
    } else {
        console.error('لم يتم العثور على القسم:', sectionId);
        // إذا لم يوجد القسم، إظهار لوحة التحكم
        showSection('dashboard');
    }
}

// تحديث تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تعيين التاريخ اليوم كقيمة افتراضية
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    
    // تحميل البيانات المحفوظة
    loadData();
    
    // تهيئة التنقل
    setupNavigation();
    
    // عرض البيانات
    updateDisplay();
    
    // عرض الفئات
    updateCategoryDisplay();
    
    // تحديث لوحة التحكم
    updateDashboard();
    
    console.log('تم تهيئة التطبيق بنجاح!');
});

