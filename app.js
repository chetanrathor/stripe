// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require('stripe')('sk_test_51Ne2HsSJWBez7tD4XAi3e9LjqQ97jWoQGtjyV6vp9HFAesBEqNGhvD8vUtDSeVNOI7aqDjEsr9CUtyTFx8hyxtga00DPB4NeK0');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session/:productId/:units', async (req, res) => {
    const myRepo = [
        {
            id: 1,
            name: 'Smartphone',
            price: 1000,
            category: 'Electronics',
        },
        {
            id: 2,
            name: 'Laptop',
            price: 1299.99,
            category: 'Electronics',
        },
        {
            id: 3,
            name: 'Running Shoes',
            price: 89.99,
            category: 'Sports',
        },
        {
            id: 4,
            name: 'Coffee Maker',
            price: 49.99,
            category: 'Kitchen Appliances',
        },
        {
            id: 5,
            name: 'T-shirt',
            price: 19.99,
            category: 'Clothing',
        },
    ];

    // console.log('req.body', req.query)
    const productId = req.params.productId
    const numberOfUnits = req.params.units
    const [foundProduct] = myRepo.filter((item) => {
        if (item.id == productId) {
            return item
        }
    })


    // console.log('productId', productId)
    // console.log('productId', numberOfUnits)
    // console.log('productId', foundProduct)
    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys

    const product = await stripe.products.create({
        name: foundProduct.name,
    });

    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.ceil(foundProduct.price) * 100,
        currency: 'inr',
    });
    console.log('product', price)


    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: price.id,
                quantity: numberOfUnits
            },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}?success=true`,
        cancel_url: `http://localhost:3000/payment/1`,
    });

    // res.redirect(200, session.url);
    res.status(200).json({ session: session.url })
});

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
    const sig = request.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  });

const corsOpts = {
    origin: '*',

    methods: [
        'GET',
        'POST',
    ],

    allowedHeaders: [
        'Content-Type',
    ],
};

// app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());
app.use(bodyParser.json)
app.use(cors(corsOpts));
app.listen(4242, () => console.log('Running on port 4242'));    