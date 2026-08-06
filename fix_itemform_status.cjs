const fs = require('fs');
let code = fs.readFileSync('./src/components/ItemFormModal.tsx', 'utf-8');

const oldSection = `            {!isRecurring && (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lifecycle & Status</h3>
                
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
                </div>`;

const newSection = `            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lifecycle & Status</h3>
                
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
                  {!isRecurring && (
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
                  )}
                </div>`;

code = code.replace(oldSection, newSection);
code = code.replace("                  )}", "                  )}"); // We need to carefully remove the closing `</>` and `)}` from `{!isRecurring && (`. Let's just do a regex replace for the end of the block.
fs.writeFileSync('./src/components/ItemFormModal.tsx', code);
