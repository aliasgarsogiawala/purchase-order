import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const PdfGenerator = ({ order }) => {
    const [orderNumber, setOrderNumber] = useState(1);
    const [logoImg, setLogoImg] = useState(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "Anonymous";  
        img.onload = () => {
            setLogoImg(img);
        };
        img.onerror = (err) => {
            console.error("Error loading logo:", err);
        };
        img.src = process.env.PUBLIC_URL + '/stc.png';
    }, []);

    const formatOrderNumber = (number) => {
        return `STC/${number.toString().padStart(3, '0')}`;
    };

    const convertNumberToWords = (amount) => {
        return 'One Lakh Twenty Thousand Three Hundred Sixty Only'; 
    };

    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true
        });
        
        doc.addFont('Helvetica', 'Helvetica', 'normal');
        doc.setFont('Helvetica');
        
        const rupeeSymbol = 'Rs.';
        
        if (logoImg) {
            try {
                const imgData = logoImg.src;
                doc.addImage(imgData, 'PNG', 150, 5, 50, 30); 
            } catch (error) {
                console.error('Error adding logo to PDF:', error);
            }
        }

        const currentDate = new Date().toLocaleDateString();
        doc.setFontSize(12); 
        const startX = 10;
        const startY = 30; 
        const cellWidth = 55;
        const cellHeight = 8;

        doc.rect(startX, startY, cellWidth * 2, cellHeight * 2);
        doc.text('Purchase Order', startX + 4, startY + 10);
        doc.rect(startX + cellWidth, startY, cellWidth, cellHeight);
        doc.text('Purchase No.', startX + cellWidth + 2, startY + 6);
        doc.rect(startX + cellWidth * 2, startY, cellWidth, cellHeight);
        doc.text(formatOrderNumber(orderNumber), startX + cellWidth * 2 + 2, startY + 6);
        doc.rect(startX + cellWidth, startY + cellHeight, cellWidth, cellHeight);
        doc.text('Date', startX + cellWidth + 2, startY + cellHeight + 6);
        doc.rect(startX + cellWidth * 2, startY + cellHeight, cellWidth, cellHeight);
        doc.text(currentDate, startX + cellWidth * 2 + 2, startY + cellHeight + 6);

        const secondTableStartY = startY + cellHeight * 2 + 5; 
        const toAddressWidth = cellWidth * 1.5;
        const secondColumnWidth = cellWidth * 1.2;

        doc.rect(startX, secondTableStartY, toAddressWidth, cellHeight * 3);
        doc.text('To:', startX + 4, secondTableStartY + 6);
        doc.text(order.toAddress || '', startX + 4, secondTableStartY + 16);

        const secondColumnStartX = startX + toAddressWidth;

        doc.rect(secondColumnStartX, secondTableStartY, secondColumnWidth * 1.6, cellHeight);
        doc.text(`PO No: ${formatOrderNumber(orderNumber)}`, secondColumnStartX + 2, secondTableStartY + 6);
        doc.rect(secondColumnStartX, secondTableStartY + cellHeight, secondColumnWidth * 1.6, cellHeight);
        doc.text(`Date: ${currentDate}`, secondColumnStartX + 2, secondTableStartY + cellHeight + 6);
        doc.rect(secondColumnStartX, secondTableStartY + cellHeight * 2, secondColumnWidth * 1.6, cellHeight);
        doc.text(`GST No: ${order.gstNumber || ''}`, secondColumnStartX + 2, secondTableStartY + cellHeight * 2 + 6);

        const mentionRowStartY = secondTableStartY + cellHeight * 3;
        const mentionRowWidth = toAddressWidth + secondColumnWidth * 1.6;

        doc.rect(startX, mentionRowStartY, mentionRowWidth, cellHeight);
        doc.setFontSize(8); 
        doc.text(
            'Please mention this Order No. and Date on your Challan / Invoice and correspondence, submit your Bills in Duplicate with Supply',
            startX + 2,
            mentionRowStartY + 5
        );

        const itemsTableStartY = mentionRowStartY + cellHeight;
        doc.setFontSize(10); 
        doc.rect(startX, itemsTableStartY, mentionRowWidth, cellHeight);
        doc.text('Sr. No.', startX + 2, itemsTableStartY + 6);
        doc.text('Item Description', startX + 20, itemsTableStartY + 6);
        doc.text('UOM', startX + 90, itemsTableStartY + 6);
        doc.text('Qty.', startX + 110, itemsTableStartY + 6);
        doc.text('Rate', startX + 130, itemsTableStartY + 6);
        doc.text('Amount', startX + 150, itemsTableStartY + 6);

        doc.line(startX + 15, itemsTableStartY, startX + 15, itemsTableStartY + cellHeight * 7); 
        doc.line(startX + 85, itemsTableStartY, startX + 85, itemsTableStartY + cellHeight * 7);
        doc.line(startX + 105, itemsTableStartY, startX + 105, itemsTableStartY + cellHeight * 7);
        doc.line(startX + 125, itemsTableStartY, startX + 125, itemsTableStartY + cellHeight * 7);
        doc.line(startX + 145, itemsTableStartY, startX + 145, itemsTableStartY + cellHeight * 7);

        let itemStartY = itemsTableStartY + cellHeight;
        for (let i = 0; i < 6; i++) {
            doc.rect(startX, itemStartY, mentionRowWidth, cellHeight);
            if (order.items && order.items[i]) {
                const item = order.items[i];
                doc.text(`${i + 1}`, startX + 2, itemStartY + 6);
                doc.text(item.product, startX + 20, itemStartY + 6);
                doc.text(item.uom, startX + 90, itemStartY + 6);
                doc.text(item.quantity.toString(), startX + 110, itemStartY + 6);
                doc.text(item.rate.toString(), startX + 130, itemStartY + 6);
                doc.text(item.price.toFixed(2), startX + 150, itemStartY + 6);
            }
            itemStartY += cellHeight;
        }

        const totalY = itemStartY;
        doc.rect(startX, totalY, mentionRowWidth, cellHeight);
        doc.text('Total', startX + 125, totalY + 6);
        doc.text(`${rupeeSymbol} ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}`, startX + 150, totalY + 6);

        const amountInWordsY = totalY + cellHeight;
        doc.rect(startX, amountInWordsY, mentionRowWidth, cellHeight);
        doc.text(`Amount in Words: ${convertNumberToWords(order.grandTotal)}`, startX + 2, amountInWordsY + 6);

        if (order.taxOption === 'cgst_sgst') {
            doc.rect(startX, amountInWordsY + cellHeight, mentionRowWidth / 2, cellHeight);
            doc.text(`CGST @ ${order.cgst}%: ${rupeeSymbol} ${order.totalCgst ? order.totalCgst.toFixed(2) : '0.00'}`, startX + 5, amountInWordsY + cellHeight + 6);
            
            doc.rect(startX + mentionRowWidth / 2, amountInWordsY + cellHeight, mentionRowWidth / 2, cellHeight);
            doc.text(`SGST @ ${order.sgst}%: ${rupeeSymbol} ${order.totalSgst ? order.totalSgst.toFixed(2) : '0.00'}`, startX + mentionRowWidth / 2 + 5, amountInWordsY + cellHeight + 6);
            
            const finalTotalY = amountInWordsY + cellHeight * 2;
            doc.rect(startX, finalTotalY, mentionRowWidth, cellHeight);
            doc.text(`Grand Total: ${rupeeSymbol} ${order.grandTotal ? order.grandTotal.toFixed(2) : '0.00'}`, startX + mentionRowWidth / 2 + 5, finalTotalY + 6);
        } else {
            doc.rect(startX, amountInWordsY + cellHeight, mentionRowWidth, cellHeight);
            doc.text(`IGST @ ${order.igst}%: ${rupeeSymbol} ${order.totalIgst ? order.totalIgst.toFixed(2) : '0.00'}`, startX + 5, amountInWordsY + cellHeight + 6);
            
            const finalTotalY = amountInWordsY + cellHeight * 2;
            doc.rect(startX, finalTotalY, mentionRowWidth, cellHeight);
            doc.text(`Grand Total: ${rupeeSymbol} ${order.grandTotal ? order.grandTotal.toFixed(2) : '0.00'}`, startX + mentionRowWidth / 2 + 5, finalTotalY + 6);
        }

        const deliveryStartY = amountInWordsY + cellHeight * 3;
        doc.setFontSize(9);
        
        const columnWidth = mentionRowWidth / 2;
        
        doc.rect(startX, deliveryStartY, columnWidth, cellHeight);
        doc.text(`Delivery – ${order.deliveryTiming || 'Immediate'}`, startX + 4, deliveryStartY + 6);
        
        doc.rect(startX + columnWidth, deliveryStartY, columnWidth, cellHeight);
        doc.text(`Mode of Transport: ${order.transportMode || 'By Road'}`, startX + columnWidth + 4, deliveryStartY + 6);
        
        doc.rect(startX, deliveryStartY + cellHeight, columnWidth, cellHeight);
        doc.text(`Payment Terms: ${order.paymentTerms || '45 days PDC'}`, startX + 4, deliveryStartY + cellHeight + 6);
        
        doc.rect(startX + columnWidth, deliveryStartY + cellHeight, columnWidth, cellHeight);
        doc.text(`Handling & Freight charges: ${order.freightCharges || 'Ex – Mumbai'}`, startX + columnWidth + 4, deliveryStartY + cellHeight + 6);
        
        doc.rect(startX, deliveryStartY + cellHeight * 2, mentionRowWidth, cellHeight);
        doc.text(`Transport Name : - ${order.transportName }`, startX + 4, deliveryStartY + cellHeight * 2 + 6);
        
        const signatureStartY = deliveryStartY + cellHeight * 3;
        const signatureWidth = mentionRowWidth / 3;
        const signatureHeight = cellHeight * 3; 
        doc.rect(startX, signatureStartY, signatureWidth, signatureHeight);
        doc.rect(startX + signatureWidth, signatureStartY, signatureWidth, signatureHeight);
        doc.rect(startX + signatureWidth * 2, signatureStartY, signatureWidth, signatureHeight);
        
        doc.text('Prepared By', startX + signatureWidth/3, signatureStartY + signatureHeight - 2);
        doc.text('Checked By', startX + signatureWidth + signatureWidth/3, signatureStartY + signatureHeight - 2);
        doc.text('Authorized Signature', startX + signatureWidth * 2 + signatureWidth/4, signatureStartY + signatureHeight - 2);
        
        const termsStartY = signatureStartY + signatureHeight + 2;
        doc.setFontSize(7); 
        
        const termsBoxHeight = 20; 
        doc.rect(startX, termsStartY, mentionRowWidth, termsBoxHeight);
        
        doc.text('Other Terms & Conditions: (General terms and conditions are stated over-leaf)', startX + 2, termsStartY + 4);
        
        const terms = [
            '1. Dispute, if any, shall be subject to Satara Jurisdiction',
            '2. The prices governing this Order shall be for all purposes, remain firm',
            '3. Supplier shall remove rejected Goods at own cost.',
            '4. We reserve right to cancel or amend this order or any part there of without assigning any reason.',
            '5. New Order will cancel earlier Order'
        ];
        
        let currentY = termsStartY + 7; 
        terms.forEach(term => {
            doc.text(term, startX + 2, currentY); 
            currentY += 3; 
        });
        
        const footerY = termsStartY + termsBoxHeight + 5; 
        doc.setFontSize(6); 
        doc.text('Address Line 1', startX + 90, footerY+30);

        doc.save('order.pdf');
        setOrderNumber(orderNumber + 1);
    };

    return (
        <div>
            <button onClick={generatePDF}>Generate PDF</button>
        </div>
    );
};

export default PdfGenerator;
