const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
require('dotenv').config()


const createCustomer = async (req,res) => {
    
    const {email,payment_method_token,subscription_interval} = req.body;
    if(!email || !payment_method_token){
        return res.status(400).json({error:"Email and Payment Method are required"});
        }   
        
    // const paymentMethod = await stripe.paymentMethods.create({
    //     type: 'card',
    //     card: {
    //         token:payment_method_token
    //     }
    // });
    // console.log(paymentMethod);    

    const customer = await stripe.customers.create({
        email,
        payment_method: payment_method_token,
        invoice_settings:{
            default_payment_method: payment_method_token
        }
    })

    let priceId;
    let trialPeriodDays;

    switch (subscription_interval) {
        case 'monthly':
            priceId=process.env.MONTHLY_PRICEID;
            trialPeriodDays=14;
            break;
        case 'three-monthly':
            priceId=process.env.THREEMONTHLY_PRICEID;
            trialPeriodDays=30;
            break;    
        case 'six-monthly':
            priceId=process.env.SIXMONTHLY_PRICEID;
            trialPeriodDays=45;
            break;

        default:
            return res.status(400).json({message:'Invalid Interval'});
            break;
    }
    const subscription = await stripe.subscriptions.create({
        customer:customer.id,
        items: [{price:priceId}],
        trial_period_days: trialPeriodDays
    })
    try{
    res.status(200).json({customer,subscription}) 
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Error Creating subsription"});
    }

    console.log('Request received:', req.body);
}

const SetupIntent=async (req, res) => {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: req.body.customer_id,
      });
  
      res.send({ client_secret: setupIntent.client_secret });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'An error occurred while creating the setup intent.' });
    }
  };

  module.exports = {createCustomer,SetupIntent};