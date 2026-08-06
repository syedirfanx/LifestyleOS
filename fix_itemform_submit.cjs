const fs = require('fs');
let code = fs.readFileSync('./src/components/ItemFormModal.tsx', 'utf-8');

const oldSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = parseFloat(priceInput) || 0;

    onSubmit({
      name: name.trim(),
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      quantity: Math.max(1, quantity),
      estimatedPrice: parsedPrice,
      isAiEstimated: !!aiEstimate,
      priceRangeMin: aiEstimate?.priceRangeMin,
      priceRangeMax: aiEstimate?.priceRangeMax,
      confidence: aiEstimate?.confidence,
      notes: notes.trim() || undefined,
      status,
      paymentMethod: status === 'Purchased' ? paymentMethod : undefined,
      paymentDetails: status === 'Purchased' ? paymentDetails : undefined,
    });
  };`;

const newSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = parseFloat(priceInput) || 0;

    onSubmit({
      name: name.trim(),
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      quantity: Math.max(1, quantity),
      estimatedPrice: isRecurring ? (paymentDetails.monthlyCost || parsedPrice) : parsedPrice,
      isAiEstimated: !!aiEstimate,
      priceRangeMin: aiEstimate?.priceRangeMin,
      priceRangeMax: aiEstimate?.priceRangeMax,
      confidence: aiEstimate?.confidence,
      notes: notes.trim() || undefined,
      status: isRecurring ? 'Purchased' : status,
      paymentMethod: isRecurring ? undefined : paymentMethod,
      paymentDetails: isRecurring || paymentMethod === 'EMI' || paymentMethod === 'Loan' ? paymentDetails : undefined,
    });
  };`;

code = code.replace(oldSubmit, newSubmit);
fs.writeFileSync('./src/components/ItemFormModal.tsx', code);
console.log('Fixed item submit logic');
