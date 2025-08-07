// Invoice Generator JavaScript
class InvoiceGenerator {
    constructor() {
        this.items = [];
        this.itemCounter = 0;
        this.logoDataUrl = null;
        this.primaryColor = '#FEE440';
        this.textColor = '#000000';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.addInitialItem();
        this.updateColors(); // Initialize colors on page load
        
        // Generate initial preview with default values
        setTimeout(() => {
            this.generatePreview();
        }, 100);
    }
    
    setupEventListeners() {
        // Logo upload
        document.getElementById('logoUpload').addEventListener('change', this.handleLogoUpload.bind(this));
        
        // Form inputs - auto update preview
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', this.debounce(this.updatePreviewAuto.bind(this), 500));
        });
        
        // Color pickers - with auto update
        document.getElementById('primaryColor').addEventListener('change', this.debounce(() => {
            this.updateColors();
        }, 300));
        document.getElementById('textColor').addEventListener('change', this.debounce(() => {
            this.updateColors();
        }, 300));
    }
    
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = today;
        
        // Set due date to 30 days from today
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    }
    
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file size (limit to 2MB for better performance)
            if (file.size > 2 * 1024 * 1024) {
                alert('Logo file size should be less than 2MB for better performance.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.logoDataUrl = e.target.result;
                const logoPreview = document.getElementById('logoPreview');
                const logoImg = document.getElementById('logoImg');
                
                logoImg.src = this.logoDataUrl;
                // Set consistent sizing for logo preview
                logoImg.style.maxHeight = '48px';
                logoImg.style.maxWidth = '150px';
                logoImg.style.height = 'auto';
                logoImg.style.width = 'auto';
                logoImg.style.objectFit = 'contain';
                
                logoPreview.classList.remove('hidden');
                
                // Auto-update preview if we have minimum required data
                this.updatePreviewAuto();
            };
            reader.readAsDataURL(file);
        }
    }
    
    addInitialItem() {
        this.addItem();
    }
    
    addItem() {
        const itemsContainer = document.getElementById('itemsContainer');
        const itemId = ++this.itemCounter;
        
        const itemHtml = `
            <div class="item-row p-4 rounded" id="item-${itemId}">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="font-bold text-lg">Item #${itemId}</h3>
                    <button onclick="invoice.removeItem(${itemId})" class="neo-btn px-3 py-1 bg-red-400 font-bold text-sm hover:bg-red-500 transition-colors">
                        🗑️ Remove
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold mb-2">Description *</label>
                        <input type="text" id="desc-${itemId}" required 
                               placeholder="Web development services"
                               class="w-full p-3 border-3 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                               onchange="invoice.calculateTotals(); invoice.updatePreviewAuto();" 
                               oninput="invoice.updatePreviewAuto();">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-2">Quantity *</label>
                        <input type="number" id="qty-${itemId}" required min="1" value="1" 
                               class="w-full p-3 border-3 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                               onchange="invoice.calculateTotals(); invoice.updatePreviewAuto();" 
                               oninput="invoice.updatePreviewAuto();">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label class="block text-sm font-bold mb-2">Rate *</label>
                        <input type="number" id="rate-${itemId}" required min="0" step="0.01" 
                               placeholder="100.00"
                               class="w-full p-3 border-3 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                               onchange="invoice.calculateTotals(); invoice.updatePreviewAuto();" 
                               oninput="invoice.updatePreviewAuto();">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-2">Total</label>
                        <input type="text" id="total-${itemId}" readonly 
                               class="w-full p-3 border-3 border-gray-400 bg-gray-100 font-bold">
                    </div>
                </div>
            </div>
        `;
        
        itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
        this.items.push(itemId);
        
        // Update preview immediately after adding item
        this.updatePreviewAuto();
    }
    
    removeItem(itemId) {
        if (this.items.length <= 1) {
            alert('You must have at least one item.');
            return;
        }
        
        const itemElement = document.getElementById(`item-${itemId}`);
        if (itemElement) {
            itemElement.remove();
            this.items = this.items.filter(id => id !== itemId);
            this.calculateTotals();
            // Update preview after removing item
            this.updatePreviewAuto();
        }
    }
    
    calculateTotals() {
        let subtotal = 0;
        
        // Calculate subtotal from all items
        this.items.forEach(itemId => {
            const qtyEl = document.getElementById(`qty-${itemId}`);
            const rateEl = document.getElementById(`rate-${itemId}`);
            const totalEl = document.getElementById(`total-${itemId}`);
            
            if (qtyEl && rateEl && totalEl) {
                const qty = parseFloat(qtyEl.value) || 0;
                const rate = parseFloat(rateEl.value) || 0;
                const itemTotal = qty * rate;
                
                totalEl.value = this.formatCurrency(itemTotal);
                subtotal += itemTotal;
            }
        });
        
        // Get tax and discount rates
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;
        
        // Calculate tax and discount
        const taxAmount = (subtotal * taxRate) / 100;
        const discountAmount = (subtotal * discountRate) / 100;
        const total = subtotal + taxAmount - discountAmount;
        
        // Update display
        document.getElementById('subtotal').textContent = this.formatCurrency(subtotal);
        document.getElementById('taxAmount').textContent = this.formatCurrency(taxAmount);
        document.getElementById('discountAmount').textContent = `-${this.formatCurrency(discountAmount)}`;
        document.getElementById('total').textContent = this.formatCurrency(total);
        
        // Update preview after calculating totals
        this.updatePreviewAuto();
    }
    
    formatCurrency(amount) {
        const currency = document.getElementById('currency').value;
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹',
            'CAD': 'C$',
            'AUD': 'A$'
        };
        
        return `${symbols[currency] || '$'}${amount.toFixed(2)}`;
    }
    
    updateColors() {
        // Update the color properties
        this.primaryColor = document.getElementById('primaryColor').value;
        this.textColor = document.getElementById('textColor').value;
        
        // Set CSS custom properties
        document.documentElement.style.setProperty('--primary-color', this.primaryColor);
        document.documentElement.style.setProperty('--text-color', this.textColor);
        
        // Force update all elements with custom colors
        this.updateAllColorElements();
        
        // Force immediate preview update with new colors
        this.generatePreview();
    }
    
    updateAllColorElements() {
        // Update all elements that use custom colors immediately
        const primaryElements = document.querySelectorAll('.custom-primary, [style*="background-color"]');
        const textElements = document.querySelectorAll('.custom-text, [style*="color"]');
        
        primaryElements.forEach(element => {
            if (element.style.backgroundColor) {
                element.style.backgroundColor = this.primaryColor;
            }
            if (element.classList.contains('custom-primary')) {
                element.style.backgroundColor = this.primaryColor;
            }
        });
        
        textElements.forEach(element => {
            if (element.style.color) {
                element.style.color = this.textColor;
            }
            if (element.classList.contains('custom-text')) {
                element.style.color = this.textColor;
            }
        });
    }
    
    generatePreview() {
        const previewContainer = document.getElementById('invoicePreview');
        
        const companyName = document.getElementById('companyName').value;
        const clientName = document.getElementById('clientName').value;
        const invoiceNumber = document.getElementById('invoiceNumber').value;
        
        if (!companyName && !clientName && !invoiceNumber) {
            // Show placeholder if no data is filled
            previewContainer.innerHTML = `
                <div class="text-center text-gray-500 py-20">
                    <p class="text-lg">Fill in your company and client details to see the invoice preview</p>
                    <p class="text-sm mt-2">Start by adding your company name, client name, and invoice number</p>
                </div>
            `;
            return;
        }
        
        previewContainer.innerHTML = this.generateInvoiceHTML();
    }
    
    generateInvoiceHTML() {
        const data = this.collectFormData();
        
        let itemsHTML = '';
        let subtotal = 0;
        
        // Show placeholder if no items
        if (this.items.length === 0) {
            itemsHTML = `
                <tr>
                    <td colspan="4" style="border: 2px solid #000; padding: 20px; text-align: center; color: #666;">
                        No items added yet. Click "Add Item" to add invoice items.
                    </td>
                </tr>
            `;
        } else {
            this.items.forEach(itemId => {
                const desc = document.getElementById(`desc-${itemId}`)?.value || '';
                const qty = parseFloat(document.getElementById(`qty-${itemId}`)?.value) || 0;
                const rate = parseFloat(document.getElementById(`rate-${itemId}`)?.value) || 0;
                const itemTotal = qty * rate;
                
                if (desc || qty > 0 || rate > 0) {
                    subtotal += itemTotal;
                    itemsHTML += `
                        <tr>
                            <td style="border: 2px solid #000; padding: 12px;">${desc || 'Item description'}</td>
                            <td style="border: 2px solid #000; padding: 12px; text-align: center;">${qty}</td>
                            <td style="border: 2px solid #000; padding: 12px; text-align: right;">${this.formatCurrency(rate)}</td>
                            <td style="border: 2px solid #000; padding: 12px; text-align: right; font-weight: bold;">${this.formatCurrency(itemTotal)}</td>
                        </tr>
                    `;
                }
            });
            
            // If no valid items were found
            if (itemsHTML === '') {
                itemsHTML = `
                    <tr>
                        <td colspan="4" style="border: 2px solid #000; padding: 20px; text-align: center; color: #666;">
                            Please fill in item descriptions and quantities.
                        </td>
                    </tr>
                `;
            }
        }
        
        const taxAmount = (subtotal * data.taxRate) / 100;
        const discountAmount = (subtotal * data.discountRate) / 100;
        const total = subtotal + taxAmount - discountAmount;
        
        return `
            <div class="invoice-preview bg-white">
                <!-- Header -->
                <div class="invoice-header" style="background-color: ${this.primaryColor}; border-bottom: 3px solid #000; padding: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            ${this.logoDataUrl ? `<img src="${this.logoDataUrl}" alt="Company Logo" style="max-height: 60px; max-width: 200px; height: auto; width: auto; object-fit: contain; margin-bottom: 16px;">` : ''}
                            <h1 class="title-font" style="color: ${this.textColor}; font-size: 2.5rem; font-weight: bold; margin: 0;">INVOICE</h1>
                        </div>
                        <div style="text-align: right; color: ${this.textColor};">
                            <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 8px;">${data.companyName || 'Your Company Name'}</h2>
                            ${data.companyEmail ? `<p style="margin-bottom: 4px;">${data.companyEmail}</p>` : ''}
                            ${data.companyAddress ? `<div style="white-space: pre-line;">${data.companyAddress}</div>` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Invoice Details -->
                <div class="invoice-details" style="background-color: white; padding: 2rem; border-bottom: 2px solid #000; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h3 style="font-weight: bold; font-size: 1.125rem; margin-bottom: 12px;">Bill To:</h3>
                        <div style="line-height: 1.5;">
                            <p style="font-weight: bold; font-size: 1.25rem; margin-bottom: 4px;">${data.clientName || 'Client Name'}</p>
                            ${data.clientEmail ? `<p style="color: #666; margin-bottom: 4px;">${data.clientEmail}</p>` : ''}
                            ${data.clientAddress ? `<div style="color: #666; white-space: pre-line;">${data.clientAddress}</div>` : ''}
                        </div>
                    </div>
                    
                    <div style="text-align: right;">
                        <div style="line-height: 1.6;">
                            <div style="margin-bottom: 8px;">
                                <span style="font-weight: bold;">Invoice #:</span>
                                <span style="font-family: monospace;">${data.invoiceNumber || 'INV-001'}</span>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <span style="font-weight: bold;">Date:</span>
                                <span>${this.formatDate(data.invoiceDate)}</span>
                            </div>
                            ${data.dueDate ? `
                                <div style="margin-bottom: 8px;">
                                    <span style="font-weight: bold;">Due Date:</span>
                                    <span>${this.formatDate(data.dueDate)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Items -->
                <div class="invoice-items" style="padding: 2rem;">
                    <table class="items-table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: ${this.primaryColor};">
                                <th style="color: ${this.textColor}; border: 2px solid #000; padding: 12px; text-align: left;">Description</th>
                                <th style="color: ${this.textColor}; border: 2px solid #000; padding: 12px; text-align: center;">Qty</th>
                                <th style="color: ${this.textColor}; border: 2px solid #000; padding: 12px; text-align: right;">Rate</th>
                                <th style="color: ${this.textColor}; border: 2px solid #000; padding: 12px; text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>
                
                <!-- Totals -->
                <div class="totals-section" style="border-top: 3px solid #000; padding: 2rem; background-color: #f9f9f9;">
                    <div style="max-width: 400px; margin-left: auto;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                            <span style="font-weight: bold;">Subtotal:</span>
                            <span style="font-weight: bold;">${this.formatCurrency(subtotal)}</span>
                        </div>
                        ${data.taxRate > 0 ? `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                                <span>Tax (${data.taxRate}%):</span>
                                <span>${this.formatCurrency(taxAmount)}</span>
                            </div>
                        ` : ''}
                        ${data.discountRate > 0 ? `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                                <span>Discount (${data.discountRate}%):</span>
                                <span style="color: #dc2626;">-${this.formatCurrency(discountAmount)}</span>
                            </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; border-top: 3px solid #000; padding: 15px 0; margin-top: 15px; font-size: 1.5rem; font-weight: bold; background-color: ${this.primaryColor}; color: ${this.textColor};">
                            <span class="title-font">TOTAL:</span>
                            <span class="title-font">${this.formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
                
                ${data.notes ? `
                    <div style="padding: 2rem; border-top: 3px solid #000;">
                        <h3 style="font-weight: bold; font-size: 1.125rem; margin-bottom: 12px;">Notes:</h3>
                        <div style="white-space: pre-line; color: #374151;">${data.notes}</div>
                    </div>
                ` : ''}
                
                ${(data.footerMessage.trim() || data.showAttribution) ? `
                    <!-- Footer -->
                    <div style="padding: 2rem; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb;">
                        ${data.footerMessage.trim() ? `<p>${data.footerMessage}</p>` : ''}
                        ${data.showAttribution ? `<p style="font-size: 0.875rem; margin-top: 8px;">Generated with ❤️ by N&D Co. - <a href="https://ndcompany.in" style="color: #2563eb; text-decoration: none;">ndcompany.in</a></p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    collectFormData() {
        return {
            companyName: document.getElementById('companyName').value,
            companyEmail: document.getElementById('companyEmail').value,
            companyAddress: document.getElementById('companyAddress').value,
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            clientAddress: document.getElementById('clientAddress').value,
            invoiceNumber: document.getElementById('invoiceNumber').value,
            invoiceDate: document.getElementById('invoiceDate').value,
            dueDate: document.getElementById('dueDate').value,
            currency: document.getElementById('currency').value,
            taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
            discountRate: parseFloat(document.getElementById('discountRate').value) || 0,
            notes: document.getElementById('notes').value,
            footerMessage: document.getElementById('footerMessage').value,
            showAttribution: document.getElementById('showAttribution').checked
        };
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    downloadPDF(event) {
        const data = this.collectFormData();
        
        if (!data.companyName || !data.clientName || !data.invoiceNumber) {
            alert('Please fill in Company Name, Client Name, and Invoice Number before downloading.');
            return;
        }

        // Validate that we have at least one item
        if (this.items.length === 0) {
            alert('Please add at least one item before downloading.');
            return;
        }

        // Check if any items have missing required data
        let hasValidItems = false;
        for (let itemId of this.items) {
            const desc = document.getElementById(`desc-${itemId}`)?.value?.trim();
            const qty = parseFloat(document.getElementById(`qty-${itemId}`)?.value) || 0;
            const rate = parseFloat(document.getElementById(`rate-${itemId}`)?.value) || 0;
            
            if (desc && qty > 0 && rate >= 0) {
                hasValidItems = true;
                break;
            }
        }

        if (!hasValidItems) {
            alert('Please ensure at least one item has a description, quantity, and rate.');
            return;
        }

        // Generate preview first to ensure consistency
        this.generatePreview();

        // Show loading state
        const btn = event?.target;
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ Generating PDF...';
            btn.disabled = true;
            btn.style.opacity = '0.6';
            
            // Use setTimeout to allow UI to update
            setTimeout(() => {
                this.generatePDFViaPrint(data, originalText, btn);
            }, 100);
        } else {
            this.generatePDFViaPrint(data);
        }
    }

    generatePDFViaPrint(data, originalText = null, btn = null) {
        try {
            // Generate the invoice HTML with current colors
            const invoiceHTML = this.generateInvoiceHTML();
            
            // Create a new window for PDF generation
            const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
            
            if (!printWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Invoice ${data.invoiceNumber} - PDF Download</title>
                    <style>
                        * {
                            box-sizing: border-box;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        body {
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background: white;
                            font-size: 14px;
                            line-height: 1.5;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        .invoice-preview {
                            max-width: none;
                            margin: 0;
                            background: white !important;
                            border: none !important;
                            box-shadow: none !important;
                        }
                        
                        /* Force color preservation for headers */
                        .invoice-header,
                        [style*="background-color: ${this.primaryColor}"] {
                            background-color: ${this.primaryColor} !important;
                            color: ${this.textColor} !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        .invoice-header *,
                        [style*="color: ${this.textColor}"] {
                            color: ${this.textColor} !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        /* Table headers */
                        th,
                        thead tr,
                        [style*="background-color: ${this.primaryColor}"] th {
                            background-color: ${this.primaryColor} !important;
                            color: ${this.textColor} !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        /* Total section */
                        .totals-section [style*="background-color: ${this.primaryColor}"],
                        [style*="background-color: ${this.primaryColor}; color: ${this.textColor}"] {
                            background-color: ${this.primaryColor} !important;
                            color: ${this.textColor} !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        /* All elements with inline styles */
                        [style*="background-color"] {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        [style*="color"] {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        /* Image handling */
                        img {
                            max-height: 60px !important;
                            max-width: 200px !important;
                            height: auto !important;
                            width: auto !important;
                            object-fit: contain !important;
                        }
                        
                        /* Table styling */
                        table {
                            border-collapse: collapse !important;
                            width: 100% !important;
                        }
                        
                        td, th {
                            border: 2px solid #000 !important;
                            padding: 12px !important;
                        }
                        
                        /* Loading overlay */
                        .pdf-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(255,255,255,0.95);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 9999;
                            font-size: 18px;
                            font-weight: bold;
                        }
                        
                        .pdf-message {
                            text-align: center;
                            padding: 30px;
                            background: white;
                            border: 3px solid #000;
                            border-radius: 10px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        }
                        
                        @media print {
                            .pdf-overlay { display: none !important; }
                            
                            body {
                                margin: 0 !important;
                                padding: 0 !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            
                            /* Ensure all custom colors are preserved */
                            .invoice-header,
                            th,
                            thead tr,
                            .totals-section [style*="background-color: ${this.primaryColor}"] {
                                background-color: ${this.primaryColor} !important;
                                color: ${this.textColor} !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            
                            .invoice-header *,
                            th *,
                            .totals-section [style*="color: ${this.textColor}"] * {
                                color: ${this.textColor} !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="pdf-overlay" id="pdfOverlay">
                        <div class="pdf-message">
                            <div style="font-size: 24px; margin-bottom: 10px;">🔄</div>
                            <div>Preparing PDF Download...</div>
                            <div style="font-size: 14px; margin-top: 10px; color: #666;">
                                The print dialog will appear in a moment
                            </div>
                        </div>
                    </div>
                    
                    ${invoiceHTML}
                    
                    <script>
                        window.onload = function() {
                            // Apply color preservation to all elements
                            const applyColorPreservation = () => {
                                const allElements = document.querySelectorAll('*');
                                allElements.forEach(el => {
                                    el.style.webkitPrintColorAdjust = 'exact';
                                    el.style.printColorAdjust = 'exact';
                                    el.style.colorAdjust = 'exact';
                                });
                            };
                            
                            // Apply immediately
                            applyColorPreservation();
                            
                            // Hide overlay and trigger print after a short delay
                            setTimeout(() => {
                                document.getElementById('pdfOverlay').style.display = 'none';
                                applyColorPreservation(); // Apply again before printing
                                
                                setTimeout(() => {
                                    window.print();
                                }, 200);
                            }, 1000);
                            
                            // Handle after print
                            window.onafterprint = function() {
                                setTimeout(() => {
                                    window.close();
                                }, 300);
                            };
                            
                            // Handle window close if user cancels print
                            window.onbeforeunload = function() {
                                return null;
                            };
                        };
                        
                        // Fallback: if user doesn't print within 30 seconds, show instructions
                        setTimeout(() => {
                            const overlay = document.getElementById('pdfOverlay');
                            if (overlay && overlay.style.display !== 'none') {
                                overlay.innerHTML = '<div class="pdf-message"><div style="font-size: 24px; margin-bottom: 10px;">📄</div><div>Ready for PDF Download</div><div style="font-size: 14px; margin-top: 10px; color: #666;">Press Ctrl+P (or Cmd+P) and choose "Save as PDF"</div></div>';
                            }
                        }, 30000);
                    </script>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.focus();
            
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF: ' + error.message);
        } finally {
            // Reset button state after a delay
            setTimeout(() => {
                if (btn && originalText) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            }, 2000);
        }
    }
    
    printInvoice() {
        // Generate the invoice HTML with current colors
        const invoiceHTML = this.generateInvoiceHTML();
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Invoice - Print</title>
                <style>
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: white;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    .invoice-preview {
                        max-width: none;
                        margin: 0;
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    
                    .invoice-header {
                        background-color: ${this.primaryColor} !important;
                        color: ${this.textColor} !important;
                        border-bottom: 3px solid #000 !important;
                        padding: 30px !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    .invoice-header * {
                        color: ${this.textColor} !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    th {
                        background-color: ${this.primaryColor} !important;
                        color: ${this.textColor} !important;
                        border: 2px solid #000 !important;
                        padding: 12px !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    .totals-section [style*="background-color: ${this.primaryColor}"] {
                        background-color: ${this.primaryColor} !important;
                        color: ${this.textColor} !important;
                        border-top: 3px solid #000 !important;
                        padding: 15px !important;
                        margin-top: 15px !important;
                        font-size: 1.5rem !important;
                        font-weight: bold !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    .totals-section [style*="color: ${this.textColor}"] * {
                        color: ${this.textColor} !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    /* Ensure all inline styles preserve colors */
                    [style*="background-color"] {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    [style*="color"] {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    img {
                        max-height: 60px !important;
                        max-width: 200px !important;
                        height: auto !important;
                        width: auto !important;
                        object-fit: contain !important;
                    }
                    
                    table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
                    
                    td, th {
                        border: 2px solid #000 !important;
                        padding: 12px !important;
                    }
                    
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        .invoice-header,
                        th,
                        .totals-section [style*="background-color: ${this.primaryColor}"] {
                            background-color: ${this.primaryColor} !important;
                            color: ${this.textColor} !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        .invoice-header *,
                        th *,
                        .totals-section [style*="color: ${this.textColor}"] * {
                            color: ${this.textColor} !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                    }
                </style>
            </head>
            <body>
                ${invoiceHTML}
                <script>
                    window.onload = function() {
                        // Force color application before printing
                        setTimeout(function() {
                            // Apply colors to all elements with inline styles
                            const elements = document.querySelectorAll('[style*="background-color"], [style*="color"]');
                            elements.forEach(el => {
                                el.style.webkitPrintColorAdjust = 'exact';
                                el.style.printColorAdjust = 'exact';
                                el.style.colorAdjust = 'exact';
                            });
                            
                            // Trigger print dialog
                            window.print();
                        }, 500);
                        
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    saveTemplate() {
        const data = this.collectFormData();
        const template = {
            ...data,
            items: this.items.map(itemId => ({
                description: document.getElementById(`desc-${itemId}`)?.value || '',
                quantity: document.getElementById(`qty-${itemId}`)?.value || '',
                rate: document.getElementById(`rate-${itemId}`)?.value || ''
            })),
            logo: this.logoDataUrl,
            primaryColor: this.primaryColor,
            textColor: this.textColor,
            timestamp: new Date().toISOString()
        };
        
        const templateName = `invoice-template-${Date.now()}`;
        localStorage.setItem(templateName, JSON.stringify(template));
        
        alert('Template saved successfully! You can load it later from your browser\'s local storage.');
    }
    
    updatePreviewAuto() {
        // Always update preview when called
        this.generatePreview();
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the invoice generator when the page loads
let invoice;
document.addEventListener('DOMContentLoaded', function() {
    invoice = new InvoiceGenerator();
});

// Global functions for button clicks
function addItem() {
    invoice.addItem();
}

function generatePreview() {
    invoice.generatePreview();
}

function downloadPDF() {
    invoice.downloadPDF();
}

function printInvoice() {
    invoice.printInvoice();
}

function saveTemplate() {
    invoice.saveTemplate();
}

function updateColors() {
    if (invoice && typeof invoice.updateColors === 'function') {
        invoice.updateColors();
    } else {
        // Retry after a short delay if invoice isn't ready
        setTimeout(() => {
            if (invoice && typeof invoice.updateColors === 'function') {
                invoice.updateColors();
            }
        }, 100);
    }
}

function calculateTotals() {
    invoice.calculateTotals();
}
