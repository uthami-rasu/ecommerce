import deliveryIcon from '../assets/images/svg.png'
import returnIcon from '../assets/images/Frame.png'
import organicIcon from '../assets/images/Frame (1).png'
import supportIcon from '../assets/images/Frame (2).png'

export const benefits = [
  {
    title: 'Free Delivery',
    description: 'Orders from all items',
    icon: deliveryIcon,
  },
  {
    title: 'Return & Refund',
    description: 'Money-back guarantee',
    icon: returnIcon,
  },
  {
    title: 'Pure Organic',
    description: '100% Natural',
    icon: organicIcon,
  },
  {
    title: 'Support 24/7',
    description: 'Contact us 24 hours a day',
    icon: supportIcon,
  },
] as const
