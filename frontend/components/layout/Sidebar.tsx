'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Transações', href: '/transactions' },
  { name: 'Nova Transação', href: '/transactions/new' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div style={{
      width: '250px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '20px 0'
    }}>
      <div style={{ padding: '0 20px', marginBottom: '30px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#000000',
          margin: 0,
          fontFamily: "'Lufga', system-ui, sans-serif"
        }}>
          Menu
        </h2>
      </div>
      
      <nav style={{ padding: '0 10px' }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'block',
                padding: '12px 15px',
                marginBottom: '5px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                color: isActive ? '#000000' : '#6b7280',
                backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                fontFamily: "'Lufga', system-ui, sans-serif",
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.color = '#000000';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}