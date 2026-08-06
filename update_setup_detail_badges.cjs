const fs = require('fs');

let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

const badgesCode = `
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={\`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide \${
                        item.status === 'Purchased' ? 'bg-emerald-950/40 text-emerald-400' :
                        item.status === 'Ready to Buy' ? 'bg-amber-950/40 text-amber-400' :
                        'bg-slate-800 text-slate-400'
                      }\`}>
                        {item.status || 'Planning'}
                      </span>
                      
                      {item.status === 'Purchased' && item.paymentMethod === 'EMI' && (
                        <span className="text-[10px] bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          EMI: {item.paymentDetails?.monthlyEMI?.toLocaleString()} {currency.code}/mo
                        </span>
                      )}
                      {item.status === 'Purchased' && item.paymentMethod === 'Subscription' && (
                        <span className="text-[10px] bg-purple-950/40 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          Sub: {item.paymentDetails?.monthlyCost?.toLocaleString()} {currency.code}/mo
                        </span>
                      )}
                      {item.status === 'Purchased' && item.paymentMethod === 'Rent' && (
                        <span className="text-[10px] bg-amber-950/40 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          Rent: {item.paymentDetails?.monthlyCost?.toLocaleString()} {currency.code}/mo
                        </span>
                      )}
                      {item.status === 'Purchased' && item.paymentMethod === 'Loan' && (
                        <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          Loan: {item.paymentDetails?.monthlyPayment?.toLocaleString()} {currency.code}/mo
                        </span>
                      )}
                    </div>
`;

code = code.replace(
  '{item.notes && (\n                      <div className="text-xs text-slate-500 font-normal italic">{item.notes}</div>\n                    )}',
  '{item.notes && (\n                      <div className="text-xs text-slate-500 font-normal italic">{item.notes}</div>\n                    )}\n' + badgesCode
);

fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('Badges injected.');
