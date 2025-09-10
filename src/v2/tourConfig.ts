import {
  createTourHelpers,
  ExtractStates,
  generateTourMachine,
  TourConfig,
} from './helpers/tourMachineGenerator';
import { BaseTourEvent, TourContext } from './types';
import { useTourState as useTourStateReact } from './components/TourMachineReact';

export const tourConfig = {
  id: 'optimized-tour',
  steps: [
    {
      id: 'step1_welcome',
      page: '/optimized-demo/products',
      targetElement: '#welcome-banner',
      title: '🛍️ Welcome to Our Store!',
      content:
        'This is the optimized tour implementation. Notice how the actor is only created when you start the tour!',
      autoAdvance: 3000,
    },
    {
      id: 'step2_product_grid',
      page: '/optimized-demo/products',
      targetElement: '#product-grid',
      title: '📦 Browse Products',
      content:
        'Here you can see all our available products. The tour logic only runs while active.',
      autoAdvance: 3000,
    },
    {
      id: 'step3_add_to_cart',
      type: 'async',
      page: '/optimized-demo/products',
      content: {
        pending: {
          title: '🛒 Add to Cart',
          content:
            'Click the "Add to Cart" button to add this product to your shopping cart.',
          targetElement: '#add-to-cart-btn',
        },
        processing: {
          title: '⏳ Adding to Cart',
          content: 'Adding product to your cart...',
          targetElement: '#cart-spinner',
        },
        success: {
          title: '✅ Added to Cart!',
          content:
            'Product successfully added! Click Next to review your cart.',
          targetElement: '#cart-success',
        },
      },
    },
    {
      id: 'step3b_add_to_cart',
      page: '/optimized-demo/products',
      targetElement: '#product-grid',
      title: '📋 Random step to test navigation',
      content:
        "Here's a random step to test navigation. Notice the navigation to the optimized demo pages.",
    },
    {
      id: 'step4_cart_preview',
      page: '/optimized-demo/checkout',
      targetElement: '#cart-summary',
      title: '📋 Review Your Cart',
      content:
        "Here's your cart summary. Notice the navigation to the optimized demo pages.",
    },
    {
      id: 'step5_payment',
      type: 'async',
      page: '/optimized-demo/checkout',
      content: {
        pending: {
          title: '💳 Ready to Pay',
          content: 'Click "Process Payment" to complete your order.',
          targetElement: '#process-payment-btn',
        },
        processing: {
          title: '⏳ Processing Payment',
          content: 'Processing your payment... Please wait.',
          targetElement: '#payment-spinner',
        },
        success: {
          title: '🎉 Payment Complete!',
          content:
            "Payment successful! Let's proceed to review your experience.",
          targetElement: '#order-confirmation',
        },
      },
    },
    {
      id: 'step6_submit_review',
      type: 'async',
      page: '/optimized-demo/review',
      content: {
        pending: {
          title: '📝 Share Your Feedback',
          content:
            'Please rate your experience and click "Submit Review" to share your feedback.',
          targetElement: '#star-rating',
        },
        processing: {
          title: '⏳ Submitting Review',
          content: 'Submitting your review... Thank you for your feedback!',
          targetElement: '#review-spinner',
        },
        success: {
          title: '✅ Review Submitted!',
          content:
            'Thank you for your feedback! Click Next to complete the tour.',
          targetElement: '#review-success',
        },
      },
    },
    {
      id: 'step7_thank_you',
      page: '/optimized-demo/review',
      targetElement: '#order-complete',
      title: '🎊 Thank You for Your Purchase!',
      content:
        'Your order is complete and will be delivered soon. Thank you for shopping with us! The tour will now end.',
      autoAdvance: 5000,
    },
  ],
  allowPageNavigation: true,
  allowSkip: true,
} as const satisfies TourConfig;

export const tourHelpers = createTourHelpers(tourConfig);

// Helper: Extract the states for this tour
export type TourStates = ExtractStates<typeof tourConfig>;

// Helper: Generate the machine configuration
export const tourMachineConfig = generateTourMachine<
  TourContext,
  BaseTourEvent
>(tourConfig);

export const useTourState = useTourStateReact<typeof tourConfig>;

const tour = useTourState();

const cartTask = tourHelpers.getAsyncTask('step3_add_to_cart');

tour?.sendEvent(cartTask!.events.start);
