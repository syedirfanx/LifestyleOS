const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

const isRecurring = `const isRecurring = setup.category === '💳 Recurring Expenses';`;

const regex = /<div className="flex items-center gap-1\.5 mt-1\.5 flex-wrap">[\s\S]*?<\/div>/;

const newSection = `<div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {!isRecurring && (
                        <span className={\`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide \${
                          item.status === 'Purchased' ? 'bg-emerald-950/40 text-emerald-400' :
                          item.status === 'Ready to Buy' ? 'bg-amber-950/40 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }\`}>
                          {item.status || 'Planning'}
                        </span>
                      )}
                      
                      {item.status === 'Purchased' && item.paymentMethod === 'EMI' && (
                        <span className="text-[10px] bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          EMI: {item.paymentDetails?.monthlyEMI?.toLocaleString()} {currency.code}/mo
                        </span>
                      )}
                      {item.status === 'Purchased' && item.paymentMethod === 'Loan' && (
                        <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          Loan: {item.paymentDetails?.monthlyPayment?.toLocaleString()} {currency.code}/mo
                        </span>
                      )}
                    </div>`;

code = code.replace(regex, newSection);

// Add isRecurring definition before it's used
code = code.replace("const setupItems = items.filter((i) => i.setupId === setup.id);", "const setupItems = items.filter((i) => i.setupId === setup.id);\n  const isRecurring = setup.category === '💳 Recurring Expenses';");

fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('Fixed SetupDetail badges');
