import React, { useState } from 'react';
import PdfGenerator from './PdfGenerator';
import './App.css';

const App = () => {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [uom, setUom] = useState('Kg');
  const [rate, setRate] = useState('');
  const [items, setItems] = useState([]);
  const [toAddress, setToAddress] = useState('');
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [quotationRefNo, setQuotationRefNo] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [addressGSTMap, setAddressGSTMap] = useState({});
  const [currentOrder, setCurrentOrder] = useState(null);
  const[taxOption,setTaxOption]=useState('cgst_sgst');
  const[cgst,setCgst]=useState('');
  const[sgst,setSgst]=useState('');
  const[igst,setIgst]=useState('');

  const handleAddAddress = () => {
    if (toAddress.trim() !== '') {
      setAddressList([...addressList, toAddress]);
      setSelectedAddress(toAddress);
      setAddressGSTMap({ ...addressGSTMap, [toAddress]: gstNumber });
      setToAddress('');
      console.log('Address added:', toAddress, 'GST:', gstNumber);
    }
  };

  const handleAddressChange = (e) => {
    const selected = e.target.value;
    setSelectedAddress(selected);
    if (addressGSTMap[selected]) {
      setGstNumber(addressGSTMap[selected]);
    } else {
      setGstNumber('');
    }
    console.log('Selected Address:', selected, 'Mapped GST:', addressGSTMap[selected]);
  };

  const handleGstNumberChange = (e) => {
    const newGstNumber = e.target.value;
    setGstNumber(newGstNumber);

    if (selectedAddress) {
      setAddressGSTMap({ ...addressGSTMap, [selectedAddress]: newGstNumber });
    }
    console.log('GST Number Updated:', newGstNumber);
  };

  const handleAddItem = () => {
    if (product && quantity && uom && rate) {
      const newItem = { product, quantity, uom, rate, price: quantity * rate };
      setItems([...items, newItem]);
      setProduct('');
      setQuantity('');
      setUom('Kg');
      setRate('');
    }
  };

  const handleGenerateOrder = () => {
    const totalAmount = items.reduce((total, item) => total + item.price, 0);

    const totalCgst=taxOption==='cgst_sgst'?(totalAmount*parseFloat(cgst || 0))/100:0;
    const totalSgst=taxOption==='cgst_sgst'?(totalAmount*parseFloat(sgst || 0))/100:0;
    const totalIgst=taxOption==='igst'?(totalAmount*parseFloat(igst || 0))/100:0;
    const grandTotal=totalAmount+totalCgst+totalSgst+totalIgst;

    const order = {
      items, 
      totalAmount,
      toAddress: selectedAddress,
      gstNumber,
      taxOption,
      cgst: parseFloat(cgst)||0,
      sgst: parseFloat(sgst) || 0,
      igst: parseFloat(igst) || 0,
      totalCgst,
      totalSgst,
      totalIgst,
      grandTotal,
      orderNumber: `STC/${(items.length + 1).toString().padStart(3, '0')}/24-25`,
      date: new Date().toLocaleDateString(),
    };
    setCurrentOrder(order);
    console.log('Order generated:', order);
  };

  return (
    <div className="container">
      <h1>Purchase Order Generator</h1>
      <div>
        <label>Product Name:</label>
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="Product Name"
        />
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />
        <label>UOM:</label>
        <select value={uom} onChange={(e) => setUom(e.target.value)}>
          <option value="Kg">Kg</option>
          <option value="g">g</option>
        </select>
        <label>Rate (₹):</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Rate"
        />

        <button onClick={handleAddItem}>Add Item</button>

        <label>To Address:</label>
        <select value={selectedAddress} onChange={handleAddressChange}>
          <option value="">Select To Address</option>
          {addressList.map((address, index) => (
            <option key={index} value={address}>
              {address}
            </option>
          ))}
        </select>

        <label>Add New Address:</label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Add New Address"
        />
        <button onClick={handleAddAddress}>Add Address</button>
        <label>GST Number:</label>
        <input
          type="text"
          value={gstNumber}
          onChange={handleGstNumberChange}
          placeholder="GST Number"
        />
        <label>Select Tax Option:</label>
        <select value={taxOption} onChange={(e)=> setTaxOption(e.target.value)}>
          <option value="cgst_sgst">CGST & SGST</option>
          <option value="igst">IGST</option>
        </select>
        {taxOption==='cgst_sgst'?(
          <>
            <label>CGST (%):</label>
            <input type="number" value={cgst} onChange={(e)=>setCgst(e.target.value)} placeholder='CGST'/>
            <label>SGST (%) :</label>
            <input
              type="number"
              value={sgst}
              onChange={(e) => setSgst(e.target.value)}
              placeholder="SGST"
            />
          </>
        ) : (
          <>
            <label>IGST (%):</label>
            <input type="number" value={igst} onChange={(e)=>setIgst(e.target.value)} placeholder='IGST'/>
          </>
        )}
        <button onClick={handleGenerateOrder}>Generate Order</button>
      </div>

      {currentOrder && (
        <div className="order-summary">
          <h2>Order Summary</h2>
          <p>To: {currentOrder.toAddress}</p>
          <p>GST Number: {currentOrder.gstNumber}</p>
          <h3>Items</h3>
          <ul>
            {currentOrder.items.map((item, index) => (
              <li key={index}>
                {item.product} - {item.quantity} {item.uom} @ ₹{item.rate} = ₹{item.price.toFixed(2)}
              </li>
            ))}
          </ul>
          <p>Total Amount: ₹{currentOrder.totalAmount.toFixed(2)}</p>
          {taxOption === 'cgst_sgst' && (
            <>
              <p>CGST @ {currentOrder.cgst}%: ₹{currentOrder.totalCgst.toFixed(2)}</p>
              <p>SGST @ {currentOrder.sgst}%: ₹{currentOrder.totalSgst.toFixed(2)}</p>
            </>
          )}
          {taxOption === 'igst' && (
            <p>IGST @ {currentOrder.igst}%: ₹{currentOrder.totalIgst.toFixed(2)}</p>
          )}
          <p>Grand Total: ₹{currentOrder.grandTotal.toFixed(2)}</p>
          <PdfGenerator order={currentOrder} />
        </div>
      )}
    </div>
  );
};

export default App;
