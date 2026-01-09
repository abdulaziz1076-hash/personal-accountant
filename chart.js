/**
 * المحاسب الشخصي - نظام الرسوم البيانية المتقدمة
 * الإصدار: 2.0.0
 * المكتبات: Chart.js
 */

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.colors = {
            primary: '#4361ee',
            secondary: '#3a0ca3',
            success: '#2ec4b6',
            danger: '#e71d36',
            warning: '#ff9f1c',
            info: '#4cc9f0',
            purple: '#7209b7',
            pink: '#f72585'
        };
        
        this.gradients = {};
        this.init();
    }
    
    init() {
        // إعداد التدرجات اللونية
        this.createGradients();
        
        // تسجيل مخططات Chart.js العربية
        this.registerArabicLocale();
    }
    
    createGradients() {
        // سيتم إنشاء التدرجات عند الحاجة
    }
    
    registerArabicLocale() {
        Chart.defaults.font.family = "'Tajawal', 'Segoe UI', sans-serif";
        Chart.defaults.rtl = true;
        
        Chart.defaults.plugins.tooltip.rtl = true;
        Chart.defaults.plugins.legend.rtl = true;
        Chart.defaults.plugins.legend.labels.padding = 20;
    }
    
    // ==================== مخططات المصروفات ====================
    createExpenseChart() {
        const ctx = document.getElementById('expensesChart');
        if (!ctx) return null;
        
        // تدمير المخطط السابق إن وجد
        if (this.charts.has('expenses')) {
            this.charts.get('expenses').destroy();
        }
        
        // جمع بيانات المصروفات حسب الفئة
        const expensesByCategory = this.getExpensesByCategory();
        
        if (Object.keys(expensesByCategory).length === 0) {
            this.showNoDataMessage(ctx, 'لا توجد مصروفات لعرضها');
            return null;
        }
        
        const categories = Object.keys(expensesByCategory);
        const amounts = Object.values(expensesByCategory);
        const total = amounts.reduce((a, b) => a + b, 0);
        
        // توليد ألوان
        const backgroundColors = this.generateColors(categories.length, 0.8);
        const borderColors = backgroundColors.map(color => color.replace('0.8', '1'));
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    hoverOffset: 20,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                radius: '80%',
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'center',
                        labels: {
                            font: {
                                size: 12,
                                family: "'Tajawal', sans-serif"
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        rtl: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { family: "'Tajawal', sans-serif" },
                        bodyFont: { family: "'Tajawal', sans-serif" },
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
        
        this.charts.set('expenses', chart);
        return chart;
    }
    
    // ==================== مخطط الدخل مقابل المصروفات ====================
    createIncomeVsExpenseChart() {
        const ctx = document.getElementById('incomeVsExpenseChart');
        if (!ctx) return null;
        
        if (this.charts.has('incomeExpense')) {
            this.charts.get('incomeExpense').destroy();
        }
        
        const monthlyData = this.getMonthlyIncomeExpense();
        
        if (monthlyData.length === 0) {
            this.showNoDataMessage(ctx, 'لا توجد بيانات كافية');
            return null;
        }
        
        const months = monthlyData.map(item => item.month);
        const incomeData = monthlyData.map(item => item.income);
        const expenseData = monthlyData.map(item => item.expense);
        
        // إنشاء تدرجات لونية
        const incomeGradient = this.createLinearGradient(ctx, [
            { offset: 0, color: 'rgba(75, 192, 192, 0.6)' },
            { offset: 1, color: 'rgba(75, 192, 192, 0.1)' }
        ]);
        
        const expenseGradient = this.createLinearGradient(ctx, [
            { offset: 0, color: 'rgba(255, 99, 132, 0.6)' },
            { offset: 1, color: 'rgba(255, 99, 132, 0.1)' }
        ]);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'الدخل',
                        data: incomeData,
                        borderColor: this.colors.success,
                        backgroundColor: incomeGradient,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: this.colors.success,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'المصروفات',
                        data: expenseData,
                        borderColor: this.colors.danger,
                        backgroundColor: expenseGradient,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: this.colors.danger,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            font: {
                                size: 13,
                                family: "'Tajawal', sans-serif",
                                weight: 'bold'
                            },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        rtl: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: "'Tajawal', sans-serif"
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: "'Tajawal', sans-serif"
                            },
                            callback: (value) => {
                                return this.formatCurrency(value);
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        this.charts.set('incomeExpense', chart);
        return chart;
    }
    
    // ==================== مخطط الميزانية ====================
    createBudgetChart(budgets) {
        const ctx = document.getElementById('budgetChart');
        if (!ctx || !budgets || budgets.length === 0) return null;
        
        if (this.charts.has('budget')) {
            this.charts.get('budget').destroy();
        }
        
        const labels = budgets.map(b => b.name);
        const amounts = budgets.map(b => b.amount);
        const spent = budgets.map(b => b.actualSpent);
        const remaining = budgets.map(b => b.remaining);
        
        // ألوان حسب الحالة
        const backgroundColors = budgets.map(budget => {
            const percentage = (budget.actualSpent / budget.amount) * 100;
            if (percentage >= 100) return 'rgba(231, 29, 54, 0.7)';
            if (percentage >= 80) return 'rgba(255, 159, 28, 0.7)';
            if (percentage >= 50) return 'rgba(76, 201, 240, 0.7)';
            return 'rgba(46, 196, 182, 0.7)';
        });
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'الميزانية',
                        data: amounts,
                        backgroundColor: 'rgba(67, 97, 238, 0.3)',
                        borderColor: this.colors.primary,
                        borderWidth: 1
                    },
                    {
                        label: 'المصروف',
                        data: spent,
                        backgroundColor: backgroundColors,
                        borderColor: backgroundColors.map(c => c.replace('0.7', '1')),
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                const budget = budgets[context.dataIndex];
                                const percentage = (budget.actualSpent / budget.amount * 100).toFixed(1);
                                return `النسبة: ${percentage}% | المتبقي: ${this.formatCurrency(budget.remaining)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
        
        this.charts.set('budget', chart);
        return chart;
    }
    
    // ==================== مخطط التوفير ====================
    createSavingsChart(savingsData) {
        const ctx = document.getElementById('savingsChart');
        if (!ctx) return null;
        
        if (this.charts.has('savings')) {
            this.charts.get('savings').destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: savingsData.labels || [],
                datasets: [{
                    label: 'رصيد التوفير',
                    data: savingsData.values || [],
                    borderColor: this.colors.success,
                    backgroundColor: 'rgba(46, 196, 182, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
        
        this.charts.set('savings', chart);
        return chart;
    }
    
    // ==================== مخطط الأهداف ====================
    createGoalsChart(goals) {
        const ctx = document.getElementById('goalsChart');
        if (!ctx) return null;
        
        if (this.charts.has('goals')) {
            this.charts.get('goals').destroy();
        }
        
        const completed = goals.filter(g => g.status === 'achieved').length;
        const inProgress = goals.filter(g => g.status !== 'achieved' && g.status !== 'expired').length;
        const expired = goals.filter(g => g.status === 'expired').length;
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['متحقق', 'قيد التنفيذ', 'منتهي'],
                datasets: [{
                    data: [completed, inProgress, expired],
                    backgroundColor: [
                        this.colors.success,
                        this.colors.warning,
                        this.colors.danger
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        this.charts.set('goals', chart);
        return chart;
    }
    
    // ==================== مخططات إحصائية ====================
    createStatisticsChart() {
        const ctx = document.getElementById('statisticsChart');
        if (!ctx) return null;
        
        // بيانات إحصائية
        const stats = this.calculateStatistics();
        
        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['التوفير', 'الاستثمار', 'الديون', 'الأصول', 'المصاريف'],
                datasets: [{
                    label: 'الصحة المالية',
                    data: [
                        stats.savingsRate / 100 * 5,
                        stats.investmentRate / 100 * 5,
                        (100 - stats.debtRatio) / 100 * 5,
                        stats.assetGrowth / 100 * 5,
                        (100 - stats.expenseRatio) / 100 * 5
                    ],
                    backgroundColor: 'rgba(67, 97, 238, 0.2)',
                    borderColor: this.colors.primary,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.colors.primary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 5,
                        ticks: {
                            stepSize: 1,
                            callback: (value) => {
                                const levels = ['ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];
                                return levels[value - 1] || '';
                            }
                        }
                    }
                }
            }
        });
        
        this.charts.set('statistics', chart);
        return chart;
    }
    
    // ==================== دوال مساعدة ====================
    getExpensesByCategory() {
        if (!window.transactions || !Array.isArray(window.transactions)) {
            return {};
        }
        
        const expensesByCategory = {};
        
        window.transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                expensesByCategory[transaction.category] = 
                    (expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
        });
        
        return expensesByCategory;
    }
    
    getMonthlyIncomeExpense() {
        if (!window.transactions || !Array.isArray(window.transactions)) {
            return [];
        }
        
        const monthlyData = {};
        
        window.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    income: 0,
                    expense: 0,
                    month: this.formatMonth(monthKey)
                };
            }
            
            if (transaction.type === 'income') {
                monthlyData[monthKey].income += transaction.amount;
            } else {
                monthlyData[monthKey].expense += transaction.amount;
            }
        });
        
        // تحويل إلى مصفوفة وترتيب
        return Object.values(monthlyData)
            .sort((a, b) => {
                const aDate = a.month.split(' ')[1] + a.month.split(' ')[0];
                const bDate = b.month.split(' ')[1] + b.month.split(' ')[0];
                return aDate.localeCompare(bDate);
            })
            .slice(-12); // آخر 12 شهر فقط
    }
    
    calculateStatistics() {
        // هذه بيانات وهمية للتوضيح
        return {
            savingsRate: 25,
            investmentRate: 15,
            debtRatio: 30,
            assetGrowth: 12,
            expenseRatio: 65
        };
    }
    
    generateColors(count, opacity = 1) {
        const colorPalette = [
            `rgba(67, 97, 238, ${opacity})`,    // أزرق
            `rgba(46, 196, 182, ${opacity})`,   // أخضر
            `rgba(255, 159, 28, ${opacity})`,   // برتقالي
            `rgba(231, 29, 54, ${opacity})`,    // أحمر
            `rgba(114, 9, 183, ${opacity})`,    // بنفسجي
            `rgba(247, 37, 133, ${opacity})`,   // وردي
            `rgba(76, 201, 240, ${opacity})`,   // سماوي
            `rgba(59, 206, 171, ${opacity})`    // فيروزي
        ];
        
        // إذا احتجنا ألوان أكثر، نولدها
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(colorPalette[i % colorPalette.length]);
        }
        
        return colors;
    }
    
    createLinearGradient(ctx, colorStops) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });
        return gradient;
    }
    
    formatMonth(monthKey) {
        const [year, month] = monthKey.split('-');
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return `${months[parseInt(month) - 1]} ${year}`;
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    showNoDataMessage(canvas, message) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '16px "Tajawal", sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
    
    // ==================== تحديث جميع المخططات ====================
    updateAllCharts() {
        this.createExpenseChart();
        this.createIncomeVsExpenseChart();
        this.createStatisticsChart();
        
        // تحديث مخططات أخرى إذا كانت البيانات متوفرة
        if (typeof budgetManager !== 'undefined' && budgetManager.budgets) {
            this.createBudgetChart(budgetManager.budgets);
        }
        
        if (typeof goalsManager !== 'undefined' && goalsManager.goals) {
            this.createGoalsChart(goalsManager.goals);
        }
    }
    
    // ==================== التصدير والطباعة ====================
    exportChart(chartName, format = 'png') {
        const chart = this.charts.get(chartName);
        if (!chart) {
            console.error('Chart not found:', chartName);
            return;
        }
        
        const link = document.createElement('a');
        link.download = `chart-${chartName}-${new Date().toISOString().split('T')[0]}.${format}`;
        link.href = chart.toBase64Image();
        link.click();
    }
    
    printChart(chartName) {
        const chart = this.charts.get(chartName);
        if (!chart) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <title>طباعة الرسم البياني</title>
                <style>
                    body { 
                        font-family: 'Tajawal', sans-serif; 
                        padding: 40px;
                        text-align: center;
                    }
                    img { 
                        max-width: 100%; 
                        height: auto;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        border-radius: 10px;
                    }
                    .header {
                        margin-bottom: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>الرسم البياني - ${chartName}</h2>
                    <p>${new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <img src="${chart.toBase64Image()}" alt="الرسم البياني">
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
    
    // ==================== تنظيف الذاكرة ====================
    destroyAllCharts() {
        this.charts.forEach(chart => {
            chart.destroy();
        });
        this.charts.clear();
    }
}

// ==================== التهيئة العالمية ====================
const chartManager = new ChartManager();

// الدوال العامة
window.updateCharts = function() {
    chartManager.updateAllCharts();
};

window.exportChart = function(chartName) {
    chartManager.exportChart(chartName);
};

window.printChart = function(chartName) {
    chartManager.printChart(chartName);
};

// تحديث المخططات عند تغيير البيانات
if (typeof addTransaction === 'function') {
    const originalAddTransaction = addTransaction;
    window.addTransaction = function(...args) {
        const result = originalAddTransaction(...args);
        setTimeout(() => chartManager.updateAllCharts(), 500);
        return result;
    };
}

// التصدير
window.chartManager = chartManager;

console.log('✅ Chart Manager loaded successfully');
