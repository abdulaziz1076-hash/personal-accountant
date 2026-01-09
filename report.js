// reports.js - التقارير المتقدمة
class ReportGenerator {
    constructor() {
        this.reports = [];
    }
    
    // إنشاء تقرير شامل
    generateComprehensiveReport() {
        if (transactions.length === 0) {
            return null;
        }
        
        const report = {
            id: Date.now(),
            date: new Date().toISOString(),
            summary: this.getFinancialSummary(),
            categories: this.getCategoryAnalysis(),
            trends: this.getTrendAnalysis(),
            insights: this.getFinancialInsights(),
            recommendations: this.getRecommendations()
        };
        
        this.reports.unshift(report);
        this.saveReports();
        
        return report;
    }
    
    // الحصول على ملخص مالي
    getFinancialSummary() {
        const totalIncome = this.getTotalIncome();
        const totalExpense = this.getTotalExpense();
        const balance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
        
        return {
            totalIncome,
            totalExpense,
            balance,
            savingsRate,
            averageMonthlyIncome: this.getAverageMonthly('income'),
            averageMonthlyExpense: this.getAverageMonthly('expense'),
            largestIncome: this.getLargestTransaction('income'),
            largestExpense: this.getLargestTransaction('expense'),
            transactionCount: transactions.length
        };
    }
    
