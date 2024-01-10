import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import './App.css'; // Import your updated CSS file

const stripePromise = loadStripe('pk_test_51OWAvgSDyyDN3yfTA3poyPH61OBys4B3mlFTWkAugc5a3EC3IofSZls5tt7M267MVEFus5eRhaGvqnLXSdNVIzOH000ZA4w9XW');

const SubscriptionForm = () => {
  const [email, setEmail] = useState('');
  const [subscriptionInterval, setSubscriptionInterval] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
    zip: '',
  });

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);

      const elements = stripeInstance.elements();
      const card = elements.create('card');
      card.mount('#card-element');
      setCardElement(card);
    };

    initializeStripe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      const response = await axios.post('http://localhost:8000/create-customer', {
        email,
        payment_method_token: paymentMethod.id,
        subscription_interval: subscriptionInterval,
      });

      console.log(response.data);
      setMsg('User successfully subscribed');
      setTimeout(() => {
        setMsg(null);
      }, 2000);
    } catch (error) {
      console.error('Error creating subscription:', error.response?.data || error.message);
      setError('An error occurred while creating the subscription.');
      setTimeout(() => {
        setError(null);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleCardDetailsChange = (type, value) => {
    setCardDetails({
      ...cardDetails,
      [type]: value,
    });
  };

  return (
    <div className="subscription-container"> {/* Add a container class for centering */}
      <h2 style={{ color: '#bb9457' }}>Subscription Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Subscription Interval:
          <select value={subscriptionInterval} onChange={(e) => setSubscriptionInterval(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="three-monthly">Three Monthly</option>
            <option value="six-monthly">Six Monthly</option>
          </select>
        </label>
        <br />
        <label>
          Card Details:
          <div id="card-element" />
          <Cards
            number={cardDetails.number}
            name={cardDetails.name}
            expiry={cardDetails.expiry}
            cvc={cardDetails.cvc}
            focused={''} // Add focused card element (e.g., 'cvc' or 'name') if needed
          />
        </label>
        <br />
        <button type="submit" disabled={loading} style={{ backgroundColor: '#bb9457', color: '#432818' }}>
          Subscribe (Test)
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
    </div>
  );
};

export default SubscriptionForm;
