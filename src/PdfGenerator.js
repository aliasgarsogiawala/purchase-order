import React, { useState } from 'react';
import jsPDF from 'jspdf';

const PdfGenerator = ({ order }) => {
    const [orderNumber, setOrderNumber] = useState(1);

    const formatOrderNumber = (number) => {
        return `STC/${number.toString().padStart(3, '0')}`;
    };

    const convertNumberToWords = (amount) => {
        return 'One Lakh Twenty Thousand Three Hundred Sixty Only'; // Example conversion
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const logo = 'stc.png';
        doc.addImage(logo, 'PNG', 150, 10, 50, 50);

        const currentDate = new Date().toLocaleDateString();
        doc.setFontSize(14);
        const startX = 10;
        const startY = 50;
        const cellWidth = 55;
        const cellHeight = 10;

        // Header Table
        doc.rect(startX, startY, cellWidth * 2, cellHeight * 2);
        doc.text('Purchase Order', startX + 4, startY + 12);
        doc.rect(startX + cellWidth, startY, cellWidth, cellHeight);
        doc.text('Purchase No.', startX + cellWidth + 2, startY + 7);
        doc.rect(startX + cellWidth * 2, startY, cellWidth, cellHeight);
        doc.text(formatOrderNumber(orderNumber), startX + cellWidth * 2 + 2, startY + 7);
        doc.rect(startX + cellWidth, startY + cellHeight, cellWidth, cellHeight);
        doc.text('Date', startX + cellWidth + 2, startY + cellHeight + 7);
        doc.rect(startX + cellWidth * 2, startY + cellHeight, cellWidth, cellHeight);
        doc.text(currentDate, startX + cellWidth * 2 + 2, startY + cellHeight + 7);

        const secondTableStartY = startY + cellHeight * 2 + 10;
        const toAddressWidth = cellWidth * 1.5;
        const secondColumnWidth = cellWidth * 1.2;

        // Address and PO Details
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

        // Mention Row
        doc.rect(startX, mentionRowStartY, mentionRowWidth, cellHeight);
        doc.setFontSize(9);
        doc.text(
            'Please mention this Order No. and Date on your Challan / Invoice and correspondence, submit your Bills in Duplicate with Supply',
            startX + 2,
            mentionRowStartY + 6
        );

        // Items Table
        const itemsTableStartY = mentionRowStartY + cellHeight;
        doc.setFontSize(12);
        doc.rect(startX, itemsTableStartY, mentionRowWidth, cellHeight);
        doc.text('Sr. No.', startX + 2, itemsTableStartY + 7);
        doc.text('Item Description', startX + 20, itemsTableStartY + 7);
        doc.text('UOM', startX + 90, itemsTableStartY + 7);
        doc.text('Qty.', startX + 110, itemsTableStartY + 7);
        doc.text('Rate', startX + 130, itemsTableStartY + 7);
        doc.text('Amount', startX + 150, itemsTableStartY + 7);

        let itemStartY = itemsTableStartY + cellHeight;
        for (let i = 0; i < 6; i++) {
            doc.rect(startX, itemStartY, mentionRowWidth, cellHeight);
            if (order.items[i]) {
                const item = order.items[i];
                doc.text(`${i + 1}`, startX + 2, itemStartY + 7);
                doc.text(item.product, startX + 20, itemStartY + 7);
                doc.text(item.uom, startX + 90, itemStartY + 7);
                doc.text(item.quantity.toString(), startX + 110, itemStartY + 7);
                doc.text(item.rate.toString(), startX + 130, itemStartY + 7);
                doc.text(item.price.toFixed(2), startX + 150, itemStartY + 7);
            }
            itemStartY += cellHeight;
        }

        // Total Line below Rate and Amount
        const totalY = itemStartY;
        doc.rect(startX, totalY, mentionRowWidth, cellHeight);
        doc.text('Total', startX + 125, totalY + 7);
        doc.text(`₹${order.totalAmount.toFixed(2)}`, startX + 150, totalY + 7);

        // Vertical Lines for Items Table
        doc.line(startX + 15, itemsTableStartY, startX + 15, totalY);
        doc.line(startX + 85, itemsTableStartY, startX + 85, totalY);
        doc.line(startX + 105, itemsTableStartY, startX + 105, totalY);
        doc.line(startX + 125, itemsTableStartY, startX + 125, totalY);
        doc.line(startX + 145, itemsTableStartY, startX + 145, totalY);

        // Amount in Words and Tax Details
        const gstStartY = totalY + cellHeight;

        // Amount in Words
        const amountInWordsY = gstStartY;
        doc.rect(startX, amountInWordsY, mentionRowWidth, cellHeight);
        doc.text(`Amount in Words: ${convertNumberToWords(order.grandTotal)}`, startX + 2, amountInWordsY + 7);

        // GST and Total
        if (order.taxOption === 'cgst_sgst') {
            doc.rect(startX, amountInWordsY + cellHeight, mentionRowWidth / 2, cellHeight);
            doc.text(`CGST @ ${order.cgst}%: ₹${order.totalCgst.toFixed(2)}`, startX + 5, amountInWordsY + cellHeight + 7);

            doc.rect(startX + mentionRowWidth / 2, amountInWordsY + cellHeight, mentionRowWidth / 2, cellHeight);
            doc.text(`SGST @ ${order.sgst}%: ₹${order.totalSgst.toFixed(2)}`, startX + mentionRowWidth / 2 + 5, amountInWordsY + cellHeight + 7);

            // Grand Total below SGST
            const finalTotalY = amountInWordsY + cellHeight * 2;
            doc.rect(startX + mentionRowWidth / 2, finalTotalY, mentionRowWidth / 2, cellHeight);
            doc.text(`Grand Total: ₹${order.grandTotal.toFixed(2)}`, startX + mentionRowWidth / 2 + 5, finalTotalY + 7);
        } else {
            doc.rect(startX, amountInWordsY + cellHeight, mentionRowWidth / 2, cellHeight);
            doc.text(`IGST @ ${order.igst}%: ₹${order.totalIgst.toFixed(2)}`, startX + mentionRowWidth / 2 + 5, amountInWordsY + cellHeight + 7);

            // Grand Total below IGST, leaving CGST blank
            const finalTotalY = amountInWordsY + cellHeight * 2;
            doc.rect(startX, finalTotalY, mentionRowWidth / 2, cellHeight);
            doc.rect(startX + mentionRowWidth / 2, finalTotalY, mentionRowWidth / 2, cellHeight);
            doc.text(`Grand Total: ₹${order.grandTotal.toFixed(2)}`, startX + mentionRowWidth / 2 + 5, finalTotalY + 7);
        }

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
