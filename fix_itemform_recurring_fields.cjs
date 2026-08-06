const fs = require('fs');
let code = fs.readFileSync('./src/components/ItemFormModal.tsx', 'utf-8');

// 1. Change the price label
code = code.replace(
  '<label className="block text-slate-400 font-medium">Estimated Unit Price ({currency.symbol})</label>',
  '<label className="block text-slate-400 font-medium">{isRecurring ? "Monthly Cost" : "Estimated Unit Price"} ({currency.symbol})</label>'
);

// 2. Remove the Monthly Cost field from the Recurring details block
const monthlyCostRegex = /<div className="space-y-1">\s*<label className="block text-slate-400 text-xs font-medium">Monthly Cost<\/label>\s*<input\s*type="number" min="0" step="0.01"\s*value=\{paymentDetails\.monthlyCost \|\| ''\}\s*onChange=\{\(e\) => setPaymentDetails\(\{\.\.\.paymentDetails, monthlyCost: parseFloat\(e\.target\.value\) \|\| 0\}\)\}\s*className="w-full bg-\[#0f172a\] rounded-lg px-2 py-1\.5 text-slate-100 text-sm focus:outline-none border border-slate-700\/50"\s*\/>\s*<\/div>/;

code = code.replace(monthlyCostRegex, '');

// 3. Status select logic for Recurring vs Asset
const oldStatusSelect = `<select
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
                    </select>`;

const newStatusSelect = `<select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ItemStatus)}
                      className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50 appearance-none font-medium cursor-pointer"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Wishlist">Wishlist</option>
                      {isRecurring ? (
                        <>
                          <option value="Active">Active</option>
                          <option value="Cancelled">Cancelled</option>
                        </>
                      ) : (
                        <>
                          <option value="Ready to Buy">Ready to Buy</option>
                          <option value="Purchased">Purchased</option>
                          <option value="Sold">Sold</option>
                        </>
                      )}
                      <option value="Removed">Removed</option>
                    </select>`;

code = code.replace(oldStatusSelect, newStatusSelect);

fs.writeFileSync('./src/components/ItemFormModal.tsx', code);
console.log('Fixed item form for recurring');
