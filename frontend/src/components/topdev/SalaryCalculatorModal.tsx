'use client';

import React, { useState } from 'react';
import { Calculator, X, DollarSign, Info, ArrowRight } from 'lucide-react';

interface SalaryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalaryCalculatorModal: React.FC<SalaryCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [grossInput, setGrossInput] = useState<number>(35000000);
  const [dependents, setDependents] = useState<number>(0);
  const [insuranceOption, setInsuranceOption] = useState<'official' | 'minimum'>('official');

  if (!isOpen) return null;

  // Constants under Vietnamese Labor Law 2025/2026
  const BASE_SALARY = 2340000; // Mức lương cơ sở
  const MAX_SOCIAL_INSURANCE_SALARY = BASE_SALARY * 20; // 46,800,000 VND
  const REGION_1_MIN_SALARY = 4960000; // Vùng 1 (Hà Nội, TP.HCM)
  const MAX_UNEMPLOYMENT_INSURANCE_SALARY = REGION_1_MIN_SALARY * 20; // 99,200,000 VND

  const PERSONAL_DEDUCTION = 11000000; // 11 triệu / tháng
  const DEPENDENT_DEDUCTION_PER_PERSON = 4400000; // 4.4 triệu / người / tháng

  // Calculate Insurance bases
  const gross = Math.max(0, grossInput || 0);
  const socialInsBase = insuranceOption === 'official' 
    ? Math.min(gross, MAX_SOCIAL_INSURANCE_SALARY)
    : REGION_1_MIN_SALARY;

  const unemployInsBase = insuranceOption === 'official'
    ? Math.min(gross, MAX_UNEMPLOYMENT_INSURANCE_SALARY)
    : REGION_1_MIN_SALARY;

  // Employee contribution rates
  const bhxh = Math.round(socialInsBase * 0.08); // 8%
  const bhyt = Math.round(socialInsBase * 0.015); // 1.5%
  const bhtn = Math.round(unemployInsBase * 0.01); // 1%
  const totalInsurance = bhxh + bhyt + bhtn;

  // Income before tax
  const incomeBeforeTax = gross - totalInsurance;

  // Family deductions
  const totalDependentDeduction = dependents * DEPENDENT_DEDUCTION_PER_PERSON;
  const totalDeductions = PERSONAL_DEDUCTION + totalDependentDeduction;

  // Taxable income
  const taxableIncome = Math.max(0, incomeBeforeTax - totalDeductions);

  // Progressive personal income tax brackets (Biểu thuế lũy tiến từng phần)
  const calculatePIT = (taxable: number): number => {
    if (taxable <= 0) return 0;
    if (taxable <= 5000000) return taxable * 0.05;
    if (taxable <= 10000000) return taxable * 0.10 - 250000;
    if (taxable <= 18000000) return taxable * 0.15 - 750000;
    if (taxable <= 32000000) return taxable * 0.20 - 1650000;
    if (taxable <= 52000000) return taxable * 0.25 - 3250000;
    if (taxable <= 80000000) return taxable * 0.30 - 5850000;
    return taxable * 0.35 - 9850000;
  };

  const pitTax = Math.round(calculatePIT(taxableIncome));
  const netSalary = Math.round(gross - totalInsurance - pitTax);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
              <Calculator className="w-4 h-4" />
              <span>Công Cụ Lập Trình Viên UpCareer</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Tính Lương Gross sang Net Chuẩn 2025 - 2026
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Áp dụng chính xác quy định BHXH, BHYT, BHTN và biểu thuế TNCN lũy tiến từng phần mới nhất.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Calculations */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-800">
          
          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mức Lương Gross (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="500000"
                  min="0"
                  value={grossInput}
                  onChange={(e) => setGrossInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block mt-1">
                = {formatVND(gross)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số Người Phụ Thuộc
              </label>
              <select
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none bg-white cursor-pointer"
              >
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} người ({formatVND(num * DEPENDENT_DEDUCTION_PER_PERSON)})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 block mt-1">Giảm trừ 4.4M/người</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Đóng Bảo Hiểm Theo
              </label>
              <select
                value={insuranceOption}
                onChange={(e) => setInsuranceOption(e.target.value as 'official' | 'minimum')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none bg-white cursor-pointer"
              >
                <option value="official">Trên 100% Lương chính thức (Chuẩn)</option>
                <option value="minimum">Theo mức tối thiểu vùng</option>
              </select>
              <span className="text-[11px] text-slate-500 block mt-1">Trần BHXH: 46.8M VND</span>
            </div>
          </div>

          {/* Quick Result Highlight Card */}
          <div className="bg-linear-to-r from-red-600 to-rose-700 text-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-100">
                LƯƠNG NET THỰC NHẬN (TAKE-HOME PAY)
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
                {formatVND(netSalary)}
              </div>
              <div className="text-xs text-red-100 mt-1">
                Tương đương khoảng ~${Math.round(netSalary / 25400)} USD/tháng
              </div>
            </div>

            <div className="bg-black/20 p-3.5 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-red-100">Lương Gross ban đầu:</span>
                <span className="font-bold font-mono">{formatVND(gross)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-red-100">Tổng các khoản bảo hiểm:</span>
                <span className="font-bold font-mono text-amber-200">-{formatVND(totalInsurance)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-red-100">Thuế TNCN phải nộp:</span>
                <span className="font-bold font-mono text-amber-200">-{formatVND(pitTax)}</span>
              </div>
            </div>
          </div>

          {/* Detailed Calculation Breakdown Table */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-red-600" />
              Chi tiết các khoản khấu trừ theo luật hiện hành
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Khoản mục</th>
                    <th className="p-3">Tỷ lệ trích nộp</th>
                    <th className="p-3 text-right">Số tiền (VND)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50 font-bold bg-slate-50/50">
                    <td className="p-3 text-slate-900">LƯƠNG GROSS</td>
                    <td className="p-3 text-slate-500">100%</td>
                    <td className="p-3 text-right font-mono text-slate-900">{formatVND(gross)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3">Bảo hiểm xã hội (BHXH)</td>
                    <td className="p-3 text-slate-500">8.0% (Trần 46.8M)</td>
                    <td className="p-3 text-right font-mono text-red-600">-{formatVND(bhxh)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3">Bảo hiểm y tế (BHYT)</td>
                    <td className="p-3 text-slate-500">1.5% (Trần 46.8M)</td>
                    <td className="p-3 text-right font-mono text-red-600">-{formatVND(bhyt)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3">Bảo hiểm thất nghiệp (BHTN)</td>
                    <td className="p-3 text-slate-500">1.0% (Trần 99.2M)</td>
                    <td className="p-3 text-right font-mono text-red-600">-{formatVND(bhtn)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50 font-semibold">
                    <td className="p-3">Thu nhập trước thuế (Gross - Bảo hiểm)</td>
                    <td className="p-3 text-slate-500">-</td>
                    <td className="p-3 text-right font-mono text-slate-900">{formatVND(incomeBeforeTax)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3">Giảm trừ bản thân</td>
                    <td className="p-3 text-slate-500">Cố định</td>
                    <td className="p-3 text-right font-mono text-slate-600">-{formatVND(PERSONAL_DEDUCTION)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3">Giảm trừ người phụ thuộc ({dependents} người)</td>
                    <td className="p-3 text-slate-500">4.4M / người</td>
                    <td className="p-3 text-right font-mono text-slate-600">-{formatVND(totalDependentDeduction)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Thu nhập chịu thuế (TNTT)</td>
                    <td className="p-3 text-slate-500">-</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{formatVND(taxableIncome)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Thuế thu nhập cá nhân (TNCN)</td>
                    <td className="p-3 text-slate-500">Lũy tiến từng phần</td>
                    <td className="p-3 text-right font-mono font-bold text-red-600">-{formatVND(pitTax)}</td>
                  </tr>
                  <tr className="bg-red-50/60 font-bold text-slate-900 border-t-2 border-red-200">
                    <td className="p-3 text-red-700">LƯƠNG NET THỰC LĨNH</td>
                    <td className="p-3 text-slate-500">-</td>
                    <td className="p-3 text-right font-mono text-red-700 text-sm">{formatVND(netSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Mẹo: Khi đàm phán lương với công ty IT nước ngoài, hãy làm rõ đóng bảo hiểm trên lương full hay lương tối thiểu.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
