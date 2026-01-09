// charts.js - الرسوم البيانية المتقدمة
let expenseChart = null;
let incomeExpenseChart = null;
let categoryChart = null;

// تحديث جميع الرسوم البيانية
function updateCharts() {
    updateExpenseChart();
    updateIncomeVsExpenseChart();
    updateCategoryChart();
    updateTrendChart();
}

// رسم بياني لتوزيع المصروفات
function updateExpenseChart() {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    
    // حساب المصروفات حسب الفئة
    const expensesByCategory = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
    
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    // ألوان للفئات
    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(201, 203, 207, 0.7)'
    ];
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    if (categories.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد بيانات لعرضها', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: backgroundColors.slice(0, categories.length),
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Tajawal',
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            label += `${value.toFixed(2)} ر.س (${percentage}%)`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// رسم بياني للدخل مقابل المصروفات
function updateIncomeVsExpenseChart() {
    const ctx = document.getElementById('incomeVsExpenseChart').getContext('2d');
    
    // تجميع البيانات حسب الشهر
    const monthlyData = {};
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
            monthlyData[monthKey].income += transaction.amount;
        } else {
            monthlyData[monthKey].expense += transaction.amount;
        }
    });
    
    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expense);
    
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }
    
    if (months.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد بيانات لعرضها', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    incomeExpenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(month => formatMonth(month)),
            datasets: [
                {
                    label: 'الدخل',
                    data: incomeData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'المصروفات',
                    data: expenseData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0) + ' ر.س';
                        }
                    }
                }
            }
        }
    });
}

// رسم بياني للفئات
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    ctx.getContext('2d');
    // ... (يمكن إضافة رسم بياني إضافي هنا)
}

// رسم بياني للإتجاهات
function updateTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    ctx.getContext('2d');
    // ... (يمكن إضافة رسم بياني للإتجاهات هنا)
}

// تنسيق الشهر للعرض
function formatMonth(monthKey) {
    const [year, month] = monthKey.split('-');
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                   'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${months[parseInt(month) - 1]} ${year}`;
}

// تهيئة الرسوم البيانية عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    if (typeof transactions !== 'undefined') {
        updateCharts();
    }
});
