import React, { useState, useEffect } from 'react';
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
  
  const [deliveryTiming, setDeliveryTiming] = useState('Immediate');
  const [transportMode, setTransportMode] = useState('By Road');
  const [paymentTerms, setPaymentTerms] = useState('45 days PDC');
  const [freightCharges, setFreightCharges] = useState('Ex – Mumbai');
  const [transportName, setTransportName] = useState('Ex - Ali Transport');

  // Load saved addresses and GST mapping from localStorage on component mount
  useEffect(() => {
    const savedAddresses = localStorage.getItem('addressList');
    const savedGSTMap = localStorage.getItem('addressGSTMap');
    
    if (savedAddresses) {
      setAddressList(JSON.parse(savedAddresses));
    }
    
    if (savedGSTMap) {
      setAddressGSTMap(JSON.parse(savedGSTMap));
    }
  }, []);

  useEffect(() => {
    if (addressList.length > 0) {
      localStorage.setItem('addressList', JSON.stringify(addressList));
    }
    
    if (Object.keys(addressGSTMap).length > 0) {
      localStorage.setItem('addressGSTMap', JSON.stringify(addressGSTMap));
    }
  }, [addressList, addressGSTMap]);

  const handleAddAddress = () => {
    if (toAddress.trim() !== '') {
      const updatedAddressList = [...addressList, toAddress];
      setAddressList(updatedAddressList);
      setSelectedAddress(toAddress);
      
      const updatedGSTMap = { ...addressGSTMap, [toAddress]: gstNumber };
      setAddressGSTMap(updatedGSTMap);
      
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
      deliveryTiming,
      transportMode,
      paymentTerms,
      freightCharges,
      transportName
    };
    setCurrentOrder(order);
    console.log('Order generated:', order);
  };

  return (
    <div className="container">
      <h1>Purchase Order Generator</h1>
      <div>
        <h3>Item Details</h3>
        <div className="form-row">
          <div className="form-col">
            <label>Product Name:</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Enter product name"
            />
          </div>
          <div className="form-col">
            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-col">
            <label>UOM:</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)}>
              <option value="Kg">Kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="mL">mL</option>
              <option value="Pcs">Pcs</option>
              <option value="Box">Box</option>
            </select>
          </div>
          <div className="form-col">
            <label>Rate (₹):</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Enter rate"
            />
          </div>
        </div>

        <button onClick={handleAddItem}>Add Item</button>

        <h3>Customer Details</h3>
        <label>Select Address:</label>
        <select value={selectedAddress} onChange={handleAddressChange}>
          <option value="">Select To Address</option>
          {addressList.map((address, index) => (
            <option key={index} value={address}>
              {address}
            </option>
          ))}
        </select>

        <div className="form-row">
          <div className="form-col">
            <label>Add New Address:</label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Enter new address"
            />
          </div>
          <div className="form-col">
            <label>GST Number:</label>
            <input
              type="text"
              value={gstNumber}
              onChange={handleGstNumberChange}
              placeholder="Enter GST number"
            />
          </div>
        </div>
        
        <button onClick={handleAddAddress}>Add Address</button>
        
        <h3>Tax Details</h3>
        <label>Select Tax Option:</label>
        <select value={taxOption} onChange={(e)=> setTaxOption(e.target.value)}>
          <option value="cgst_sgst">CGST & SGST</option>
          <option value="igst">IGST</option>
        </select>
        
        {taxOption==='cgst_sgst' ? (
          <div className="form-row">
            <div className="form-col">
              <label>CGST (%):</label>
              <input 
                type="number" 
                value={cgst} 
                onChange={(e)=>setCgst(e.target.value)} 
                placeholder='Enter CGST percentage'
              />
            </div>
            <div className="form-col">
              <label>SGST (%):</label>
              <input
                type="number"
                value={sgst}
                onChange={(e) => setSgst(e.target.value)}
                placeholder="Enter SGST percentage"
              />
            </div>
          </div>
        ) : (
          <div className="form-row">
            <div className="form-col">
              <label>IGST (%):</label>
              <input 
                type="number" 
                value={igst} 
                onChange={(e)=>setIgst(e.target.value)} 
                placeholder='Enter IGST percentage'
              />
            </div>
          </div>
        )}
        
        <div className="transport-details">
          <h3>Transport Details</h3>
          
          <div className="form-row">
            <div className="form-col">
              <label>Delivery Timing:</label>
              <input
                type="text"
                value={deliveryTiming}
                onChange={(e) => setDeliveryTiming(e.target.value)}
                placeholder="e.g. Immediate"
              />
            </div>
            <div className="form-col">
              <label>Mode of Transport:</label>
              <input
                type="text"
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                placeholder="e.g. By Road"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-col">
              <label>Payment Terms:</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. 45 days PDC"
              />
            </div>
            <div className="form-col">
              <label>Handling & Freight:</label>
              <input
                type="text"
                value={freightCharges}
                onChange={(e) => setFreightCharges(e.target.value)}
                placeholder="e.g. Ex – Mumbai"
              />
            </div>
          </div>
          
          <label>Transport Name:</label>
          <input
            type="text"
            value={transportName}
            onChange={(e) => setTransportName(e.target.value)}
            placeholder="Enter transport service details"
          />
        </div>
        
        <button onClick={handleGenerateOrder}>Generate Order</button>
      </div>

      {currentOrder && (
        <div className="order-summary">
          <h2>Order Summary</h2>
          <p><strong>To:</strong> {currentOrder.toAddress}</p>
          <p><strong>GST Number:</strong> {currentOrder.gstNumber}</p>
          
          <h3>Items</h3>
          <ul>
            {currentOrder.items.map((item, index) => (
              <li key={index}>
                <strong>{item.product}</strong> - {item.quantity} {item.uom} @ ₹{item.rate} = ₹{item.price.toFixed(2)}
              </li>
            ))}
          </ul>
          
          <p><strong>Total Amount:</strong> ₹{currentOrder.totalAmount.toFixed(2)}</p>
          
          {taxOption === 'cgst_sgst' && (
            <>
              <p><strong>CGST @ {currentOrder.cgst}%:</strong> ₹{currentOrder.totalCgst.toFixed(2)}</p>
              <p><strong>SGST @ {currentOrder.sgst}%:</strong> ₹{currentOrder.totalSgst.toFixed(2)}</p>
            </>
          )}
          
          {taxOption === 'igst' && (
            <p><strong>IGST @ {currentOrder.igst}%:</strong> ₹{currentOrder.totalIgst.toFixed(2)}</p>
          )}
          
          <p><strong>Grand Total:</strong> ₹{currentOrder.grandTotal.toFixed(2)}</p>
          
          <div className="custom-divider"></div>
          
          <h3>Transport Details</h3>
          <p><strong>Delivery:</strong> {currentOrder.deliveryTiming}</p>
          <p><strong>Mode of Transport:</strong> {currentOrder.transportMode}</p>
          <p><strong>Payment Terms:</strong> {currentOrder.paymentTerms}</p>
          <p><strong>Freight Charges:</strong> {currentOrder.freightCharges}</p>
          <p><strong>Transport Name:</strong> {currentOrder.transportName}</p>
          
          <button className="pdf-button">
            <PdfGenerator order={currentOrder} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
