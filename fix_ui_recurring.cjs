const fs = require('fs');
let code = fs.readFileSync('./src/components/ItemFormModal.tsx', 'utf-8');

const oldStatusSelect = `<select
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

const newStatusSelect = `<select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ItemStatus)}
                      className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50 appearance-none font-medium cursor-pointer"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Wishlist">Wishlist</option>
                      <option value="Ready to Buy">Ready to Buy</option>
                      {isRecurring ? (
                        <>
                          <option value="Active">Active</option>
                          <option value="Cancelled">Cancelled</option>
                        </>
                      ) : (
                        <>
                          <option value="Purchased">Purchased</option>
                          <option value="Sold">Sold</option>
                        </>
                      )}
                      <option value="Removed">Removed</option>
                    </select>`;

code = code.replace(oldStatusSelect, newStatusSelect);

const oldDateInput = `<label className="block text-slate-400 text-xs font-medium">
                        {setupSubCategory === 'Utilities' ? 'Next Billing Date' : 'Renewal Date'}
                      </label>
                      <input
                        type="date"
                        value={paymentDetails.nextBillingDate || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, nextBillingDate: e.target.value})}
                        className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                      />`;

const newDateInput = `<label className="block text-slate-400 text-xs font-medium">
                        {setupSubCategory === 'Utilities' ? 'Billing Day (1-31)' : 'Renewal Day (1-31)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={paymentDetails.billingDay || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, billingDay: parseInt(e.target.value) || undefined})}
                        className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                      />`;

code = code.replace(oldDateInput, newDateInput);

fs.writeFileSync('./src/components/ItemFormModal.tsx', code);
console.log('Fixed UI recurring elements');