    // تحليل الفئات
    getCategoryAnalysis() {
        const incomeByCategory = {};
        const expenseByCategory = {};
        
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                incomeByCategory[transaction.category] = 
                    (incomeByCategory[transaction.category] || 0) + transaction.amount;
            } else {
                expenseByCategory[transaction.category] = 
                    (expenseByCategory[transaction.category] || 0) + transaction.amount;
            }
        });
        
        return {
            income: this.sortCategories(incomeByCategory),
            expense: this.sortCategories(expenseByCategory),
            topIncomeCategory: this.getTopCategory(incomeByCategory),
            topExpenseCategory: this.getTopCategory(expenseByCategory)
        };
    }
    
    // تحليل الاتجاهات
    getTrendAnalysis() {
        const monthlyTrends = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthlyTrends[monthKey]) {
                monthlyTrends[monthKey] = { income: 0, expense: 0, count: 0 };
            }
            
            if (transaction.type === 'income') {
                monthlyTrends[monthKey].income += transaction.amount;
            } else {
                monthlyTrends[monthKey].expense += transaction.amount;
            }
            
            monthlyTrends[monthKey].count++;
        });
        
        return {
            monthly: monthlyTrends,
            growthRate: this.calculateGrowthRate(monthlyTrends),
            bestMonth: this.getBestMonth(monthlyTrends),
            worstMonth: this.getWorstMonth(monthlyTrends)
        };
    }
    
    // الحصول على رؤى مالية
    getFinancialInsights() {
        const insights = [];
        const summary = this.getFinancialSummary();
        const categories = this.getCategoryAnalysis();
        
        // رؤية حول المدخرات
        if (summary.savingsRate < 10) {
            insights.push({
                type: 'warning',
                title: 'معدل مدخرات منخفض',
                message: `معدل مدخراتك (${summary.savingsRate.toFixed(1)}%) أقل من المستوى الموصى به (20%).`,
                suggestion: 'فكر في تقليل المصروفات غير الضرورية.'
            });
        }
        
        // رؤية حول أكبر مصروف
        if (categories.expense.length > 0) {
            const topExpense = categories.expense[0];
            insights.push({
                type: 'info',
                title: 'أكبر مصروف',
                message: `أكبر مصروفاتك في فئة "${topExpense.category}" بنسبة ${topExpense.percentage.toFixed(1)}% من إجمالي المصروفات.`,
                suggestion: 'راجع مصروفات هذه الفئة لتحسين التوفير.'
            });
        }
        
        // رؤية حول الاتجاهات
        const trends = this.getTrendAnalysis();
        if (trends.growthRate.income < 0) {
            insights.push({
                type: 'danger',
                title: 'انخفاض في الدخل',
                message: 'لاحظنا انخفاضاً في الدخل خلال الفترة الأخيرة.',
                suggestion: 'ابحث عن مصادر دخل إضافية.'
            });
        }
        
        return insights;
    }
    
    // الحصول على توصيات
    getRecommendations() {
        const recommendations = [];
        const summary = this.getFinancialSummary();
        
        if (summary.balance < 0) {
            recommendations.push({
                priority: 'high',
                action: 'خفض المصروفات',
                details: 'ركز على خفض المصروفات غير الضرورية لتصحيح الميزانية.'
            });
        }
        
        if (summary.savingsRate < 20) {
            recommendations.push({
                priority: 'medium',
                action: 'زيادة المدخرات',
                details: 'حاول توفير 20% من دخلك الشهري على الأقل.'
            });
        }
        
        return recommendations;
    }
    
    // الدوال المساعدة
    getTotalIncome() {
        return transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }
    
    getTotalExpense() {
        return transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }
    
    getAverageMonthly(type) {
        const filtered = transactions.filter(t => t.type === type);
        if (filtered.length === 0) return 0;
        
        const total = filtered.reduce((sum, t) => sum + t.amount, 0);
        const months = this.getDistinctMonths();
        
        return months > 0 ? total / months : total;
    }
    
    getDistinctMonths() {
        const months = new Set();
        transactions.forEach(t => {
            const date = new Date(t.date);
            months.add(`${date.getFullYear()}-${date.getMonth()}`);
        });
        return months.size || 1;
    }
    
    getLargestTransaction(type) {
        const filtered = transactions.filter(t => t.type === type);
        if (filtered.length === 0) return null;
        
        return filtered.reduce((max, t) => t.amount > max.amount ? t : max);
    }
    
    sortCategories(categoryData) {
        const total = Object.values(categoryData).reduce((a, b) => a + b, 0);
        return Object.entries(categoryData)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: (amount / total) * 100
            }))
            .sort((a, b) => b.amount - a.amount);
    }
    
    getTopCategory(categoryData) {
        const sorted = this.sortCategories(categoryData);
        return sorted.length > 0 ? sorted[0] : null;
    }
    
    calculateGrowthRate(monthlyTrends) {
        const months = Object.keys(monthlyTrends).sort();
        if (months.length < 2) return { income: 0, expense: 0 };
        
        const first = monthlyTrends[months[0]];
        const last = monthlyTrends[months[months.length - 1]];
        
        const incomeGrowth = ((last.income - first.income) / first.income) * 100;
        const expenseGrowth = ((last.expense - first.expense) / first.expense) * 100;
        
        return { income: incomeGrowth, expense: expenseGrowth };
    }
    
    getBestMonth(monthlyTrends) {
        const months = Object.entries(monthlyTrends);
        if (months.length === 0) return null;
        
        return months.reduce((best, [month, data]) => {
            const net = data.income - data.expense;
            const bestNet = best.data.income - best.data.expense;
            return net > bestNet ? { month, data } : best;
        }, { month: months[0][0], data: months[0][1] });
    }
    
    getWorstMonth(monthlyTrends) {
        const months = Object.entries(monthlyTrends);
        if (months.length === 0) return null;
        
        return months.reduce((worst, [month, data]) => {
            const net = data.income - data.expense;
            const worstNet = worst.data.income - worst.data.expense;
            return net < worstNet ? { month, data } : worst;
        }, { month: months[0][0], data: months[0][1] });
    }
    
    saveReports() {
        localStorage.setItem('financialReports', JSON.stringify(this.reports));
    }
    
    loadReports() {
        const saved = localStorage.getItem('financialReports');
        if (saved) {
            this.reports = JSON.parse(saved);
        }
    }
}

// تهيئة مولد التقارير
const reportGenerator = new ReportGenerator();

// دالة عرض التقرير
function generateAdvancedReport() {
    const report = reportGenerator.generateComprehensiveReport();
    
    if (!report) {
        alert('لا توجد بيانات كافية لإنشاء تقرير!');
        return;
    }
    
    // فتح التقرير في نافذة جديدة
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(this.formatReportHTML(report));
    reportWindow.document.close();
}

