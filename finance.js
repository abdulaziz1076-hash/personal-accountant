// finance.js - حاسبة القروض والتمويل المتكاملة
class FinanceCalculator {
    constructor() {
        this.loanHistory = [];
        this.loadLoanHistory();
    }

    // حساب القرض الشخصي
    calculatePersonalLoan(amount, months, interestRate) {
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                             (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayment = monthlyPayment * months;
        const totalInterest = totalPayment - amount;
        
        return {
            monthlyPayment: monthlyPayment,
            totalPayment: totalPayment,
            totalInterest: totalInterest,
            interestPercentage: (totalInterest / amount) * 100,
            schedule: this.generatePaymentSchedule(amount, months, interestRate)
        };
    }

    // حساب التمويل العقاري
    calculateMortgage(propertyPrice, downPayment, years, interestRate) {
        const loanAmount = propertyPrice - downPayment;
        const months = years * 12;
        
        const result = this.calculatePersonalLoan(loanAmount, months, interestRate);
        
        return {
            ...result,
            loanAmount: loanAmount,
            downPayment: downPayment,
            downPaymentPercentage: (downPayment / propertyPrice) * 100,
            propertyPrice: propertyPrice
        };
    }

    // حساب التوفير والاستثمار
    calculateSavings(initialAmount, monthlyDeposit, years, annualReturn) {
        const months = years * 12;
        const monthlyRate = annualReturn / 100 / 12;
        let total = initialAmount;
        
        for(let i = 0; i < months; i++) {
            total = total * (1 + monthlyRate) + monthlyDeposit;
        }
        
        const totalDeposits = initialAmount + (monthlyDeposit * months);
        const totalEarnings = total - totalDeposits;
        
        return {
            finalAmount: total,
            totalDeposits: totalDeposits,
            totalEarnings: totalEarnings,
            earningsPercentage: (totalEarnings / totalDeposits) * 100
        };
    }

    // جدول السداد
    generatePaymentSchedule(amount, months, interestRate) {
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                             (Math.pow(1 + monthlyRate, months) - 1);
        
        let schedule = [];
        let remainingBalance = amount;
        
        for(let i = 1; i <= months; i++) {
            const interest = remainingBalance * monthlyRate;
            const principal = monthlyPayment - interest;
            remainingBalance -= principal;
            
            schedule.push({
                month: i,
                payment: monthlyPayment,
                principal: principal,
                interest: interest,
                remainingBalance: remainingBalance > 0 ? remainingBalance : 0
            });
        }
        
        return schedule;
    }

    // حفظ الحساب في السجل
    saveCalculation(type, inputs, results) {
        const calculation = {
            id: Date.now(),
            type: type,
            inputs: inputs,
            results: results,
            date: new Date().toISOString()
        };
        
        this.loanHistory.push(calculation);
        this.saveLoanHistory();
        
        return calculation;
    }

    // تحميل سجل الحسابات
    loadLoanHistory() {
        const saved = localStorage.getItem('loanCalculations');
        if (saved) {
            this.loanHistory = JSON.parse(saved);
        }
    }

    // حفظ سجل الحسابات
    saveLoanHistory() {
        localStorage.setItem('loanCalculations', JSON.stringify(this.loanHistory));
    }

    // جلب آخر الحسابات
    getRecentCalculations(limit = 5) {
        return this.loanHistory
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // حذف حساب
    deleteCalculation(id) {
        this.loanHistory = this.loanHistory.filter(calc => calc.id !== id);
        this.saveLoanHistory();
    }
}

// تهيئة الحاسبة
const financeCalculator = new FinanceCalculator();

// الدوال العامة للاستخدام
function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const months = parseInt(document.getElementById('loanTermRange').value);
    const interestRate = parseFloat(document.getElementById('interestRateRange').value);
    
    if (!amount || amount < 1000) {
        alert('الرجاء إدخال مبلغ قرض صحيح (أقل مبلغ 1000 ريال)');
        return;
    }
    
    const results = financeCalculator.calculatePersonalLoan(amount, months, interestRate);
    
    // عرض النتائج
    document.getElementById('monthlyPayment').textContent = `${results.monthlyPayment.toFixed(2)} ر.س`;
    document.getElementById('totalPayment').textContent = `${results.totalPayment.toFixed(2)} ر.س`;
    document.getElementById('totalInterest').textContent = `${results.totalInterest.toFixed(2)} ر.س`;
    document.getElementById('interestPercentage').textContent = `${results.interestPercentage.toFixed(2)}%`;
    
    document.getElementById('loanResults').style.display = 'none';
    document.getElementById('loanDetails').style.display = 'block';
    
    // تحديث العرض البياني
    updateLoanChart(results);
}

function saveLoanCalculation() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const months = parseInt(document.getElementById('loanTermRange').value);
    const interestRate = parseFloat(document.getElementById('interestRateRange').value);
    
    const results = financeCalculator.calculatePersonalLoan(amount, months, interestRate);
    
    const calculation = financeCalculator.saveCalculation('personal_loan', {
        amount: amount,
        months: months,
        interestRate: interestRate
    }, results);
    
    alert('تم حفظ حساب القرض بنجاح!');
}

function updateLoanChart(results) {
    const ctx = document.getElementById('loanChart').getContext('2d');
    
    // ... كود الرسم البياني للقرض
}

// تحديث القيم عند تغيير الرنجات
document.getElementById('loanTermRange').addEventListener('input', function() {
    document.getElementById('loanTermValue').textContent = `${this.value} أشهر`;
});

document.getElementById('interestRateRange').addEventListener('input', function() {
    document.getElementById('interestRateValue').textContent = `${this.value}%`;
});
