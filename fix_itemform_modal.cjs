const fs = require('fs');
let code = fs.readFileSync('./src/components/ItemFormModal.tsx', 'utf-8');

const regex = /<div className="grid grid-cols-2 gap-4">[\s\S]*?(?=<div className="space-y-1 pt-2">)/;

const newSection = `
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50 appearance-none font-medium cursor-pointer"
              >
                <option value="Planning">Planning</option>
                <option value="Wishlist">Wishlist</option>
                <option value="Ready to Buy">Ready to Buy</option>
                <option value="Purchased">Purchased</option>
                <option value="Sold">Sold</option>
                <option value="Removed">Removed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50 appearance-none font-medium cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="EMI">EMI</option>
                <option value="Loan">Loan</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {paymentMethod === 'EMI' && (
              <div className="space-y-3 bg-[#131a2b] p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase">EMI Details</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">Down Payment</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={paymentDetails.downPayment || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, downPayment: parseFloat(e.target.value) || 0})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">Interest Rate (%)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={paymentDetails.interestRate || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, interestRate: parseFloat(e.target.value) || 0})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">Installments</label>
                    <input
                      type="number" min="1"
                      value={paymentDetails.numberOfInstallments || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, numberOfInstallments: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">Monthly EMI</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={paymentDetails.monthlyEMI || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, monthlyEMI: parseFloat(e.target.value) || 0})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="block text-slate-400 text-xs font-medium">Start Date</label>
                    <input
                      type="date"
                      value={paymentDetails.emiStartDate || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, emiStartDate: e.target.value})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'Loan' && (
              <div className="space-y-3 bg-[#131a2b] p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase">Loan Details</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">Loan Amount</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={paymentDetails.loanAmount || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, loanAmount: parseFloat(e.target.value) || 0})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">Interest Rate (%)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={paymentDetails.interestRate || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, interestRate: parseFloat(e.target.value) || 0})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="block text-slate-400 text-xs font-medium">Monthly Payment</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={paymentDetails.monthlyPayment || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, monthlyPayment: parseFloat(e.target.value) || 0})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">Start Date</label>
                    <input
                      type="date"
                      value={paymentDetails.startDate || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, startDate: e.target.value})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">End Date</label>
                    <input
                      type="date"
                      value={paymentDetails.endDate || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, endDate: e.target.value})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {setupCategory === '💳 Recurring Expenses' && (
              <div className="space-y-3 bg-[#1e1a3b] p-3 rounded-xl border border-purple-900/50">
                <div className="text-xs font-bold text-purple-400 uppercase">{setupSubCategory || 'Recurring'} Details</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-xs font-medium">Monthly Cost</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={paymentDetails.monthlyCost || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, monthlyCost: parseFloat(e.target.value) || 0})}
                      className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                    />
                  </div>
                  
                  {setupSubCategory === 'Housing' && (
                    <div className="space-y-1">
                      <label className="block text-slate-400 text-xs font-medium">Deposit</label>
                      <input
                        type="number" min="0" step="0.01"
                        value={paymentDetails.securityDeposit || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, securityDeposit: parseFloat(e.target.value) || 0})}
                        className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                      />
                    </div>
                  )}
                  {setupSubCategory === 'Housing' && (
                    <>
                      <div className="space-y-1">
                        <label className="block text-slate-400 text-xs font-medium">Contract Start</label>
                        <input
                          type="date"
                          value={paymentDetails.startDate || ''}
                          onChange={(e) => setPaymentDetails({...paymentDetails, startDate: e.target.value})}
                          className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-400 text-xs font-medium">Contract End</label>
                        <input
                          type="date"
                          value={paymentDetails.endDate || ''}
                          onChange={(e) => setPaymentDetails({...paymentDetails, endDate: e.target.value})}
                          className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                        />
                      </div>
                    </>
                  )}

                  {setupSubCategory !== 'Housing' && (
                    <div className="space-y-1">
                      <label className="block text-slate-400 text-xs font-medium">Billing Cycle</label>
                      <select
                        value={paymentDetails.billingCycle || 'Monthly'}
                        onChange={(e) => setPaymentDetails({...paymentDetails, billingCycle: e.target.value as any})}
                        className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50 appearance-none cursor-pointer"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                  )}

                  {setupSubCategory !== 'Housing' && (
                    <div className="space-y-1">
                      <label className="block text-slate-400 text-xs font-medium">
                        {setupSubCategory === 'Utilities' ? 'Next Billing Date' : 'Renewal Date'}
                      </label>
                      <input
                        type="date"
                        value={paymentDetails.nextBillingDate || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, nextBillingDate: e.target.value})}
                        className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
`;

code = code.replace(regex, newSection);

fs.writeFileSync('./src/components/ItemFormModal.tsx', code);
console.log('Replaced sections in ItemFormModal');