// تنسيق التقرير كـ HTML
function formatReportHTML(report) {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>التقرير المالي المتقدم</title>
        <style>
            body { 
                font-family: 'Tajawal', 'Segoe UI', sans-serif; 
                line-height: 1.6;
                color: #333;
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                background: #f8f9fa;
            }
            
            .report-header {
                text-align: center;
                background: linear-gradient(135deg, #4361ee, #3a0ca3);
                color: white;
                padding: 2rem;
                border-radius: 15px;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .section {
                background: white;
                padding: 1.5rem;
                border-radius: 10px;
                margin-bottom: 1.5rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            
            .stat-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin: 1rem 0;
            }
            
            .stat-card {
                padding: 1rem;
                border-radius: 8px;
                text-align: center;
            }
            
            .income-stat { background: #d1fae5; border-left: 4px solid #10b981; }
            .expense-stat { background: #fee2e2; border-left: 4px solid #ef4444; }
            .balance-stat { background: #dbeafe; border-left: 4px solid #3b82f6; }
            .savings-stat { background: #fef3c7; border-left: 4px solid #f59e0b; }
            
            .insight {
                padding: 1rem;
                margin: 0.5rem 0;
                border-radius: 8px;
                border-left: 4px solid;
            }
            
            .insight-warning { background: #fef3c7; border-color: #f59e0b; }
            .insight-info { background: #dbeafe; border-color: #3b82f6; }
            .insight-danger { background: #fee2e2; border-color: #ef4444; }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
            }
            
            th, td {
                padding: 0.75rem;
                text-align: center;
                border-bottom: 1px solid #dee2e6;
            }
            
            th {
                background: #f8f9fa;
                font-weight: bold;
            }
            
            .footer {
                text-align: center;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 0.9rem;
            }
            
            @media print {
                body { background: white; }
                .section { box-shadow: none; border: 1px solid #dee2e6; }
                .report-header { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="report-header">
            <h1>التقرير المالي المتقدم</h1>
            <p>المحاسب الشخصي المتكامل</p>
            <p>${new Date(report.date).toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
        </div>
        
        <div class="section">
            <h2>📊 الملخص المالي</h2>
            <div class="stat-grid">
                <div class="stat-card income-stat">
                    <h3>${report.summary.totalIncome.toFixed(2)} ر.س</h3>
                    <p>إجمالي الدخل</p>
                </div>
                <div class="stat-card expense-stat">
                    <h3>${report.summary.totalExpense.toFixed(2)} ر.س</h3>
                    <p>إجمالي المصروفات</p>
                </div>
                <div class="stat-card balance-stat">
                    <h3>${report.summary.balance.toFixed(2)} ر.س</h3>
                    <p>الرصيد النهائي</p>
                </div>
                <div class="stat-card savings-stat">
                    <h3>${report.summary.savingsRate.toFixed(1)}%</h3>
                    <p>معدل المدخرات</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🏷️ تحليل الفئات</h2>
            <h3>أعلى 5 فئات دخول</h3>
            <table>
                <thead>
                    <tr>
                        <th>الفئة</th>
                        <th>المبلغ</th>
                        <th>النسبة</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.categories.income.slice(0, 5).map(item => `
                        <tr>
                            <td>${item.category}</td>
                            <td>${item.amount.toFixed(2)} ر.س</td>
                            <td>${item.percentage.toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h3>أعلى 5 فئات مصروفات</h3>
            <table>
                <thead>
                    <tr>
                        <th>الفئة</th>
                        <th>المبلغ</th>
                        <th>النسبة</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.categories.expense.slice(0, 5).map(item => `
                        <tr>
                            <td>${item.category}</td>
                            <td>${item.amount.toFixed(2)} ر.س</td>
                            <td>${item.percentage.toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>💡 الرؤى المالية</h2>
            ${report.insights.map(insight => `
                <div class="insight insight-${insight.type}">
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                    <small><strong>اقتراح:</strong> ${insight.suggestion}</small>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>🎯 التوصيات</h2>
            <ol>
                ${report.recommendations.map(rec => `
                    <li>
                        <strong>${rec.action} (${rec.priority === 'high' ? 'عالي' : 'متوسط'} الأولوية):</strong>
                        ${rec.details}
                    </li>
                `).join('')}
            </ol>
        </div>
        
        <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً بواسطة المحاسب الشخصي المتكامل</p>
            <p>لأفضل النتائج، نوصي بمراجعة هذا التقرير شهرياً وتعديل خططك المالية بناءً عليه</p>
        </div>
        
        <script>
            // طباعة التقرير
            window.onload = function() {
                window.print();
            };
        </script>
    </body>
    </html>
    `;
}
