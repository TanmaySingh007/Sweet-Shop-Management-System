import { Sweet } from '../services/sweetsService';

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (id: string) => void;
}

const SweetCard = ({ sweet, onPurchase }: SweetCardProps) => {
  const isOutOfStock = sweet.quantity <= 0;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h3>{sweet.name}</h3>
      <p>Category: {sweet.category}</p>
      <p>Price: ₹{sweet.price}</p>
      <p>Stock: {sweet.quantity}</p>
      <button
        onClick={() => onPurchase(sweet.id)}
        disabled={isOutOfStock}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '15px',
          backgroundColor: isOutOfStock ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
          opacity: isOutOfStock ? 0.6 : 1,
        }}
      >
        {isOutOfStock ? 'Out of Stock' : 'Purchase'}
      </button>
    </div>
  );
};

export default SweetCard;

